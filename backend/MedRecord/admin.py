from django.contrib import admin
from .models import Usuario, Medicamento, CitaMedica, Tratamiento, Recordatorio


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("cedula", "nombre", "apellido", "correo")
    search_fields = ("cedula", "nombre", "apellido", "correo")


admin.site.register(Medicamento)
admin.site.register(CitaMedica)
admin.site.register(Tratamiento)
admin.site.register(Recordatorio)