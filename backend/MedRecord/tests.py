import re
from datetime import date, time, timedelta
from io import StringIO

from django.core import mail
from django.core.cache import cache
from django.core.management import call_command
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CitaMedica, Medicamento, Recordatorio, Usuario

PASSWORD = "Clave-Segura-2026"


def crear_usuario(correo, nombre="Ana"):
    return Usuario.objects.create_user(
        correo=correo, password=PASSWORD, nombre=nombre, apellido="Prueba"
    )


class BaseTest(APITestCase):
    def setUp(self):
        cache.clear()  # reinicia los límites de intentos entre pruebas

    def autenticar(self, correo, password=PASSWORD):
        respuesta = self.client.post("/api/auth/login/", {"correo": correo, "password": password}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {respuesta.data['access']}")
        return respuesta.data


class AutenticacionTests(BaseTest):
    def test_registro_y_login_con_correo(self):
        respuesta = self.client.post(
            "/api/auth/registro/",
            {
                "nombre": "Ana",
                "apellido": "Pérez",
                "correo": "Ana@Correo.com",
                "password": PASSWORD,
            },
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        self.assertNotIn("password", respuesta.data)
        self.assertEqual(respuesta.data["correo"], "ana@correo.com")

        datos = self.autenticar("ANA@correo.com")
        self.assertIn("access", datos)
        self.assertIn("refresh", datos)
        self.assertEqual(datos["usuario"]["nombre"], "Ana")

        perfil = self.client.get("/api/auth/yo/")
        self.assertEqual(perfil.status_code, status.HTTP_200_OK)
        self.assertEqual(perfil.data["correo"], "ana@correo.com")

    def test_registro_rechaza_correo_repetido_y_clave_debil(self):
        crear_usuario("ana@correo.com")
        repetido = self.client.post(
            "/api/auth/registro/",
            {"nombre": "A", "apellido": "B", "correo": "ana@correo.com", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(repetido.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("correo", repetido.data)

        debil = self.client.post(
            "/api/auth/registro/",
            {"nombre": "A", "apellido": "B", "correo": "b@correo.com", "password": "123"},
            format="json",
        )
        self.assertEqual(debil.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", debil.data)

    def test_login_incorrecto(self):
        crear_usuario("ana@correo.com")
        respuesta = self.client.post(
            "/api/auth/login/", {"correo": "ana@correo.com", "password": "otra"}, format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_sin_token_no_hay_acceso(self):
        for endpoint in ["/api/medicamentos/", "/api/citas/", "/api/recordatorios/", "/api/auth/yo/"]:
            self.assertEqual(self.client.get(endpoint).status_code, status.HTTP_401_UNAUTHORIZED, endpoint)

    def test_refresh_token(self):
        crear_usuario("ana@correo.com")
        datos = self.autenticar("ana@correo.com")
        self.client.credentials()
        respuesta = self.client.post("/api/auth/refresh/", {"refresh": datos["refresh"]}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)

    def test_usuarios_solo_para_administradores(self):
        crear_usuario("ana@correo.com")
        self.autenticar("ana@correo.com")
        self.assertEqual(self.client.get("/api/usuarios/").status_code, status.HTTP_403_FORBIDDEN)


class RecuperarPasswordTests(BaseTest):
    def test_flujo_completo_de_recuperacion(self):
        crear_usuario("ana@correo.com")
        respuesta = self.client.post("/api/auth/recuperar/", {"correo": "ana@correo.com"}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["ana@correo.com"])

        enlace = re.search(r"restablecer\?uid=([^&\s]+)&token=(\S+)", mail.outbox[0].body)
        self.assertIsNotNone(enlace, mail.outbox[0].body)
        uid, token = enlace.groups()

        nueva = "Nueva-Clave-2026"
        cambio = self.client.post(
            "/api/auth/restablecer/", {"uid": uid, "token": token, "password": nueva}, format="json"
        )
        self.assertEqual(cambio.status_code, status.HTTP_200_OK, cambio.data)
        self.autenticar("ana@correo.com", nueva)

        # El enlace solo sirve una vez
        otra_vez = self.client.post(
            "/api/auth/restablecer/", {"uid": uid, "token": token, "password": "Otra-Clave-2026"}, format="json"
        )
        self.assertEqual(otra_vez.status_code, status.HTTP_400_BAD_REQUEST)

    def test_correo_inexistente_responde_igual_sin_enviar(self):
        respuesta = self.client.post("/api/auth/recuperar/", {"correo": "nadie@correo.com"}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_cambiar_password_autenticado(self):
        crear_usuario("ana@correo.com")
        self.autenticar("ana@correo.com")
        respuesta = self.client.post(
            "/api/auth/cambiar-password/",
            {"password_actual": PASSWORD, "password_nueva": "Cambiada-2026"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.client.credentials()
        self.autenticar("ana@correo.com", "Cambiada-2026")


class DatosPorUsuarioTests(BaseTest):
    def setUp(self):
        super().setUp()
        self.ana = crear_usuario("ana@correo.com", "Ana")
        self.luis = crear_usuario("luis@correo.com", "Luis")
        self.med_luis = Medicamento.objects.create(id_usuario=self.luis, nombre="Ibuprofeno")
        self.cita_luis = CitaMedica.objects.create(
            id_usuario=self.luis, especialidad="Medicina general", medico="Dra. Laura Méndez",
            fecha=date(2026, 12, 1), hora=time(10, 0), lugar="Clínica",
        )

    def test_crea_medicamento_y_queda_a_nombre_del_usuario(self):
        self.autenticar("ana@correo.com")
        respuesta = self.client.post(
            "/api/medicamentos/",
            {"nombre": "Paracetamol", "dosis_valor": "500", "dosis_unidad": "mg", "id_usuario": self.luis.pk},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        self.assertEqual(respuesta.data["id_usuario"], self.ana.pk)  # ignora el id enviado

        lista = self.client.get("/api/medicamentos/?search=parac")
        self.assertEqual([m["nombre"] for m in lista.data], ["Paracetamol"])

    def test_no_ve_ni_modifica_datos_de_otro_usuario(self):
        self.autenticar("ana@correo.com")
        self.assertEqual(self.client.get("/api/medicamentos/").data, [])
        self.assertEqual(self.client.get("/api/citas/").data, [])
        self.assertEqual(
            self.client.patch(f"/api/citas/{self.cita_luis.pk}/", {"estado": "cancelada"}, format="json").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_no_puede_ligar_recordatorio_a_cita_ajena(self):
        self.autenticar("ana@correo.com")
        respuesta = self.client.post(
            "/api/recordatorios/",
            {"tipo": "cita", "fecha_hora": "2026-12-01T09:00:00Z", "id_cita": self.cita_luis.pk},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("id_cita", respuesta.data)

    def test_cita_toma_el_nombre_del_paciente_del_usuario(self):
        self.autenticar("ana@correo.com")
        respuesta = self.client.post(
            "/api/citas/",
            {"medico": "Dr. Martín Pérez", "especialidad": "Cardiología", "fecha": "2026-12-05",
             "hora": "09:00:00", "lugar": "Clínica", "paciente": ""},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        self.assertEqual(respuesta.data["paciente"], "Ana Prueba")
        self.assertEqual(respuesta.data["id_usuario"], self.ana.pk)


class CatalogosTests(BaseTest):
    def setUp(self):
        super().setUp()
        crear_usuario("ana@correo.com", "Ana")
        self.autenticar("ana@correo.com")

    def cita(self, especialidad, medico):
        return self.client.post(
            "/api/citas/",
            {"medico": medico, "especialidad": especialidad, "fecha": "2026-12-05",
             "hora": "09:00:00", "lugar": "Clínica"},
            format="json",
        )

    def test_catalogo_trae_especialidades_medicos_y_medicamentos(self):
        respuesta = self.client.get("/api/catalogos/")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        cardio = next(e for e in respuesta.data["especialidades"] if e["nombre"] == "Cardiología")
        self.assertIn("Dr. Martín Pérez", cardio["medicos"])
        nombres = [m["nombre"] for grupo in respuesta.data["medicamentos"] for m in grupo["items"]]
        self.assertIn("Losartán", nombres)
        self.assertIn("Clínica", respuesta.data["lugares"])

    def test_catalogo_requiere_sesion(self):
        self.client.credentials()
        self.assertEqual(self.client.get("/api/catalogos/").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_medico_de_su_especialidad_se_acepta(self):
        self.assertEqual(self.cita("Pediatría", "Dra. Catalina Ríos").status_code, status.HTTP_201_CREATED)

    def test_medico_de_otra_especialidad_se_rechaza(self):
        respuesta = self.cita("Pediatría", "Dr. Martín Pérez")
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("medico", respuesta.data)

    def test_medico_o_especialidad_inventados_se_rechazan(self):
        self.assertEqual(self.cita("Pediatría", "Dr. Inventado").status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.cita("Astrología", "Dra. Catalina Ríos").status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelar_cita_no_exige_reenviar_medico(self):
        cita_id = self.cita("Pediatría", "Dra. Catalina Ríos").data["id_cita"]
        respuesta = self.client.patch(f"/api/citas/{cita_id}/", {"estado": "cancelada"}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)


class AlertasCorreoTests(BaseTest):
    def setUp(self):
        super().setUp()
        self.ana = crear_usuario("ana@correo.com", "Ana")
        self.med = Medicamento.objects.create(
            id_usuario=self.ana, nombre="Losartán", dosis_valor="50", dosis_unidad="mg", frecuencia="Cada 12 horas"
        )

    def nuevo(self, minutos_desde_ahora, anticipacion=15, **extra):
        return Recordatorio.objects.create(
            id_usuario=self.ana, tipo="medicacion", id_medicamento=self.med,
            fecha_hora=timezone.now() + timedelta(minutes=minutos_desde_ahora),
            anticipacion_minutos=anticipacion, **extra,
        )

    def ejecutar(self):
        call_command("enviar_recordatorios", stdout=StringIO(), stderr=StringIO())

    def test_envia_solo_los_que_llegaron_a_su_hora_de_aviso(self):
        debido = self.nuevo(10, anticipacion=15)       # aviso hace 5 min -> se envía
        futuro = self.nuevo(60, anticipacion=15)       # aviso en 45 min -> no
        atendido = self.nuevo(5, estado="completado")  # ya atendido -> no
        viejo = self.nuevo(-60 * 24)                   # de ayer -> no

        self.ejecutar()

        self.assertEqual(len(mail.outbox), 1)
        correo = mail.outbox[0]
        self.assertEqual(correo.to, ["ana@correo.com"])
        self.assertIn("Losartán", correo.subject)
        self.assertIn("50 mg", correo.body)

        debido.refresh_from_db()
        self.assertTrue(debido.enviado)
        self.assertIsNotNone(debido.fecha_envio)
        for r in (futuro, atendido, viejo):
            r.refresh_from_db()
            self.assertFalse(r.enviado)

    def test_no_envia_dos_veces(self):
        self.nuevo(5)
        self.ejecutar()
        self.ejecutar()
        self.assertEqual(len(mail.outbox), 1)

    def test_correo_de_cita(self):
        cita = CitaMedica.objects.create(
            id_usuario=self.ana, especialidad="Cardiología", medico="Dr. Martín Pérez",
            fecha=date(2026, 12, 1), hora=time(8, 30), lugar="Hospital",
        )
        Recordatorio.objects.create(
            id_usuario=self.ana, tipo="cita", id_cita=cita,
            fecha_hora=timezone.now() + timedelta(minutes=30), anticipacion_minutos=60,
        )
        self.ejecutar()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Cardiología", mail.outbox[0].subject)
        self.assertIn("Dr. Martín Pérez", mail.outbox[0].body)

    def test_reprogramar_reactiva_la_alerta(self):
        recordatorio = self.nuevo(5)
        self.ejecutar()
        self.autenticar("ana@correo.com")
        nueva_hora = (timezone.now() + timedelta(minutes=10)).isoformat()
        respuesta = self.client.patch(
            f"/api/recordatorios/{recordatorio.pk}/", {"fecha_hora": nueva_hora}, format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertFalse(respuesta.data["enviado"])
        self.ejecutar()
        self.assertEqual(len(mail.outbox), 2)
