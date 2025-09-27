# Demostración Práctica con Claude Code

## Resumen
Este módulo presenta una demostración completa de cómo Claude Code utiliza el servidor MCP con grafos de conocimiento para generar un agente de Pydantic AI libre de alucinaciones, siguiendo un flujo de trabajo estructurado.

## Contenido

### Configuración del Entorno de Demostración

La demostración utiliza **Claude Code** integrado con el servidor MCP de grafos de conocimiento ejecutándose en el puerto 8052. La configuración inicial incluye la verificación de que el servidor MCP esté correctamente registrado y funcionando.

```bash
# Verificación de la configuración MCP
claude mcp add crawl-for-ai-rag http://localhost:8052
claude mcp list
```

### Definición del Flujo de Trabajo

Para garantizar resultados óptimos, se define un **flujo de trabajo estructurado** en el archivo `claude.md` que guía al asistente a través de fases específicas:

#### Fase 1: Verificación de Fuentes
- Confirmar disponibilidad de Pydantic AI en el grafo de conocimiento
- Validar acceso a la base de conocimientos RAG
- Establecer las fuentes de información necesarias

#### Fase 2: Investigación
- Búsqueda de ejemplos de código mediante RAG
- Exploración de la documentación de Pydantic AI
- Consulta del grafo de conocimiento para métodos y atributos específicos

#### Fase 3: Investigación Profunda
- Consultas granulares del grafo para clases específicas como `Agent`
- Exploración de métodos disponibles y sus parámetros
- Validación de patrones de uso correctos

#### Fase 4: Generación y Validación
- Generación del código del agente
- Ejecución del detector de alucinaciones
- Escritura de pruebas unitarias
- Iteración hasta lograr cero alucinaciones

### Ejecución de la Demostración

La demostración comienza con un prompt simple: "Sigue el plan para construir el agente de Pydantic AI". Claude Code automáticamente genera una lista de tareas pendientes y procede a ejecutar cada fase del flujo de trabajo.

#### Verificación Inicial
Claude Code inicia consultando el grafo de conocimiento para confirmar que Pydantic AI está disponible:

```python
# Consulta inicial al grafo
query_result = await query_knowledge_graph(
    command="repos",
    params={}
)
```

#### Investigación con RAG
El asistente realiza múltiples consultas RAG para explorar la documentación y ejemplos de código de Pydantic AI. Esta fase proporciona contexto de alto nivel sobre cómo usar la biblioteca.

#### Exploración del Grafo de Conocimiento
Claude Code consulta específicamente la clase `Agent` en el grafo para obtener información detallada sobre métodos y atributos disponibles:

```python
# Consulta específica de la clase Agent
agent_methods = await query_knowledge_graph(
    command="class",
    params={"class_name": "Agent"}
)
```

### Código Generado

El resultado de la demostración es un **agente de Pydantic AI completamente funcional** que incluye:

```python
from pydantic_ai import Agent
from pydantic_ai.models import OpenAIModel
import asyncio
import os

# Configuración del modelo
model = OpenAIModel('gpt-4')

# Definición de herramientas
async def get_weather(location: str) -> str:
    """Herramienta simulada para obtener el clima"""
    return f"El clima en {location} es soleado con 22°C"

async def get_time() -> str:
    """Herramienta para obtener la hora actual"""
    from datetime import datetime
    return f"La hora actual es {datetime.now().strftime('%H:%M:%S')}"

# Creación del agente con prompt dinámico
agent = Agent(
    model=model,
    system_prompt="Eres un asistente útil que puede proporcionar información sobre el clima y la hora.",
    tools=[get_weather, get_time]
)

async def main():
    """Función principal para probar el agente"""
    test_queries = [
        "¿Cuál es el clima en Madrid?",
        "¿Qué hora es?",
        "Dime el clima en Barcelona y la hora actual"
    ]
    
    for query in test_queries:
        print(f"\nConsulta: {query}")
        result = await agent.run_stream(query)
        async for message in result:
            print(f"Respuesta: {message}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Validación y Resultados

Después de generar el código, Claude Code ejecuta automáticamente el **detector de alucinaciones** para verificar la corrección del código:

```bash
# Resultado de la validación
python hallucination_detector.py hallucination_free_agent.py
```

Los resultados muestran:
- **12 usos válidos** de Pydantic AI
- **0 alucinaciones** detectadas
- **Tasa de alucinación: 0%**

### Características del Código Generado

El agente generado demuestra varias **mejores prácticas**:

1. **Uso correcto de la API**: Utiliza `run_stream()` en lugar de funciones inventadas
2. **Configuración apropiada**: Incluye modelo, prompt del sistema y herramientas
3. **Manejo asíncrono**: Implementa correctamente el patrón async/await
4. **Herramientas múltiples**: Demuestra cómo agregar múltiples herramientas al agente
5. **Pruebas integradas**: Incluye consultas de prueba para validar funcionalidad

### Tiempo de Ejecución

La demostración completa, desde la configuración inicial hasta la generación del código validado, toma aproximadamente **pocos minutos**. Esto incluye:
- Múltiples consultas RAG
- Varias consultas al grafo de conocimiento
- Generación de más de 300 líneas de código
- Validación automática de alucinaciones

### Comparación con Métodos Tradicionales

Sin el grafo de conocimiento, un asistente de IA típicamente requeriría **múltiples iteraciones** para corregir alucinaciones como el uso de `invoke_async()` inexistente. Con el grafo de conocimiento, el código se genera **correctamente en el primer intento**.

## Código
```python
# Ejemplo de configuración para replicar la demostración
class DemoConfiguration:
    def __init__(self):
        self.mcp_server_url = "http://localhost:8052"
        self.workflow_file = "claude.md"
        self.target_library = "pydantic-ai"
        
    def setup_demo_environment(self):
        """Configura el entorno para la demostración"""
        # Verificar servidor MCP
        self.verify_mcp_server()
        
        # Cargar flujo de trabajo
        self.load_workflow_instructions()
        
        # Indexar biblioteca objetivo si es necesario
        self.ensure_library_indexed()
        
    def verify_mcp_server(self):
        """Verifica que el servidor MCP esté funcionando"""
        import requests
        try:
            response = requests.get(f"{self.mcp_server_url}/health")
            assert response.status_code == 200
            print("✓ Servidor MCP funcionando correctamente")
        except Exception as e:
            print(f"✗ Error en servidor MCP: {e}")
            
    def load_workflow_instructions(self):
        """Carga las instrucciones del flujo de trabajo"""
        with open(self.workflow_file, 'r') as f:
            self.workflow = f.read()
        print("✓ Flujo de trabajo cargado")
```

## Ejercicios Prácticos
1. Replica la demostración configurando tu propio servidor MCP y Claude Code.
2. Modifica el flujo de trabajo para incluir una biblioteca diferente (ej. FastAPI, Flask).
3. Experimenta con diferentes tipos de agentes y herramientas más complejas.

## Puntos Clave
- La demostración muestra generación de código libre de alucinaciones en el primer intento.
- El flujo de trabajo estructurado es crucial para obtener resultados óptimos.
- La combinación de RAG y grafos de conocimiento proporciona contexto completo.
- La validación automática confirma la corrección del código generado.
- El proceso es significativamente más eficiente que los métodos tradicionales.

---
← [Anterior](05-integracion-mcp.md) | [Índice](README.md) | [Siguiente](07-conclusiones-futuro.md)

