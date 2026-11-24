from django.db import migrations, models


def populate_cedulas(apps, schema_editor):
    Usuario = apps.get_model('MedRecord', 'Usuario')
    for usuario in Usuario.objects.all():
        usuario.cedula = f"CED-{usuario.id_usuario}"
        usuario.save(update_fields=['cedula'])


class Migration(migrations.Migration):

    dependencies = [
        ('MedRecord', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='cedula',
            field=models.CharField(default='CED-0', max_length=20, unique=True, db_index=True, verbose_name='Cédula / número de identidad'),
        ),
        migrations.RunPython(populate_cedulas, migrations.RunPython.noop),
    ]
