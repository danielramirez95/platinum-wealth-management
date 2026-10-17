// Platinum Wealth Management — vitrina interactiva (backend crudcrud, demo 24h)
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

// 2) Vitrina interactiva conectada a backend compartido
(function () {
  const BASE = ''; // ya no se usa crudcrud; se lee data/inventario.json estático
  const contenedorUnidades = document.getElementById('unidades-grid');
  const contenedorOport = document.getElementById('oportunidades-grid');
  if (!contenedorUnidades && !contenedorOport) return;

  let cache = { unidades: [], oportunidades: [] };

  function fetchInventario() {
    // Leer inventario local estático (fuente de verdad regenerada por Pepito)
    return fetch('data/inventario.json').then(function (r) { return r.json(); })
      .then(function (data) { return data.unidades.concat(data.oportunidades); });
  }

  function partir(data) {
    return {
      unidades: data.filter(function (x) { return (x.id || '').indexOf('u') === 0; }),
      oportunidades: data.filter(function (x) { return (x.id || '').indexOf('o') === 0; })
    };
  }

  function renderUnidades(unidades) {
    if (!contenedorUnidades) return;
    contenedorUnidades.innerHTML = '';
    unidades.forEach(function (u) {
      const dispo = u.disponibles;
      const n = u.id.replace('u','');
      const card = document.createElement('article');
      card.className = 'card unidad-card';
      card.innerHTML =
        '<img src="assets/img/torres/torre' + n + '.jpg" alt="' + u.nombre + '" loading="lazy">' +
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
      const dispo = o.disponibles;
      const card = document.createElement('article');
      card.className = 'card oportunidad-card';
      card.innerHTML =
        '<div class="op-badge">' + (o.id === 'o1' ? '🏛️' : '📈') + '</div>' +
        '<h3>' + o.nombre + '</h3>' +
        '<p>' + (o.descripcion || '') + '</p>' +
        '<div class="op-datos">' +
          '<span><strong>Monto:</strong> ' + (o.monto || '') + '</span>' +
          '<span><strong>Plazo:</strong> ' + (o.plazo || '') + '</span>' +
        '</div>' +
        '<div class="spaces"><strong>' + dispo + '</strong> de ' + o.total + ' espacios disponibles</div>' +
        '<button class="cta reservar" data-id="' + o.id + '" ' + (dispo === 0 ? 'disabled' : '') + '>' +
          (dispo === 0 ? 'Agotado' : 'Aceptar oportunidad') +
        '</button>';
      contenedorOport.appendChild(card);
    });
  }


  function actualizarResumen(data) {
    const totalBox = document.getElementById('total-disponibles');
    const detalleBox = document.getElementById('resumen-detalle');
    if (!totalBox && !detalleBox) return;
    const todos = data.unidades.concat(data.oportunidades);
    const total = todos.reduce(function (s, x) { return s + (x.disponibles || 0); }, 0);
    if (totalBox) totalBox.textContent = total;
    if (detalleBox) {
      const unidades = data.unidades.reduce(function (s, x) { return s + (x.disponibles || 0); }, 0);
      const oport = data.oportunidades.reduce(function (s, x) { return s + (x.disponibles || 0); }, 0);
      detalleBox.innerHTML =
        '<div class="r-item"><span class="r-num">' + unidades + '</span><span class="r-lbl">Apartamentos</span></div>' +
        '<div class="r-item"><span class="r-num">' + oport + '</span><span class="r-lbl">Oportunidades privadas</span></div>';
    }
  }

  function renderTodo() {
    renderUnidades(cache.unidades);
    renderOportunidades(cache.oportunidades);
    actualizarResumen(cache);
  }

  fetchInventario().then(function (data) {
    cache = partir(data);
    renderTodo();
  }).catch(function () {
    if (contenedorUnidades) contenedorUnidades.innerHTML = '<p class="empty">Cargando oportunidades…</p>';
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.reservar');
    if (!btn) return;
    const id = btn.dataset.id;
    btn.disabled = true;
    // Leer item actual y descontar
    fetchInventario().then(function (data) {
      const recibidas = partir(data);
      const todos = recibidas.unidades.concat(recibidas.oportunidades);
      const item = todos.find(function (x) { return x.id === id; });
      if (!item || item.disponibles <= 0) {
        toast('⛔ Ese espacio ya se agotó.');
        btn.disabled = false;
        refresh();
        return;
      }
      const nuevo = Object.assign({}, item, { disponibles: item.disponibles - 1 });
      // crudcrud: actualizar por _id
      return fetch(BASE + '/inventario/' + item._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      }).then(function (r) { return r.json(); }).then(function () {
        toast('✅ Espacio reservado. Nuestro asesor te contactará por Telegram.');
        refresh();
      });
    }).catch(function () {
      toast('Error de conexión. Inténtalo de nuevo.');
      btn.disabled = false;
    });
  });

  function refresh() {
    fetchInventario().then(function (data) {
      cache = partir(data);
      renderTodo();
    });
  }

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

  const btnHero = document.querySelector('.hero-actions .cta:not(.ghost)');
  if (btnHero) {
    btnHero.addEventListener('click', function (e) {
      e.preventDefault();
      window.open('https://t.me/Platinum_Wealth_bot', '_blank');
    });
  }
})();