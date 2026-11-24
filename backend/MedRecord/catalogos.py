"""
Catálogos fijos de la aplicación: especialidades con sus médicos, lugares de consulta
y medicamentos. Para agregar o quitar opciones basta con editar estas listas.

Los nombres de los médicos son ficticios.
"""

ESPECIALIDADES = {
    "Medicina general": ["Dra. Laura Méndez", "Dr. Andrés Castaño", "Dra. Paola Rincón"],
    "Cardiología": ["Dr. Martín Pérez", "Dra. Carolina Ospina", "Dr. Felipe Arango"],
    "Dermatología": ["Dra. Valentina Restrepo", "Dr. Julián Cárdenas"],
    "Endocrinología": ["Dra. Natalia Quintero", "Dr. Sebastián Mejía"],
    "Ginecología": ["Dra. Marcela Gómez", "Dra. Daniela Torres", "Dr. Ricardo Salazar"],
    "Neurología": ["Dr. Camilo Herrera", "Dra. Juliana Vargas"],
    "Oftalmología": ["Dr. Esteban Giraldo", "Dra. Mónica Pardo"],
    "Pediatría": ["Dra. Catalina Ríos", "Dr. Diego Montoya", "Dra. Isabel Duarte"],
    "Psicología": ["Dra. Lucía Aristizábal", "Dr. Tomás Benítez"],
    "Traumatología": ["Dr. Alejandro Rojas", "Dr. Mauricio Londoño", "Dra. Sara Villegas"],
}

LUGARES = [
    "Consultorio particular",
    "Clínica",
    "Hospital",
    "Centro médico",
    "Centro de salud",
]

# Cada medicamento trae las unidades más comunes para llenar el formulario.
MEDICAMENTOS = [
    {
        "categoria": "Dolor, fiebre e inflamación",
        "items": [
            {"nombre": "Acetaminofén", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Ibuprofeno", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Naproxeno", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Diclofenaco", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Dipirona (metamizol)", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Tramadol", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
        ],
    },
    {
        "categoria": "Antibióticos",
        "items": [
            {"nombre": "Amoxicilina", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
            {"nombre": "Azitromicina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Cefalexina", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
            {"nombre": "Ciprofloxacino", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Clindamicina", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
            {"nombre": "Nitrofurantoína", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
        ],
    },
    {
        "categoria": "Corazón y presión arterial",
        "items": [
            {"nombre": "Losartán", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Enalapril", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Amlodipino", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Metoprolol", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Hidroclorotiazida", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Furosemida", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Atorvastatina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Ácido acetilsalicílico", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Clopidogrel", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
        ],
    },
    {
        "categoria": "Diabetes y tiroides",
        "items": [
            {"nombre": "Metformina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Glibenclamida", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Insulina glargina", "dosis_unidad": "UI", "cantidad_unidad": "ml"},
            {"nombre": "Levotiroxina", "dosis_unidad": "mcg", "cantidad_unidad": "tabletas"},
        ],
    },
    {
        "categoria": "Estómago y digestión",
        "items": [
            {"nombre": "Omeprazol", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
            {"nombre": "Esomeprazol", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Metoclopramida", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Loperamida", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Hidróxido de aluminio y magnesio", "dosis_unidad": "ml", "cantidad_unidad": "ml"},
        ],
    },
    {
        "categoria": "Alergias y respiratorio",
        "items": [
            {"nombre": "Loratadina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Cetirizina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Montelukast", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Salbutamol (inhalador)", "dosis_unidad": "mcg", "cantidad_unidad": "ml"},
            {"nombre": "Prednisolona", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
        ],
    },
    {
        "categoria": "Sistema nervioso",
        "items": [
            {"nombre": "Sertralina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Fluoxetina", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
            {"nombre": "Escitalopram", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Carbamazepina", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Ácido valproico", "dosis_unidad": "mg", "cantidad_unidad": "cápsulas"},
        ],
    },
    {
        "categoria": "Vitaminas y suplementos",
        "items": [
            {"nombre": "Vitamina D3", "dosis_unidad": "UI", "cantidad_unidad": "cápsulas"},
            {"nombre": "Sulfato ferroso", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Ácido fólico", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
            {"nombre": "Complejo B", "dosis_unidad": "mg", "cantidad_unidad": "tabletas"},
        ],
    },
]


def catalogos_api():
    """Estructura que devuelve GET /api/catalogos/."""
    return {
        "especialidades": [
            {"nombre": nombre, "medicos": medicos} for nombre, medicos in ESPECIALIDADES.items()
        ],
        "lugares": LUGARES,
        "medicamentos": MEDICAMENTOS,
    }
