document.addEventListener("DOMContentLoaded", () => {
    const burgerImg = document.getElementById('hamburguesa-animada');
    
    // Secuencia de imágenes de la hamburguesa
    const burgerSteps = ['ham1.png', 'ham2.png', 'ham3.png'];
    let currentStep = 0;

    // 1. Bucle que cambia la imagen simulando los mordiscos
    const eatingInterval = setInterval(() => {
        currentStep = (currentStep + 1) % burgerSteps.length;
        burgerImg.src = burgerSteps[currentStep];

        // Efecto de rebote suave al cambiar de imagen con Anime.js
        anime({
            targets: '#hamburguesa-animada',
            scale: [1.2, 1],
            duration: 350,
            easing: 'easeOutQuad'
        });
    }, 700);

    // 2. Transición de salida cuando la página termina de cargar
    window.addEventListener("load", () => {
        setTimeout(() => {
            clearInterval(eatingInterval); 
            burgerImg.src = 'ham3.png';

            // Animación de salida del loader
            anime.timeline({
                easing: 'easeInOutExpo'
            })
            .add({
                targets: '#hamburguesa-animada',
                scale: 0,
                opacity: 0,
                duration: 500
            })
            .add({
                targets: '.contenedor-cargador-hamburguesa',
                opacity: 0,
                scale: 0.8,
                duration: 400
            }, '-=200')
            .add({
                targets: '#pantalla-carga',
                translateY: '-100%', // Cortina amarilla deslizándose hacia arriba
                duration: 900,
                complete: function() {
                    document.getElementById('pantalla-carga').style.display = 'none';
                    
                    // Revelar el contenido principal
                    anime({
                        targets: '#main-content',
                        opacity: [0, 1],
                        translateY: [20, 0],
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                }
            });

        }, 2800); 
    });
});