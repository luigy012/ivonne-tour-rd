# Poner los cobros y los correos en marcha

Guía para alguien que no programa. Léela entera antes de empezar: son
cuatro contrataciones y una tarde.

---

## Lo que ya está hecho

- El cliente reserva, elige apartar o pagar completo, y paga.
- Cuando el banco confirma, **salen dos correos automáticamente**: su
  voucher y tu aviso.
- Si el banco rechaza la tarjeta, **te llega un tercer correo** con el
  WhatsApp del cliente para que le escribas. A él no le llega nada.
- Las reservas se guardan **en el servidor**, no en el teléfono del cliente.

## Lo que falta

Contratar cuatro servicios y pegar sus llaves. Y **un dato del manual de
Azul** que no es público (está explicado abajo, es lo único delicado).

---

## Paso 1 · Vercel — dónde vive la web

Hoy la web está en GitHub Pages, que solo sirve páginas: **no puede
recibir el aviso de Azul ni mandar correos**. Por eso hace falta mover
la web a un sitio que sí ejecute código. Vercel es gratis para esto.

1. Entra en **vercel.com** y regístrate con tu cuenta de GitHub
2. *Add New → Project* → elige `ivonne-tour-rd`
3. En **Branch**, elige la rama de pruebas (no `main`)
4. *Deploy*

Te dará una dirección tipo `ivonne-tour-rd.vercel.app`. Esa es tu web.
Cuando todo funcione, ahí se le pone tu dominio de verdad.

## Paso 2 · Upstash — dónde se guardan las reservas

Entre que el cliente pulsa pagar y vuelve del banco, **se va de nuestra
página**. La reserva tiene que estar esperándolo en algún sitio.

1. Entra en **upstash.com**, regístrate
2. *Create Database* → Redis → región cercana (`us-east-1`)
3. Copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

> Sin esto funciona, pero guarda en memoria y se pierde al reiniciar.
> Vale para probar; **no para cobrar de verdad**.

## Paso 3 · Resend — quién manda los correos

1. Entra en **resend.com**, regístrate
2. *Domains* → añade tu dominio y pon los registros que te pida donde
   compraste el dominio. **Esto no es opcional**: sin verificar el
   dominio, los correos caen en spam
3. *API Keys* → crea una y cópiala

## Paso 4 · Azul — el cobro

1. Llama al **809-544-2985** o entra en azul.com.do y pide afiliarte a
   la **Página de Pagos** (no a Webservices — la Página de Pagos es la
   que no nos obliga a manejar tarjetas)
2. Necesitas estar registrado en la **DGII**
3. Te darán: el `MerchantId`, la **llave de autenticación**, y **un
   manual en PDF**

### ⚠️ Lo único que tengo que rellenar yo

En ese manual hay una lista que dice en qué orden se pegan los campos
para calcular la firma del cobro (`AuthHash`). **Ese orden no es público
y no me lo puedo inventar**: si no es exacto, Azul rechaza todos los
pagos con error de firma.

**Mándame esa página del manual** y lo dejo funcionando en cinco
minutos. Está marcado en el código en `api/_lib/azul.js`, donde pone
`ORDEN_FIRMA`.

## Paso 5 · Pegar las llaves

En Vercel: *Settings → Environment Variables*. Añade una por una las que
están en `.env.example`.

> **Nunca** escribas estas llaves en un archivo del proyecto. GitHub es
> público: lo que sube, se queda para siempre aunque lo borres.

Deja `AZUL_PRUEBAS` en `true` hasta que hayas probado todo.

## Paso 6 · Probar

Azul te da tarjetas de prueba. Haz una reserva entera:

- ✅ Te llega el correo a ti y al cliente
- ✅ Los importes cuadran
- ✅ Prueba también **rechazar** un pago y comprueba que te llega el
  aviso de pago fallido con el WhatsApp

Cuando todo cuadre, `AZUL_PRUEBAS` a `false` y ya cobras de verdad.

---

## Cómo mirar si algo falla

En Vercel, pestaña **Logs**. Ahí se ve cada intento de cobro y cada
correo. Si un correo no salió, sale escrito el motivo.

## Qué NO hay que hacer

- **No pongas las llaves en el código.** Van solo en Vercel.
- **No pases `AZUL_PRUEBAS` a `false`** sin haber probado un cobro y un
  rechazo completos.
- **No fusiones esto con `main`** hasta que cobre de verdad.
