

## Ingeniería de Contexto (LangChain Blog)

Este artículo de LangChain define la ingeniería de contexto como la construcción de sistemas dinámicos para proporcionar la información y las herramientas adecuadas en el formato correcto, de modo que el LLM pueda realizar la tarea de manera plausible. Se argumenta que, a menudo, cuando un agente no funciona de manera fiable, la causa subyacente es que el contexto, las instrucciones y las herramientas apropiadas no se han comunicado al modelo.

### ¿Qué es la Ingeniería de Contexto?

La ingeniería de contexto es un **sistema dinámico** que busca proporcionar la **información correcta** y las **herramientas adecuadas** en el **formato apropiado** para que un LLM pueda cumplir una tarea. Esto implica:

*   **Sistema:** Los agentes complejos obtienen contexto de múltiples fuentes (desarrollador, usuario, interacciones previas, llamadas a herramientas, datos externos). Unir todo esto implica un sistema complejo.
*   **Dinámico:** Muchas piezas de contexto pueden llegar dinámicamente, por lo que la lógica para construir el prompt final debe ser también dinámica, no solo un prompt estático.
*   **Información Correcta:** Los sistemas agénticos fallan si no tienen el contexto adecuado. Los LLMs no leen la mente; se les debe proporcionar la información necesaria.
*   **Herramientas Adecuadas:** Si el LLM no puede resolver la tarea solo con las entradas, necesita las herramientas correctas (para buscar más información, realizar acciones, etc.).
*   **Formato Importa:** La forma en que se comunica con los LLMs es crucial. Un mensaje de error descriptivo es más útil que un gran blob JSON. Los parámetros de entrada de las herramientas también son importantes para que los LLMs puedan usarlas.
*   **¿Puede realizar la tarea de manera plausible?:** Esta pregunta ayuda a asegurar que los LLMs estén configurados para el éxito y a diferenciar los modos de fallo (falta de información/herramientas vs. error del modelo).

### ¿Por qué es importante la Ingeniería de Contexto?

Los errores en los sistemas agénticos a menudo se deben a que el LLM no recibió el contexto apropiado. Esto puede ser por:

*   **Contexto faltante:** El modelo no tiene la información necesaria para tomar la decisión correcta.
*   **Contexto mal formateado:** La forma en que se presentan los datos al modelo afecta su respuesta.

### Diferencia entre Ingeniería de Contexto y Prompt Engineering

El artículo sugiere que la ingeniería de prompts es un subconjunto de la ingeniería de contexto. Mientras que la ingeniería de prompts se enfoca en la redacción de prompts, la ingeniería de contexto se centra en proporcionar un **contexto completo y estructurado** al AI. La clave es que el prompt no solo funcione con un conjunto de datos de entrada estático, sino que pueda tomar datos dinámicos y formatearlos correctamente.

### Ejemplos de Ingeniería de Contexto:

*   **Uso de herramientas:** Asegurar que el agente tenga acceso a herramientas para información externa y que la información devuelta esté en un formato digerible para los LLMs.
*   **Memoria a corto plazo:** Resumir la conversación para usarla en interacciones futuras.
*   **Memoria a largo plazo:** Recuperar preferencias del usuario de conversaciones anteriores.
*   **Prompt Engineering:** Incluir instrucciones claras y detalladas sobre cómo debe comportarse el agente en el prompt.
*   **Recuperación (Retrieval):** Obtener información dinámicamente e insertarla en el prompt antes de llamar al LLM.

El artículo concluye que la ingeniería de contexto no es una idea nueva, pero es un término que describe una habilidad cada vez más importante en el desarrollo de agentes de IA.

