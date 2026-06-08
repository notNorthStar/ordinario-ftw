// ============================================
// SOSABOOKS — POR-LEER.JS
// Muestra libros con estado por-leer del XML
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

  // --- ELEMENTOS DEL DOM ---
  const contenedor   = document.getElementById('contenedor-por-leer');
  const cuerpoTabla  = document.getElementById('cuerpo-tabla-por-leer');
  const inputBuscar  = document.getElementById('buscar');
  const selectGenero = document.getElementById('filtro-genero');

  // --- VARIABLE GLOBAL ---
  let todosLosLibros = [];

  // --- GENERAR ESTRELLAS ---
  function generarEstrellas(num) {
    const llenas = Math.floor(num);
    const media  = num % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias) + ` ${num}`;
  }

  // --- CREAR TARJETA ---
  function crearTarjeta(libro) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');

    tarjeta.innerHTML = `
      <img
        src="${libro.imagen || ''}"
        alt="Portada de ${libro.titulo}"
        onerror="this.src='https://via.placeholder.com/200x300/0a1628/4d9fff?text=Sin+portada'">
      <span class="etiqueta-genero">${libro.genero}</span>
      <div class="tarjeta-info">
        <p class="tarjeta-titulo">${libro.titulo}</p>
        <p class="tarjeta-autor">${libro.autor} · ${libro.anio}</p>
        <p class="tarjeta-por-que">${libro.porQue}</p>
      </div>
    `;

    return tarjeta;
  }

  // --- CREAR FILA DE TABLA ---
  function crearFila(libro) {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.autor}</td>
      <td>${libro.genero}</td>
      <td>${libro.anio}</td>
      <td>${libro.porQue}</td>
    `;
    return fila;
  }

  // --- FILTRAR Y RENDERIZAR ---
  function renderizar(libros) {
    const textoBuscar  = inputBuscar  ? inputBuscar.value.toLowerCase()  : '';
    const generoFiltro = selectGenero ? selectGenero.value : '';

    const filtrados = libros.filter(function (libro) {
      const coincideTexto =
        libro.titulo.toLowerCase().includes(textoBuscar) ||
        libro.autor.toLowerCase().includes(textoBuscar);
      const coincideGenero = generoFiltro === '' || libro.genero === generoFiltro;
      return coincideTexto && coincideGenero;
    });

    if (contenedor)  contenedor.innerHTML  = '';
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';

    if (filtrados.length === 0) {
      if (contenedor) {
        contenedor.innerHTML = '<p style="color:var(--texto-suave)">No se encontraron libros.</p>';
      }
      return;
    }

    filtrados.forEach(function (libro) {
      if (contenedor)  contenedor.appendChild(crearTarjeta(libro));
      if (cuerpoTabla) cuerpoTabla.appendChild(crearFila(libro));
    });
  }

  // --- EVENTOS DE FILTROS ---
  if (inputBuscar) {
    inputBuscar.addEventListener('input', function () {
      renderizar(todosLosLibros);
    });
  }

  if (selectGenero) {
    selectGenero.addEventListener('change', function () {
      renderizar(todosLosLibros);
    });
  }

  // --- CARGAR XML ---
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'libros.xml', true);
  xhr.onload = function () {
    if (xhr.status !== 200) return;

    const xml    = xhr.responseXML;
    const nodos  = xml.getElementsByTagName('libro');

    for (let i = 0; i < nodos.length; i++) {
      function getText(tag) {
        const el = nodos[i].getElementsByTagName(tag)[0];
        return el ? el.textContent.trim() : '';
      }

      const estado = getText('estado');
      if (estado !== 'por-leer') continue;

      todosLosLibros.push({
        id:        nodos[i].getAttribute('id'),
        titulo:    getText('titulo'),
        autor:     getText('autor'),
        genero:    getText('genero'),
        anio:      getText('anio'),
        estrellas: parseFloat(getText('estrellas')) || 0,
        imagen:    getText('imagen'),
        porQue:    getText('por-que'),
        fuente:    'xml'
      });
    }

    renderizar(todosLosLibros);
  };
  xhr.send();

});