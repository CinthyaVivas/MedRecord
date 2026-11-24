"""Envío de correos: recuperación de contraseña y alertas de recordatorios."""

import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


def _modo_consola():
    return settings.EMAIL_BACKEND.endswith("console.EmailBackend")


def _fecha_legible(fecha_hora):
    local = timezone.localtime(fecha_hora)
    return local.strftime("%d/%m/%Y a las %I:%M %p")


def enviar_correo_recuperacion(usuario):
    uid = urlsafe_base64_encode(force_bytes(usuario.pk))
    token = default_token_generator.make_token(usuario)
    enlace = f"{settings.FRONTEND_URL}/restablecer?uid={uid}&token={token}"

    asunto = "MedRecord · Restablece tu contraseña"
    mensaje = (
        f"Hola {usuario.get_short_name()},\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta en MedRecord.\n"
        "Abre este enlace para crear una contraseña nueva:\n\n"
        f"{enlace}\n\n"
        f"El enlace vence en {settings.PASSWORD_RESET_TIMEOUT // 3600} horas y solo se puede usar una vez.\n"
        "Si no fuiste tú, ignora este correo: tu contraseña no cambiará.\n\n"
        "— MedRecord"
    )
    send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [usuario.correo])
    if _modo_consola():
        # Sin servidor de correo, el texto del correo sale codificado en los logs;
        # se deja el enlace legible para poder probar.
        logger.info("Enlace de recuperación para %s: %s", usuario.correo, enlace)


def contenido_alerta(recordatorio):
    """Devuelve (asunto, mensaje) para el correo de un recordatorio."""
    usuario = recordatorio.id_usuario
    cuando = _fecha_legible(recordatorio.fecha_hora)

    if recordatorio.tipo == "cita":
        cita = recordatorio.id_cita
        if cita:
            asunto = f"Recordatorio: cita de {cita.especialidad} el {cita.fecha:%d/%m/%Y}"
            detalle = (
                f"Tienes una cita médica:\n\n"
                f"  • Especialidad: {cita.especialidad}\n"
                f"  • Médico: {cita.medico}\n"
                f"  • Fecha: {cita.fecha:%d/%m/%Y} a las {cita.hora:%I:%M %p}\n"
                f"  • Lugar: {cita.lugar}\n"
            )
        else:
            asunto = "Recordatorio: cita médica"
            detalle = f"Tienes una cita médica programada para el {cuando}.\n"
    else:
        medicamento = recordatorio.id_medicamento or (
            recordatorio.id_tratamiento.id_medicamento if recordatorio.id_tratamiento else None
        )
        if medicamento:
            asunto = f"Recordatorio: toma de {medicamento.nombre}"
            dosis = (
                f"{medicamento.dosis_valor.normalize():f} {medicamento.dosis_unidad}"
                if medicamento.dosis_valor is not None
                else ""
            )
            lineas = [f"Es momento de tu medicación ({cuando}):\n", f"  • Medicamento: {medicamento.nombre}"]
            if dosis:
                lineas.append(f"  • Dosis: {dosis}")
            if medicamento.frecuencia:
                lineas.append(f"  • Frecuencia: {medicamento.frecuencia}")
            if medicamento.indicaciones:
                lineas.append(f"  • Indicaciones: {medicamento.indicaciones}")
            detalle = "\n".join(lineas) + "\n"
        else:
            asunto = "Recordatorio: medicación"
            detalle = f"Tienes una toma de medicamento programada para el {cuando}.\n"

    mensaje = (
        f"Hola {usuario.get_short_name()},\n\n"
        f"{detalle}\n"
        f"Puedes ver tus recordatorios en {settings.FRONTEND_URL}/recordatorios\n\n"
        "— MedRecord"
    )
    return asunto, mensaje


def enviar_alerta(recordatorio):
    asunto, mensaje = contenido_alerta(recordatorio)
    send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [recordatorio.id_usuario.correo])
