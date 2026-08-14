# Cómo poner los cobros y los correos a funcionar

Guía para alguien que **no programa**. No hace falta que entiendas el
código: solo tienes que abrir cuatro páginas web, registrarte, y copiar
unas claves. Como cuando das de alta un servicio de internet.

Calcula **una tarde**. Puedes parar y seguir otro día.

---

## Antes de nada: tres cosas que se confunden siempre

Mucha gente cree que "la página web" es una sola cosa. Son tres, y hoy
tienes dos:

| | Qué es | Ejemplo del mundo real | ¿Lo tienes? |
|---|---|---|---|
| **El dominio** | El nombre que la gente escribe | El rótulo de tu local | Cuando lo compres |
| **El alojamiento** | Dónde viven los archivos | El local alquilado | Sí (GitHub Pages) |
| **El código** | Los archivos | Los muebles y la mercancía | Sí (GitHub) |

**Hostinger** vende las dos primeras juntas, por eso parece una sola.
**Vercel** solo hace la segunda, y gratis.

### ¿Y por qué cambiar de alojamiento?

Porque el que tienes ahora **solo sabe enseñar páginas**. No sabe hacer
cosas. Y nosotros necesitamos que haga dos:

1. **Escuchar a Azul** cuando avise de que un cliente pagó
2. **Mandar los correos**

Es como tener un local precioso pero sin teléfono ni empleados: la gente
entra y mira, pero nadie puede atender un pedido.

**Tu dominio no se toca.** Si lo compras en Hostinger, se queda en
Hostinger. Solo le dices que apunte hacia Vercel. No pagas dos veces, no
pierdes nada, y el nombre sigue siendo tuyo.

---

## Lo que ya está hecho (no tienes que hacer nada)

- ✅ El cliente reserva, elige apartar o pagar completo, y paga
- ✅ Cuando el banco confirma, **salen dos correos solos**
- ✅ Si el banco rechaza, **te llega un aviso con su WhatsApp**
- ✅ Las reservas se guardan **en el servidor**, no en el teléfono del cliente
- ✅ Los precios los calcula el servidor: nadie puede pagar menos trucando la página

## Lo que falta (esto es lo tuyo)

Registrarte en **cuatro sitios** y copiar sus claves. Y conseguirme
**un dato de Azul** que no puedo sacar de ningún sitio.

---

# PASO 1 · Vercel

**Qué es:** el sitio donde vivirá la web, y que sí sabe hacer cosas.
**Cuánto cuesta:** gratis para lo que necesitas.
**Cuánto tardas:** 10 minutos.

### Qué hacer

1. Entra en **vercel.com**
2. Pulsa **Sign Up** → elige **Continue with GitHub**
3. Te pedirá permiso para ver tus repositorios → **Authorize**
4. Ya dentro: **Add New… → Project**
5. Busca `ivonne-tour-rd` en la lista y pulsa **Import**
6. ⚠️ **IMPORTANTE:** en el desplegable que dice **Branch**, cambia
   `main` por la rama de pruebas
   (`TEST-con-tarjeta-de-credito-y-correo-y-pasarela-que-falta`)
7. No toques nada más. Pulsa **Deploy**
8. Espera un minuto

### Qué tienes que ver

Una pantalla de felicitación con una dirección tipo
`ivonne-tour-rd.vercel.app`. **Ábrela.** Debe verse tu web.

📌 **Apunta esa dirección.** La vas a necesitar en el paso 4.

### Si algo sale mal

- **No aparece el repositorio:** pulsa *Adjust GitHub App Permissions* y
  dale acceso a `ivonne-tour-rd`
- **Sale error rojo:** haz una captura y mándamela

---

# PASO 2 · Upstash

**Qué es:** el cajón donde se guarda la reserva mientras el cliente está
pagando en la página del banco.
**Cuánto cuesta:** gratis.
**Cuánto tardas:** 5 minutos.

### Por qué hace falta

Cuando el cliente pulsa pagar, **se va de tu web** a la página de Azul.
En ese rato tu web no sabe nada de él. Cuando vuelve, hay que reconocerlo
y saber qué había reservado.

Sin esto es como apuntar los pedidos en la mano: te los lavas y ya no
están.

### Qué hacer

1. Entra en **upstash.com** → **Sign Up** (con Google o GitHub)
2. **Create Database**
3. Rellena así:
   - **Name:** `ivonne-reservas`
   - **Type:** Regional
   - **Region:** `us-east-1` (la más cercana a RD)
4. **Create**
5. Baja hasta la sección **REST API**
6. Verás dos líneas largas. Pulsa el botón de copiar de cada una y
   **pégalas en un bloc de notas**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

📌 **Guárdalas.** Las necesitas en el paso 5.

---

# PASO 3 · Resend

**Qué es:** quien mete los correos en internet.
**Cuánto cuesta:** gratis hasta 3.000 correos al mes.
**Cuánto tardas:** 15 minutos, más la espera de internet.

### Qué hacer

1. Entra en **resend.com** → **Sign Up**
2. Ve a **Domains** → **Add Domain**
3. Escribe tu dominio (ejemplo: `ivonnetourrd.com`)
4. Te enseñará una tabla con **registros DNS**. Son unas líneas raras que
   hay que copiar en donde compraste el dominio

### Lo de los DNS, explicado

Los DNS son la forma que tiene internet de saber que ese correo lo mandas
tú y no un estafador haciéndose pasar por ti.

Ve a donde compraste el dominio (Hostinger, GoDaddy…), busca **DNS** o
*Gestión de DNS*, y **copia cada línea tal cual** de Resend. Son 3 o 4.

Luego vuelve a Resend y pulsa **Verify**. Puede tardar de 10 minutos a
unas horas — es internet propagando el cambio, no un fallo. Si sigue en
rojo, espera y vuelve a intentarlo.

> ⚠️ **Este paso no es opcional.** Sin el dominio verificado, tus correos
> caen en la carpeta de spam y el cliente nunca los ve.

5. Cuando esté verificado, ve a **API Keys** → **Create API Key**
6. Cópiala al bloc de notas

📌 Empieza por `re_...`. **Solo se enseña una vez.** Si la pierdes, borras
esa y creas otra.

---

# PASO 4 · Azul

**Qué es:** quien cobra las tarjetas y te mete el dinero en el banco.
**Cuánto cuesta:** una comisión por cada venta. Te la dicen ellos.
**Cuánto tardas:** la llamada son 15 minutos. La aprobación, días.

### Qué hacer

1. Llama al **809-544-2985** (o 1-809-200-0305)
2. Di exactamente esto:

> «Tengo una empresa de excursiones en Punta Cana y quiero cobrar con
> tarjeta en mi página web. Quiero afiliarme a la **Página de Pagos**.»

⚠️ **Di "Página de Pagos".** Si te ofrecen *Webservices*, di que no. La
Página de Pagos es la que hace que las tarjetas **nunca pasen por tu
web** — y eso te ahorra una certificación de seguridad que cuesta miles
de dólares al año.

3. Te pedirán estar registrado en la **DGII** y papeles del negocio
4. Cuando te aprueben te darán:
   - Un **MerchantId** (números)
   - Una **llave de autenticación** (letras y números largos)
   - **Un manual en PDF** ← esto es lo importante

### 🔴 Lo único que necesito de ti

Dentro de ese PDF hay una página que explica cómo se calcula la firma de
cada cobro (busca **AuthHash**). Ahí viene una **lista de campos en un
orden concreto**.

**Necesito esa página.** Hazle una foto o mándame el PDF.

**Por qué no puedo sacarlo yo:** ese orden no está publicado en ningún
sitio de internet — lo busqué. Azul solo se lo da a sus clientes. Y si el
orden no es **exacto**, Azul rechaza *todos* los pagos con error de firma.
No es algo que se pueda adivinar probando.

Con esa foto lo dejo funcionando en cinco minutos.

---

# PASO 5 · Pegar las claves en Vercel

**Cuánto tardas:** 10 minutos.

Ahora juntas todo lo que has ido copiando.

1. Entra en **vercel.com**, abre tu proyecto
2. **Settings** → **Environment Variables**
3. Añade estas, **una por una**. En *Key* va el nombre y en *Value* el
   valor:

| Key (copia tal cual) | Value (lo tuyo) |
|---|---|
| `URL_BASE` | Tu dirección de Vercel, **sin barra al final** |
| `UPSTASH_REDIS_REST_URL` | Del paso 2 |
| `UPSTASH_REDIS_REST_TOKEN` | Del paso 2 |
| `RESEND_API_KEY` | Del paso 3 |
| `CORREO_DUENO` | **Tu correo**, donde quieres los avisos |
| `CORREO_DESDE` | `IVONNE TOUR RD <reservas@tudominio.com>` |
| `AZUL_MERCHANT_ID` | Del paso 4 |
| `AZUL_AUTH_KEY` | Del paso 4 |
| `AZUL_PRUEBAS` | `true` ← déjalo así de momento |
| `WHATSAPP` | `18092006389` (sin +, sin espacios) |

4. Al terminar: **Deployments** → el de arriba → **Redeploy**

> Las variables nuevas no se aplican solas. **Hay que volver a
> desplegar.** Es el fallo más común.

### 🔒 Regla que no se rompe nunca

**Estas claves no se escriben en ningún archivo del proyecto. Solo en
Vercel.**

Tu repositorio de GitHub es **público**: lo puede leer cualquiera. Y lo
que se sube a GitHub queda en el historial **aunque lo borres después**.
Si una clave de Azul se sube ahí, hay que llamar al banco y pedir otra.

Ya dejé protección para que no pase sin querer, pero conviene que lo
sepas.

---

# PASO 6 · Probar antes de cobrar de verdad

**Cuánto tardas:** 20 minutos. **No te lo saltes.**

Azul te da unas tarjetas de mentira. Haz **dos pruebas completas**:

### Prueba A — que funciona

1. Entra en tu web, reserva una excursión
2. Rellena todo y pulsa pagar
3. Te lleva a la página de Azul → paga con la tarjeta de prueba
4. Vuelves a tu web y ves la confirmación

**Comprueba:**
- [ ] Te llega **tu correo** con la reserva
- [ ] Al cliente le llega **su correo**
- [ ] Las cifras **cuadran**
- [ ] El código de reserva es el mismo en los dos correos

### Prueba B — que falla (la que nadie hace)

Repite con una tarjeta de prueba **rechazada**.

**Comprueba:**
- [ ] Te llega el aviso de **PAGO FALLIDO** con el WhatsApp del cliente
- [ ] Al cliente **NO** le llega nada
- [ ] La página le dice claramente que no se cobró

### Cuando las dos salgan bien

Vuelve a Vercel y cambia `AZUL_PRUEBAS` de `true` a `false`. Redeploy.

**A partir de ese momento se cobra dinero de verdad.**

---

# Cómo mirar si algo falla

En Vercel, pestaña **Logs**. Ahí se ve cada intento de cobro y cada
correo, con la hora. Si un correo no salió, sale escrito el motivo.

| Lo que ves | Qué pasa | Qué hacer |
|---|---|---|
| Los correos no llegan | Falta la clave o el dominio sin verificar | Revisa `RESEND_API_KEY` y que el dominio esté en verde |
| Llegan a spam | El dominio no está verificado | Termina los DNS del paso 3 |
| Azul da error de firma | Falta el orden del manual | **Mándame la foto** del PDF |
| "El cobro no está activado" | Faltan las claves de Azul o el redeploy | Revisa el paso 5 |
| La reserva se pierde al volver | Falta Upstash | Revisa el paso 2 |

---

# Lo que NO hay que hacer

- ❌ **No pongas las claves en el código.** Solo en Vercel.
- ❌ **No pases `AZUL_PRUEBAS` a `false`** sin las dos pruebas del paso 6.
- ❌ **No fusiones esto con `main`** hasta que cobre de verdad y esté
  probado. `main` es lo que ve la gente.
- ❌ **No borres la rama de pruebas** aunque parezca que ya no hace falta.

---

# Resumen en una tabla

| Paso | Dónde | Cuánto cuesta | Cuánto tardas |
|---|---|---|---|
| 1 | vercel.com | Gratis | 10 min |
| 2 | upstash.com | Gratis | 5 min |
| 3 | resend.com | Gratis | 15 min + espera |
| 4 | 809-544-2985 | Comisión por venta | Días |
| 5 | Vercel | — | 10 min |
| 6 | Tu web | — | 20 min |

**Empieza por el 4** — es el único que depende de otros y el que más
tarda. Mientras te aprueban, haces los demás.
