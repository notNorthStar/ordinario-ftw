// SOSABOOKS — AGREGAR.JS
// Guarda un libro nuevo en localStorage

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

  // --- ELEMENTOS DEL DOM ---
  const form            = document.getElementById('form-agregar');
  const inputTitulo     = document.getElementById('titulo');
  const inputAutor      = document.getElementById('autor');
  const selectGenero    = document.getElementById('genero');
  const inputAnio       = document.getElementById('anio');
  const inputEstrellas  = document.getElementById('estrellas');
  const inputImagen     = document.getElementById('imagen');
  const inputResumen    = document.getElementById('resumen');
  const inputOpinion    = document.getElementById('opinion');
  const mensajeAgregar  = document.getElementById('mensaje-agregar');

  // --- CARGAR LIBROS EXISTENTES DE LOCALSTORAGE ---
  function cargarLibros() {
    const datos = localStorage.getItem('sosabooks_libros');
    return datos ? JSON.parse(datos) : [];
  }

  // --- GUARDAR LIBROS EN LOCALSTORAGE ---
  function guardarLibros(libros) {
    localStorage.setItem('sosabooks_libros', JSON.stringify(libros));
  }

  // --- GENERAR ID ÚNICO ---
  function generarId() {
    return 'ls_' + Date.now();
  }

  // --- VALIDAR FORMULARIO ---
  function validar() {
    if (inputTitulo.value.trim() === '') {
      return 'El título es obligatorio.';
    }
    if (inputAutor.value.trim() === '') {
      return 'El autor es obligatorio.';
    }
    if (selectGenero.value === '') {
      return 'Selecciona un género.';
    }
    const anio = parseInt(inputAnio.value);
    if (isNaN(anio) || anio < 1000 || anio > 2099) {
      return 'Ingresa un año válido.';
    }
    const estrellas = parseFloat(inputEstrellas.value);
    if (isNaN(estrellas) || estrellas < 0 || estrellas > 5) {
      return 'La calificación debe ser entre 0 y 5.';
    }
    if (estrellas % 0.5 !== 0) {
      return 'Solo se permiten medios puntos (0, 0.5, 1, 1.5...).';
    }
    if (inputResumen.value.trim() === '') {
      return 'El resumen es obligatorio.';
    }
    if (inputOpinion.value.trim() === '') {
      return 'La opinión es obligatoria.';
    }
    return null; // null significa sin errores
  }

  // --- EVENTO SUBMIT ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Valida
    const error = validar();
    if (error) {
      mensajeAgregar.textContent = error;
      mensajeAgregar.className = 'error';
      return;
    }

    // Construye el objeto libro
    const libroNuevo = {
      id:        generarId(),
      titulo:    inputTitulo.value.trim(),
      autor:     inputAutor.value.trim(),
      genero:    selectGenero.value,
      anio:      inputAnio.value.trim(),
      estrellas: parseFloat(inputEstrellas.value),
      imagen:    inputImagen.value.trim(),
      resumen:   inputResumen.value.trim(),
      opinion:   inputOpinion.value.trim(),
      estado:    'leido',
      porQue:    '',
      favorito:  'no',
      fuente:    'ls'
    };

    // Carga libros existentes y agrega el nuevo
    const libros = cargarLibros();
    libros.push(libroNuevo);
    guardarLibros(libros);

    // Muestra mensaje de éxito
    mensajeAgregar.textContent = `"${libroNuevo.titulo}" agregado correctamente.`;
    mensajeAgregar.className = 'exito';

    // Limpia el formulario
    form.reset();

    // Redirige al index después de 2 segundos
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 2000);
  });

  // --- AUTOCOMPLETAR DESDE CATÁLOGO ---
  // Lee el catalogo.xml y sugiere títulos mientras escribes
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'catalogo.xml', true);
  xhr.onload = function () {
    if (xhr.status !== 200) return;

    const xml = xhr.responseXML;
    const libros = xml.getElementsByTagName('libro');

    // Construye lista de sugerencias
    const catalogo = [];
    for (let i = 0; i < libros.length; i++) {
      const tituloEl = libros[i].getElementsByTagName('titulo')[0];
      const autorEl  = libros[i].getElementsByTagName('autor')[0];
      if (tituloEl && autorEl) {
        catalogo.push({
          titulo: tituloEl.textContent.trim(),
          autor:  autorEl.textContent.trim()
        });
      }
    }

    // Escucha lo que se escribe en el campo título
    inputTitulo.addEventListener('input', function () {
      const texto = inputTitulo.value.toLowerCase();
      if (texto.length < 2) return;

      const coincidencia = catalogo.find(function (l) {
        return l.titulo.toLowerCase().includes(texto);
      });

      // Si encuentra coincidencia, autocompleta el autor
      if (coincidencia) {
        inputAutor.value = coincidencia.autor;
        inputAutor.style.borderColor = 'var(--cian)';
        setTimeout(function () {
          inputAutor.style.borderColor = '';
        }, 1500);
      }
    });
  };
  xhr.send();

});