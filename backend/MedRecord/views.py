import logging

from django.contrib.auth import password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .catalogos import catalogos_api
from .correos import enviar_correo_recuperacion
from .models import CitaMedica, Medicamento, Recordatorio, Tratamiento, Usuario
from .serializers import (
    CambiarPasswordSerializer,
    CitaMedicaSerializer,
    LoginSerializer,
    MedicamentoSerializer,
    RecordatorioSerializer,
    RecuperarPasswordSerializer,
    RegistroSerializer,
    RestablecerPasswordSerializer,
    TratamientoSerializer,
    UsuarioSerializer,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Autenticación
# ---------------------------------------------------------------------------

class LoginView(TokenObtainPairView):
    """POST {correo, password} -> {access, refresh, usuario}"""

    serializer_class = LoginSerializer
    throttle_scope = "login"


class RegistroView(generics.CreateAPIView):
    """POST {nombre, apellido, correo, password} -> crea la cuenta."""

    serializer_class = RegistroSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "registro"


class PerfilView(generics.RetrieveUpdateAPIView):
    """GET/PATCH los datos del usuario autenticado."""

    serializer_class = UsuarioSerializer

    def get_object(self):
        return self.request.user


class RecuperarPasswordView(APIView):
    """POST {correo} -> envía el enlace de recuperación si la cuenta existe."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = "recuperar"

    def post(self, request):
        serializer = RecuperarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data["correo"].strip().lower()

        usuario = Usuario.objects.filter(correo__iexact=correo, is_active=True).first()
        if usuario:
            try:
                enviar_correo_recuperacion(usuario)
            except Exception:  # no revelar detalles del servidor de correo
                logger.exception("No se pudo enviar el correo de recuperación a %s", correo)
                return Response(
                    {"detail": "No se pudo enviar el correo. Intenta de nuevo más tarde."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        # Misma respuesta exista o no la cuenta, para no revelar qué correos están registrados.
        return Response(
            {"detail": "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña."}
        )


class RestablecerPasswordView(APIView):
    """POST {uid, token, password} -> asigna la nueva contraseña."""

    permission_classes = [permissions.AllowAny]
    throttle_scope = "recuperar"

    def post(self, request):
        serializer = RestablecerPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data

        try:
            pk = force_str(urlsafe_base64_decode(datos["uid"]))
            usuario = Usuario.objects.get(pk=pk, is_active=True)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            usuario = None

        if usuario is None or not default_token_generator.check_token(usuario, datos["token"]):
            return Response(
                {"detail": "El enlace no es válido o ya venció. Solicita uno nuevo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            password_validation.validate_password(datos["password"], usuario)
        except DjangoValidationError as error:
            return Response({"password": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(datos["password"])
        usuario.save(update_fields=["password"])
        return Response({"detail": "Contraseña actualizada. Ya puedes iniciar sesión."})


class CambiarPasswordView(APIView):
    """POST {password_actual, password_nueva} para el usuario autenticado."""

    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data
        usuario = request.user

        if not usuario.check_password(datos["password_actual"]):
            return Response(
                {"password_actual": ["La contraseña actual no es correcta."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            password_validation.validate_password(datos["password_nueva"], usuario)
        except DjangoValidationError as error:
            return Response({"password_nueva": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(datos["password_nueva"])
        usuario.save(update_fields=["password"])
        return Response({"detail": "Contraseña actualizada."})


class CatalogosView(APIView):
    """GET -> especialidades con sus médicos, lugares y medicamentos para las listas desplegables."""

    def get(self, request):
        return Response(catalogos_api())


# ---------------------------------------------------------------------------
# Datos médicos: cada usuario solo ve y modifica lo suyo
# ---------------------------------------------------------------------------

class DelUsuarioViewSet(viewsets.ModelViewSet):
    """Filtra por el usuario del token y lo asigna al crear."""

    def get_queryset(self):
        return super().get_queryset().filter(id_usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(id_usuario=self.request.user)


class UsuarioViewSet(viewsets.ModelViewSet):
    """Gestión de usuarios: solo administradores."""

    queryset = Usuario.objects.all().order_by("id_usuario")
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]


class MedicamentoViewSet(DelUsuarioViewSet):
    queryset = Medicamento.objects.all().order_by("nombre")
    serializer_class = MedicamentoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nombre", "frecuencia", "indicaciones"]


class CitaMedicaViewSet(DelUsuarioViewSet):
    queryset = CitaMedica.objects.select_related("id_usuario").order_by("fecha", "hora")
    serializer_class = CitaMedicaSerializer


class TratamientoViewSet(DelUsuarioViewSet):
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer


class RecordatorioViewSet(DelUsuarioViewSet):
    queryset = Recordatorio.objects.all().order_by("fecha_hora")
    serializer_class = RecordatorioSerializer
