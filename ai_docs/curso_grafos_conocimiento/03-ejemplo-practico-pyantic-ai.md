# Ejemplo Práctico: Detección de Alucinaciones en Pydantic AI

## Resumen
Este módulo presenta un caso de estudio real donde un asistente de IA (Windsurf) genera código con alucinaciones al usar Pydantic AI, y cómo el grafo de conocimiento puede detectar y corregir estos errores.

## Contenido
Para demostrar la efectividad de los grafos de conocimiento en la detección de alucinaciones, examinaremos un caso real donde **Windsurf con Claude 3.7 Sonnet** generó código para Pydantic AI que contenía errores sutiles pero críticos.

### El Problema de la Alucinación

El asistente generó correctamente la definición del agente, incluyendo la configuración del modelo de lenguaje, el prompt del sistema y las herramientas. Sin embargo, al implementar la invocación del agente, utilizó una función **inexistente**: `invoke_async()`.

```python
# Código generado por Windsurf (INCORRECTO)
result = agent.invoke_async(user_prompt="¿Cuál es el clima en Madrid?")
```

Esta función simplemente **no existe** en la API de Pydantic AI. El asistente "rellenó el vacío" cuando no encontró la sintaxis exacta en la documentación, creando una función que parecía lógica pero era completamente inventada.

### Detección Mediante Grafo de Conocimiento

Al consultar el grafo de conocimiento para la clase `Agent` de Pydantic AI, podemos ver todos los métodos disponibles representados como nodos rojos conectados a la clase. La ausencia de un nodo para `invoke_async` confirma inmediatamente que esta función no existe.

El **script de detección de alucinaciones** analiza el código de manera determinista, sin usar modelos de lenguaje. Examina cada uso de Pydantic AI en el código y verifica su existencia en el grafo de conocimiento. En este caso, encontró **siete usos válidos** de Pydantic AI pero identificó **una alucinación**: el método `invoke_async` no encontrado en la clase `Agent`.

### La Corrección Automática

Una vez detectada la alucinación, el sistema puede sugerir alternativas válidas consultando el grafo. En este caso, el método correcto es `run_stream()`, que sí existe en la clase `Agent` y proporciona la funcionalidad de streaming deseada.

```python
# Código corregido
result = agent.run_stream(user_prompt="¿Cuál es el clima en Madrid?")
```

### Validación de Parámetros

El sistema también valida los **parámetros de las funciones**. Si se pasa un argumento inexistente como `test` al método `run_stream`, el detector de alucinaciones lo identificará consultando la lista de parámetros válidos en el grafo de conocimiento.

```python
# Código con parámetro inválido (DETECTADO)
result = agent.run_stream(user_prompt="Hola", test="valor_inexistente")
```

El grafo muestra que `run_stream` acepta parámetros como `user_prompt`, `model_settings` y `dependencies`, pero no `test`. Esta validación granular previene errores sutiles que podrían pasar desapercibidos.

### Resultados de la Validación

Después de la corrección, el script de detección reporta **ocho usos válidos** de Pydantic AI y **cero alucinaciones**, confirmando que el código está libre de errores relacionados con la API.

## Código
```python
# Ejemplo del script de detección de alucinaciones
def validate_pydantic_usage(script_path, knowledge_graph):
    """
    Valida el uso de Pydantic AI contra el grafo de conocimiento
    """
    valid_uses = 0
    hallucinations = []
    
    # Analizar el código fuente
    with open(script_path, 'r') as file:
        code = file.read()
    
    # Extraer usos de Pydantic AI
    pydantic_calls = extract_pydantic_calls(code)
    
    for call in pydantic_calls:
        if validate_against_graph(call, knowledge_graph):
            valid_uses += 1
        else:
            hallucinations.append(call)
    
    return {
        'valid_uses': valid_uses,
        'hallucinations': hallucinations,
        'hallucination_rate': len(hallucinations) / len(pydantic_calls) * 100
    }

# Ejemplo de consulta al grafo de conocimiento
def check_method_exists(class_name, method_name, knowledge_graph):
    """
    Verifica si un método existe en una clase específica
    """
    query = f"""
    MATCH (c:Class {{name: '{class_name}'}})-[:HAS_METHOD]->(m:Method {{name: '{method_name}'}})
    RETURN m
    """
    result = knowledge_graph.run(query)
    return len(result) > 0
```

## Ejercicios Prácticos
1. Instala Pydantic AI y examina su documentación. Identifica otros métodos que podrían ser confundidos o alucinados por un asistente de IA.
2. Crea un pequeño script que use Pydantic AI incorrectamente (con funciones inventadas) y piensa cómo un grafo de conocimiento lo detectaría.

## Puntos Clave
- Las alucinaciones en código pueden ser sutiles pero críticas para el funcionamiento.
- Los grafos de conocimiento permiten detección determinista sin usar LLMs.
- La validación incluye tanto métodos como parámetros de funciones.
- La corrección automática es posible consultando alternativas válidas en el grafo.

---
← [Anterior](02-conceptos-basicos.md) | [Índice](README.md) | [Siguiente](04-herramientas-relacionadas.md)

