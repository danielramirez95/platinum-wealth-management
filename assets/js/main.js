// Platinum Wealth Management — captación de prospectos (GitHub Pages, estático)
// Al enviar, redirige al prospecto al bot de Telegram como canal de contacto.
const form = document.getElementById('lead-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const monto = Number(data.monto) || 0;
    if (monto < 10000) {
      alert('El monto mínimo de inversión es USD 10,000.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Abriendo contacto…';
    // Abrir el bot de Telegram (cara de contacto) en una nueva pestaña.
    window.open('https://t.me/Platinum_Wealth_bot', '_blank');
    // Mostrar confirmación.
    const ok = document.createElement('p');
    ok.id = 'form-ok';
    ok.style.marginTop = '12px';
    ok.style.color = '#1a7f37';
    ok.textContent = 'Gracias. Se abrió nuestro contacto en Telegram para continuar.';
    const prev = document.getElementById('form-ok');
    if (prev) prev.remove();
    form.appendChild(ok);
    btn.disabled = false;
    btn.textContent = 'Enviar';
  });
}

// Scroll reveal: anima elementos con clase .reveal al entrar al viewport
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();
