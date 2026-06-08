// ============================================
// SOSABOOKS — LIBRO.JS
// Muestra el detalle del libro seleccionado
// y permite modificar la calificación
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // --- PROTECCIÓN DE SESIÓN ---
  const usuarioActivo = sessionStorage.getItem('usuario');
  if (!usuarioActivo) {
    window.location.href = 'login.html';
    return;
  }

  // --- CERRAR SESIÓN ---
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function (e) {
      e.preventDefault();
      sessionStorage.removeItem('usuario');
      window.location.href = 'login.html';
    });
  }

  // --- LEER PARÁMETROS DE LA URL ---
  // Cuando clickeas una tarjeta, la URL lleva ?id=l1&fuente=xml
  const params = new URLSearchParams(window.location.search);
  const libroId = params.get('id');
  const fuente = params.get('fuente');

  if (!libroId) {
    window.location.href = 'index.html';
    return;
  }

  // --- ELEMENTOS DEL DOM ---
  const imgLibro       = document.getElementById('libro-imagen');
  const titulo         = document.getElementById('libro-titulo');
  const autor          = document.getElementById('libro-autor');
  const genero         = document.getElementById('libro-genero');
  const anio           = document.getElementById('libro-anio');
  const estrellasDisplay = document.getElementById('libro-estrellas-display');
  const resumen        = document.getElementById('libro-resumen');
  const opinion        = document.getElementById('libro-opinion');
  const formEstrellas  = document.getElementById('form-estrellas');
  const inputEstrellas = document.getElementById('nueva-calificacion');
  const mensajeEstrellas = document.getElementById('mensaje-estrellas');

  // --- FUNCIÓN PARA GENERAR ESTRELLAS ---
  function generarEstrellas(num) {
    const llenas = Math.floor(num);
    const media = num % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias) + ` ${num}`;
  }

  // --- FUNCIÓN PARA LLENAR EL DOM ---
  function mostrarLibro(libro) {
    // Título de la pestaña
    document.title = `SosaBooks — ${libro.titulo}`;

    imgLibro.src = libro.imagen || '';
    imgLibro.alt = `Portada de ${libro.titulo}`;

    titulo.textContent           = libro.titulo;
    autor.textContent            = libro.autor;
    genero.textContent           = libro.genero;
    anio.textContent             = libro.anio;
    resumen.textContent          = libro.resumen;
    opinion.textContent          = libro.opinion;

    // Revisa si hay calificación guardada en localStorage
    const calGuardada = localStorage.getItem(`estrellas_${libroId}`);
    const calFinal = calGuardada ? parseFloat(calGuardada) : libro.estrellas;
    estrellasDisplay.textContent = generarEstrellas(calFinal);
    inputEstrellas.value         = calFinal;
  }

  // --- CARGAR DESDE XML ---
  function cargarDesdeXML() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'libros.xml', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        const xml = xhr.responseXML;
        const libros = xml.getElementsByTagName('libro');

        for (let i = 0; i < libros.length; i++) {
          if (libros[i].getAttribute('id') === libroId) {
            function getText(tag) {
              const el = libros[i].getElementsByTagName(tag)[0];
              return el ? el.textContent.trim() : '';
            }

            const libro = {
              titulo:    getText('titulo'),
              autor:     getText('autor'),
              genero:    getText('genero'),
              anio:      getText('anio'),
              estrellas: parseFloat(getText('estrellas')) || 0,
              resumen:   getText('resumen'),
              opinion:   getText('opinion'),
              imagen:    getText('imagen')
            };

            mostrarLibro(libro);
            break;
          }
        }
      }
    };
    xhr.send();
  }

  // --- CARGAR DESDE LOCALSTORAGE ---
  function cargarDesdeLS() {
    const datos = localStorage.getItem('sosabooks_libros');
    if (!datos) {
      window.location.href = 'index.html';
      return;
    }
    const libros = JSON.parse(datos);
    const libro = libros.find(function (l) { return l.id === libroId; });
    if (libro) {
      mostrarLibro(libro);
    } else {
      window.location.href = 'index.html';
    }
  }

  // --- DECIDE DE DÓNDE CARGAR ---
  if (fuente === 'ls') {
    cargarDesdeLS();
  } else {
    cargarDesdeXML();
  }

  // --- FORMULARIO DE ESTRELLAS ---
  if (formEstrellas) {
    formEstrellas.addEventListener('submit', function (e) {
      e.preventDefault();

      const nueva = parseFloat(inputEstrellas.value);

      // Validación
      if (isNaN(nueva) || nueva < 0 || nueva > 5) {
        mensajeEstrellas.textContent = 'Ingresa un número entre 0 y 5.';
        mensajeEstrellas.className = 'error';
        return;
      }

      // Valida que sea múltiplo de 0.5
      if (nueva % 0.5 !== 0) {
        mensajeEstrellas.textContent = 'Solo se permiten medios puntos (0, 0.5, 1, 1.5...)';
        mensajeEstrellas.className = 'error';
        return;
      }

      // Guarda en localStorage
      localStorage.setItem(`estrellas_${libroId}`, nueva);

      // Actualiza el display
      estrellasDisplay.textContent = generarEstrellas(nueva);
      mensajeEstrellas.textContent = '¡Calificación guardada!';
      mensajeEstrellas.className = 'exito';

      // Limpia el mensaje después de 3 segundos
      setTimeout(function () {
        mensajeEstrellas.textContent = '';
      }, 3000);
    });
  }

});