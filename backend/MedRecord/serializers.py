from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .catalogos import ESPECIALIDADES
from .models import CitaMedica, Medicamento, Recordatorio, Tratamiento, Usuario


# ---------------------------------------------------------------------------
# Usuarios y autenticación
# ---------------------------------------------------------------------------

class UsuarioSerializer(serializers.ModelSerializer):
    """Datos públicos del usuario (nunca expone la contraseña)."""

    class Meta:
        model = Usuario
        fields = ["id_usuario", "nombre", "apellido", "correo", "is_staff"]
        read_only_fields = ["id_usuario", "correo", "is_staff"]


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = Usuario
        fields = ["id_usuario", "nombre", "apellido", "correo", "password"]
        read_only_fields = ["id_usuario"]
        extra_kwargs = {
            "nombre": {"required": True, "allow_blank": False},
            "apellido": {"required": True, "allow_blank": False},
        }

    def validate_correo(self, valor):
        valor = valor.strip().lower()
        if Usuario.objects.filter(correo__iexact=valor).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return valor

    def validate(self, datos):
        usuario_temporal = Usuario(
            correo=datos.get("correo", ""),
            nombre=datos.get("nombre", ""),
            apellido=datos.get("apellido", ""),
        )
        try:
            password_validation.validate_password(datos["password"], usuario_temporal)
        except Exception as error:  # ValidationError de Django
            raise serializers.ValidationError({"password": list(error.messages)})
        return datos

    def create(self, datos):
        password = datos.pop("password")
        return Usuario.objects.create_user(password=password, **datos)


class LoginSerializer(TokenObtainPairSerializer):
    """Login con correo + contraseña. Devuelve tokens y los datos del usuario."""

    def validate(self, attrs):
        if isinstance(attrs.get(self.username_field), str):
            attrs[self.username_field] = attrs[self.username_field].strip().lower()
        datos = super().validate(attrs)
        datos["usuario"] = UsuarioSerializer(self.user).data
        return datos

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["nombre"] = user.get_full_name()
        token["correo"] = user.correo
        return token


class RecuperarPasswordSerializer(serializers.Serializer):
    correo = serializers.EmailField()


class RestablecerPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nueva = serializers.CharField(write_only=True)


# ---------------------------------------------------------------------------
# Datos médicos (siempre pertenecen al usuario autenticado)
# ---------------------------------------------------------------------------

class PropietarioMixin:
    """Valida que los objetos relacionados pertenezcan al usuario autenticado."""

    def _usuario(self):
        return self.context["request"].user

    def validar_propietario(self, objeto, nombre):
        if objeto is not None and objeto.id_usuario_id != self._usuario().pk:
            raise serializers.ValidationError(f"El {nombre} seleccionado no existe.")
        return objeto


class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = [
            "id_medicamento",
            "id_usuario",
            "nombre",
            "dosis_valor",
            "dosis_unidad",
            "frecuencia",
            "duracion_valor",
            "duracion_unidad",
            "cantidad_valor",
            "cantidad_unidad",
            "fecha_formulacion",
            "indicaciones",
        ]
        read_only_fields = ["id_usuario"]


class CitaMedicaSerializer(serializers.ModelSerializer):
    paciente = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CitaMedica
        fields = "__all__"
        read_only_fields = ["id_usuario"]

    def validate(self, attrs):
        # El médico debe pertenecer a la especialidad elegida (ver catalogos.py).
        if "especialidad" in attrs or "medico" in attrs:
            especialidad = attrs.get("especialidad", getattr(self.instance, "especialidad", None))
            medico = attrs.get("medico", getattr(self.instance, "medico", None))
            if especialidad not in ESPECIALIDADES:
                raise serializers.ValidationError({"especialidad": "Selecciona una especialidad de la lista."})
            if medico not in ESPECIALIDADES[especialidad]:
                raise serializers.ValidationError(
                    {"medico": f"El médico seleccionado no atiende {especialidad}."}
                )
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data["paciente"] and instance.id_usuario_id:
            data["paciente"] = instance.id_usuario.get_full_name()
        return data


class TratamientoSerializer(PropietarioMixin, serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = "__all__"
        read_only_fields = ["id_usuario"]

    def validate_id_medicamento(self, medicamento):
        return self.validar_propietario(medicamento, "medicamento")


class RecordatorioSerializer(PropietarioMixin, serializers.ModelSerializer):
    class Meta:
        model = Recordatorio
        fields = "__all__"
        read_only_fields = ["id_usuario", "enviado", "fecha_envio"]

    def validate_id_cita(self, cita):
        return self.validar_propietario(cita, "cita")

    def validate_id_tratamiento(self, tratamiento):
        return self.validar_propietario(tratamiento, "tratamiento")

    def validate_id_medicamento(self, medicamento):
        return self.validar_propietario(medicamento, "medicamento")

    def update(self, instance, validated_data):
        # Si cambia la hora o la anticipación, la alerta se vuelve a programar.
        if {"fecha_hora", "anticipacion_minutos"} & validated_data.keys():
            validated_data["enviado"] = False
            validated_data["fecha_envio"] = None
        return super().update(instance, validated_data)
