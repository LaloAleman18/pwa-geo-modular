function consultarEstadoPermisoGeo() {
  return new Promise((resolve) => {
    if (!navigator.permissions?.query) {
      resolve('prompt');
      return;
    }
    resolve(navigator.permissions.query({ name: 'geolocation' })
      .then((permiso) => permiso.state));
  }).catch(() => 'prompt');
}

function obtenerUbicacionActual(opcionesPersonalizadas = {}) {
  const opciones = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 0,
    ...opcionesPersonalizadas
  };

  return new Promise((resolve, reject) => {
    if (!window.isSecureContext || !navigator.geolocation) {
      reject(new Error('Abre la app por HTTPS en un navegador compatible o elige tu zona.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => resolve({
        latitud: coords.latitude,
        longitud: coords.longitude,
        precisionMetros: coords.accuracy,
        timestamp
      }),
      (error) => {
        const mensajes = {
          1: 'Permiso denegado. Para reactivarlo, revisa el permiso de ubicación en los ajustes del sitio y del dispositivo.',
          2: 'El dispositivo no pudo determinar tu ubicación. Puedes elegir tu zona.',
          3: 'Se agotó el tiempo de espera. Elige tu zona o intenta de nuevo.'
        };
        reject(new Error(mensajes[error.code] || 'No fue posible obtener tu ubicación.'));
      },
      opciones
    );
  });
}
