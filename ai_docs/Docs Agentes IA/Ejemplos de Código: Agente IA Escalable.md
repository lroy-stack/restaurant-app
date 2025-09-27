# Ejemplos de Código: Agente IA Escalable

## Resumen

Este archivo contiene ejemplos de código prácticos que ilustran cómo implementar un agente de IA escalable utilizando Arcade, LangChain y LangGraph. Los ejemplos están comentados en español y muestran la integración con APIs de Gmail y Asana.

## Configuración Inicial

### Instalación de Dependencias

```bash
# Instalar las dependencias necesarias
pip install arcade-ai
pip install langchain
pip install langgraph
pip install openai
pip install streamlit
```

### Variables de Entorno

```python
import os

# Configurar variables de entorno necesarias
os.environ["ARCADE_API_KEY"] = "tu_arcade_api_key"
os.environ["OPENAI_API_KEY"] = "tu_openai_api_key"
os.environ["ARCADE_EMAIL"] = "tu_email_para_autorizacion@ejemplo.com"
```

## Ejemplo 1: Configuración Básica del Agente con Arcade

```python
from arcade_ai import ToolManager
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# Configurar el gestor de herramientas de Arcade
tool_manager = ToolManager()

# Obtener toolkits preconfigurados para Gmail y Asana
gmail_toolkit = tool_manager.get_toolkit("gmail")
asana_toolkit = tool_manager.get_toolkit("asana")

# Convertir herramientas de Arcade al formato LangChain
gmail_tools = gmail_toolkit.to_langchain_tools()
asana_tools = asana_toolkit.to_langchain_tools()

# Combinar todas las herramientas
all_tools = gmail_tools + asana_tools

# Crear instancia del modelo de lenguaje
llm = ChatOpenAI(model="gpt-4", temperature=0.1)

# Enlazar herramientas al modelo
llm_with_tools = llm.bind_tools(all_tools)

# Crear el agente con LangGraph
agent = create_react_agent(
    model=llm_with_tools,
    tools=all_tools,
    # Incluir un nodo de autorización en el flujo
    include_authorization_node=True
)
```

## Ejemplo 2: Flujo de Autorización Just-in-Time

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class AgentState(TypedDict):
    """Estado del agente que incluye información de autorización"""
    messages: List[dict]
    user_id: str
    authorized_tools: List[str]
    pending_authorization: str

def authorization_node(state: AgentState):
    """Nodo que maneja la autorización de herramientas"""
    pending_tool = state.get("pending_authorization")
    
    if pending_tool:
        # Iniciar flujo OAuth con Arcade
        auth_url = tool_manager.request_authorization(
            tool_name=pending_tool,
            user_id=state["user_id"]
        )
        
        return {
            "messages": state["messages"] + [{
                "role": "system",
                "content": f"Autorización requerida para {pending_tool}. URL: {auth_url}"
            }],
            "pending_authorization": None
        }
    
    return state

def tool_execution_node(state: AgentState):
    """Nodo que ejecuta herramientas autorizadas"""
    last_message = state["messages"][-1]
    
    # Verificar si la herramienta está autorizada
    required_tool = extract_required_tool(last_message["content"])
    
    if required_tool not in state["authorized_tools"]:
        return {
            **state,
            "pending_authorization": required_tool
        }
    
    # Ejecutar la herramienta
    result = execute_tool(required_tool, last_message["content"])
    
    return {
        **state,
        "messages": state["messages"] + [{
            "role": "assistant",
            "content": result
        }]
    }

# Construir el grafo del agente
workflow = StateGraph(AgentState)
workflow.add_node("authorization", authorization_node)
workflow.add_node("tool_execution", tool_execution_node)
workflow.add_node("llm", llm_node)

# Definir las transiciones
workflow.add_edge("authorization", "tool_execution")
workflow.add_edge("tool_execution", "llm")
workflow.add_conditional_edges(
    "llm",
    should_continue,
    {
        "continue": "tool_execution",
        "end": END
    }
)

# Compilar el grafo
app = workflow.compile()
```

## Ejemplo 3: Gestión de Memoria a Largo Plazo

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain.memory import ConversationSummaryBufferMemory
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

class PersonalAgentMemory:
    """Clase para gestionar la memoria personalizada del agente"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        
        # Configurar checkpointer para memoria a corto plazo
        self.checkpointer = SqliteSaver(f"memory_{user_id}.db")
        
        # Configurar memoria semántica con base de datos vectorial
        self.embeddings = OpenAIEmbeddings()
        self.semantic_memory = Chroma(
            collection_name=f"user_{user_id}_semantic",
            embedding_function=self.embeddings,
            persist_directory=f"./chroma_db_{user_id}"
        )
        
        # Configurar memoria conversacional
        self.conversation_memory = ConversationSummaryBufferMemory(
            llm=ChatOpenAI(temperature=0),
            max_token_limit=2000,
            return_messages=True
        )
    
    def save_semantic_fact(self, fact: str, metadata: dict = None):
        """Guardar un hecho en la memoria semántica"""
        self.semantic_memory.add_texts(
            texts=[fact],
            metadatas=[metadata or {}]
        )
    
    def retrieve_relevant_facts(self, query: str, k: int = 5):
        """Recuperar hechos relevantes de la memoria semántica"""
        return self.semantic_memory.similarity_search(query, k=k)
    
    def update_conversation_memory(self, human_input: str, ai_output: str):
        """Actualizar la memoria conversacional"""
        self.conversation_memory.save_context(
            {"input": human_input},
            {"output": ai_output}
        )
    
    def get_conversation_context(self):
        """Obtener el contexto de la conversación"""
        return self.conversation_memory.chat_memory.messages

# Ejemplo de uso
user_memory = PersonalAgentMemory("usuario_123")

# Guardar un hecho sobre las preferencias del usuario
user_memory.save_semantic_fact(
    "El usuario prefiere recibir resúmenes de correos largos en lugar de leer todo el contenido",
    metadata={"tipo": "preferencia", "categoria": "email"}
)

# Recuperar hechos relevantes
relevant_facts = user_memory.retrieve_relevant_facts("gestión de correo electrónico")
```

## Ejemplo 4: Integración con Gmail API

```python
from arcade_ai.tools.gmail import GmailTool

class EmailProcessor:
    """Procesador de correos electrónicos con IA"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.gmail_tool = GmailTool(user_id=user_id)
        self.llm = ChatOpenAI(model="gpt-4")
    
    def process_new_emails(self):
        """Procesar nuevos correos electrónicos"""
        # Obtener correos no leídos
        unread_emails = self.gmail_tool.get_unread_messages()
        
        for email in unread_emails:
            # Analizar el correo con IA
            analysis = self.analyze_email(email)
            
            # Tomar acciones basadas en el análisis
            if analysis["requires_task"]:
                self.create_asana_task(analysis["task_details"])
            
            if analysis["priority"] == "high":
                self.send_priority_notification(email, analysis)
    
    def analyze_email(self, email: dict):
        """Analizar un correo electrónico con IA"""
        prompt = f"""
        Analiza el siguiente correo electrónico y determina:
        1. Si requiere crear una tarea (requires_task: true/false)
        2. La prioridad (priority: low/medium/high)
        3. Si requiere una tarea, extrae los detalles (task_details)
        4. Un resumen breve del contenido
        
        Correo:
        De: {email['sender']}
        Asunto: {email['subject']}
        Contenido: {email['body']}
        
        Responde en formato JSON.
        """
        
        response = self.llm.invoke(prompt)
        return eval(response.content)  # En producción, usar json.loads()
    
    def create_asana_task(self, task_details: dict):
        """Crear una tarea en Asana basada en el correo"""
        asana_tool = AsanaTool(user_id=self.user_id)
        
        task = asana_tool.create_task(
            name=task_details["title"],
            notes=task_details["description"],
            due_date=task_details.get("due_date"),
            project_id=task_details.get("project_id")
        )
        
        return task

# Ejemplo de uso
email_processor = EmailProcessor("usuario_123")
email_processor.process_new_emails()
```

## Ejemplo 5: Interfaz Streamlit para el Agente

```python
import streamlit as st
from datetime import datetime

class AgentInterface:
    """Interfaz de usuario para el agente personal"""
    
    def __init__(self):
        self.agent = None
        self.user_memory = None
    
    def setup_page(self):
        """Configurar la página de Streamlit"""
        st.set_page_config(
            page_title="Agente Personal IA",
            page_icon="🤖",
            layout="wide"
        )
        
        st.title("🤖 Tu Agente Personal de IA")
        st.sidebar.title("Configuración")
    
    def handle_authentication(self):
        """Manejar la autenticación del usuario"""
        if "user_id" not in st.session_state:
            st.session_state.user_id = st.text_input("ID de Usuario:")
            
            if st.button("Iniciar Sesión"):
                if st.session_state.user_id:
                    self.initialize_agent(st.session_state.user_id)
                    st.success("¡Sesión iniciada correctamente!")
                    st.rerun()
    
    def initialize_agent(self, user_id: str):
        """Inicializar el agente para el usuario"""
        self.user_memory = PersonalAgentMemory(user_id)
        
        # Configurar el agente con memoria personalizada
        self.agent = create_react_agent(
            model=llm_with_tools,
            tools=all_tools,
            checkpointer=self.user_memory.checkpointer
        )
    
    def chat_interface(self):
        """Interfaz de chat con el agente"""
        if "messages" not in st.session_state:
            st.session_state.messages = []
        
        # Mostrar historial de mensajes
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
        
        # Input del usuario
        if prompt := st.chat_input("¿En qué puedo ayudarte?"):
            # Añadir mensaje del usuario
            st.session_state.messages.append({
                "role": "user",
                "content": prompt
            })
            
            with st.chat_message("user"):
                st.markdown(prompt)
            
            # Obtener respuesta del agente
            with st.chat_message("assistant"):
                with st.spinner("Pensando..."):
                    response = self.get_agent_response(prompt)
                    st.markdown(response)
            
            # Añadir respuesta del agente
            st.session_state.messages.append({
                "role": "assistant",
                "content": response
            })
    
    def get_agent_response(self, user_input: str):
        """Obtener respuesta del agente"""
        try:
            # Configurar el estado inicial
            config = {
                "configurable": {
                    "thread_id": st.session_state.user_id,
                    "user_id": st.session_state.user_id
                }
            }
            
            # Invocar el agente
            result = self.agent.invoke(
                {"messages": [{"role": "user", "content": user_input}]},
                config=config
            )
            
            # Actualizar memoria
            self.user_memory.update_conversation_memory(
                user_input,
                result["messages"][-1]["content"]
            )
            
            return result["messages"][-1]["content"]
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    def authorization_status(self):
        """Mostrar estado de autorizaciones"""
        st.sidebar.subheader("Estado de Autorizaciones")
        
        # Verificar autorizaciones existentes
        authorizations = tool_manager.get_user_authorizations(
            st.session_state.user_id
        )
        
        for service, status in authorizations.items():
            if status:
                st.sidebar.success(f"✅ {service}")
            else:
                if st.sidebar.button(f"Autorizar {service}"):
                    auth_url = tool_manager.request_authorization(
                        service,
                        st.session_state.user_id
                    )
                    st.sidebar.markdown(f"[Autorizar {service}]({auth_url})")
    
    def run(self):
        """Ejecutar la aplicación"""
        self.setup_page()
        
        if "user_id" not in st.session_state or not st.session_state.user_id:
            self.handle_authentication()
        else:
            if not self.agent:
                self.initialize_agent(st.session_state.user_id)
            
            self.authorization_status()
            self.chat_interface()

# Ejecutar la aplicación
if __name__ == "__main__":
    app = AgentInterface()
    app.run()
```

## Ejemplo 6: Configuración de Webhooks para Tiempo Real

```python
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

class WebhookHandler:
    """Manejador de webhooks para eventos en tiempo real"""
    
    def __init__(self):
        self.email_processor = EmailProcessor
        self.task_processor = TaskProcessor
    
    @app.route('/webhook/gmail', methods=['POST'])
    def handle_gmail_webhook(self):
        """Manejar webhooks de Gmail"""
        try:
            data = request.get_json()
            
            # Verificar la autenticidad del webhook
            if not self.verify_gmail_webhook(data):
                return jsonify({"error": "Unauthorized"}), 401
            
            # Procesar el evento
            user_id = data.get('user_id')
            message_id = data.get('message_id')
            
            # Procesar el nuevo correo
            processor = self.email_processor(user_id)
            processor.process_specific_email(message_id)
            
            return jsonify({"status": "success"}), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/webhook/asana', methods=['POST'])
    def handle_asana_webhook(self):
        """Manejar webhooks de Asana"""
        try:
            data = request.get_json()
            
            # Verificar la autenticidad del webhook
            if not self.verify_asana_webhook(data):
                return jsonify({"error": "Unauthorized"}), 401
            
            # Procesar el evento de Asana
            event_type = data.get('event_type')
            user_id = data.get('user_id')
            
            if event_type == 'task_completed':
                self.handle_task_completion(data, user_id)
            elif event_type == 'task_created':
                self.handle_task_creation(data, user_id)
            
            return jsonify({"status": "success"}), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    def verify_gmail_webhook(self, data):
        """Verificar la autenticidad del webhook de Gmail"""
        # Implementar verificación de firma
        return True  # Simplificado para el ejemplo
    
    def verify_asana_webhook(self, data):
        """Verificar la autenticidad del webhook de Asana"""
        # Implementar verificación de firma
        return True  # Simplificado para el ejemplo
    
    def handle_task_completion(self, data, user_id):
        """Manejar la finalización de una tarea"""
        task_id = data.get('task_id')
        
        # Actualizar memoria del agente
        user_memory = PersonalAgentMemory(user_id)
        user_memory.save_semantic_fact(
            f"Tarea {task_id} completada el {datetime.now().isoformat()}",
            metadata={"tipo": "evento", "categoria": "tarea_completada"}
        )
        
        # Enviar notificación al usuario si es necesario
        self.send_completion_notification(user_id, task_id)

# Ejecutar el servidor de webhooks
if __name__ == "__main__":
    webhook_handler = WebhookHandler()
    app.run(host='0.0.0.0', port=5000)
```

## Puntos Clave del Código

- **Configuración Modular:** El código está organizado en clases y funciones reutilizables
- **Gestión de Estado:** LangGraph maneja el estado del agente de forma persistente
- **Autorización Dinámica:** Arcade gestiona la autorización just-in-time de herramientas
- **Memoria Personalizada:** Cada usuario tiene su propia memoria aislada
- **Interfaz de Usuario:** Streamlit proporciona una interfaz intuitiva
- **Tiempo Real:** Los webhooks permiten respuestas inmediatas a eventos

## Referencias

[1] Video: "Agentes de IA Escalables y Personalizados usando LangGraph y Arcade"
[2] Documentación de Arcade: https://docs.arcade.dev/
[3] Documentación de LangGraph: https://langchain-ai.github.io/langgraph/
[4] Documentación de LangChain: https://python.langchain.com/

---

**Navegación:**
- [Volver al README](README_part2.md)

