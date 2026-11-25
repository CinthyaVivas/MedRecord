from django.http import JsonResponse


class SaludMiddleware:
    """
    Responde /salud/ antes que cualquier otra validación.

    Render hace el chequeo de salud desde su red interna, con una dirección (Host)
    que no está en ALLOWED_HOSTS. Sin esto Django respondería 400, Render pensaría
    que el servicio está caído y lo reiniciaría una y otra vez.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/salud/":
            return JsonResponse({"estado": "ok"})
        return self.get_response(request)
