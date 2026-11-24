from datetime import timedelta

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _crear(self, correo, password, **extra):
        if not correo:
            raise ValueError("El correo es obligatorio.")
        correo = self.normalize_email(correo).lower()
        usuario = self.model(correo=correo, **extra)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_user(self, correo, password=None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._crear(correo, password, **extra)

    def create_superuser(self, correo, password=None, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self._crear(correo, password, **extra)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Usuario del sistema. Inicia sesión con su correo."""

    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=True, default="")
    apellido = models.CharField(max_length=100, blank=True, default="")
    correo = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_staff = models.BooleanField(default=False, verbose_name="Acceso al panel de administración")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "correo"
    EMAIL_FIELD = "correo"
    REQUIRED_FIELDS = ["nombre", "apellido"]

    def get_full_name(self):
        return f"{self.nombre} {self.apellido}".strip() or self.correo

    def get_short_name(self):
        return self.nombre or self.correo

    def __str__(self):
        return f"{self.get_full_name()} ({self.correo})"


class Medicamento(models.Model):
    id_medicamento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="medicamentos",
        null=True,
        blank=True,
    )
    nombre = models.CharField(max_length=150)
    dosis_valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dosis_unidad = models.CharField(max_length=20, default="mg")
    frecuencia = models.CharField(max_length=100, blank=True, default="")
    duracion_valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duracion_unidad = models.CharField(max_length=20, default="días")
    cantidad_valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cantidad_unidad = models.CharField(max_length=30, default="tabletas")
    fecha_formulacion = models.DateField(null=True, blank=True)
    indicaciones = models.TextField(blank=True, default="")
    concentracion = models.CharField(max_length=100, blank=True, default="")
    forma_farmaceutica = models.CharField(max_length=100, blank=True, default="")
    via_administracion = models.CharField(max_length=100, blank=True, default="")

    def __str__(self):
        return self.nombre


class CitaMedica(models.Model):
    ESTADOS = [
        ("programada", "Programada"),
        ("realizada", "Realizada"),
        ("cancelada", "Cancelada"),
    ]
    id_cita = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="citas",
        null=True,
        blank=True,
    )
    paciente = models.CharField(max_length=200, blank=True, default="")
    especialidad = models.CharField(max_length=100)
    medico = models.CharField(max_length=150)
    fecha = models.DateField()
    hora = models.TimeField()
    lugar = models.CharField(max_length=200)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="programada")

    def __str__(self):
        return f"{self.medico} - {self.fecha}"


class Tratamiento(models.Model):
    id_tratamiento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="tratamientos")
    id_medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name="tratamientos")
    dosis = models.CharField(max_length=100)
    frecuencia = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.id_medicamento} - {self.id_usuario}"


class Recordatorio(models.Model):
    TIPOS = [
        ("medicacion", "Medicación"),
        ("cita", "Cita médica"),
    ]
    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("completado", "Completado"),
        ("cancelado", "Cancelado"),
    ]
    id_recordatorio = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="recordatorios")
    id_cita = models.ForeignKey(CitaMedica, on_delete=models.CASCADE, related_name="recordatorios", null=True, blank=True)
    id_tratamiento = models.ForeignKey(Tratamiento, on_delete=models.CASCADE, related_name="recordatorios", null=True, blank=True)
    id_medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name="recordatorios", null=True, blank=True)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    fecha_hora = models.DateTimeField()
    anticipacion_minutos = models.IntegerField(default=15)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pendiente")
    enviado = models.BooleanField(default=False, help_text="Ya se envió el correo de alerta")
    fecha_envio = models.DateTimeField(null=True, blank=True)

    @property
    def momento_alerta(self):
        return self.fecha_hora - timedelta(minutes=self.anticipacion_minutos)

    def __str__(self):
        return f"{self.tipo} - {self.fecha_hora}"
