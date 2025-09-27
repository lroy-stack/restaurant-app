# Ejercicios Prácticos

## Resumen
Esta sección proporciona ejercicios prácticos organizados por módulos para reforzar los conceptos aprendidos y desarrollar habilidades prácticas con grafos de conocimiento y asistentes de codificación de IA.

## Ejercicios del Módulo 1: Introducción

### Ejercicio 1.1: Reflexión sobre Experiencias
**Objetivo**: Evaluar experiencias previas con asistentes de IA

**Instrucciones**:
1. Reflexiona sobre tu experiencia con asistentes de codificación de IA (GitHub Copilot, Claude, ChatGPT, etc.)
2. Documenta al menos 3 casos específicos donde encontraste:
   - Alucinaciones (funciones o métodos inventados)
   - Errores difíciles de depurar
   - Bucles infinitos de corrección
3. Analiza el impacto de estos errores en tu productividad

**Resultado esperado**: Un documento de reflexión de 500-750 palabras con casos específicos y análisis del impacto.

### Ejercicio 1.2: Investigación de Grafos de Conocimiento
**Objetivo**: Comprender aplicaciones de grafos de conocimiento en otros dominios

**Instrucciones**:
1. Investiga cómo se utilizan los grafos de conocimiento en:
   - Motores de búsqueda (ej. Google Knowledge Graph)
   - Sistemas de recomendación (ej. Netflix, Amazon)
   - Asistentes virtuales (ej. Siri, Alexa)
2. Identifica similitudes y diferencias con su aplicación en código fuente
3. Propón 2-3 ideas de cómo podrían aplicarse en otros aspectos del desarrollo de software

**Resultado esperado**: Informe de investigación de 1000 palabras con ejemplos específicos y propuestas innovadoras.

## Ejercicios del Módulo 2: Conceptos Básicos

### Ejercicio 2.1: Diseño de Grafo de Conocimiento
**Objetivo**: Visualizar la estructura de un repositorio como grafo

**Instrucciones**:
1. Selecciona un repositorio Python pequeño (máximo 10 archivos)
2. Dibuja un diagrama que represente:
   - Repositorio como nodo raíz
   - Archivos como nodos conectados
   - Clases, funciones y métodos como nodos específicos
   - Relaciones entre componentes
3. Usa diferentes colores según el tipo de nodo (como se describe en el curso)

**Resultado esperado**: Diagrama visual del grafo con al menos 20 nodos y explicación de las relaciones.

### Ejercicio 2.2: Consultas de Validación
**Objetivo**: Diseñar consultas útiles para validación de código

**Instrucciones**:
1. Basándote en el grafo del ejercicio anterior, diseña 5 consultas que serían útiles para validar código generado por IA:
   - Verificar existencia de métodos
   - Validar parámetros de funciones
   - Comprobar herencia de clases
   - Verificar importaciones
   - Validar tipos de retorno
2. Escribe las consultas en pseudocódigo o Cypher

**Resultado esperado**: Lista de 5 consultas con explicación de su utilidad y sintaxis.

## Ejercicios del Módulo 3: Ejemplo Práctico

### Ejercicio 3.1: Análisis de Biblioteca
**Objetivo**: Identificar posibles alucinaciones en una biblioteca específica

**Instrucciones**:
1. Instala Pydantic AI siguiendo la documentación oficial
2. Examina la documentación y identifica:
   - Métodos que podrían ser confundidos o mal nombrados
   - Parámetros opcionales vs obligatorios
   - Patrones de uso comunes
3. Crea una lista de "alucinaciones probables" que un asistente de IA podría generar

**Resultado esperado**: Lista de 10-15 posibles alucinaciones con explicación de por qué podrían ocurrir.

### Ejercicio 3.2: Script de Prueba con Errores
**Objetivo**: Crear código con alucinaciones intencionadas

**Instrucciones**:
1. Crea un script Python que use Pydantic AI incorrectamente:
   - Usa al menos 3 funciones inventadas
   - Incluye parámetros inexistentes
   - Implementa patrones de uso incorrectos
2. Documenta cada error intencionado
3. Piensa cómo un grafo de conocimiento detectaría cada error

**Resultado esperado**: Script Python con errores documentados y análisis de detección.

## Ejercicios del Módulo 4: Herramientas Relacionadas

### Ejercicio 4.1: Exploración de Herramientas Frontend
**Objetivo**: Comprender autocorrección en desarrollo frontend

**Instrucciones**:
1. Crea una cuenta en Bolt DIY o Lovable (si está disponible)
2. Construye una aplicación web simple con errores intencionados
3. Observa cómo la herramienta detecta y corrige errores
4. Documenta el proceso de autocorrección

**Resultado esperado**: Reporte de experiencia con capturas de pantalla y análisis del proceso.

### Ejercicio 4.2: Investigación de Browserbase
**Objetivo**: Entender automatización robusta de navegadores

**Instrucciones**:
1. Investiga Browserbase y Stagehand en profundidad
2. Compara con herramientas tradicionales como Selenium
3. Identifica ventajas específicas de la automatización con IA
4. Propón 3 casos de uso donde sería especialmente útil

**Resultado esperado**: Análisis comparativo de 1500 palabras con casos de uso específicos.

### Ejercicio 4.3: Evaluación de Casos de Uso
**Objetivo**: Determinar cuándo usar cada herramienta

**Instrucciones**:
1. Crea una matriz de decisión para elegir entre:
   - Grafos de conocimiento
   - Herramientas frontend (Lovable/Bolt)
   - Automatización de navegadores (Browserbase)
   - Desarrollo tradicional
2. Incluye criterios como complejidad, tipo de proyecto, experiencia del desarrollador
3. Proporciona ejemplos específicos para cada escenario

**Resultado esperado**: Matriz de decisión con al menos 10 escenarios diferentes y recomendaciones.

## Ejercicios del Módulo 5: Integración MCP

### Ejercicio 5.1: Configuración de Entorno
**Objetivo**: Configurar un entorno completo de grafos de conocimiento

**Instrucciones**:
1. Instala Neo4j localmente (usando Docker o instalación nativa)
2. Configura el servidor MCP para grafos de conocimiento
3. Establece las variables de entorno necesarias
4. Verifica la conectividad con consultas básicas

**Resultado esperado**: Entorno funcional con documentación del proceso de instalación.

### Ejercicio 5.2: Indexación de Repositorio
**Objetivo**: Indexar un repositorio real en el grafo de conocimiento

**Instrucciones**:
1. Selecciona un repositorio Python de tamaño medio (100-500 archivos)
2. Usa la herramienta MCP para indexarlo
3. Explora la estructura resultante mediante consultas
4. Documenta estadísticas de indexación (tiempo, nodos creados, etc.)

**Resultado esperado**: Repositorio indexado con reporte de estadísticas y consultas de ejemplo.

### Ejercicio 5.3: Consultas Avanzadas
**Objetivo**: Desarrollar consultas complejas del grafo

**Instrucciones**:
1. Usando el repositorio indexado, crea consultas para:
   - Encontrar todas las clases que heredan de una clase base
   - Listar funciones que usan parámetros específicos
   - Identificar archivos con mayor número de dependencias
   - Detectar patrones de diseño comunes
2. Optimiza las consultas para rendimiento

**Resultado esperado**: Conjunto de 8-10 consultas avanzadas con explicación y resultados.

## Ejercicios del Módulo 6: Demostración Práctica

### Ejercicio 6.1: Replicación de Demostración
**Objetivo**: Replicar la demostración completa del curso

**Instrucciones**:
1. Configura Claude Code con el servidor MCP
2. Crea un archivo de flujo de trabajo similar al mostrado
3. Genera un agente de Pydantic AI siguiendo el proceso
4. Valida el resultado con el detector de alucinaciones

**Resultado esperado**: Agente funcional con tasa de alucinación del 0% y documentación del proceso.

### Ejercicio 6.2: Biblioteca Alternativa
**Objetivo**: Aplicar el proceso a una biblioteca diferente

**Instrucciones**:
1. Selecciona una biblioteca Python diferente (ej. FastAPI, Flask, SQLAlchemy)
2. Indexa la biblioteca en el grafo de conocimiento
3. Modifica el flujo de trabajo para la nueva biblioteca
4. Genera código usando el asistente de IA con validación

**Resultado esperado**: Código generado para nueva biblioteca con validación completa.

### Ejercicio 6.3: Agente Complejo
**Objetivo**: Crear un agente más sofisticado

**Instrucciones**:
1. Diseña un agente que use múltiples bibliotecas
2. Incluye al menos 5 herramientas diferentes
3. Implementa manejo de errores y logging
4. Valida todo el código contra los grafos de conocimiento

**Resultado esperado**: Agente complejo (500+ líneas) libre de alucinaciones.

## Ejercicios del Módulo 7: Conclusiones y Futuro

### Ejercicio 7.1: Análisis de Impacto
**Objetivo**: Evaluar el impacto potencial en el flujo de trabajo

**Instrucciones**:
1. Analiza tu flujo de trabajo actual de desarrollo
2. Identifica puntos donde los grafos de conocimiento serían útiles
3. Estima el impacto en productividad y calidad
4. Propón un plan de adopción gradual

**Resultado esperado**: Plan de adopción detallado con métricas de impacto esperado.

### Ejercicio 7.2: Contribución al Proyecto
**Objetivo**: Contribuir al desarrollo de la tecnología

**Instrucciones**:
1. Identifica una mejora específica para el proyecto de código abierto
2. Puede ser: nueva funcionalidad, corrección de bug, documentación, casos de uso
3. Implementa la mejora o crea una propuesta detallada
4. Comparte con la comunidad

**Resultado esperado**: Contribución real al proyecto o propuesta detallada de mejora.

### Ejercicio 7.3: Visión Futura
**Objetivo**: Imaginar evoluciones futuras de la tecnología

**Instrucciones**:
1. Propón 3 mejoras específicas para Archon v2
2. Diseña una nueva aplicación de grafos de conocimiento en desarrollo
3. Considera implicaciones éticas y sociales
4. Crea una hoja de ruta de desarrollo a 2-3 años

**Resultado esperado**: Documento de visión futura de 2000+ palabras con propuestas concretas.

## Proyecto Final Integrador

### Objetivo
Crear un sistema completo que demuestre dominio de todos los conceptos del curso.

### Especificaciones
1. **Biblioteca objetivo**: Selecciona una biblioteca Python compleja (no usada en ejercicios anteriores)
2. **Indexación completa**: Indexa la biblioteca en un grafo de conocimiento
3. **Flujo de trabajo personalizado**: Crea un flujo de trabajo específico para la biblioteca
4. **Generación de código**: Usa asistente de IA para generar una aplicación completa
5. **Validación exhaustiva**: Asegura 0% de alucinaciones
6. **Documentación**: Documenta todo el proceso y resultados

### Entregables
1. Grafo de conocimiento indexado
2. Flujo de trabajo documentado
3. Aplicación generada (mínimo 1000 líneas)
4. Reporte de validación
5. Documentación completa del proceso
6. Análisis de lecciones aprendidas

### Criterios de Evaluación
- **Completitud**: Todos los componentes implementados
- **Calidad**: Código libre de alucinaciones y bien estructurado
- **Innovación**: Uso creativo de las técnicas aprendidas
- **Documentación**: Proceso claramente explicado
- **Reflexión**: Análisis profundo de resultados y aprendizajes

---
← [Anterior](codigo-ejemplos.md) | [Índice](README.md) | [Siguiente](glosario.md)

