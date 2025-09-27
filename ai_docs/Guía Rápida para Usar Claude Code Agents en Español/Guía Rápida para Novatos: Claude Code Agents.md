# Guía Rápida para Novatos: Claude Code Agents

## Introducción a Claude Code Agents

Claude Code Agents es una herramienta de Anthropic que permite a los desarrolladores trabajar con Claude directamente desde su terminal, delegando tareas de codificación como migraciones de código, depuración y corrección de errores. Lo más innovador es la capacidad de crear 'sub-agentes', que son equipos especializados de IA diseñados para diferentes aspectos del flujo de trabajo de desarrollo. Cada sub-agente opera de forma independiente con su propio contexto, experiencia y herramientas, lo que permite delegar flujos de trabajo específicos a especialistas de IA dedicados, manteniendo la conversación principal enfocada en el panorama general del proyecto.

## ¿Cómo funciona?

Claude Code Agents funciona como un asistente de codificación agentivo que se integra en tu terminal. En lugar de ser una ventana de chat o un IDE separado, Claude Code se encuentra donde ya trabajas, utilizando las herramientas que ya conoces. Puede realizar las siguientes acciones:

*   **Construir características a partir de descripciones:** Le dices a Claude lo que quieres construir en lenguaje natural, y él planificará, escribirá el código y se asegurará de que funcione.
*   **Depurar y corregir problemas:** Describe un error o pega un mensaje de error. Claude Code analizará tu base de código, identificará el problema e implementará una solución.
*   **Navegar por cualquier base de código:** Puedes hacer preguntas sobre la base de código de tu equipo y obtener respuestas detalladas. Claude Code mantiene una conciencia de la estructura completa de tu proyecto, puede encontrar información actualizada de la web y, con los Protocolos de Contexto del Modelo (MCP), puede extraer datos de fuentes externas como Google Drive, Figma y Slack.
*   **Automatizar tareas tediosas:** Corrige problemas de lint, resuelve conflictos de fusión y escribe notas de lanzamiento. Todo esto se puede hacer con un solo comando desde tu máquina de desarrollo o automáticamente en CI.

Los sub-agentes, en particular, son personalidades de IA preconfiguradas a las que Claude Code puede delegar tareas. Cada sub-agente tiene un propósito y un área de especialización específicos, y utiliza sus propias herramientas y contexto. Esto permite una 


delegación de tareas muy eficiente y una mayor especialización.

## Configuración para Novatos (No Técnicos)

Aunque Claude Code Agents es una herramienta para desarrolladores, la creación y configuración de sub-agentes se ha simplificado para que incluso los usuarios no técnicos puedan entender los conceptos básicos. Aquí te explicamos cómo:

1.  **Acceso a Claude Code:** Claude Code se ejecuta en tu terminal. Para empezar, necesitarás tener Node.js instalado (versión 18 o superior). Luego, puedes instalar Claude Code globalmente con un simple comando:
    ```bash
    npm install -g @anthropic-ai/claude-code
    ```
    Una vez instalado, navega a la carpeta de tu proyecto en la terminal y escribe `claude` para iniciar.

2.  **Creación de Agentes:** Dentro de Claude Code, puedes crear nuevos agentes escribiendo `/agents`. Esto te permitirá definir un nuevo agente. Puedes especificar si el agente será para un proyecto específico o si estará disponible globalmente en tu máquina.

3.  **Configuración del Agente:** Aquí es donde la magia sucede. Puedes configurar el agente de dos maneras:
    *   **Manual:** Puedes definir manualmente las características y el propósito del agente.
    *   **Generar con Claude:** ¡La opción más sencilla para novatos! Puedes pedirle a Claude que genere un agente por ti. Por ejemplo, podrías decir: "Quiero crear un ingeniero frontend experto en Next.js, Tailwind y Shadcn UI." Claude generará un archivo Markdown que describe este agente.

4.  **Personalización del Agente (Archivo Markdown):** El archivo Markdown generado es clave. Contiene la siguiente información:
    *   **Nombre:** El nombre del agente (ej. "Ingeniero Frontend").
    *   **Ubicación:** Dónde se guardará el archivo del agente en relación con tu directorio.
    *   **Herramientas:** Una lista de las herramientas a las que el agente tendrá acceso (ej. leer/editar archivos, buscar en la web, etc.). Puedes darle acceso a todas las herramientas o solo a las necesarias.
    *   **Descripción:** Una breve explicación de cuándo invocar a este agente (ej. "Usa este agente cuando necesites construir, modificar o depurar componentes frontend...").
    *   **System Prompt (Instrucciones del Sistema):** Esta es la parte más poderosa. Aquí puedes añadir instrucciones específicas sobre cómo quieres que el agente se comporte, qué estilo de código prefieres, qué evitar, etc. Por ejemplo, puedes indicarle que no use gradientes lineales o que evite ciertos emojis. Esto permite una personalización muy fina del comportamiento del agente.

5.  **Portabilidad de Agentes:** Una gran ventaja es que estos archivos Markdown son portátiles. Puedes compartirlos, versionarlos en tu repositorio de código (como Git) y reutilizarlos en diferentes proyectos.

## Ejemplos de Uso para Novatos

Imagina que quieres crear una página web sencilla. Podrías tener:

*   **Un Agente de Investigación:** Un experto en búsqueda web que pueda encontrar las últimas noticias o tendencias para incluir en tu contenido.
*   **Un Agente Frontend:** Que se encargue de construir la estructura de la página, tablas de precios y secciones de preguntas frecuentes.

Claude Code te permite delegar estas tareas a tus agentes especializados, y ellos trabajarán de forma colaborativa para lograr el objetivo final. El sistema incluso desglosará tus solicitudes en listas de tareas para cada agente.

## Conclusión

Claude Code Agents y sus sub-agentes representan un avance significativo en la forma en que interactuamos con la IA para el desarrollo de software. Permiten una mayor especialización, eficiencia y personalización, incluso para aquellos con poca experiencia técnica en codificación. Al entender cómo configurar y personalizar estos agentes a través de archivos Markdown y comandos sencillos, los novatos pueden empezar a aprovechar el poder de la IA para automatizar y mejorar sus flujos de trabajo.

