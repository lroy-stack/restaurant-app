# Conceptos Básicos de Grafos de Conocimiento para Código

## Resumen
Este módulo explica los fundamentos de los grafos de conocimiento aplicados al código fuente, incluyendo la estructura de nodos y relaciones, y cómo representar repositorios de código de manera relacional.

## Contenido
Un **grafo de conocimiento** es una estructura de datos que representa información como una red de entidades interconectadas. En el contexto del código fuente, estas entidades incluyen **repositorios**, **archivos**, **clases**, **funciones** y **atributos**. Cada entidad se representa como un **nodo**, y las relaciones entre ellas se modelan como **aristas**.

La representación de un repositorio en un grafo de conocimiento sigue una jerarquía específica. Los **repositorios** actúan como nodos raíz, etiquetados con el tag "repository". Los **archivos** del repositorio se representan como nodos verdes conectados al repositorio. Dentro de cada archivo, las **funciones** se modelan como nodos azul oscuro, mientras que las **clases** aparecen como nodos color teal.

Las clases tienen una estructura más compleja, ya que pueden contener tanto **métodos** (representados como nodos rojos) como **atributos** (nodos beige). Esta representación jerárquica permite consultas eficientes sobre la estructura del código y facilita la validación de referencias entre diferentes componentes.

El proceso de **indexación** es completamente determinista y no requiere modelos de lenguaje. El sistema analiza el código fuente, extrae la información estructural y la almacena en el grafo. Este proceso típicamente toma menos de 30 segundos para repositorios de tamaño medio, ya que se basa en análisis sintáctico directo del código.

La **consulta del grafo** permite a los asistentes de IA verificar la existencia de funciones, métodos y atributos antes de utilizarlos en el código generado. Por ejemplo, si un asistente intenta usar un método que no existe en una clase específica, el grafo puede proporcionar retroalimentación inmediata sobre la inexistencia de dicho método.

## Código
```python
# Ejemplo conceptual de estructura de nodos en un grafo de conocimiento
class GraphNode:
    def __init__(self, node_type, name, properties=None):
        self.type = node_type  # 'repository', 'file', 'class', 'function', 'attribute'
        self.name = name
        self.properties = properties or {}
        self.relationships = []

# Ejemplo de representación de una clase en el grafo
agent_class = GraphNode(
    node_type='class',
    name='Agent',
    properties={'file': 'agent.py', 'line_number': 15}
)

# Método asociado a la clase
run_stream_method = GraphNode(
    node_type='method',
    name='run_stream',
    properties={'parameters': ['user_prompt', 'model_settings'], 'return_type': 'AsyncIterator'}
)
```

## Ejercicios Prácticos
1. Dibuja un diagrama simple de cómo se vería un pequeño repositorio Python representado como grafo de conocimiento.
2. Identifica qué tipos de consultas serían útiles para validar código generado por IA.

## Puntos Clave
- Los grafos de conocimiento representan código como redes de entidades interconectadas.
- La estructura jerárquica incluye repositorios, archivos, clases, funciones y atributos.
- El proceso de indexación es determinista y rápido.
- Las consultas permiten validación en tiempo real del código generado.

---
← [Anterior](01-introduccion.md) | [Índice](README.md) | [Siguiente](03-ejemplo-practico-pyantic-ai.md)

