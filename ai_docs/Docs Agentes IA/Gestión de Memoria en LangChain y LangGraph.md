
## Gestión de Memoria en LangChain y LangGraph

La memoria es un componente crucial para construir agentes de IA efectivos y personalizados, permitiéndoles recordar interacciones previas y mantener la coherencia a lo largo del tiempo. LangChain y LangGraph ofrecen diversas abstracciones y herramientas para implementar la memoria en agentes de IA.

### ¿Qué es la Memoria para Agentes?

En un nivel alto, la memoria es simplemente un sistema que recuerda algo sobre interacciones previas [1]. Es fundamental para construir una buena experiencia de agente, ya que los LLMs por sí mismos no recuerdan inherentemente las cosas; la memoria debe ser añadida intencionalmente.

La memoria es **específica de la aplicación**. Lo que un agente de codificación puede recordar sobre un usuario (ej. librerías de Python preferidas) es muy diferente de lo que un agente de investigación podría recordar (ej. industrias de las empresas investigadas). Además, **cómo** el agente recuerda también puede diferir.

### Tipos de Memoria

Aunque la forma exacta de la memoria varía según la aplicación, existen diferentes tipos de memoria de alto nivel que imitan los tipos de memoria humana [1]:

*   **Memoria Procedural:** Se refiere a la memoria a largo plazo sobre cómo realizar tareas. En agentes, se describe como la combinación de los pesos del LLM y el código del agente que determinan fundamentalmente cómo funciona el agente. En la práctica, esto rara vez se actualiza automáticamente, aunque algunos agentes pueden actualizar su propio prompt de sistema.
*   **Memoria Semántica:** Es el almacén de conocimiento a largo plazo de alguien, compuesto por hechos y conceptos. En agentes, es un repositorio de hechos sobre el mundo, a menudo utilizado para personalizar una aplicación. Se implementa extrayendo información de conversaciones o interacciones y luego insertándola en el prompt del sistema en futuras conversaciones para influir en las respuestas del agente.
*   **Memoria Episódica:** Se refiere a recordar eventos pasados específicos. En agentes, se define como el almacenamiento de secuencias de acciones pasadas del agente. Se utiliza principalmente para lograr que un agente se desempeñe según lo previsto, a menudo implementada como prompting de pocos ejemplos (few-shot prompting), donde se recopilan suficientes secuencias para guiar al agente si hay una forma "correcta" de realizar acciones específicas que se han hecho antes.

### Cómo Actualizar la Memoria

Existen dos enfoques principales para actualizar la memoria de un agente [1]:

*   **"In the hot path" (En el camino crítico):** El sistema del agente decide explícitamente recordar hechos (generalmente a través de llamadas a herramientas) antes de responder. Esto introduce cierta latencia adicional antes de que se entregue cualquier respuesta y requiere combinar la lógica de la memoria con la lógica del agente.
*   **"In the background" (En segundo plano):** Un proceso en segundo plano se ejecuta durante o después de la conversación para actualizar la memoria. Esto evita la latencia adicional y mantiene la lógica de la memoria separada, pero la memoria no se actualiza inmediatamente y se necesita lógica adicional para determinar cuándo iniciar el proceso en segundo plano.

La retroalimentación del usuario también es una forma de actualizar la memoria, especialmente relevante para la memoria episódica. Por ejemplo, si el usuario marca una interacción como positiva, esa retroalimentación puede guardarse para recordarla en el futuro.

### LangChain y LangGraph para la Memoria

LangChain y LangGraph proporcionan funcionalidades para facilitar la implementación de la memoria en agentes:

*   **Abstracciones de bajo nivel para un "memory store" en LangGraph:** Permite un control total sobre la memoria del agente [1].
*   **Plantillas para ejecutar la memoria "in the hot path" y "in the background" en LangGraph:** Ofrecen flexibilidad en cómo y cuándo se actualiza la memoria.
*   **Selección dinámica de ejemplos de pocos disparos (few-shot) en LangSmith:** Para una iteración rápida y mejora del agente.

LangGraph, en particular, gestiona la memoria a corto plazo como parte del estado del agente. Este estado se persiste en una base de datos utilizando un "checkpointer", lo que permite reanudar el hilo de conversación en cualquier momento [2]. Para la memoria a largo plazo, LangGraph permite implementar agentes que pueden almacenar, recuperar y utilizar recuerdos para mejorar su rendimiento [3].

### Referencias

[1] LangChain Blog. "Memory for agents." https://blog.langchain.com/memory-for-agents/

[2] LangGraph. "LangGraph memory - Overview." https://langchain-ai.github.io/langgraph/concepts/memory/

[3] LangChain. "A Long-Term Memory Agent." https://python.langchain.com/docs/versions/migrating_memory/long_term_memory_agent/

