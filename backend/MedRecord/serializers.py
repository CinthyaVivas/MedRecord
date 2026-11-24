from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario, Medicamento, CitaMedica, Tratamiento, Recordatorio


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id_usuario", "cedula", "nombre", "apellido", "correo", "contraseña"]
        extra_kwargs = {
            "contraseña": {"write_only": True},
            "cedula": {"required": True},
        }

    def create(self, validated_data):
        validated_data["contraseña"] = make_password(validated_data["contraseña"])
        return super().create(validated_data)


class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = [
            "id_medicamento",
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


class CitaMedicaSerializer(serializers.ModelSerializer):
    paciente = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CitaMedica
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data["paciente"] and instance.id_usuario_id:
            data["paciente"] = f"{instance.id_usuario.nombre} {instance.id_usuario.apellido}"
        return data


class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamiento
        fields = "__all__"


class RecordatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recordatorio
        fields = "__all__"
