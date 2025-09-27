# Integración con MCP (Model Context Protocol)

## Resumen
Este módulo detalla cómo implementar y configurar el servidor MCP para grafos de conocimiento, incluyendo las herramientas disponibles, configuración de variables de entorno y proceso de indexación de repositorios.

## Contenido

### Configuración del Servidor MCP

El **servidor MCP para grafos de conocimiento** se integra con el proyecto "crawl for AI rag" y proporciona tres herramientas principales para los asistentes de IA. La configuración inicial requiere establecer variables de entorno específicas y configurar una instancia de **Neo4j**.

Para habilitar las capacidades de grafo de conocimiento, se debe establecer la variable `USE_KNOWLEDGE_GRAPH=true` en el archivo de configuración. Además, se requieren las credenciales de Neo4j, que pueden obtenerse instalando Neo4j localmente a través del paquete "local AI" o mediante Neo4j Desktop.

```bash
# Variables de entorno requeridas
USE_KNOWLEDGE_GRAPH=true
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tu_password_aqui
```

### Herramientas MCP Disponibles

#### 1. Detector de Alucinaciones

La primera herramienta permite ejecutar el **script de detección de alucinaciones** directamente desde el asistente de IA. Esta herramienta toma la ruta de un script como parámetro y devuelve un análisis completo de las alucinaciones encontradas.

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
```

#### 2. Consulta del Grafo de Conocimiento

La segunda herramienta proporciona capacidades de **consulta flexible** del grafo de conocimiento. Los asistentes de IA pueden explorar clases, métodos, atributos y relaciones mediante comandos específicos.

```python
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
```

#### 3. Indexación de Repositorios

La tercera herramienta permite **indexar repositorios de GitHub** directamente en el grafo de conocimiento. El proceso es completamente automatizado y típicamente toma menos de 30 segundos.

```python
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

### Proceso de Indexación

El **proceso de indexación** es completamente determinista y no utiliza modelos de lenguaje. El sistema clona el repositorio en un directorio temporal, analiza la estructura del código fuente mediante análisis sintáctico, y almacena la información extraída en el grafo de conocimiento.

La indexación captura:
- **Estructura de archivos** y su organización
- **Definiciones de clases** con sus atributos y métodos
- **Funciones independientes** y sus parámetros
- **Relaciones entre componentes** (herencia, composición, etc.)
- **Metadatos** como números de línea y tipos de datos

### Configuración en Claude Code

Para integrar el servidor MCP con **Claude Code**, se utiliza el comando de configuración que especifica el puerto y las credenciales del servidor:

```bash
# Comando para agregar el servidor MCP
claude mcp add crawl-for-ai-rag http://localhost:8052

# Verificar servidores MCP configurados
claude mcp list
```

### Limitaciones y Consideraciones

Es importante tener en cuenta que la **versión Docker** del servidor MCP tiene limitaciones para la detección de alucinaciones, ya que los scripts generados por el asistente no están disponibles dentro del contenedor. Sin embargo, las herramientas de consulta del grafo y indexación de repositorios funcionan perfectamente.

Para proyectos que requieren detección de alucinaciones en tiempo real, se recomienda ejecutar el servidor MCP directamente en el sistema host en lugar de usar la versión containerizada.

### Flujo de Trabajo Recomendado

El flujo de trabajo óptimo para usar estas herramientas incluye:

1. **Indexación inicial**: Agregar los repositorios relevantes al grafo de conocimiento
2. **Investigación**: Usar consultas del grafo para explorar APIs y estructuras
3. **Generación de código**: Permitir que el asistente genere código basado en el conocimiento del grafo
4. **Validación**: Ejecutar detección de alucinaciones en el código generado
5. **Iteración**: Corregir alucinaciones y repetir el proceso hasta lograr código libre de errores

## Código
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

## Ejercicios Prácticos
1. Configura una instancia local de Neo4j y establece las variables de entorno necesarias.
2. Indexa un repositorio pequeño de GitHub y explora su estructura mediante consultas del grafo.
3. Genera código que use la biblioteca indexada y ejecuta el detector de alucinaciones.

## Puntos Clave
- MCP proporciona un estándar para integrar grafos de conocimiento con asistentes de IA.
- Tres herramientas principales: detección de alucinaciones, consulta del grafo e indexación.
- La indexación es determinista y rápida (menos de 30 segundos).
- La configuración requiere Neo4j y variables de entorno específicas.
- El flujo de trabajo incluye indexación, investigación, generación y validación.

---
← [Anterior](04-herramientas-relacionadas.md) | [Índice](README.md) | [Siguiente](06-demostracion-claude-code.md)

