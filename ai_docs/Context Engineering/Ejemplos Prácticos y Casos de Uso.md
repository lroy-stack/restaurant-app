# Ejemplos Prácticos y Casos de Uso

## Resumen

Este módulo proporciona ejemplos prácticos y casos de uso que ilustran la aplicación de los conceptos de creación de agentes de IA, Prompt Engineering, Context Engineering y el uso de los agentes de Claude Code. Los ejemplos están diseñados para ser claros y aplicables, demostrando cómo estas tecnologías pueden resolver problemas reales y mejorar la eficiencia en diversos dominios.

## Contenido

### 1. Ejemplo de Prompt Engineering: Mejora de la Precisión de un Agente de Resumen

Imaginemos que tenemos un agente de IA cuya tarea es resumir artículos técnicos. Inicialmente, el agente produce resúmenes que son demasiado generales o que omiten detalles importantes. Podemos aplicar técnicas de Prompt Engineering para mejorar su rendimiento.

#### Prompt Inicial (Zero-shot)

```
Resume el siguiente artículo técnico:

[Contenido del Artículo]
```

**Problema:** El resumen puede ser superficial y no capturar los puntos clave técnicos.

#### Prompt Mejorado (Few-shot con Chain-of-Thought)

Para mejorar la calidad, podemos proporcionar ejemplos y guiar al agente a través de un proceso de pensamiento.

```
Eres un experto en inteligencia artificial y tu tarea es resumir artículos técnicos de manera concisa y precisa, destacando los conceptos clave, la metodología y los resultados principales. Piensa paso a paso antes de generar el resumen final.

Ejemplo 1:
Artículo: "[Artículo Técnico 1]"
Pensamiento:
1. Identificar el objetivo principal del artículo.
2. Extraer la metodología utilizada.
3. Anotar los resultados más relevantes.
4. Sintetizar los puntos clave en un resumen conciso.
Resumen: "[Resumen Conciso y Preciso del Artículo 1]"

Ejemplo 2:
Artículo: "[Artículo Técnico 2]"
Pensamiento:
1. Identificar el objetivo principal del artículo.
2. Extraer la metodología utilizada.
3. Anotar los resultados más relevantes.
4. Sintetizar los puntos clave en un resumen conciso.
Resumen: "[Resumen Conciso y Preciso del Artículo 2]"

Ahora, resume el siguiente artículo técnico:

Artículo: "[Contenido del Artículo a Resumir]"
Pensamiento:
```

**Explicación:**
*   **Rol:** "Eres un experto en inteligencia artificial..." le da al agente una personalidad y un conjunto de expectativas.
*   **Few-shot:** Se proporcionan dos ejemplos completos de artículo y resumen, mostrando el formato y el nivel de detalle deseado.
*   **Chain-of-Thought:** La sección "Pensamiento:" guía al agente a descomponer la tarea en pasos lógicos, lo que mejora la calidad del razonamiento y, por ende, del resumen.
*   **Instrucción Específica:** "destacando los conceptos clave, la metodología y los resultados principales" enfoca la atención del agente en la información más relevante.

### 2. Caso de Uso de Context Engineering: Agente de Soporte al Cliente con Memoria a Largo Plazo

Consideremos un agente de soporte al cliente que necesita recordar interacciones pasadas y preferencias del usuario para proporcionar un servicio personalizado. Aquí, el Context Engineering es crucial.

#### Arquitectura del Contexto

*   **Memoria a Corto Plazo (Conversación Actual):** El historial de la conversación actual se mantiene en el contexto del LLM para asegurar la coherencia inmediata.
*   **Memoria a Largo Plazo (Base de Datos de Clientes):** Se utiliza una base de datos externa (CRM) para almacenar el historial completo del cliente, incluyendo compras previas, problemas resueltos, preferencias de productos y notas de interacciones anteriores.
*   **Herramientas:** El agente tiene acceso a herramientas para:
    *   `buscar_historial_cliente(id_cliente)`: Recupera el historial completo de un cliente.
    *   `actualizar_preferencias_cliente(id_cliente, preferencias)`: Almacena nuevas preferencias.
    *   `buscar_base_conocimiento(consulta)`: Accede a una base de datos de preguntas frecuentes y soluciones.

#### Flujo de Interacción (Simplificado)

1.  **Usuario:** "Hola, tengo un problema con mi producto X. Ya lo mencioné la semana pasada."
2.  **Agente Primario (Claude Code):**
    *   Identifica la necesidad de contexto histórico.
    *   Invoca la herramienta `buscar_historial_cliente` con el ID del usuario.
    *   Recupera el historial: "El cliente reportó un problema similar con el producto X la semana pasada (ticket #12345). Se le sugirió reiniciar el dispositivo y verificar la conexión. También se notó que prefiere soporte por chat."
    *   Integra este historial en el contexto del prompt para el LLM.
3.  **LLM (con contexto enriquecido):** "Entiendo que ya experimentó un problema con el producto X la semana pasada. Según nuestros registros, se le sugirió reiniciar el dispositivo. ¿Ha intentado eso de nuevo? También veo que prefiere el soporte por chat, así que continuaré asistiéndole por aquí."

**Explicación:**
*   El agente no solo responde a la consulta actual, sino que utiliza el contexto histórico para mostrar empatía y ofrecer soluciones más relevantes, basándose en interacciones previas.
*   La **ingeniería de contexto** se manifiesta en la capacidad del agente primario para decidir cuándo y cómo recuperar información externa y cómo integrarla de manera efectiva en el prompt del LLM.

### 3. Ejemplo de Agentes de Claude Code: Creación de un Subagente de Generación de Pruebas Unitarias

Supongamos que queremos automatizar la creación de pruebas unitarias para nuevas funciones de Python. Podemos crear un subagente de Claude Code especializado en esta tarea.

#### Definición del Subagente (`test_generator_agent.json`)

```json
{
  "name": "test_generator",
  "description": "Genera pruebas unitarias en Python para una función dada. Invocar cuando se solicite 'generar pruebas' o 'escribir tests'.",
  "tools": [
    {
      "name": "write_file",
      "description": "Escribe contenido en un archivo dado. Útil para guardar el código de las pruebas.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "Ruta completa del archivo a escribir."
          },
          "content": {
            "type": "string",
            "description": "Contenido a escribir en el archivo."
          }
        },
        "required": ["path", "content"]
      }
    }
  ],
  "prompt": {
    "purpose": "Tu propósito es generar pruebas unitarias de alta calidad para funciones de Python. Debes cubrir casos de éxito, casos límite y manejo de errores. Utiliza el framework `unittest` o `pytest` según la preferencia indicada o `unittest` por defecto.",
    "report": "He generado las pruebas unitarias para la función solicitada y las he guardado en el archivo {file_path}. Por favor, revisa el código y ejecuta las pruebas para verificar su funcionalidad."
  }
}
```

#### Prompt del Agente Primario para Invocar el Subagente

El usuario interactúa con el agente primario, que luego invoca al subagente `test_generator`.

```
claude -p "Necesito que generes pruebas unitarias para la siguiente función de Python. La función se llama `calcular_factorial` y toma un entero `n` como entrada, devolviendo su factorial. Guarda las pruebas en `test_factorial.py`.

```python
def calcular_factorial(n):
    if n < 0:
        raise ValueError("El factorial no está definido para números negativos")
    if n == 0:
        return 1
    res = 1
    for i in range(1, n + 1):
        res *= i
    return res
```
"
```

**Flujo de Ejecución:**
1.  El agente primario recibe el prompt del usuario.
2.  Basándose en la descripción del subagente `test_generator` ("generar pruebas", "escribir tests"), el agente primario decide invocarlo.
3.  El agente primario construye un prompt para el subagente `test_generator`, incluyendo la función Python y la instrucción de guardar el resultado en `test_factorial.py`.
4.  El subagente `test_generator` utiliza su prompt de sistema y la función proporcionada para generar el código de las pruebas unitarias.
5.  El subagente utiliza la herramienta `write_file` para guardar el código generado en `test_factorial.py`.
6.  El subagente reporta al agente primario usando el formato definido en su sección `report`.
7.  El agente primario informa al usuario que las pruebas han sido generadas y guardadas.

**Contenido Esperado de `test_factorial.py` (ejemplo simplificado):**

```python
import unittest
from your_module import calcular_factorial # Asumiendo que la función está en 'your_module'

class TestCalcularFactorial(unittest.TestCase):

    def test_factorial_cero(self):
        self.assertEqual(calcular_factorial(0), 1)

    def test_factorial_positivo(self):
        self.assertEqual(calcular_factorial(1), 1)
        self.assertEqual(calcular_factorial(5), 120)
        self.assertEqual(calcular_factorial(7), 5040)

    def test_factorial_negativo(self):
        with self.assertRaises(ValueError):
            calcular_factorial(-1)

    def test_factorial_grande(self):
        # Puede que necesites un valor más grande para pruebas de rendimiento
        self.assertEqual(calcular_factorial(10), 3628800)

if __name__ == '__main__':
    unittest.main()
```

### 4. Caso de Uso Avanzado: Orquestación Multi-Agente para Desarrollo de Características

Consideremos un escenario donde un equipo de desarrollo utiliza agentes de IA para implementar una nueva característica en una aplicación web. Esto involucra múltiples pasos y la colaboración de varios subagentes.

#### Característica a Implementar: "Sistema de Notificaciones de Pedidos"

**Objetivo:** Implementar un sistema que notifique a los usuarios por correo electrónico cuando el estado de su pedido cambie (ej. "enviado", "entregado").

#### Agentes Involucrados:

*   **Agente Primario (Coordinador):** Recibe la solicitud del usuario y orquesta el flujo.
*   **Subagente de Diseño de API (`api_designer`):** Diseña los endpoints de la API necesarios para las notificaciones.
*   **Subagente de Desarrollo Backend (`backend_dev`):** Implementa la lógica del servidor y la integración con la base de datos.
*   **Subagente de Desarrollo Frontend (`frontend_dev`):** Crea la interfaz de usuario para que los administradores puedan cambiar el estado del pedido.
*   **Subagente de Generación de Pruebas (`test_generator`):** Genera pruebas unitarias y de integración para el nuevo código.
*   **Subagente de Documentación (`doc_writer`):** Genera documentación para la nueva característica.

#### Flujo de Orquestación (Simplificado)

1.  **Usuario:** "Implementar un sistema de notificaciones por correo electrónico para cambios de estado de pedidos."
2.  **Agente Primario:**
    *   Invoca a `api_designer` para diseñar los endpoints de notificación.
    *   Recibe el diseño de la API.
    *   Invoca a `backend_dev` para implementar la lógica del servidor y la integración con el servicio de correo electrónico, utilizando el diseño de la API.
    *   Recibe el código backend.
    *   Invoca a `frontend_dev` para crear la interfaz de usuario, utilizando el diseño de la API y el backend implementado.
    *   Recibe el código frontend.
    *   Invoca a `test_generator` para generar pruebas para el código backend y frontend.
    *   Recibe las pruebas generadas.
    *   Invoca a `doc_writer` para generar la documentación de la característica.
    *   Recibe la documentación.
    *   Reporta al usuario el éxito de la implementación y proporciona los archivos generados.

**Explicación:**
*   Este caso de uso demuestra cómo el agente primario actúa como un orquestador, delegando tareas complejas a subagentes especializados.
*   Cada subagente opera en su propio contexto, pero el agente primario se encarga de pasar el contexto relevante (ej. diseño de API, código generado) entre ellos.
*   La capacidad de los subagentes para reportar al agente primario es fundamental para que el coordinador pueda tomar decisiones sobre los próximos pasos y manejar las dependencias.

### 5. Glosario de Términos Clave

Para facilitar la comprensión de los conceptos presentados en esta documentación, se incluye un glosario de términos clave. (Ver [Glosario de Términos Clave](06_glosario.md))

---

**Navegación:**
- [← Agentes de Claude Code](04_claude_code_agents.md)
- [Glosario de Términos Clave →](06_glosario.md)


