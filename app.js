// Catálogo de hamburguesas gourmet
const productos = [
  { id: 1, nombre: "Trufada Royale", precio: 34000, categoria: "hamburguesas", rating: 4.9, img: "../img/inferno.jpg", desc: "Carne angus, queso brie y mayonesa de trufa negra." },
  { id: 2, nombre: "Bacon Bourbon", precio: 32000, categoria: "hamburguesas", rating: 4.8, img: "../img/inferno.jpg", desc: "Doble smash, tocineta glaseada en bourbon y cheddar." },
  { id: 3, nombre: "Smash Clasica", precio: 28000, categoria: "hamburguesas", rating: 4.7, img: "../img/inferno.jpg", desc: "Cebolla crispy, doble queso americano y salsa especial." },
  { id: 4, nombre: "Portobello Veggie", precio: 29000, categoria: "hamburguesas", rating: 4.6, img: "../img/inferno.jpg", desc: "Hongo portobello a la parrilla, queso de cabra y espinaca." },
  { id: 5, nombre: "Fire Fries", precio: 6900, categoria: "acompanamientos", rating: 4.8, img: "../img/fries.jpg", desc: "Papas crujientes, cheddar, chile y cebollín fresco." },
  { id: 6, nombre: "Onion Crunch", precio: 5900, categoria: "acompanamientos", rating: 4.6, img: "../img/onion.jpg", desc: "Aros de cebolla dorados con dip de pimentón ahumado." },
  { id: 7, nombre: "Cherry Fizz", precio: 4500, categoria: "bebidas", rating: 4.7, img: "../img/cherry.jpg", desc: "Soda artesanal de cereza, lima y mucho hielo." },
];

let carrito = JSON.parse(localStorage.getItem("carrito_burgers")) || [];

const formatoCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

/* =========================================================
   MÓDULO PAGE WIPE TRANSITION (Transición Dividida)
========================================================= */
(() => {
  const wipe = document.querySelector('[data-page-wipe]');
  if (!wipe) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CLOSE_TIME = 760;
  const OPEN_TIME = 760;
  let running = false;

  function build() {
    const delays = [80, 40, 0, 40, 80];
    wipe.innerHTML = delays.map((delay, row) => `
      <div class="page-wipe__row" style="--row:${row}; --delay:${delay}ms;">
        <div class="page-wipe__half page-wipe__half--start">
          <div class="page-wipe__title"><span data-page-wipe-title></span></div>
        </div>
        <div class="page-wipe__half page-wipe__half--end">
          <div class="page-wipe__title"><span data-page-wipe-title></span></div>
        </div>
      </div>
    `).join('');
  }

  function wait(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
  }

  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function setTitle(title) {
    wipe.querySelectorAll('[data-page-wipe-title]').forEach(el => el.textContent = title);
  }

  function setColors({ color, text, accent }) {
    wipe.style.setProperty('--wipe-bg', color || '#0a0a0a');
    wipe.style.setProperty('--wipe-color', text || '#fff');
    wipe.style.setProperty('--wipe-accent', accent || '#ff5a1f');
  }

  async function run({ title = '', color = '#0a0a0a', text = '#fff', accent = '#ff5a1f', onCovered } = {}) {
    if (running) return;

    if (reducedMotion.matches) {
      if (typeof onCovered === 'function') await onCovered();
      return;
    }

    running = true;
    setTitle(title);
    setColors({ color, text, accent });

    document.documentElement.classList.add('is-page-transitioning');
    wipe.classList.remove('is-opening', 'is-covered', 'is-covering');

    await nextFrame();
    wipe.classList.add('is-covering');
    await wait(CLOSE_TIME);

    wipe.classList.remove('is-covering');
    wipe.classList.add('is-covered');

    if (typeof onCovered === 'function') await onCovered();

    await nextFrame();
    wipe.classList.remove('is-covered');
    wipe.classList.add('is-opening');

    await wait(OPEN_TIME);
    wipe.classList.remove('is-opening');
    document.documentElement.classList.remove('is-page-transitioning');

    running = false;
  }

  build();
  window.PageWipe = { run };
})();


/* =========================================================
   LÓGICA PRINCIPAL DE LA APLICACIÓN
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor   = document.getElementById("contenedor-productos");
  const listaCarrito = document.getElementById("lista-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");
  const conteoBadge  = document.getElementById("carrito-conteo");
  const btnVaciar    = document.getElementById("btn-vaciar");
  const btnPagar     = document.getElementById("btn-pagar");
  const filtros      = document.querySelectorAll("[data-filtro]");
  let filtroActual = "todo";

  // Verificación de horario (9:00 AM a 10:00 PM)
  function verificarHorario() {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const puntoEstado = document.getElementById('punto-estado');
    const textoEstado = document.getElementById('texto-estado');

    if (puntoEstado && textoEstado) {
      if (horaActual >= 9 && horaActual < 22) {
        puntoEstado.className = "fb-open-dot bg-success";
        textoEstado.innerText = "Abierto hasta 22:00";
      } else {
        puntoEstado.className = "fb-open-dot bg-danger";
        textoEstado.innerText = "Cerrado (Abre a las 09:00)";
      }
    }
  }
  verificarHorario();

  // Renderizar catálogo
  function renderProductos() {
    const lista = productos.filter((p) => filtroActual === "todo" || p.categoria === filtroActual);

    contenedor.innerHTML = lista
      .map((p) => `
      <div class="col-12 col-md-4">
        <article class="fb-item cursor-pointer" data-demo-link="producto-${p.id}">
          <div class="fb-item-img">
            ${p.img ? `<img src="${p.img}" alt="${p.nombre}">` : '<span class="fb-item-ph" aria-hidden="true">🍔</span>'}
            ${p.rating ? `<span class="fb-rate">★ ${p.rating}</span>` : ""}
          </div>
          <h3>${p.nombre}</h3>
          <p>${p.desc}</p>
          <div class="fb-item-foot">
            <span class="fb-price"><small>$</small> ${p.precio.toLocaleString("es-CO")}</span>
            <button class="fb-add" type="button" data-agregar="${p.id}" aria-label="Agregar ${p.nombre} al carrito">Agregar <span>+</span></button>
          </div>
        </article>
      </div>`)
      .join("");
  }

  // Renderizar Carrito
  function renderCarrito() {
    const vacio = carrito.length === 0;
    const unidades = carrito.reduce((s, i) => s + i.cantidad, 0);
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

    carritoVacio.hidden = !vacio;
    listaCarrito.hidden = vacio;
    listaCarrito.innerHTML = carrito
      .map((item) => `
      <li class="fb-cart-item">
        <div class="fb-cart-info">
          <strong>${item.nombre}</strong>
          <small>${formatoCOP(item.precio)} c/u</small>
          <div class="fb-qty">
            <button type="button" data-cambiar="${item.id}" data-delta="-1" aria-label="Quitar una ${item.nombre}">−</button>
            <span>${item.cantidad}</span>
            <button type="button" data-cambiar="${item.id}" data-delta="1" aria-label="Agregar una ${item.nombre}">+</button>
          </div>
        </div>
        <div class="fb-cart-side">
          <span class="fb-cart-sub">${formatoCOP(item.precio * item.cantidad)}</span>
          <button type="button" class="fb-remove" data-cambiar="${item.id}" data-delta="-999">Quitar</button>
        </div>
      </li>`)
      .join("");

    conteoBadge.textContent = unidades;
    conteoBadge.hidden = vacio;
    document.getElementById("carrito-subtotal").textContent = formatoCOP(total);
    document.getElementById("carrito-envio").textContent = formatoCOP(0);
    document.getElementById("carrito-total").textContent = formatoCOP(total);
    btnVaciar.hidden = vacio;
    btnPagar.disabled = vacio;
    localStorage.setItem("carrito_burgers", JSON.stringify(carrito));
  }

  function cambiarCantidad(id, delta) {
    let item = carrito.find((i) => i.id === id);
    if (!item) {
      const prod = productos.find((p) => p.id === id);
      if (!prod) return;
      item = { id, nombre: prod.nombre, precio: prod.precio, cantidad: 0 };
      carrito.push(item);
    }
    item.cantidad += delta;
    carrito = carrito.filter((i) => i.cantidad > 0);
    renderCarrito();
  }

  // Eventos de compras
  contenedor.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-agregar]");
    if (btn) {
      e.stopPropagation();
      cambiarCantidad(Number(btn.dataset.agregar), 1);
    }
  });

  listaCarrito.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cambiar]");
    if (btn) cambiarCantidad(Number(btn.dataset.cambiar), Number(btn.dataset.delta));
  });

  btnVaciar.addEventListener("click", () => {
    carrito = [];
    renderCarrito();
  });

  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroActual = btn.dataset.filtro;
      filtros.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      renderProductos();
      
      anime({
        targets: ".fb-item",
        opacity: [0, 1],
        translateY: [15, 0],
        delay: anime.stagger(60),
        easing: "easeOutQuad",
        duration: 400
      });
    });
  });

  renderProductos();
  renderCarrito();

  // ---------- ENRUTAMIENTO Y TRANSICIÓN PAGE WIPE ----------
  const pages = [...document.querySelectorAll('[data-demo-page]')];
  let currentPage = document.querySelector('[data-demo-page].is-active');

  function renderDetalleProducto(prod) {
    const contenedorDetalle = document.getElementById("contenedor-detalle-producto");
    contenedorDetalle.innerHTML = `
      <div class="col-md-6">
        <div class="rounded-4 overflow-hidden border border-secondary border-opacity-25 shadow-lg">
          <img src="${prod.img || '../img/inferno.jpg'}" alt="${prod.nombre}" class="w-100 object-fit-cover" style="max-height: 450px;">
        </div>
      </div>
      <div class="col-md-6">
        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">SELECCIÓN CHO!BURGUER 🔥</span>
        <h1 class="display-4 font-goblin text-white mb-3" style="font-family: var(--fb-display);">${prod.nombre}</h1>
        <p class="fs-5 text-white-50 mb-4">${prod.desc} Elaborada con insumos de alta calidad, sabor incomparable y sazón artesanal.</p>
        <div class="d-flex align-items-center gap-4 mb-4">
          <span class="display-6 fw-bold text-warning">${formatoCOP(prod.precio)}</span>
          ${prod.rating ? `<span class="badge bg-dark border border-secondary px-3 py-2 fs-6">★ ${prod.rating}</span>` : ''}
        </div>
        <button class="btn fb-btn btn-lg rounded-pill px-5 fw-bold" data-agregar-detalle="${prod.id}">
          Agregar al Carrito 🛒
        </button>
      </div>
    `;

    contenedorDetalle.querySelector('[data-agregar-detalle]').addEventListener('click', () => {
      cambiarCantidad(prod.id, 1);
    });
  }

  async function navigateTo(linkId) {
    let targetPage = null;
    let titleText = "CHO!BURGUER";

    if (linkId.startsWith("producto-")) {
      const prodId = Number(linkId.replace("producto-", ""));
      const prod = productos.find(p => p.id === prodId);
      if (prod) {
        renderDetalleProducto(prod);
        targetPage = pages.find(p => p.dataset.demoPage === "detalle-producto");
        titleText = prod.nombre.toUpperCase();
      }
    } else {
      targetPage = pages.find(p => p.dataset.demoPage === linkId);
      if (linkId === "home") titleText = "NUESTRO MENÚ";
    }

    if (!targetPage || targetPage === currentPage) return;

    await window.PageWipe.run({
      title: titleText,
      color: "#0a0a0a",
      text: "#f7f3ec",
      accent: "#ff5a1f",
      onCovered() {
        pages.forEach(p => p.classList.toggle('is-active', p === targetPage));
        currentPage = targetPage;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-demo-link]');
    if (!link) return;

    if (event.target.closest('[data-agregar]')) return;

    event.preventDefault();
    navigateTo(link.dataset.demoLink);
  });

  // ---------- PANTALLA DE CARGA (ANIMACIÓN ANIME.JS) ----------
  const burgerImg = document.getElementById("hamburguesa-animada");
  const burgerSteps = ["../img/ham1.png", "../img/ham2.png", "../img/ham3.png"];
  let currentStep = 0;

  const pulseAnimation = anime({
    targets: "#hamburguesa-animada",
    scale: [1, 1.08],
    duration: 600,
    easing: "easeInOutSine",
    direction: "alternate",
    loop: true
  });

  anime({
    targets: ".texto-carga",
    opacity: [0.6, 1],
    duration: 800,
    easing: "easeInOutSine",
    direction: "alternate",
    loop: true
  });

  const eatingInterval = setInterval(() => {
    currentStep = (currentStep + 1) % burgerSteps.length;
    burgerImg.src = burgerSteps[currentStep];
  }, 700);

  window.addEventListener("load", () => {
    setTimeout(() => {
      clearInterval(eatingInterval);
      pulseAnimation.pause();

      anime({
        targets: "#pantalla-carga",
        translateY: "-100%",
        duration: 900,
        easing: "easeInOutExpo",
        complete: () => {
          document.getElementById("pantalla-carga").style.display = "none";
          
          anime({
            targets: "#main-content",
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: "easeOutQuad",
            complete: () => {
              document.getElementById("main-content").style.transform = "none";
              
              anime({
                targets: ".fb-item",
                opacity: [0, 1],
                scale: [0.95, 1],
                delay: anime.stagger(100),
                easing: "easeOutCubic",
                duration: 600
              });
            }
          });
        },
      });
    }, 2800);
  });
});