from django.contrib import admin
from django.urls import include, path

# /salud/ lo responde nombre_proyecto.salud.SaludMiddleware (chequeo de Render).
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('MedRecord.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
