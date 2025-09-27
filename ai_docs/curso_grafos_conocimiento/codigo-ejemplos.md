# Código de Ejemplos

## Resumen
Esta sección recopila todos los ejemplos de código presentados a lo largo del curso, organizados por categorías para facilitar la referencia y reutilización.

## Estructura de Grafos de Conocimiento

### Representación de Nodos
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

## Detección de Alucinaciones

### Script de Validación
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

## Automatización de Navegadores

### Ejemplo con Stagehand
```javascript
// Ejemplo conceptual de automatización con Stagehand
const { stagehand } = require('@browserbase/stagehand');

async function automateGitHubSummary() {
    const browser = await stagehand.launch();
    const page = await browser.newPage();
    
    // El agente de IA navega inteligentemente
    await page.goto('https://github.com/user/local-ai');
    await page.aiClick('Issues tab'); // Navegación inteligente
    const issues = await page.aiExtract('issue summaries');
    
    return issues;
}
```

## Servidor MCP

### Configuración del Servidor
```python
# Ejemplo de integración MCP para grafos de conocimiento
class KnowledgeGraphMCPServer:
    def __init__(self, neo4j_uri, credentials):
        self.graph = Neo4jGraph(neo4j_uri, credentials)
        
    async def query_knowledge_graph(self, command, params):
        """Herramienta MCP para consultar el grafo"""
        if command == "list_methods":
            return self.list_class_methods(params['class_name'])
        elif command == "validate_function":
            return self.validate_function_call(params)
            
    async def check_hallucinations(self, script_path):
        """Herramienta MCP para detectar alucinaciones"""
        return self.hallucination_detector.analyze(script_path)
        
    async def index_repository(self, repo_url):
        """Herramienta MCP para indexar repositorios"""
        return self.repository_indexer.process(repo_url)
```

### Herramientas MCP Específicas
```python
async def run_hallucination_check(script_path: str) -> dict:
    """
    Ejecuta el detector de alucinaciones en un script
    
    Args:
        script_path: Ruta absoluta al script a analizar
        
    Returns:
        dict: Resultados del análisis incluyendo usos válidos y alucinaciones
    """
    result = subprocess.run([
        'python', 'hallucination_detector.py', script_path
    ], capture_output=True, text=True)
    
    return parse_hallucination_results(result.stdout)

async def query_knowledge_graph(command: str, params: dict) -> any:
    """
    Consulta el grafo de conocimiento con comandos específicos
    
    Comandos disponibles:
    - list_methods: Lista métodos de una clase
    - list_attributes: Lista atributos de una clase  
    - validate_function: Valida existencia de función
    - custom_query: Ejecuta consulta Cypher personalizada
    """
    if command == "list_methods":
        return list_class_methods(params['class_name'])
    elif command == "validate_function":
        return validate_function_exists(params['class_name'], params['method_name'])
    elif command == "custom_query":
        return execute_cypher_query(params['query'])

async def index_repository(repo_url: str) -> dict:
    """
    Indexa un repositorio de GitHub en el grafo de conocimiento
    
    Args:
        repo_url: URL del repositorio (debe terminar en .git)
        
    Returns:
        dict: Estadísticas de indexación (archivos, clases, funciones procesadas)
    """
    # Clonar repositorio temporalmente
    temp_dir = clone_repository(repo_url)
    
    # Procesar archivos y extraer estructura
    stats = process_repository_structure(temp_dir)
    
    # Almacenar en grafo de conocimiento
    store_in_knowledge_graph(stats)
    
    # Limpiar archivos temporales
    cleanup_temp_directory(temp_dir)
    
    return stats
```

### Configuración Completa
```python
# Ejemplo de configuración completa del servidor MCP
class CrawlForAIRagMCPServer:
    def __init__(self):
        self.knowledge_graph_enabled = os.getenv('USE_KNOWLEDGE_GRAPH', 'false').lower() == 'true'
        if self.knowledge_graph_enabled:
            self.setup_neo4j_connection()
            
    def setup_neo4j_connection(self):
        """Configura la conexión a Neo4j"""
        self.neo4j_uri = os.getenv('NEO4J_URI')
        self.neo4j_username = os.getenv('NEO4J_USERNAME')
        self.neo4j_password = os.getenv('NEO4J_PASSWORD')
        
        self.driver = GraphDatabase.driver(
            self.neo4j_uri,
            auth=(self.neo4j_username, self.neo4j_password)
        )
        
    async def handle_mcp_request(self, tool_name: str, params: dict):
        """Maneja solicitudes MCP entrantes"""
        if tool_name == "run_hallucination_check":
            return await self.run_hallucination_check(params['script_path'])
        elif tool_name == "query_knowledge_graph":
            return await self.query_knowledge_graph(params['command'], params)
        elif tool_name == "index_repository":
            return await self.index_repository(params['repo_url'])
        else:
            raise ValueError(f"Herramienta desconocida: {tool_name}")
```

## Agente de Pydantic AI

### Implementación Completa
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

## Configuración de Demostración

### Entorno de Pruebas
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

## Archon v2 (Visión Futura)

### Arquitectura Conceptual
```python
# Visión conceptual de Archon v2
class ArchonV2:
    def __init__(self):
        self.project_manager = ProjectManager()
        self.rag_engine = MultiStrategyRAG()
        self.knowledge_graph = KnowledgeGraphValidator()
        self.mcp_interface = MCPServerManager()
        
    async def generate_reliable_code(self, requirements: str):
        """Genera código confiable usando múltiples estrategias"""
        # Fase 1: Análisis de requisitos
        tasks = await self.project_manager.analyze_requirements(requirements)
        
        # Fase 2: Investigación con RAG
        context = await self.rag_engine.gather_context(tasks)
        
        # Fase 3: Validación con grafo de conocimiento
        validated_context = await self.knowledge_graph.validate_context(context)
        
        # Fase 4: Generación de código
        code = await self.generate_code(validated_context)
        
        # Fase 5: Validación final
        validation_result = await self.knowledge_graph.validate_code(code)
        
        if validation_result.hallucination_rate == 0:
            return code
        else:
            return await self.refine_code(code, validation_result.issues)
            
    async def continuous_learning(self):
        """Mejora continua basada en feedback"""
        feedback = await self.collect_user_feedback()
        await self.update_knowledge_base(feedback)
        await self.refine_validation_rules(feedback)
```

## Comandos de Configuración

### Variables de Entorno
```bash
# Variables de entorno requeridas
USE_KNOWLEDGE_GRAPH=true
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tu_password_aqui
```

### Comandos de Claude Code
```bash
# Comando para agregar el servidor MCP
claude mcp add crawl-for-ai-rag http://localhost:8052

# Verificar servidores MCP configurados
claude mcp list

# Verificación de la configuración MCP
claude mcp add crawl-for-ai-rag http://localhost:8052
claude mcp list
```

### Validación Manual
```bash
# Resultado de la validación
python hallucination_detector.py hallucination_free_agent.py
```

---
← [Anterior](07-conclusiones-futuro.md) | [Índice](README.md) | [Siguiente](ejercicios.md)

