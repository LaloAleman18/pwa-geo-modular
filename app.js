const botonUbicacion = document.querySelector('#btn-ubicacion');
const preferencia = document.querySelector('#alta-precision');
const aviso = document.querySelector('#aviso');
const manual = document.querySelector('#manual');
const selector = document.querySelector('#zona');
const nombreZona = document.querySelector('#nombre-zona');
const resultado = document.querySelector('#resultado');
const estado = document.querySelector('#estado');
const calidad = document.querySelector('#calidad');
const esIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
let permisoConocido = 'prompt';
let operacion = 0;

// Consultar el permiso no activa el sensor ni abre el diálogo nativo.
if (esIOS) consultarEstadoPermisoGeo().then((permiso) => { permisoConocido = permiso; });

function mostrarAviso(mostrar) {
  aviso.hidden = !mostrar;
  botonUbicacion.setAttribute('aria-expanded', String(mostrar));
}

function mostrarManual(mensaje) {
  mostrarAviso(false);
  resultado.hidden = true;
  manual.hidden = false;
  estado.textContent = mensaje;
  selector.focus();
}

function iniciarLectura(turno) {
  mostrarAviso(false);
  estado.textContent = 'Consultando ubicación…';
  botonUbicacion.disabled = true;

  return obtenerUbicacionActual({ enableHighAccuracy: preferencia.checked })
    .then((datos) => {
      if (turno !== operacion) return;
      const alta = datos.precisionMetros < 30;
      calidad.dataset.alta = String(alta);
      calidad.textContent = alta ? 'Precisión GPS Alta' : 'Ubicación Aproximada (Wi-Fi / IP)';
      document.querySelector('#latitud').textContent = datos.latitud.toFixed(5);
      document.querySelector('#longitud').textContent = datos.longitud.toFixed(5);
      document.querySelector('#margen').textContent =
        '±' + datos.precisionMetros.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' m';
      document.querySelector('#hora').textContent = new Date(datos.timestamp).toLocaleTimeString('es-MX');
      estado.textContent = 'Ubicación adjuntada.';
      resultado.hidden = false;
      botonUbicacion.disabled = false;
    })
    .catch((error) => {
      if (turno !== operacion) return;
      permisoConocido = 'prompt';
      botonUbicacion.disabled = false;
      mostrarManual(error.message);
    });
}

botonUbicacion.addEventListener('click', () => {
  const turno = ++operacion;
  manual.hidden = true;
  resultado.hidden = true;
  mostrarAviso(false);

  // En iOS, el acceso ya concedido conserva el clic directo.
  if (esIOS && permisoConocido === 'granted') {
    iniciarLectura(turno);
    return;
  }

  botonUbicacion.disabled = true;
  estado.textContent = 'Consultando permiso…';
  consultarEstadoPermisoGeo().then((permiso) => {
    if (turno !== operacion) return;
    permisoConocido = permiso;
    botonUbicacion.disabled = false;
    estado.textContent = '';
    if (permiso === 'denied') {
      mostrarManual('Permiso de ubicación bloqueado. Puedes reactivarlo en los ajustes del sitio y del dispositivo.');
    } else if (permiso === 'granted' && !esIOS) {
      iniciarLectura(turno);
    } else {
      mostrarAviso(true);
      document.querySelector('#titulo-aviso').focus();
    }
  });
});

document.querySelector('#btn-confirmar').addEventListener('click', () => iniciarLectura(++operacion));

document.querySelector('#btn-cancelar').addEventListener('click', () => {
  mostrarAviso(false);
  estado.textContent = 'Solicitud cancelada.';
  botonUbicacion.focus();
});

document.querySelector('#btn-manual').addEventListener('click', () => {
  operacion++;
  botonUbicacion.disabled = false;
  mostrarManual('');
});

selector.addEventListener('change', () => {
  const otra = selector.value === 'Otra zona';
  document.querySelector('#zona-otra').hidden = !otra;
  nombreZona.disabled = !otra;
  nombreZona.required = otra;
});

manual.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const zona = selector.value === 'Otra zona' ? nombreZona.value.trim() : selector.value;
  if (!zona) {
    estado.textContent = 'Escribe el nombre de tu zona para continuar.';
    nombreZona.focus();
    return;
  }
  estado.textContent = 'Zona adjuntada manualmente: ' + zona + '.';
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .catch((error) => console.warn('No se pudo registrar el service worker:', error));
}
