# Glosario de Términos Clave

## Resumen

Este glosario proporciona definiciones claras y concisas de los términos más importantes utilizados en el contexto de la creación de agentes de IA, Prompt Engineering, Context Engineering y el uso de agentes de Claude Code. Está diseñado como una referencia rápida para facilitar la comprensión de los conceptos técnicos presentados en esta documentación.

## Términos

### A

**Agente de IA (AI Agent)**
Sistema computacional autónomo capaz de percibir su entorno, tomar decisiones y ejecutar acciones para alcanzar objetivos específicos. Se caracteriza por su autonomía, reactividad y proactividad.

**Agente Primario (Primary Agent)**
En la arquitectura de Claude Code, es el agente coordinador central que recibe las instrucciones del usuario, planifica la secuencia de acciones, coordina la ejecución de subagentes y presenta los resultados finales.

**Autonomía**
Capacidad de un agente de IA para operar sin intervención humana constante, tomando decisiones independientes basadas en su programación y el contexto disponible.

### C

**Chain-of-Thought Prompting**
Técnica de Prompt Engineering que guía al modelo para que muestre su proceso de razonamiento paso a paso, mejorando la calidad de las respuestas en tareas complejas que requieren múltiples pasos de razonamiento.

**Claude Code**
Herramienta de codificación agéntica desarrollada por Anthropic que opera directamente en el terminal del desarrollador, proporcionando capacidades de análisis de código, generación, depuración y automatización de tareas.

**Context Engineering**
Disciplina que se enfoca en la construcción de sistemas dinámicos que proporcionan la información y herramientas correctas en el formato adecuado para que los modelos de lenguaje puedan realizar tareas de manera efectiva.

**Contexto Dinámico**
Información contextual que se genera o modifica en tiempo real durante la ejecución de una tarea, adaptándose a las circunstancias específicas de cada interacción.

### F

**Few-shot Prompting**
Técnica que mejora el rendimiento del modelo proporcionando algunos ejemplos de la tarea deseada antes de presentar la consulta real, aprovechando la capacidad de reconocimiento de patrones de los LLMs.

### L

**LLM (Large Language Model)**
Modelo de lenguaje grande entrenado en vastas cantidades de texto para comprender y generar lenguaje natural de manera coherente y contextualmente apropiada.

### M

**MCP (Model Context Protocol)**
Protocolo que extiende las capacidades de Claude Code permitiendo la integración con sistemas externos como bases de datos, APIs web, sistemas de gestión de documentos y herramientas de colaboración.

**Memory Management (Gestión de Memoria)**
Técnica de Context Engineering que incluye memoria a corto plazo para mantener el contexto de la conversación actual y memoria a largo plazo para preservar información importante de sesiones anteriores.

**Meta-Agente**
Agente especializado que puede construir otros agentes automáticamente, analizando los requisitos de una tarea e identificando la necesidad de nuevos subagentes especializados.

### O

**Orquestación Multi-Agente**
Coordinación sofisticada de múltiples agentes para asegurar que trabajen juntos efectivamente, incluyendo gestión de dependencias, resolución de conflictos y sincronización de estado.

### P

**Prompt Chaining**
Técnica que descompone tareas complejas en una serie de prompts más simples, donde la salida de un prompt se convierte en la entrada del siguiente.

**Prompt Engineering**
Disciplina para desarrollar y optimizar prompts que permiten utilizar eficientemente los modelos de lenguaje en una amplia variedad de aplicaciones, abarcando técnicas sofisticadas para mejorar la precisión y confiabilidad.

**Prompt del Sistema (System Prompt)**
En el contexto de subagentes, es la configuración que define el comportamiento fundamental, personalidad y capacidades del agente, diferente de un prompt de usuario que contiene instrucciones específicas de tarea.

### R

**Reactividad**
Habilidad de un agente de IA para responder apropiadamente a cambios en su entorno o a nuevas informaciones que recibe.

**Retrieval Augmented Generation (RAG)**
Técnica que combina la generación de texto con la recuperación de información de una base de datos externa, permitiendo que los modelos accedan a información actualizada y específica del dominio.

### S

**Self-Consistency**
Técnica que genera múltiples respuestas para la misma consulta y selecciona la más consistente o común entre ellas, útil para tareas donde la precisión es crítica.

**Subagente (Sub-agent)**
En Claude Code, son instancias especializadas que se enfocan en dominios específicos, operando en su propio contexto aislado para prevenir la contaminación del contexto y permitir una especialización más profunda.

### Z

**Zero-shot Prompting**
Técnica básica donde se proporciona una instrucción sin ejemplos previos, confiando en el conocimiento preentrenado del modelo para generar una respuesta apropiada.

---

**Navegación:**
- [← Ejemplos Prácticos](05_ejemplos_practicos.md)
- [README →](README.md)

