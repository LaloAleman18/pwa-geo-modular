# Defensa oral · Mi zona

## Guion de 60 segundos

> Primero pulso **Adjuntar mi ubicación**. La app consulta el estado del permiso. Si aún falta decidir, muestra un aviso para que yo confirme antes de solicitar la posición. Si el permiso está bloqueado, puedo usar el selector manual.
>
> En `geo-helper.js` encapsulé los callbacks de `getCurrentPosition()` en una promesa. Si el navegador encuentra mi posición, `resolve()` devuelve latitud, longitud, margen de error y hora. Si falla, `reject()` entrega un error que `app.js` captura para abrir el plan manual.
>
> `coords.accuracy` expresa el margen en metros. Uso 30 metros como límite para las dos etiquetas de la práctica. Si mi celular y mi laptop devuelven márgenes diferentes, puedo comparar su precisión estimada. La app hace una sola lectura y precarga el helper con el service worker.

## Demostración en clase

1. Abre la misma URL en laptop y teléfono. Para mostrar el aviso desde cero, restablece el permiso del sitio antes de practicar.
2. Pulsa **Adjuntar mi ubicación**, muestra la tarjeta y pulsa **Cancelar** para enseñar que el aviso es independiente del diálogo nativo.
3. Repite, confirma, concede acceso y compara los márgenes con la misma configuración en ambos equipos.
4. Para demostrar el plan B, usa un navegador con el permiso bloqueado o el botón manual. Escoge **Otra zona** y escribe un municipio. El modo manual muestra la zona por nombre.
5. Si necesitas probar tiempo agotado de forma controlada durante el ensayo, usa temporalmente un sustituto de la API en una pestaña de prueba que invoque el callback de error con `{ code: 3 }`. Una laptop sin GPS puede entregar coordenadas, fallar por otra razón o tardar según el entorno.

| Dispositivo | Navegador | Alta precisión marcada | Margen real | Etiqueta |
| --- | --- | --- | --- | --- |
| Laptop | | | | |
| Teléfono | | | | |

## Preguntas que te pueden hacer

**¿Por qué usar `new Promise()`?**  
`getCurrentPosition()` entrega su respuesta con callbacks. La promesa permite reutilizar esa lógica y consumir el éxito con `.then()` y el error con `.catch()`.

**¿Qué diferencia hay entre el aviso y el permiso nativo?**  
El aviso lo controla el HTML de la app. La decisión nativa la controla el navegador. Al cancelar el aviso, el helper no solicita coordenadas.

**¿Qué ocurre con el error 3?**  
Es `TIMEOUT`. El helper rechaza la promesa con un mensaje y la interfaz abre el selector manual. El error 1 indica permiso denegado y el 2, posición no disponible.

**¿Qué diferencia hay entre `accuracy` y `enableHighAccuracy`?**  
El primero es el margen estimado que devuelve el navegador. El segundo es una preferencia que la app envía. Una lectura de 10 m cae en la categoría alta de esta práctica, pero el valor por sí solo no identifica si se usó GPS.

**¿Por qué puede fallar o ser menos precisa la laptop?**  
Un equipo sin GPS depende de las fuentes que su plataforma tenga disponibles, como redes Wi-Fi o IP. Pedir alta precisión puede aumentar la espera. La configuración, la señal y los permisos influyen en el resultado.

**¿Por qué registrar un service worker si la ubicación depende del dispositivo?**  
El service worker guarda archivos de la app, incluido `geo-helper.js`. La página puede cargar desde el caché y el helper solicita la posición al navegador cuando el usuario toca el botón.

**¿Qué ajuste hiciste para iOS?**  
La confirmación inicia la lectura en el mismo clic. Si Safari o la PWA instalada manejan un permiso distinto del esperado, el aviso y el plan manual ofrecen una salida.
