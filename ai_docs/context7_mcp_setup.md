# Context7 MCP Setup para Reservas-saas

Este documento describe la instalación y configuración de Context7 MCP en el proyecto Reservas-saas.

## ¿Qué es Context7 MCP?

Context7 MCP es un servidor de Model Context Protocol que proporciona documentación actualizada y específica por versión de librerías directamente en tus prompts. Context7 obtiene documentación actualizada, ejemplos de código específicos por versión directamente de la fuente y los coloca directamente en tu prompt.

## Instalación Completada

✅ **Configuración MCP creada**: Se ha creado el archivo `.mcp.json` en la raíz del proyecto con la configuración de context7.

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

## Requisitos del Sistema

- ✅ Node.js >= v18.0.0 (Instalado: v22.11.0)
- ✅ npm (Instalado: v10.9.1)

## Cómo Usar Context7

Una vez configurado, puedes invocar Context7 agregando `use context7` a tus prompts.

### Ejemplos de Prompts:

```
use context7

Ayúdame a crear un componente de formulario usando React Hook Form con validación usando Zod.
```

```
use context7

Necesito implementar autenticación con Supabase en Next.js 15. Muéstrame el setup completo.
```

```
use context7

Cómo implementar Row Level Security (RLS) en Supabase para un sistema multi-tenant?
```

## Beneficios

- 🚫 **No más cambio de pestañas**: Documentación directamente en el contexto
- 🚫 **No APIs alucinadas**: Solo APIs reales que existen
- 🚫 **No generación de código desactualizada**: Siempre versión específica
- ✅ **Documentación dinámica**: Inyección automática de docs actualizadas
- ✅ **Ejemplos de código reales**: Directamente de la fuente oficial

## Testing de la Instalación

Para verificar que Context7 MCP está funcionando correctamente:

1. **Reinicia Claude Code** después de la configuración
2. **Usa el comando `/mcp`** en Claude Code para ver si context7 aparece en la lista
3. **Prueba con un prompt** que incluya `use context7`

### Testing Manual con MCP Inspector

Si necesitas debuggear la instalación:

```bash
npx @modelcontextprotocol/inspector@latest npx -y @upstash/context7-mcp@latest
```

## Integración con el Proyecto

Context7 MCP es especialmente útil para este proyecto de Reservas-saas porque:

1. **Supabase**: Documentación actualizada para APIs de Supabase
2. **Next.js 15**: Ejemplos actuales con App Router y nuevas funcionalidades
3. **TypeScript**: Tipos y patrones actualizados
4. **Shadcn/ui**: Componentes y patrones de implementación actuales
5. **Tailwind CSS**: Clases y utilidades más recientes

## Próximos Pasos

1. ✅ Context7 MCP instalado y configurado
2. 🔄 Reiniciar Claude Code para aplicar la configuración
3. 🧪 Probar con prompts que incluyan `use context7`
4. 📝 Documentar casos de uso específicos del proyecto

## Troubleshooting

### Si Context7 no responde:

1. **Verificar configuración**: Confirma que `.mcp.json` existe y está bien formateado
2. **Reiniciar Claude Code**: Reinicia después de cambios de configuración
3. **Verificar conexión de red**: Confirma acceso a internet para descargar docs
4. **Revisar logs**: Usa `/mcp` en Claude Code para verificar estado

### Si hay errores de instalación:

1. **Limpiar cache npx**: `npx clear-npx-cache`
2. **Verificar Node.js**: Confirmar versión >= 18.0.0
3. **Probar instalación manual**: `npx -y @upstash/context7-mcp@latest`

## Archivos de Configuración

- **`.mcp.json`**: Configuración principal de MCP servers
- **`ai_docs/context7_mcp_setup.md`**: Esta documentación
- **`ai_docs/mcp_shadcn.md`**: Documentación existente de MCP para shadcn

---

**¡Context7 MCP está listo para usar en tu proyecto Reservas-saas!**

Ahora puedes obtener documentación actualizada y ejemplos de código específicos por versión directamente en tus prompts usando `use context7`.