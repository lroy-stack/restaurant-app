# Guía Detallada: Orquestación de Sub-Agentes en Claude Code

## Introducción: Desmitificando la Creación de Sub-Agentes

Claude Code ha revolucionado la forma en que los desarrolladores interactúan con la inteligencia artificial para tareas de codificación. Una de sus características más potentes es la capacidad de utilizar 'sub-agentes', que son especialistas de IA dedicados a funciones específicas. Sin embargo, existe una concepción errónea común: que somos nosotros, los usuarios, quienes debemos crear e invocar directamente a cada sub-agente. La realidad es mucho más sofisticada y eficiente: es el **Agente Primario de Claude Code** quien asume este rol de orquestador, creando o invocando a los sub-agentes según las necesidades de la tarea.

Esta guía detallada explicará cómo funciona este flujo de trabajo, destacando el papel central del Agente Primario y cómo podemos definir un 'prompt maestro' para guiar su comportamiento y la delegación de tareas a sus sub-agentes.

## El Corazón del Sistema: El Agente Primario de Claude Code

Cuando interactúas con Claude Code, tu comunicación inicial es siempre con el **Agente Primario**. Este agente es tu interfaz principal con el sistema. No es un simple chatbot; es un orquestador inteligente, capaz de entender tus solicitudes complejas, desglosarlas en subtareas y decidir qué recursos (incluyendo otros sub-agentes) necesita para completarlas.

### Tu 'Prompt Maestro': La Definición del Agente Primario

El poder del Agente Primario reside en su 'System Prompt' (prompt del sistema), que actúa como tu 'prompt maestro'. Aquí es donde defines la personalidad, las capacidades generales y las directrices de alto nivel para tu Agente Primario. Este prompt le indica cómo debe trabajar, qué tipo de problemas puede resolver y, crucialmente, cómo debe interactuar con los sub-agentes.

**Ejemplo de un fragmento de 'Prompt Maestro' para el Agente Primario:**

```markdown
System Prompt: Eres un ingeniero de software senior y un gestor de proyectos excepcional. Tu objetivo es transformar las ideas del usuario en código funcional y de alta calidad. Cuando recibas una solicitud, primero crea un plan detallado. Luego, identifica las subtareas y determina qué sub-agentes especializados son necesarios para cada una. Delega estas subtareas a los sub-agentes apropiados, supervisa su progreso y consolida sus resultados. Si un sub-agente no puede completar su tarea o necesita más información, interviene y decide el siguiente paso, que puede incluir la invocación de un nuevo sub-agente o la comunicación con el usuario para aclaraciones. Siempre busca la solución más eficiente y robusta.
```

Este 'prompt maestro' es lo que permite al Agente Primario actuar de forma autónoma y estratégica, decidiendo cuándo y cómo utilizar a sus 'empleados' (los sub-agentes).

## Los Sub-Agentes: Especialistas a Demanda

Los sub-agentes son modelos de IA con prompts de sistema específicos que los dotan de experiencia en un dominio particular (ej. desarrollo frontend, QA, backend, testing, investigación). A diferencia de lo que muchos piensan, **no somos nosotros quienes invocamos directamente a estos sub-agentes**. En cambio, el Agente Primario es quien decide cuándo y qué sub-agente 'contratar' para una tarea específica.

### ¿Cómo 'Conoce' el Agente Primario a sus Sub-Agentes?

Los sub-agentes se definen en archivos Markdown (o formatos similares) dentro de un directorio específico de Claude Code (típicamente `.cloud/agents`). Cada uno de estos archivos contiene el 'System Prompt' del sub-agente, su descripción, las herramientas a las que tiene acceso y, a veces, un 'trigger' o palabra clave que el Agente Primario puede usar para identificar cuándo invocarlo.

**Ejemplo de un archivo de configuración de Sub-Agente (meta-agente):**

```markdown
Name: Frontend Developer Agent
Location: project
Tools: [code_editor, file_system_access, browser_automation]
Description: Este agente es un experto en el desarrollo de interfaces de usuario con React, Next.js y Tailwind CSS. Utilízalo cuando necesites construir, modificar o depurar componentes frontend.
System Prompt: Eres un desarrollador frontend meticuloso y creativo. Tu tarea es implementar interfaces de usuario según las especificaciones. Siempre escribe código limpio, modular y optimizado para el rendimiento. Cuando completes una tarea, informa al Agente Primario con el código final y un resumen de los cambios.
```

El Agente Primario 'lee' estas descripciones y prompts de sistema de los sub-agentes disponibles. Cuando el Agente Primario está procesando una solicitud del usuario, utiliza su propio razonamiento (guiado por su 'prompt maestro') para determinar qué sub-agente es el más adecuado para la subtarea actual. Es como un gestor de proyectos que asigna tareas a los miembros de su equipo basándose en sus habilidades.

## El Flujo de Uso: Orquestación en Acción

El flujo de interacción en Claude Code, especialmente con sub-agentes, es una cadena de delegación y reporte. Entender esta cadena es fundamental para optimizar tus prompts y obtener los mejores resultados.

### Diagrama de Flujo:

```mermaid
graph TD
    A[Usuario] --> B{Agente Primario}
    B -- Delega Tarea --> C[Sub-Agente (Ej. Desarrollador)]
    B -- Delega Tarea --> D[Sub-Agente (Ej. QA)]
    B -- Delega Tarea --> E[Sub-Agente (Ej. Backend)]
    C -- Reporta Resultado --> B
    D -- Reporta Resultado --> B
    E -- Reporta Resultado --> B
    B -- Decide Siguiente Paso / Comunica --> A
```

### Explicación del Flujo:

1.  **Usuario -> Agente Primario:**
    *   Tú, el usuario, inicias la interacción con una solicitud o un problema complejo. Esta es tu comunicación directa con el Agente Primario.
    *   **Ejemplo:** "Necesito una aplicación web que permita a los usuarios gestionar sus tareas diarias y sincronizarlas con Google Calendar."

2.  **Agente Primario -> Sub-Agentes:**
    *   El Agente Primario, basándose en su 'prompt maestro' y la solicitud del usuario, analiza la tarea. Decide qué sub-agentes son necesarios y les 'pide' que realicen subtareas específicas.
    *   **Crucial:** Los sub-agentes **no te responden a ti directamente**. Responden siempre al Agente Primario. Esta es una distinción clave que muchos ingenieros pasan por alto y que afecta la forma en que se escriben los prompts de los sub-agentes.
    *   **Ejemplo:** El Agente Primario podría decir al 'Desarrollador Frontend': "Crea la estructura base de la interfaz de usuario para la gestión de tareas." Y al 'Desarrollador Backend': "Diseña la API para la gestión de tareas y la integración con Google Calendar."

3.  **Sub-Agentes -> Agente Primario:**
    *   Una vez que un sub-agente completa su subtarea, reporta sus resultados (código, análisis, informe, etc.) de vuelta al Agente Primario. Este reporte es crucial para que el Agente Primario tenga una visión completa del progreso.
    *   **Ejemplo:** El 'Desarrollador Frontend' envía el código HTML/CSS/JS de la interfaz al Agente Primario. El 'Desarrollador Backend' envía la definición de la API y el código del servidor.

4.  **Agente Primario -> Usuario (o Nuevos Sub-Agentes):**
    *   El Agente Primario recibe y consolida los resultados de los sub-agentes. Evalúa si la tarea principal está completa o si se necesitan más pasos.
    *   **Decisión Estratégica:** En este punto, el Agente Primario puede:
        *   **Invocar/Crear Nuevos Sub-Agentes:** Si se identifica una nueva necesidad (ej. "necesitamos un agente de pruebas para verificar la API"), el Agente Primario puede 'activar' un sub-agente existente o incluso 'crear' uno nuevo si no hay un especialista adecuado disponible (si su 'prompt maestro' lo permite).
        *   **Comunicar con el Usuario:** Si la tarea está completa, si se necesita una decisión del usuario, o si hay un problema que requiere intervención humana, el Agente Primario se comunica contigo.
    *   **Ejemplo:** El Agente Primario consolida el frontend y el backend, y luego invoca al 'Agente QA' para que realice pruebas de integración. Una vez que las pruebas son satisfactorias, el Agente Primario te informa: "La aplicación de gestión de tareas está lista para revisión. Aquí tienes el enlace y un resumen de las funcionalidades."

## La Importancia de la Delegación y el 'Prompt Maestro'

La clave para aprovechar al máximo Claude Code y sus sub-agentes no es microgestionar cada sub-agente, sino definir un 'prompt maestro' robusto para tu Agente Primario. Este prompt debe empoderar al Agente Primario para que:

*   **Entienda la Intención:** Comprenda tus objetivos de alto nivel.
*   **Planifique:** Desglose tareas complejas en subtareas manejables.
*   **Delegue Inteligentemente:** Asigne subtareas a los sub-agentes más adecuados.
*   **Orqueste:** Coordine el trabajo de múltiples sub-agentes en paralelo o en secuencia.
*   **Consolide y Reporte:** Recopile los resultados y te los presente de manera coherente.
*   **Decida y Adapte:** Tome decisiones sobre los siguientes pasos, incluyendo la creación o invocación de nuevos sub-agentes, o la interacción contigo.

Al centrarte en el 'prompt maestro' del Agente Primario, estás construyendo un sistema de IA que no solo ejecuta comandos, sino que también razona, planifica y gestiona, liberándote para enfocarte en los problemas de alto nivel y la visión del proyecto.

## Conclusión

Claude Code Agents ofrece un paradigma de desarrollo de software asistido por IA donde el Agente Primario actúa como un gestor de proyectos inteligente, orquestando un equipo de sub-agentes especializados. Entender que el Agente Primario es quien crea e invoca a estos sub-agentes, y que ellos le reportan a él (no directamente a ti), es fundamental para diseñar prompts efectivos y aprovechar al máximo esta poderosa herramienta. Al dominar la creación de tu 'prompt maestro', estarás construyendo un sistema de IA que trabaja para ti, delegando tareas arbitrarias y optimizando tu flujo de trabajo de desarrollo.

