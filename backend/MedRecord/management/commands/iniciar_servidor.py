"""
Arranque del contenedor del backend.

- Aplica las migraciones.
- Si SCHEDULER_EN_WEB=true, deja corriendo el programador de alertas en segundo plano
  (útil en Render gratuito, donde no hay "background workers" sin costo).
- Desarrollo (DJANGO_DEBUG=true): servidor de Django con recarga automática.
- Producción (DJANGO_DEBUG=false): gunicorn en el puerto que indique PORT.
"""

import os
import subprocess
import sys

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Migra la base de datos y arranca el servidor (desarrollo o producción)."

    def handle(self, *args, **opciones):
        call_command("migrate", interactive=False)

        if os.environ.get("SCHEDULER_EN_WEB", "").strip().lower() == "true":
            subprocess.Popen([sys.executable, "manage.py", "enviar_recordatorios", "--loop"])
            self.stdout.write("Programador de alertas iniciado dentro del servicio web.")

        if settings.DEBUG:
            comando = [sys.executable, "manage.py", "runserver", "0.0.0.0:8000"]
        else:
            puerto = os.environ.get("PORT", "8000")
            comando = [
                "gunicorn", "nombre_proyecto.wsgi:application",
                "--bind", f"0.0.0.0:{puerto}",
                "--workers", os.environ.get("GUNICORN_WORKERS", "2"),
                "--timeout", "60",
                "--access-logfile", "-",
            ]
        sys.stdout.flush()
        os.execvp(comando[0], comando)
