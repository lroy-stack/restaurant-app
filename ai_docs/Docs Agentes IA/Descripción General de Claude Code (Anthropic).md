

## Descripción General de Claude Code (Anthropic)

Claude Code es una herramienta de codificación agéntica de Anthropic que reside en el terminal y ayuda a los desarrolladores a convertir ideas en código de manera más rápida. Se integra directamente en el flujo de trabajo del desarrollador, sin necesidad de ventanas de chat o IDEs adicionales.

### Capacidades Clave de Claude Code:

*   **Construcción de características a partir de descripciones:** Permite a los usuarios describir lo que quieren construir en lenguaje natural. Claude Code planifica, escribe el código y asegura su funcionamiento.
*   **Depuración y corrección de errores:** Analiza el código base, identifica problemas y aplica soluciones a partir de la descripción de un error o un mensaje de error.
*   **Navegación por cualquier código base:** Mantiene una conciencia de la estructura completa del proyecto, puede obtener información actualizada de la web y, con el Protocolo de Contexto del Modelo (MCP), puede extraer datos de fuentes externas como Google Drive, Figma y Slack.
*   **Automatización de tareas tediosas:** Realiza tareas como corregir problemas de lint, resolver conflictos de fusión y escribir notas de lanzamiento, todo desde un solo comando o automáticamente en CI.

### Razones por las que los desarrolladores aprecian Claude Code:

*   **Funciona en el terminal:** Se integra en el entorno de trabajo existente del desarrollador.
*   **Toma acción:** Puede editar archivos directamente, ejecutar comandos y crear commits. Con MCP, puede interactuar con herramientas personalizadas del desarrollador.
*   **Filosofía Unix:** Es componible y programable, permitiendo flujos de trabajo complejos y automatizados.
*   **Preparado para empresas:** Ofrece seguridad, privacidad y cumplimiento de nivel empresarial, con opciones de alojamiento en AWS o GCP.

### Subagentes en Claude Code:

El video original y la documentación de Anthropic destacan la importancia de los subagentes. Los subagentes son asistentes de IA especializados que pueden ser invocados para manejar tipos específicos de tareas. Permiten una orquestación multi-agente más eficiente y modular, donde el agente primario delega tareas a subagentes con contextos aislados para evitar la contaminación del contexto principal y mejorar la especialización. Es crucial entender que los subagentes reportan al agente primario, no directamente al usuario, y que lo que se define en su configuración es su prompt de sistema, no un prompt de usuario directo.

