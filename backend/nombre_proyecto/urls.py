from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def salud(request):
    """Chequeo de salud: Render lo usa para saber si el servicio está vivo."""
    return JsonResponse({"estado": "ok"})


urlpatterns = [
    path('salud/', salud),
    path('admin/', admin.site.urls),
    path('api/', include('MedRecord.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
