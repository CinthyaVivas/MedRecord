$python = Join-Path $PSScriptRoot 'venv\Scripts\python.exe'
$envFile = Join-Path $PSScriptRoot '.env'

if (-not (Test-Path $python)) {
    Write-Error "No existe el entorno virtual. Créalo con: python -m venv venv"
    exit 1
}

if (-not (Test-Path $envFile)) {
    Write-Error "Falta .env. Créalo copiando .env.example y configura DB_PASSWORD."
    exit 1
}

Set-Location $PSScriptRoot
& $python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& $python manage.py runserver
exit $LASTEXITCODE
