import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("MedRecord", "0004_citamedica_paciente_medicamento_cantidad_unidad_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="recordatorio",
            name="id_medicamento",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="recordatorios",
                to="MedRecord.medicamento",
            ),
        ),
    ]
