FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Estilos del panel de administración, listos para producción
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Migra y arranca: runserver en desarrollo, gunicorn en producción (ver iniciar_servidor.py)
CMD ["python", "manage.py", "iniciar_servidor"]
