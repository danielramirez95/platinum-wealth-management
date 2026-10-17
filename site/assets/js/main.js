// Platinum Wealth Management — captación de prospectos
const form = document.getElementById('lead-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      btn.textContent = 'Recibido ✓';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Enviar'; }, 3000);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Reintentar';
      console.error(err);
    }
  });
}
