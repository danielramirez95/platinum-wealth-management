# Automatización — captación y notificación

Flujo completo:

1. Prospecto llena el formulario en la web.
2. `server.js` valida (monto >= USD 10,000) y guarda en `data/leads.json`.
3. Una automatización de OpenClaw (trigger) detecta el prospecto nuevo y Pepito (agente main) notifica a Daniel por Telegram.

## Ejecutar el servidor

```bash
cd workspace-pepito/automations
node server.js
```

Sirve la web en http://127.0.0.1:3000 y expone POST /api/lead.

No requiere .env ni tokens: la notificación la hace OpenClaw, no este proceso.

## Reglas
- Rendimiento siempre como rango estimado según perfil de riesgo (conservador 4–6%, moderado 6–9%, agresivo 9–14%, anual, orientativo).
- Nunca prometer ganancias.
- `data/leads.json` es privado: no publicar.
