from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet,
    MedicamentoViewSet,
    CitaMedicaViewSet,
    TratamientoViewSet,
    RecordatorioViewSet,
)

router = DefaultRouter()
router.register("usuarios", UsuarioViewSet, basename="usuarios")
router.register("medicamentos", MedicamentoViewSet, basename="medicamentos")
router.register("citas", CitaMedicaViewSet, basename="citas")
router.register("tratamientos", TratamientoViewSet, basename="tratamientos")
router.register("recordatorios", RecordatorioViewSet, basename="recordatorios")

urlpatterns = router.urls
