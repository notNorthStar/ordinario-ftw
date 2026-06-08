// SOSABOOKS — LOGIN.JS
// Valida usuario contra usuarios.xml


// Espera a que el HTML esté listo
document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('form-login');
  const inputUsuario = document.getElementById('usuario');
  const inputPassword = document.getElementById('password');
  const mensajeError = document.getElementById('mensaje-error');

  // Función para leer el XML de usuarios
  function cargarUsuarios(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'usuarios.xml', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.responseXML);
      } else {
        mensajeError.textContent = 'Error al cargar los datos.';
      }
    };
    xhr.send();
  }

  // Función para validar credenciales
  function validarUsuario(xml, nombre, password) {
    const usuarios = xml.getElementsByTagName('usuario');

    for (let i = 0; i < usuarios.length; i++) {
      const nombreXML = usuarios[i]
        .getElementsByTagName('nombre')[0]
        .textContent.trim();
      const passwordXML = usuarios[i]
        .getElementsByTagName('password')[0]
        .textContent.trim();

      if (nombreXML === nombre && passwordXML === password) {
        return true;
      }
    }
    return false;
  }

  // Evento submit del formulario
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que la página se recargue

    const nombre = inputUsuario.value.trim();
    const password = inputPassword.value.trim();

    // Validación básica
    if (nombre === '' || password === '') {
      mensajeError.textContent = 'Por favor llena todos los campos.';
      return;
    }

    // Carga el XML y valida
    cargarUsuarios(function (xml) {
      const esValido = validarUsuario(xml, nombre, password);

      if (esValido) {
        // Guarda en sessionStorage que el usuario está logueado
        sessionStorage.setItem('usuario', nombre);
        // Redirige al index
        window.location.href = 'index.html';
      } else {
        mensajeError.textContent = 'Usuario o contraseña incorrectos.';
        inputPassword.value = '';
      }
    });
  });

});