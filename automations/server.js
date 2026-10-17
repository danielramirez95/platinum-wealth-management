// Platinum Wealth Management — captación de prospectos (servidor web)
// Recibe el formulario y guarda el prospecto en data/leads.json.
// La notificación a Daniel la hace una automatización de OpenClaw (sin tokens aquí).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, '..', 'site');
const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS = path.join(DATA_DIR, 'leads.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function rangoEstimado(perfil, monto) {
  // Rangos anuales orientativos, NO garantizados.
  const tabla = { conservador: [0.04, 0.06], moderado: [0.06, 0.09], agresivo: [0.09, 0.14] };
  const [a, b] = tabla[perfil] || tabla.moderado;
  return { min: Math.round(monto * a), max: Math.round(monto * b) };
}

function loadLeads() {
  try { return JSON.parse(fs.readFileSync(LEADS, 'utf8')); }
  catch { return []; }
}
function saveLeads(leads) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LEADS, JSON.stringify(leads, null, 2));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/lead') {
      let body = '';
      for await (const chunk of req) body += chunk;
      let lider;
      try { lider = JSON.parse(body); } catch { lider = {}; }

      const monto = Number(lider.monto);
      if (!lider.nombre || !lider.contacto || !monto || monto < 10000) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Datos incompletos o monto menor al mínimo.' }));
      }

      const rango = rangoEstimado(lider.perfil, monto);
      const registro = { ...lider, monto, rangoEstimado: rango, creadoEn: new Date().toISOString() };
      const leads = loadLeads();
      leads.push(registro);
      saveLeads(leads);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, id: leads.length }));
    }

    let p = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    if (p.includes('..')) { res.writeHead(403); return res.end('Forbidden'); }
    const fp = path.normalize(path.join(SITE_DIR, p));
    if (!fp.startsWith(SITE_DIR)) { res.writeHead(403); return res.end('Forbidden'); }

    try {
      const data = fs.readFileSync(fp);
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      return res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404');
    }
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: false, error: String(e) }));
  }
});

server.listen(PORT, () => console.log(`Platinum Wealth server en http://127.0.0.1:${PORT}`));
