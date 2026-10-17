#!/bin/sh
# Detectar lead nuevo en leads.json y emitir resumen si hay cambio (marca de agua en /tmp)
LEADS=/Users/DanielRamirez/.openclaw/workspace-pepito/data/leads.json
WM=/tmp/pwm-notified
if [ ! -f "$LEADS" ]; then exit 0; fi
COUNT=$(python3 -c "import json;print(len(json.load(open('$LEADS'))))" 2>/dev/null)
if [ -z "$COUNT" ]; then exit 0; fi
PREV=""
[ -f "$WM" ] && PREV=$(cat "$WM")
if [ "$COUNT" = "$PREV" ]; then exit 0; fi
# hay lead nuevo -> imprimir resumen
python3 - "$LEADS" <<'PYEOF'
import json,sys
leads=json.load(open(sys.argv[1]))
u=leads[-1]
r=u.get('rangoEstimado',{})
print("💼 Nuevo prospecto Platinum Wealth")
print("Nombre:", u.get('nombre','?'))
print("Contacto:", u.get('contacto','?'))
print("Tipo:", u.get('tipo','?'))
print("Monto: USD", format(u.get('monto',0), ',d'))
print("Perfil:", u.get('perfil','?'))
print("Rango est. anual: USD", format(r.get('min',0), ',d'), "–", format(r.get('max',0), ',d'))
print("")
print("⚠️ Estimación, no garantía.")
PYEOF
echo "$COUNT" > "$WM"
