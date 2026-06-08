// SOSABOOKS — FAVORITOS.JS
// Muestra libros con favorito=si del XML

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
  const contenedor   = document.getElementById('contenedor-favoritos');
  const cuerpoTabla  = document.getElementById('cuerpo-tabla-favoritos');
  const inputBuscar  = document.getElementById('buscar');
  const selectGenero = document.getElementById('filtro-genero');
  const selectEstrellas = document.getElementById('filtro-estrellas');

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
      <span class="etiqueta-favorito">★ Fav</span>
      <div class="tarjeta-info">
        <p class="tarjeta-titulo">${libro.titulo}</p>
        <p class="tarjeta-autor">${libro.autor} · ${libro.anio}</p>
        <p class="tarjeta-estrellas">${generarEstrellas(libro.estrellas)}</p>
      </div>
    `;

    tarjeta.addEventListener('click', function () {
      window.location.href = `libro.html?id=${libro.id}&fuente=${libro.fuente}`;
    });

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
      <td>${generarEstrellas(libro.estrellas)}</td>
    `;
    return fila;
  }

  // --- FILTRAR Y RENDERIZAR ---
  function renderizar(libros) {
    const textoBuscar     = inputBuscar     ? inputBuscar.value.toLowerCase() : '';
    const generoFiltro    = selectGenero    ? selectGenero.value : '';
    const estrellasFiltro = selectEstrellas ? parseFloat(selectEstrellas.value) : 0;

    const filtrados = libros.filter(function (libro) {
      const coincideTexto =
        libro.titulo.toLowerCase().includes(textoBuscar) ||
        libro.autor.toLowerCase().includes(textoBuscar);
      const coincideGenero    = generoFiltro === ''    || libro.genero === generoFiltro;
      const coincideEstrellas = libro.estrellas >= estrellasFiltro;
      return coincideTexto && coincideGenero && coincideEstrellas;
    });

    if (contenedor)  contenedor.innerHTML  = '';
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';

    if (filtrados.length === 0) {
      if (contenedor) {
        contenedor.innerHTML = '<p style="color:var(--texto-suave)">No se encontraron favoritos.</p>';
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

  if (selectEstrellas) {
    selectEstrellas.addEventListener('change', function () {
      renderizar(todosLosLibros);
    });
  }

  // --- CARGAR XML ---
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'libros.xml', true);
  xhr.onload = function () {
    if (xhr.status !== 200) return;

    const xml   = xhr.responseXML;
    const nodos = xml.getElementsByTagName('libro');

    for (let i = 0; i < nodos.length; i++) {
      function getText(tag) {
        const el = nodos[i].getElementsByTagName(tag)[0];
        return el ? el.textContent.trim() : '';
      }

      const favorito = getText('favorito');
      if (favorito !== 'si') continue;

      todosLosLibros.push({
        id:        nodos[i].getAttribute('id'),
        titulo:    getText('titulo'),
        autor:     getText('autor'),
        genero:    getText('genero'),
        anio:      getText('anio'),
        estrellas: parseFloat(getText('estrellas')) || 0,
        imagen:    getText('imagen'),
        favorito:  favorito,
        fuente:    'xml'
      });
    }

    renderizar(todosLosLibros);
  };
  xhr.send();

});