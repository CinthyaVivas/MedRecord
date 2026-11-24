from rest_framework import filters, viewsets
from .models import Usuario, Medicamento, CitaMedica, Tratamiento, Recordatorio
from .serializers import (
    UsuarioSerializer,
    MedicamentoSerializer,
    CitaMedicaSerializer,
    TratamientoSerializer,
    RecordatorioSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nombre", "frecuencia", "indicaciones"]


class UsuarioFilterViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = super().get_queryset()
        id_usuario = self.request.query_params.get("id_usuario")
        if id_usuario:
            queryset = queryset.filter(id_usuario=id_usuario)
        return queryset


class CitaMedicaViewSet(UsuarioFilterViewSet):
    queryset = CitaMedica.objects.select_related("id_usuario")
    serializer_class = CitaMedicaSerializer


class TratamientoViewSet(UsuarioFilterViewSet):
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer


class RecordatorioViewSet(UsuarioFilterViewSet):
    queryset = Recordatorio.objects.all()
    serializer_class = RecordatorioSerializer
