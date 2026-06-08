// Lee XML + localStorage, genera tarjetas,
// tabla, filtros y maneja sesión

document.addEventListener('DOMContentLoaded', function () {

  // --- PROTECCIÓN DE SESIÓN ---
  // Si no hay usuario en sessionStorage, regresa al login
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
  const contenedor = document.getElementById('contenedor-libros');
  const cuerpoTabla = document.getElementById('cuerpo-tabla');
  const inputBuscar = document.getElementById('buscar');
  const selectGenero = document.getElementById('filtro-genero');
  const selectEstrellas = document.getElementById('filtro-estrellas');

  // --- VARIABLE GLOBAL DE LIBROS ---
  // Aquí guardaremos todos los libros (XML + localStorage)
  let todosLosLibros = [];

  // --- LEER XML ---
  function cargarXML(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'libros.xml', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.responseXML);
      } else {
        console.error('Error al cargar libros.xml');
      }
    };
    xhr.send();
  }

  // --- PARSEAR LIBRO DEL XML ---
  // Convierte un nodo XML en un objeto JavaScript
  function parsearLibro(nodo) {
    function getText(tag) {
      const el = nodo.getElementsByTagName(tag)[0];
      return el ? el.textContent.trim() : '';
    }

    return {
      id:        nodo.getAttribute('id'),
      titulo:    getText('titulo'),
      autor:     getText('autor'),
      genero:    getText('genero'),
      anio:      getText('anio'),
      estrellas: parseFloat(getText('estrellas')) || 0,
      resumen:   getText('resumen'),
      opinion:   getText('opinion'),
      imagen:    getText('imagen'),
      estado:    getText('estado'),
      porQue:    getText('por-que'),
      favorito:  getText('favorito'),
      fuente:    'xml'
    };
  }

  // --- LEER LIBROS DE LOCALSTORAGE ---
  function cargarLocalStorage() {
    const datos = localStorage.getItem('sosabooks_libros');
    return datos ? JSON.parse(datos) : [];
  }

  // --- GENERAR ESTRELLAS EN TEXTO ---
  function generarEstrellas(num) {
    const llenas = Math.floor(num);
    const media = num % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias) + ` ${num}`;
  }

  // --- CREAR TARJETA DE LIBRO ---
  function crearTarjeta(libro) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');
    tarjeta.setAttribute('data-id', libro.id);

    tarjeta.innerHTML = `
      <img 
        src="${libro.imagen || ''}" 
        alt="Portada de ${libro.titulo}"
        onerror="this.src='https://via.placeholder.com/200x300/0a1628/4d9fff?text=Sin+portada'">
      <span class="etiqueta-genero">${libro.genero}</span>
      ${libro.favorito === 'si' ? '<span class="etiqueta-favorito">★ Fav</span>' : ''}
      <div class="tarjeta-info">
        <p class="tarjeta-titulo">${libro.titulo}</p>
        <p class="tarjeta-autor">${libro.autor} · ${libro.anio}</p>
        <p class="tarjeta-estrellas">${generarEstrellas(libro.estrellas)}</p>
      </div>
    `;

    // Click en tarjeta — va a la página de detalle
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
    const textoBuscar = inputBuscar ? inputBuscar.value.toLowerCase() : '';
    const generoFiltro = selectGenero ? selectGenero.value : '';
    const estrellasFiltro = selectEstrellas ? parseFloat(selectEstrellas.value) : 0;

    const filtrados = libros.filter(function (libro) {
      const coincideTexto =
        libro.titulo.toLowerCase().includes(textoBuscar) ||
        libro.autor.toLowerCase().includes(textoBuscar);
      const coincideGenero = generoFiltro === '' || libro.genero === generoFiltro;
      const coincideEstrellas = libro.estrellas >= estrellasFiltro;

      return coincideTexto && coincideGenero && coincideEstrellas;
    });

    // Limpia contenedores
    if (contenedor) contenedor.innerHTML = '';
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';

    if (filtrados.length === 0) {
      if (contenedor) {
        contenedor.innerHTML = '<p style="color:var(--texto-suave)">No se encontraron libros.</p>';
      }
      return;
    }

    // Llena tarjetas y tabla
    filtrados.forEach(function (libro) {
      if (contenedor) contenedor.appendChild(crearTarjeta(libro));
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

  // --- INICIO: CARGA XML + LOCALSTORAGE ---
  cargarXML(function (xml) {
    const nodos = xml.getElementsByTagName('libro');
    const librosXML = [];

    for (let i = 0; i < nodos.length; i++) {
      librosXML.push(parsearLibro(nodos[i]));
    }

    // Solo muestra los libros leídos en el index
    const leidos = librosXML.filter(function (l) {
      return l.estado === 'leido';
    });

    // Libros del localStorage
    const librosLS = cargarLocalStorage().map(function (l) {
      l.fuente = 'ls';
      return l;
    });

    // Combina ambos
    todosLosLibros = leidos.concat(librosLS);

    renderizar(todosLosLibros);
  });

});