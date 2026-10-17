// Platinum Wealth Management — sitio estático (GitHub Pages)
// 1) Scroll reveal
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

// 2) Vitrina interactiva de oportunidades
(function () {
  const KV = 'pwm_reservas_v1';
  const contenedorUnidades = document.getElementById('unidades-grid');
  const contenedorOport = document.getElementById('oportunidades-grid');
  if (!contenedorUnidades && !contenedorOport) return;

  // estado persistido localmente: { u1: 2, o1: 1, ... } cuenta reservas hechas por este visitante
  let reservas = {};
  try { reservas = JSON.parse(localStorage.getItem(KV) || '{}'); } catch (e) { reservas = {}; }

  function guardar() { localStorage.setItem(KV, JSON.stringify(reservas)); }

  function disponiblesDe(obj) {
    const r = reservas[obj.id] || 0;
    return Math.max(0, obj.total - r);
  }

  fetch('data/inventario.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderUnidades(data.unidades);
      renderOportunidades(data.oportunidades);
    })
    .catch(function () {
      if (contenedorUnidades) contenedorUnidades.innerHTML = '<p class="empty">Las oportunidades se cargarán en breve.</p>';
    });

  function renderUnidades(unidades) {
    if (!contenedorUnidades) return;
    contenedorUnidades.innerHTML = '';
    unidades.forEach(function (u) {
      const dispo = disponiblesDe(u);
      const card = document.createElement('article');
      card.className = 'card unidad-card';
      card.dataset.id = u.id;
      card.innerHTML =
        '<img src="assets/img/torres/torre' + u.id.replace('u','') + '.jpg" alt="' + u.nombre + '" loading="lazy">' +
        '<div class="unidad-body">' +
          '<div class="unidad-tags">' +
            '<span class="tag ok">Unidad disponible</span>' +
            '<span class="tag">Retorno estimado ' + u.retorno + '</span>' +
          '</div>' +
          '<h3>' + u.nombre + '</h3>' +
          '<p class="unidad-meta">' + u.ubicacion + ' · ' + u.m2 + ' m²</p>' +
          '<div class="spaces"><strong>' + dispo + '</strong> de ' + u.total + ' espacios libres</div>' +
          '<button class="cta reservar" data-id="' + u.id + '" ' + (dispo === 0 ? 'disabled' : '') + '>' +
            (dispo === 0 ? 'Agotado' : 'Reservar espacio') +
          '</button>' +
        '</div>';
      contenedorUnidades.appendChild(card);
    });
  }

  function renderOportunidades(oportunidades) {
    if (!contenedorOport) return;
    contenedorOport.innerHTML = '';
    oportunidades.forEach(function (o) {
      const dispo = disponiblesDe(o);
      const card = document.createElement('article');
      card.className = 'card oportunidad-card';
      card.dataset.id = o.id;
      card.innerHTML =
        '<div class="op-badge">' + (o.tipo === 'Tokens privados' ? '🏛️' : '📈') + '</div>' +
        '<h3>' + o.tipo + '</h3>' +
        '<p>' + o.descripcion + '</p>' +
        '<div class="op-datos">' +
          '<span><strong>Monto:</strong> ' + o.monto + '</span>' +
          '<span><strong>Plazo:</strong> ' + o.plazo + '</span>' +
        '</div>' +
        '<div class="spaces"><strong>' + dispo + '</strong> de ' + o.total + ' espacios disponibles</div>' +
        '<button class="cta reservar" data-id="' + o.id + '" ' + (dispo === 0 ? 'disabled' : '') + '>' +
          (dispo === 0 ? 'Agotado' : 'Aceptar oportunidad') +
        '</button>';
      contenedorOport.appendChild(card);
    });
  }

  // Delegación de evento para reservar
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.reservar');
    if (!btn) return;
    const id = btn.dataset.id;
    reservas[id] = (reservas[id] || 0) + 1;
    guardar();
    // re-render solo las cards afectadas
    const card = btn.closest('[data-id]');
    const isUnidad = card.classList.contains('unidad-card');
    const isOport = card.classList.contains('oportunidad-card');
    // refrescar desde el fetch para mantener consistencia
    fetch('data/inventario.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (isUnidad) renderUnidades(data.unidades);
        if (isOport) renderOportunidades(data.oportunidades);
        // aviso
        toast('✅ Espacio reservado. Nuestro asesor te contactará por Telegram.');
      });
  });

  function toast(msg) {
    let t = document.getElementById('pwm-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pwm-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  // Botón de inicio de conversación (deja listo para ir a Telegram)
  const btnHero = document.querySelector('.hero-actions .cta:not(.ghost)');
  if (btnHero) {
    btnHero.addEventListener('click', function (e) {
      e.preventDefault();
      window.open('https://t.me/Platinum_Wealth_bot', '_blank');
    });
  }
})();
