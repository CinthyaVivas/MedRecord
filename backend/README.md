# Backend - Sistema de Medicación (Django + DRF)

## Instalación y ejecución local en Windows

Abre PowerShell en la carpeta `backend` y ejecuta estos comandos. La activación
del entorno virtual, la configuración de la conexión y el servidor deben
hacerse en la misma ventana de PowerShell.

```powershell
# Crear y activar el entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt
```

### Preparar PostgreSQL

Comprueba en `services.msc` que el servicio PostgreSQL esté iniciado. Si `psql`
no está en el PATH, agrega temporalmente la carpeta `bin` de tu instalación
(ajusta `18` si tienes otra versión):

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
psql -h localhost -U postgres -d postgres
```

Introduce la contraseña del usuario `postgres` cuando la solicite. En la
consola de PostgreSQL, crea la base de datos (solo la primera vez) y sal:

```sql
CREATE DATABASE nombre_bd;
\q
```

Si `nombre_bd` ya existe, no vuelvas a ejecutar `CREATE DATABASE`.

### Configurar Django (solo la primera vez)

En la carpeta `backend`, crea tu archivo de configuración local a partir de la
plantilla:

```powershell
Copy-Item .env.example .env
notepad .env
```

En `.env`, cambia `DB_PASSWORD` por la contraseña local de PostgreSQL. El
archivo `.env` es solo para tu equipo y está excluido del control de versiones;
no lo compartas ni subas al repositorio.

### Iniciar el backend

Cada vez que quieras iniciar el backend, abre PowerShell en `backend` y ejecuta:

```powershell
.\iniciar.ps1
```

El script aplica las migraciones pendientes y arranca Django. La API estará
disponible en `http://localhost:8000/api/`. Asegúrate de que el servicio de
PostgreSQL esté iniciado en Windows.

En producción, configura también `DJANGO_DEBUG=false`, `DJANGO_SECRET_KEY` con una clave secreta segura y `DJANGO_ALLOWED_HOSTS` con los dominios permitidos separados por comas. La clave de desarrollo incluida como fallback no debe usarse en producción.

Para crear un usuario administrador, ejecuta `python manage.py createsuperuser`
después de las migraciones.

## Conexión con el frontend

La URL base de la API local es `http://localhost:8000/api/`. De forma predeterminada, Django permite solicitudes desde los puertos `3000` y `5173` en `localhost` y `127.0.0.1`. Si el frontend usa otro origen, configúralo antes de iniciar Django (PowerShell):

```powershell
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
python manage.py runserver
```

Para permitir varios origenes, sepáralos por comas.

## Endpoints disponibles

- `/admin/` — panel de administración Django
- `/api/usuarios/`
- `/api/medicamentos/`
- `/api/citas/` (filtrable por `?id_usuario=`)
- `/api/tratamientos/` (filtrable por `?id_usuario=`)
- `/api/recordatorios/` (filtrable por `?id_usuario=`)

## Notas

- El diseño de las tablas sigue el diagrama entidad-relación: Usuario, Medicamento, CitaMedica, Tratamiento, Recordatorio.
- Las contraseñas se guardan hasheadas usando `django.contrib.auth.hashers.make_password`.
- CORS está habilitado para `http://localhost:3000` (React).
