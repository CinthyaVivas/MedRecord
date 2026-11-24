from django.db import models


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    cedula = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        default="SIN-CEDULA",
        verbose_name="Cédula / número de identidad"
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.cedula})"


class Medicamento(models.Model):
    id_medicamento = models.AutoField(primary_key=True)
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

    def __str__(self):
        return f"{self.tipo} - {self.fecha_hora}"
