from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CambiarPasswordView,
    CatalogosView,
    CitaMedicaViewSet,
    LoginView,
    MedicamentoViewSet,
    PerfilView,
    RecordatorioViewSet,
    RecuperarPasswordView,
    RegistroView,
    RestablecerPasswordView,
    TratamientoViewSet,
    UsuarioViewSet,
)

router = DefaultRouter()
router.register("usuarios", UsuarioViewSet, basename="usuarios")
router.register("medicamentos", MedicamentoViewSet, basename="medicamentos")
router.register("citas", CitaMedicaViewSet, basename="citas")
router.register("tratamientos", TratamientoViewSet, basename="tratamientos")
router.register("recordatorios", RecordatorioViewSet, basename="recordatorios")

auth_urls = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/registro/", RegistroView.as_view(), name="registro"),
    path("auth/yo/", PerfilView.as_view(), name="perfil"),
    path("auth/recuperar/", RecuperarPasswordView.as_view(), name="recuperar_password"),
    path("auth/restablecer/", RestablecerPasswordView.as_view(), name="restablecer_password"),
    path("auth/cambiar-password/", CambiarPasswordView.as_view(), name="cambiar_password"),
]

urlpatterns = auth_urls + [
    path("catalogos/", CatalogosView.as_view(), name="catalogos"),
] + router.urls
