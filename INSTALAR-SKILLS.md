# Instalación de las skills de diseño

Las tres skills se instalan con comandos `npx`, que necesitan internet. El entorno donde trabajé no tiene acceso de red para instalar paquetes, así que en esta carpeta dejé instaladas las dos skills de Emil Kowalski (`emil-design-eng` y `animate`) como copia local. Para tener las tres completas, ejecuta esto en tu terminal, **desde la raíz de tu proyecto**:

```bash
# 1) Emil Kowalski: las 17 skills completas (animate, review-animations, choreograph, break-ui, ...)
npx skills@latest add emilkowalski/skills

# 2) Taste Skill (design-taste-frontend). Requiere Node 22+ y Chrome/Edge/Chromium.
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"

# 3) Impeccable (24 comandos: critique, audit, polish, bolder, animate, ...)
npx impeccable install
```

Después reinicia tu herramienta (Claude Code, Cursor, etc.) y en tu agente ejecuta una sola vez:

```
/impeccable init
```

Eso escribe `PRODUCT.md` con el contexto de Kidphone. Luego puedes usar, por ejemplo:

```
/impeccable critique el dashboard
/impeccable polish la página de login
/impeccable audit
```

## Qué hay ya instalado aquí

| Skill | Ruta | Estado |
| --- | --- | --- |
| emil-design-eng | `.claude/skills/emil-design-eng/SKILL.md` | Instalada (copia local) |
| animate | `.claude/skills/animate/SKILL.md` | Instalada (versión resumida, sin `RECIPES.md`) |
| design-taste-frontend | — | Falta: necesita scripts, assets y Chrome. Usa el comando 2 |
| impeccable | — | Falta: necesita su motor y hook. Usa el comando 3 |

## Antes de aceptar el hook de Impeccable

El instalador ofrece un hook que revisa cada archivo de UI que edita el agente. Según su README, los hooks de Claude Code se ejecutan aunque deniegues comandos al modelo, y la primera edición puede descargar el motor. Revisa lo que instala. La telemetría se desactiva con `npx impeccable telemetry off`.
