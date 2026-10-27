// Catálogo de hamburguesas gourmet - johan
// "categoria" alimenta los filtros del menú; "img" y "rating" son opcionales
const productos = [
  { id: 1, nombre: "Trufada Royale", precio: 34000, categoria: "hamburguesas", desc: "Carne angus, queso brie y mayonesa de trufa negra." },
  { id: 2, nombre: "Bacon Bourbon", precio: 32000, categoria: "hamburguesas", desc: "Doble smash, tocineta glaseada en bourbon y cheddar." },
  { id: 3, nombre: "Smash Clasica", precio: 28000, categoria: "hamburguesas", desc: "Cebolla crispy, doble queso americano y salsa especial." },
  { id: 4, nombre: "Portobello Veggie", precio: 29000, categoria: "hamburguesas", desc: "Hongo portobello a la parrilla, queso de cabra y espinaca." },
  // Acompañamientos
  { id: 5, nombre: "Fire Fries", precio: 6900, categoria: "acompanamientos", rating: 4.8, img: "../img/fries.jpg", desc: "Papas crujientes, cheddar, chile y cebollín fresco." },
  { id: 6, nombre: "Onion Crunch", precio: 5900, categoria: "acompanamientos", rating: 4.6, img: "../img/onion.jpg", desc: "Aros de cebolla dorados con dip de pimentón ahumado." },
  // Bebidas
  { id: 7, nombre: "Cherry Fizz", precio: 4500, categoria: "bebidas", rating: 4.7, img: "../img/cherry.jpg", desc: "Soda artesanal de cereza, lima y mucho hielo." },
];

// Carrito persistente: se lee de localStorage al abrir la página
let carrito = JSON.parse(localStorage.getItem("carrito_burgers")) || [];

const formatoCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

document.addEventListener("DOMContentLoaded", () => {
  const contenedor   = document.getElementById("contenedor-productos");
  const listaCarrito = document.getElementById("lista-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");
  const conteoBadge  = document.getElementById("carrito-conteo");
  const btnVaciar    = document.getElementById("btn-vaciar");
  const btnPagar     = document.getElementById("btn-pagar");
  const filtros      = document.querySelectorAll("[data-filtro]");
  let filtroActual = "todo";

  // ---------- Catálogo: pinta las cards desde el array según el filtro ----------
  function renderProductos() {
    const lista = productos.filter((p) => filtroActual === "todo" || p.categoria === filtroActual);

    contenedor.innerHTML = lista
      .map((p) => `
      <div class="col-12 col-md-4">
        <article class="fb-item">
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

  // ---------- Carrito: pinta, calcula totales y guarda en localStorage ----------
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

  // Agrega (delta > 0) o resta (delta < 0) unidades; si llega a 0 se elimina
  function cambiarCantidad(id, delta) {
    let item = carrito.find((i) => i.id === id);
    if (!item) {
      const { nombre, precio } = productos.find((p) => p.id === id);
      item = { id, nombre, precio, cantidad: 0 };
      carrito.push(item);
    }
    item.cantidad += delta;
    carrito = carrito.filter((i) => i.cantidad > 0);
    renderCarrito();
  }

  // ---------- Eventos ----------
  contenedor.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-agregar]");
    if (btn) cambiarCantidad(Number(btn.dataset.agregar), 1);
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
    });
  });

  renderProductos();
  renderCarrito();

  // ---------- Pantalla de carga (animación con Anime.js) ----------
  const burgerImg = document.getElementById("hamburguesa-animada");
  const burgerSteps = ["../img/ham1.png", "../img/ham2.png", "../img/ham3.png"];
  let currentStep = 0;

  // La hamburguesa cambia de imagen simulando los mordiscos
  const eatingInterval = setInterval(() => {
    currentStep = (currentStep + 1) % burgerSteps.length;
    burgerImg.src = burgerSteps[currentStep];
  }, 700);

  // Al cargar la página: la cortina sube y se revela el contenido
  window.addEventListener("load", () => {
    setTimeout(() => {
      clearInterval(eatingInterval);
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
            // Quitar el transform al terminar para no afectar al header sticky
            complete: () => (document.getElementById("main-content").style.transform = "none"),
          });
        },
      });
    }, 2800);
  });
});