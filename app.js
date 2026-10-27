// Catalogo de hamburguesas gourmet-johan 
const productos = [
  {
    id: 1,
    nombre: "Trufada Royale",
    precio: 34000,
    desc: "Carne angus, queso brie y mayonesa de trufa negra.",
    img: 
  },
  {
    id: 2,
    nombre: "Bacon Bourbon",
    precio: 32000,
    desc: "Doble smash, tocineta glaseada en bourbon y cheddar.",
    img: 
  },
  {
    id: 3,
    nombre: "Smash Clasica",
    precio: 28000,
    desc: "Cebolla crispy, doble queso americano y salsa especial.",
    img: 
  },
  {
    id: 4,
    nombre: "Portobello Veggie",
    precio: 29000,
    desc: "Hongo portobello a la parrilla, queso de cabra y espinaca.",
    img: 
  }
];

// Carrito persistente en localStorage-johan 
let carrito = JSON.parse(localStorage.getItem("carrito_burgers")) || [];


// Elementos de la interfaz-johan
const contenedor   = document.getElementById("contenedor-productos");
const listaCarrito = document.getElementById("lista-carrito");
const conteoBadge  = document.getElementById("carrito-conteo");
const totalSpan    = document.getElementById("carrito-total");
const btnVaciar    = document.getElementById("btn-vaciar");
const avisoA11y    = document.getElementById("a11y-status")

;