# Mi zona · Práctica 6.3

PWA de geolocalización consciente y modular. Permite consultar una posición y su margen de error o elegir un municipio manualmente. Las coordenadas se muestran en pantalla y quedan en memoria durante la sesión. La app carece de backend, almacenamiento de coordenadas y seguimiento continuo.

- [Aplicación en GitHub Pages](https://laloaleman18.github.io/pwa-geo-modular/)
- [Repositorio público](https://github.com/LaloAleman18/pwa-geo-modular)
- [Guion y preguntas de defensa](./DEFENSA.md)

## Archivos y responsabilidades

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Contiene el aviso, los botones, el selector y los campos de resultado. Carga el helper antes de la interfaz usando `defer`, que mantiene el orden de los scripts. |
| `styles.css` | Define el diseño adaptable y el indicador visual de precisión. |
| `geo-helper.js` | Expone `consultarEstadoPermisoGeo()` y `obtenerUbicacionActual()`. Ambas devuelven promesas. |
| `app.js` | Coordina el consentimiento, obtiene los datos a través del helper y actualiza la pantalla. |
| `sw.js` | Precarga la interfaz, incluido `./geo-helper.js`, y usa Cache First para servir sus archivos. |
| `manifest.json` e `icons/` | Definen la identidad y el modo `standalone` de la PWA con iconos locales. |

## Del botón al resultado

1. **Adjuntar mi ubicación** consulta el permiso con `navigator.permissions.query()` por medio del helper. Consultar el estado por sí solo no abre el diálogo. Si falta la API o falla, el helper devuelve `prompt` para tratar el estado como desconocido.
2. Con `prompt` aparece el aviso. **Cancelar** lo cierra. **Compartir mi ubicación** llama al helper directamente desde el clic. En iOS se prepara una consulta de permiso al iniciar para que un permiso ya conocido como concedido también permita leer directamente desde el clic. Si el estado concedido se conoce solo después del clic, se usa la confirmación para conservar el gesto directo.
3. Con `granted` ya conocido se hace la lectura solicitada. Con `denied` se abre el selector manual y se explican los ajustes para reactivar el permiso. Los permisos pueden variar entre Safari y la PWA abierta desde la pantalla de inicio.
4. `obtenerUbicacionActual()` envuelve los callbacks de `getCurrentPosition()` en `new Promise()`. El callback de éxito llama a `resolve()` con `latitud`, `longitud`, `precisionMetros` y `timestamp`. El callback de error llama a `reject()` con un mensaje según el código nativo. `.then()` muestra el resultado y `.catch()` abre el plan manual.
5. El modo normal usa `enableHighAccuracy: false`, `timeout: 10000` y `maximumAge: 0`. La casilla permite pedir mayor precisión para comparar en clase. Pedirla puede tardar más y depende de lo que ofrezca el dispositivo. Los 10 segundos corresponden a la adquisición y el tiempo del diálogo de permiso se maneja por separado.
6. La interfaz clasifica el valor original de `coords.accuracy`. Para valores **menores a 30 m** muestra **Precisión GPS Alta**. Desde **30 m** muestra **Ubicación Aproximada (Wi-Fi / IP)**. Las etiquetas siguen la práctica. El margen mide la precisión estimada y por sí solo no identifica el sensor o la red usados. [Especificación de geolocalización del W3C](https://www.w3.org/TR/2026/REC-geolocation-20260324/)
7. **Elegir zona manualmente** funciona desde el inicio y también se habilita ante rechazo, posición no disponible o tiempo agotado. El menú incluye municipios de Morelos y **Otra zona** para escribir el nombre. Si el usuario cambia a modo manual durante una solicitud, el contador `operacion` hace que la interfaz ignore cualquier respuesta anterior que llegue tarde.

La app usa JavaScript Vanilla, `new Promise()`, `.then()` y `.catch()`. Un segundo flujo puede reutilizar el helper pasando, por ejemplo, `obtenerUbicacionActual({ enableHighAccuracy: true, timeout: 7000 })`. Cada flujo decide cómo presentar el resultado sin repetir los callbacks nativos.

## Probar y publicar

Para probar en Windows, abre PowerShell en la carpeta del proyecto, ejecuta `python -m http.server 8000` y abre [localhost:8000](http://localhost:8000/). En el celular usa el enlace HTTPS de Pages.

1. En GitHub, crea un repositorio público `pwa-geo-modular` si vas a publicar una copia propia. El repositorio de esta entrega ya está creado.
2. Sube el contenido del proyecto a la raíz de `main`. Verifica que `index.html` y `geo-helper.js` aparezcan en la raíz y que GitHub conserve la carpeta `icons/`.
3. En **Settings → Pages**, elige **Deploy from a branch**, **main**, **/(root)** y guarda.
4. Revisa el despliegue en **Actions**, abre la URL desde **Settings → Pages** y confirma que use HTTPS. En Classroom pega la URL pública del sitio y la del repositorio. [Configuración oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Para publicar una actualización desde el repositorio local, usa `git add .`, `git commit -m "Describe tu cambio"` y `git push`. Si cambias un archivo del precaché, sube la versión del caché en `sw.js` y cierra las ventanas anteriores para que se active la actualización. Después de la primera carga exitosa se puede abrir la interfaz desde el caché. Obtener coordenadas sigue dependiendo del dispositivo y sus servicios de ubicación.

## Lista para la evaluación

- [ ] En laptop y teléfono abre el enlace HTTPS y comprueba que cargar la página no dispara permisos.
- [ ] Con permiso sin decidir, abre el aviso, cancela y comprueba que nunca apareció el diálogo nativo.
- [ ] Abre el aviso de nuevo, confirma y concede acceso. Apunta el margen de error de cada dispositivo con el mismo ajuste de precisión.
- [ ] Prueba un permiso ya concedido y uno bloqueado. Para repetir el aviso restablece el permiso del sitio.
- [ ] Comprueba que puedes usar una zona manual con permiso bloqueado o cuando falla la adquisición.
- [ ] En Chrome, revisa **DevTools → Application → Service Workers** y confirma que **Cache Storage** incluye `geo-helper.js`.
- [ ] Practica una respuesta en 60 segundos y entrega ambos enlaces en Classroom.

El proyecto sigue la guía de laboratorio adjunta para el Tema 6.3. La fecha y hora de entrega quedan sujetas al aviso del profesor.
