from datetime import date, time

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CitaMedica, Medicamento, Recordatorio, Tratamiento, Usuario


class ApiIntegrationTests(APITestCase):
	def test_crea_y_busca_medicamento_con_campos_del_frontend(self):
		medicamento = {
			"nombre": "Paracetamol",
			"dosis_valor": "500",
			"dosis_unidad": "mg",
			"frecuencia": "Cada 8 horas",
			"duracion_valor": "7",
			"duracion_unidad": "días",
			"cantidad_valor": "21",
			"cantidad_unidad": "tabletas",
			"fecha_formulacion": "2026-09-28",
			"indicaciones": "Tomar con alimentos",
		}
		response = self.client.post("/api/medicamentos/", medicamento, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data["nombre"], "Paracetamol")
		self.assertEqual(response.data["dosis_unidad"], "mg")
		self.assertNotIn("concentracion", response.data)

		search_response = self.client.get("/api/medicamentos/?search=parac")
		self.assertEqual(search_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(search_response.data), 1)

	def test_crea_y_cancela_cita_desde_el_frontend(self):
		cita = {
			"paciente": "Ana Prueba",
			"medico": "Dra. Uno",
			"especialidad": "General",
			"fecha": "2026-10-01",
			"hora": "09:00:00",
			"lugar": "Consulta 1",
		}
		response = self.client.post("/api/citas/", cita, format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data["paciente"], "Ana Prueba")
		self.assertIsNone(response.data["id_usuario"])

		cancel_response = self.client.patch(
			f"/api/citas/{response.data['id_cita']}/",
			{"estado": "cancelada"},
			format="json",
		)
		self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
		self.assertEqual(cancel_response.data["estado"], "cancelada")


class UsuarioFilterTests(APITestCase):
	def setUp(self):
		self.usuario = Usuario.objects.create(
			cedula="TEST-001",
			nombre="Ana",
			apellido="Uno",
			correo="ana@example.com",
			contraseña="hash",
		)
		self.otro_usuario = Usuario.objects.create(
			cedula="TEST-002",
			nombre="Luis",
			apellido="Dos",
			correo="luis@example.com",
			contraseña="hash",
		)

	def assert_filtra_por_usuario(self, endpoint, campo_id, id_esperado):
		response = self.client.get(endpoint, {"id_usuario": self.usuario.id_usuario})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual([item[campo_id] for item in response.data], [id_esperado])

	def test_filtra_citas(self):
		cita = CitaMedica.objects.create(
			id_usuario=self.usuario,
			especialidad="General",
			medico="Dra. Uno",
			fecha=date(2026, 9, 28),
			hora=time(9, 0),
			lugar="Consulta 1",
		)
		CitaMedica.objects.create(
			id_usuario=self.otro_usuario,
			especialidad="General",
			medico="Dr. Dos",
			fecha=date(2026, 9, 29),
			hora=time(10, 0),
			lugar="Consulta 2",
		)

		self.assert_filtra_por_usuario("/api/citas/", "id_cita", cita.id_cita)

	def test_filtra_tratamientos(self):
		medicamento = Medicamento.objects.create(
			nombre="Medicamento de prueba",
			concentracion="10 mg",
			forma_farmaceutica="Tableta",
			via_administracion="Oral",
		)
		tratamiento = Tratamiento.objects.create(
			id_usuario=self.usuario,
			id_medicamento=medicamento,
			dosis="1 tableta",
			frecuencia="Diaria",
			fecha_inicio=date(2026, 9, 28),
		)
		Tratamiento.objects.create(
			id_usuario=self.otro_usuario,
			id_medicamento=medicamento,
			dosis="1 tableta",
			frecuencia="Diaria",
			fecha_inicio=date(2026, 9, 28),
		)

		self.assert_filtra_por_usuario(
			"/api/tratamientos/", "id_tratamiento", tratamiento.id_tratamiento
		)

	def test_filtra_recordatorios(self):
		recordatorio = Recordatorio.objects.create(
			id_usuario=self.usuario,
			tipo="medicacion",
			fecha_hora=timezone.now(),
		)
		Recordatorio.objects.create(
			id_usuario=self.otro_usuario,
			tipo="medicacion",
			fecha_hora=timezone.now(),
		)

		self.assert_filtra_por_usuario(
			"/api/recordatorios/", "id_recordatorio", recordatorio.id_recordatorio
		)

	def test_crea_recordatorio_asociado_directamente_a_medicamento(self):
		medicamento = Medicamento.objects.create(nombre="Medicamento asociado")

		response = self.client.post(
			"/api/recordatorios/",
			{
				"id_usuario": self.usuario.id_usuario,
				"id_medicamento": medicamento.id_medicamento,
				"tipo": "medicacion",
				"fecha_hora": "2026-10-01T09:00:00Z",
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data["id_medicamento"], medicamento.id_medicamento)
		self.assertIsNone(response.data["id_tratamiento"])
