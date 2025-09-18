#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "openai",
#     "python-dotenv",
# ]
# ///

import os
import sys
from dotenv import load_dotenv


def prompt_llm(prompt_text):
    """
    Base OpenAI LLM prompting method using fastest model.

    Args:
        prompt_text (str): The prompt to send to the model

    Returns:
        str: The model's response text, or None if error
    """
    load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4.1-nano",  # Fastest OpenAI model
            messages=[{"role": "user", "content": prompt_text}],
            max_tokens=100,
            temperature=0.7,
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return None


def generate_completion_message():
    """
    Generate a completion message using OpenAI LLM.

    Returns:
        str: A natural language completion message, or None if error
    """
    engineer_name = os.getenv("ENGINEER_NAME", "").strip()

    if engineer_name:
        name_instruction = f"A veces (alrededor del 30% del tiempo) incluye el nombre del ingeniero '{engineer_name}' de manera natural."
        examples = f"""Ejemplos del estilo: 
- Estándar: "¡Trabajo completo!", "¡Todo listo!", "¡Tarea finalizada!", "¡Listo para tu próximo movimiento!"
- Personalizado: "¡{engineer_name}, todo listo!", "¡Listo para ti, {engineer_name}!", "¡Completo, {engineer_name}!", "¡{engineer_name}, hemos terminado!" """
    else:
        name_instruction = ""
        examples = """Ejemplos del estilo: "¡Trabajo completo!", "¡Todo listo!", "¡Tarea finalizada!", "¡Listo para tu próximo movimiento!" """

    prompt = f"""Genera un mensaje corto y amigable de finalización para cuando un asistente de IA de codificación termina una tarea.

Requisitos:
- Manténlo bajo 10 palabras
- Hazlo positivo y enfocado al futuro
- Usa lenguaje natural y conversacional
- Enfócate en completación/preparación
- NO incluyas comillas, formato o explicaciones
- Devuelve SOLO el texto del mensaje de finalización
- RESPONDE EN ESPAÑOL
{name_instruction}

{examples}

Genera UN mensaje de finalización:"""

    response = prompt_llm(prompt)

    # Clean up response - remove quotes and extra formatting
    if response:
        response = response.strip().strip('"').strip("'").strip()
        # Take first line if multiple lines
        response = response.split("\n")[0].strip()

    return response


def main():
    """Command line interface for testing."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--completion":
            message = generate_completion_message()
            if message:
                print(message)
            else:
                print("Error generating completion message")
        else:
            prompt_text = " ".join(sys.argv[1:])
            response = prompt_llm(prompt_text)
            if response:
                print(response)
            else:
                print("Error calling OpenAI API")
    else:
        print("Usage: ./oai.py 'your prompt here' or ./oai.py --completion")


if __name__ == "__main__":
    main()
