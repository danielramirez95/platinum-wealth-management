# Platinum Wealth Management — Estructura del workspace

Negocio: fondo de compra de unidades inmobiliarias + asesoría y administración de capital.
Dueño: Daniel. Agente: pepito.

## Tres líneas de servicio

1. **Fondo inmobiliario** — inversión en unidades inmobiliarias (capital de clientes).
2. **Asesoría patrimonial** — planificación y estructura del patrimonio.
3. **Administración de capital** — gestión y seguimiento de portafolio.

## Árbol

```
workspace-pepito/
├── AGENTS.md          # rol, reglas financieras, estilo
├── USER.md            # contexto de Daniel y del negocio
├── site/              # página web
│   ├── index.html     # landing principal
│   ├── pages/         # secciones o páginas internas
│   └── assets/
│       ├── img/       # banner.jpg, logo.jpg (marca)
│       ├── css/
│       └── js/
├── automations/       # lógica de captación y notificación
├── data/              # prospectos en JSON (local, privado)
└── docs/              # copy, avisos legales, decisiones
```

## Reglas de contenido (no negociables)

- Nunca prometer rendimientos ni garantizar ganancias.
- Siempre "rango estimado según perfil de riesgo" + disclaimer.
- Aviso legal y de riesgo obligatorio en toda comunicación.
- Datos de prospectos: privados, solo dentro del Gateway.

## Estado

- [x] Agente pepito creado, modelo gpt-6-luna
- [x] Estructura de carpetas creada
- [x] Assets de marca copiados (banner.jpg, logo.jpg)
- [ ] index.html con copy y formulario
- [ ] Automatización formulario → notificación Telegram
