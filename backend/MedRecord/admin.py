from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import CitaMedica, Medicamento, Recordatorio, Tratamiento, Usuario


class UsuarioCreacionForm(forms.ModelForm):
    password1 = forms.CharField(label="Contraseña", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirmar contraseña", widget=forms.PasswordInput)

    class Meta:
        model = Usuario
        fields = ("correo", "nombre", "apellido")

    def clean_password2(self):
        p1, p2 = self.cleaned_data.get("password1"), self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Las contraseñas no coinciden.")
        return p2

    def save(self, commit=True):
        usuario = super().save(commit=False)
        usuario.correo = usuario.correo.lower()
        usuario.set_password(self.cleaned_data["password1"])
        if commit:
            usuario.save()
        return usuario


class UsuarioEdicionForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(label="Contraseña")

    class Meta:
        model = Usuario
        fields = "__all__"


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    form = UsuarioEdicionForm
    add_form = UsuarioCreacionForm

    list_display = ("correo", "nombre", "apellido", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("correo", "nombre", "apellido")
    ordering = ("correo",)
    readonly_fields = ("last_login", "fecha_registro")

    fieldsets = (
        (None, {"fields": ("correo", "password")}),
        ("Datos personales", {"fields": ("nombre", "apellido")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Fechas", {"fields": ("last_login", "fecha_registro")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("correo", "nombre", "apellido", "password1", "password2"),
        }),
    )


@admin.register(Recordatorio)
class RecordatorioAdmin(admin.ModelAdmin):
    list_display = ("tipo", "id_usuario", "fecha_hora", "anticipacion_minutos", "estado", "enviado")
    list_filter = ("tipo", "estado", "enviado")


admin.site.register(Medicamento)
admin.site.register(CitaMedica)
admin.site.register(Tratamiento)
