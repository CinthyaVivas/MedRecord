"""
Envía por correo las alertas de los recordatorios que ya llegaron a su hora de aviso.

Uso:
    python manage.py enviar_recordatorios           # revisa una vez y termina
    python manage.py enviar_recordatorios --loop    # revisa cada minuto (contenedor "scheduler")
"""

import signal
import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import DatabaseError, close_old_connections, transaction
from django.utils import timezone

from MedRecord.correos import enviar_alerta
from MedRecord.models import Recordatorio

# Recordatorios cuya hora ya pasó hace más de esto no se envían (evita avisos viejos).
VENTANA_ATRASO = timedelta(hours=12)
# La anticipación máxima que se revisa hacia el futuro.
HORIZONTE = timedelta(days=30)


class Command(BaseCommand):
    help = "Envía los correos de alerta de los recordatorios pendientes."

    def add_arguments(self, parser):
        parser.add_argument("--loop", action="store_true", help="Repetir indefinidamente.")
        parser.add_argument("--intervalo", type=int, default=60, help="Segundos entre revisiones (con --loop).")

    def handle(self, *args, **opciones):
        if not opciones["loop"]:
            self.revisar()
            return

        self.detener = False
        signal.signal(signal.SIGTERM, self._senal_detener)
        signal.signal(signal.SIGINT, self._senal_detener)
        self.stdout.write(f"Programador de alertas iniciado (cada {opciones['intervalo']} s).")

        while not self.detener:
            close_old_connections()
            try:
                self.revisar()
            except DatabaseError as error:
                # Ej.: la base de datos aún no está lista o faltan migraciones.
                self.stderr.write(f"Base de datos no disponible todavía: {error}")
            for _ in range(opciones["intervalo"]):
                if self.detener:
                    break
                time.sleep(1)
        self.stdout.write("Programador de alertas detenido.")

    def _senal_detener(self, *_):
        self.detener = True

    def revisar(self):
        ahora = timezone.now()
        enviados = fallidos = 0

        with transaction.atomic():
            candidatos = (
                Recordatorio.objects.select_for_update(skip_locked=True, of=("self",))
                .select_related("id_usuario", "id_cita", "id_medicamento", "id_tratamiento__id_medicamento")
                .filter(
                    estado="pendiente",
                    enviado=False,
                    id_usuario__is_active=True,
                    fecha_hora__gte=ahora - VENTANA_ATRASO,
                    fecha_hora__lte=ahora + HORIZONTE,
                )
            )
            for recordatorio in candidatos:
                if recordatorio.momento_alerta > ahora:
                    continue
                try:
                    enviar_alerta(recordatorio)
                except Exception as error:  # se reintenta en la siguiente revisión
                    fallidos += 1
                    self.stderr.write(
                        f"No se pudo enviar el recordatorio {recordatorio.pk} "
                        f"a {recordatorio.id_usuario.correo}: {error}"
                    )
                    continue
                recordatorio.enviado = True
                recordatorio.fecha_envio = timezone.now()
                recordatorio.save(update_fields=["enviado", "fecha_envio"])
                enviados += 1

        if enviados or fallidos:
            self.stdout.write(f"{timezone.localtime(ahora):%Y-%m-%d %H:%M} · enviados: {enviados} · fallidos: {fallidos}")
