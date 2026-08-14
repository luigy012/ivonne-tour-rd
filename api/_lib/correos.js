/* ============================================================
   LOS CORREOS

   Salen DESDE AQUÍ, del servidor, y no del teléfono del cliente. Es
   toda la diferencia: el cliente puede cerrar la página, quedarse sin
   datos o tirar el teléfono al mar en el segundo siguiente a pagar —
   el correo sale igual, porque no depende de él.

   Son TRES, no dos:
     1. al cliente  → su voucher, cuando el pago sale bien
     2. a Ivonne    → el aviso de la reserva, cuando el pago sale bien
     3. a Ivonne    → el aviso de INTENTO FALLIDO, cuando el banco dice
                      que no. Al cliente no le llega nada en ese caso.

   El tercero es el que vale dinero: quien llegó hasta la tarjeta ya
   dejó nombre, correo y WhatsApp, y quería ir. Que se pierda por un
   problema de banco es tirar un cliente casi cerrado.
   ============================================================ */

const CFG = {
  dueno   : process.env.CORREO_DUENO   || 'reservas@ivonnetourrd.com',
  desde   : process.env.CORREO_DESDE   || 'IVONNE TOUR RD <reservas@ivonnetourrd.com>',
  whatsapp: process.env.WHATSAPP       || '18092006389'
};

/* ── formato ────────────────────────────────────────────────── */
const dinero = (n, cur) => (cur || '$') + Math.round(n).toLocaleString('en-US');

function fechaLarga(f){
  if(!f) return '';
  return new Date(f + 'T00:00').toLocaleDateString('es-DO',
    { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
function fechaCorta(f){
  if(!f) return '';
  return new Date(f + 'T00:00').toLocaleDateString('es-DO',
    { weekday:'short', day:'numeric', month:'short' });
}
const primerNombre = n => (n || '').trim().split(/\s+/)[0] || '';

function personasTx(p){
  let t = p.adultos + ' adulto' + (p.adultos > 1 ? 's' : '');
  if(p.ninos) t += ', ' + p.ninos + ' niño' + (p.ninos > 1 ? 's' : '');
  return t;
}

/* ── el cuerpo, en filas ────────────────────────────────────── */
function filas(r){
  const cur = r.producto.cur;
  const f = [];
  f.push(['Código de reserva', r.codigo]);
  f.push([r.producto.tipo === 'paquete' ? 'Plan' : 'Excursión', r.producto.nombre]);
  f.push(['Fecha', fechaLarga(r.fecha) + (r.hora ? ' · sale ' + r.hora : '')]);
  f.push(['Personas', personasTx(r.personas) + ' (' + r.personas.total + ' en total)']);
  f.push([r.recogida.tipo === 'hotel' ? 'Recoger en el hotel' : 'Punto de encuentro', r.recogida.valor]);
  f.push(null);
  f.push(['Cliente', r.cliente.nombre]);
  f.push(['Correo', r.cliente.email]);
  f.push(['WhatsApp', r.cliente.whatsapp + (r.cliente.whatsapp2 ? '  /  ' + r.cliente.whatsapp2 : '')]);
  f.push(null);
  f.push(['Modalidad', r.pago.modo === 'completo' ? 'PAGÓ EL TOUR COMPLETO' : 'APARTÓ EL CUPO']);
  f.push(['Total del tour', dinero(r.totales.total, cur)]);
  f.push(['Cobrado ahora', dinero(r.pago.hoy, cur)]);
  f.push(['Pendiente de cobro', r.pago.pendiente > 0
    ? dinero(r.pago.pendiente, cur) + '   ← cobrar el día del tour'
    : 'Nada. Está pagado entero.']);
  if(r.pago.referencia) f.push(['Referencia del banco', r.pago.referencia]);
  if(r.extras && r.extras.length){
    f.push(null);
    r.extras.forEach(e => {
      const det = Object.values(e.opciones || {}).filter(v => v !== '' && v !== 1).join(', ');
      f.push(['Extra', e.nombre + (det ? ' (' + det + ')' : '') + ' — ' + dinero(e.precio, cur)]);
    });
  }
  if(r.peticion) f.push(['PETICIÓN ESPECIAL', r.peticion]);
  return f;
}

function aTexto(sobre){
  const anchos = sobre.filas.filter(Boolean).map(l => l[0].length);
  const ancho = Math.max(...anchos);
  const cuerpo = sobre.filas.map(l => l ? l[0].padEnd(ancho) + '  :  ' + l[1] : '').join('\n');
  return sobre.titulo + '\n' + '='.repeat(Math.min(sobre.titulo.length, 62)) + '\n\n' +
         cuerpo + '\n\n' + sobre.pie + '\n\n— IVONNE TOUR RD';
}

/* ── EL CORREO BONITO ─────────────────────────────────────────
   Un correo NO se maqueta como una página web. Gmail, Outlook y el
   correo del iPhone se comen la mitad del CSS moderno: nada de flex,
   nada de grid, nada de hojas de estilo aparte. Se hace con tablas y
   con el estilo escrito en cada etiqueta, como en 2005 — feo por
   dentro, pero es lo único que se ve igual en todas partes.

   Reglas que se respetan aquí:
     · tablas para todo lo que sea colocar cosas
     · estilo dentro de cada etiqueta (nada de <style>)
     · 600px de ancho, que es lo que cabe en todos los clientes
     · nada de imágenes de fondo (Outlook las ignora)
     · el color se hereda del tipo de correo: verde si todo va bien,
       ámbar si es un aviso de pago fallido
     · y siempre acompañado de la versión en texto plano, que es la
       que se lee si alguien tiene las imágenes bloqueadas          */
function aHtml(sobre){
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  const alerta = sobre.etiqueta === 'fallido';
  const c = alerta
    ? { fuerte:'#b0430f', suave:'#e0742a', papel:'#fff6ef', linea:'#f3d9c2', icono:'!' }
    : { fuerte:'#0b5a34', suave:'#12854c', papel:'#f2f9f4', linea:'#cfe4d7', icono:'✓' };

  const FUENTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  /* las filas de datos. La primera de cada bloque manda: si la etiqueta
     va en MAYÚSCULAS es porque es la que hay que leer primero (el
     WhatsApp en el aviso de fallo, la petición especial), y se pinta
     destacada en vez de en gris. */
  const filasHtml = sobre.filas.map(l => {
    if(!l) return `<tr><td colspan="2" style="padding:9px 0"><div style="height:1px;background:#e8e1d5;line-height:1px;font-size:0">&nbsp;</div></td></tr>`;
    const destacada = l[0] === l[0].toUpperCase() && l[0].length > 4;
    return `<tr>
      <td style="padding:8px 16px 8px 0;font-family:${FUENTE};font-size:12px;color:${destacada ? c.fuerte : '#5c6b60'};font-weight:${destacada ? '700' : '400'};white-space:nowrap;vertical-align:top;line-height:1.5">${esc(l[0])}</td>
      <td style="padding:8px 0;font-family:${FUENTE};font-size:14px;color:#1b241e;font-weight:600;line-height:1.5">${esc(l[1])}</td>
    </tr>`;
  }).join('');

  /* la cabecera del resguardo: el código grande, que es lo que el
     cliente va a buscar cuando abra el correo dentro de tres semanas */
  const codigo = (sobre.filas.find(l => l && /^Código/.test(l[0])) || [])[1] || '';

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(sobre.asunto)}</title></head>
<body style="margin:0;padding:0;background:#fbf7ef;">
<!-- el texto que asoma en la lista del móvil, antes de abrir -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(sobre.pie)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fbf7ef;padding:24px 12px">
<tr><td align="center">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e8e1d5">

    <!-- CABECERA -->
    <tr><td style="background:${c.fuerte};padding:28px 30px 26px">
      <div style="font-family:${FUENTE};font-size:10px;letter-spacing:.24em;font-weight:700;color:rgba(255,255,255,.6)">IVONNE TOUR RD</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px"><tr>
        <td width="42" valign="top">
          <div style="width:38px;height:38px;background:${c.suave};border-radius:50%;text-align:center;line-height:38px;font-size:20px;color:#ffffff;font-family:${FUENTE};font-weight:700">${c.icono}</div>
        </td>
        <td valign="middle" style="padding-left:12px">
          <div style="font-family:${FUENTE};font-size:19px;line-height:1.32;font-weight:700;color:#ffffff">${esc(sobre.titulo)}</div>
        </td>
      </tr></table>
    </td></tr>

    ${codigo ? `<!-- EL CÓDIGO, EN GRANDE -->
    <tr><td style="padding:0 30px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.papel};border:1px solid ${c.linea};border-radius:13px;margin-top:24px">
        <tr><td align="center" style="padding:16px 18px">
          <div style="font-family:${FUENTE};font-size:10px;letter-spacing:.16em;font-weight:700;color:#5c6b60">TU CÓDIGO DE RESERVA</div>
          <div style="font-family:${FUENTE};font-size:27px;letter-spacing:.09em;font-weight:700;color:${c.fuerte};padding-top:5px">${esc(codigo)}</div>
        </td></tr>
      </table>
    </td></tr>` : ''}

    <!-- LOS DATOS -->
    <tr><td style="padding:22px 30px 4px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${filasHtml}</table>
    </td></tr>

    <!-- QUÉ HAY QUE HACER -->
    <tr><td style="padding:18px 30px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.papel};border-radius:12px;border-left:4px solid ${c.suave}">
        <tr><td style="padding:15px 17px;font-family:${FUENTE};font-size:13.5px;line-height:1.6;color:${c.fuerte}">${esc(sobre.pie)}</td></tr>
      </table>
    </td></tr>

    <!-- WHATSAPP -->
    <tr><td style="padding:20px 30px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="background:#12854c;border-radius:12px">
          <a href="https://wa.me/${esc(CFG.whatsapp)}" style="display:block;padding:15px;font-family:${FUENTE};font-size:14.5px;font-weight:700;color:#ffffff;text-decoration:none">${alerta ? 'Escribirle por WhatsApp' : 'Escribir por WhatsApp'}</a>
        </td></tr>
      </table>
    </td></tr>

    <!-- PIE -->
    <tr><td style="padding:24px 30px 26px">
      <div style="height:1px;background:#e8e1d5;line-height:1px;font-size:0">&nbsp;</div>
      <div style="font-family:${FUENTE};font-size:11.5px;line-height:1.6;color:#8b978f;padding-top:16px">
        IVONNE TOUR RD · Punta Cana, República Dominicana<br>
        ${alerta
          ? 'Este aviso es solo para ti. Al cliente no le ha llegado ningún correo.'
          : 'Si tienes cualquier duda, responde a este correo y te contestamos.'}
      </div>
    </td></tr>

  </table>

</td></tr>
</table>
</body></html>`;
}

/* ── LOS TRES SOBRES ────────────────────────────────────────── */

export function sobreDueno(r){
  const completo = r.pago.modo === 'completo';
  const quien = primerNombre(r.cliente.nombre) || r.cliente.nombre;
  return {
    etiqueta  : 'dueno',
    para      : CFG.dueno,
    responderA: r.cliente.email,
    asunto    : (completo ? '💳 PAGADO COMPLETO' : '🎟️ CUPO APARTADO') +
                ' · ' + r.producto.nombre + ' · ' + fechaCorta(r.fecha) +
                ' · ' + r.cliente.nombre + ' (' + r.codigo + ')',
    titulo    : completo
      ? quien + ' pagó el tour completo'
      : quien + ' apartó su cupo — quedan ' + dinero(r.pago.pendiente, r.producto.cur) + ' por cobrar',
    filas     : filas(r),
    pie       : completo
      ? 'No hay que cobrarle nada el día del tour.'
      : 'RECORDAR: cobrarle ' + dinero(r.pago.pendiente, r.producto.cur) + ' el día del tour.'
  };
}

export function sobreCliente(r){
  const completo = r.pago.modo === 'completo';
  return {
    etiqueta  : 'cliente',
    para      : r.cliente.email,
    responderA: CFG.dueno,
    asunto    : 'Tu reserva ' + r.codigo + ' · ' + r.producto.nombre + ' · ' + fechaCorta(r.fecha),
    titulo    : '¡Listo, ' + (primerNombre(r.cliente.nombre) || 'ya está') +
                '! Guardamos tu reserva para el ' + fechaLarga(r.fecha),
    filas     : filas(r),
    pie       : completo
      ? 'Ya está todo pagado. El día del tour no tienes que pagar nada ni llevar efectivo: llegas, saludas y te subes.'
      : 'Tu cupo está guardado. Te faltan ' + dinero(r.pago.pendiente, r.producto.cur) + ', que pagas ' +
        (r.producto.tipo === 'paquete' ? 'al llegar' : 'al subir a la guagua') + '.'
  };
}

/* ── EL TERCERO: el intento fallido ─────────────────────────
   Solo para Ivonne. Al cliente NO le llega nada: decirle "tu reserva
   está confirmada" a quien el banco le rechazó la tarjeta sería
   mentirle, y un correo de "te falló el pago" no le aporta nada que no
   haya visto ya en la pantalla.

   Este correo es una LISTA DE LLAMADAS, no un registro. Por eso lo
   primero que lleva es el WhatsApp, y el pie dice qué hacer.        */
export function sobreFallido(r, motivo){
  const quien = primerNombre(r.cliente.nombre) || r.cliente.nombre;
  const f = [];
  f.push(['ESCRÍBELE AL WHATSAPP', r.cliente.whatsapp + (r.cliente.whatsapp2 ? '  /  ' + r.cliente.whatsapp2 : '')]);
  f.push(['Se llama', r.cliente.nombre]);
  f.push(['Su correo', r.cliente.email]);
  f.push(null);
  f.push(['Quería', r.producto.nombre]);
  f.push(['Para el día', fechaLarga(r.fecha) + (r.hora ? ' · ' + r.hora : '')]);
  f.push(['Iban', personasTx(r.personas)]);
  f.push([r.recogida.tipo === 'hotel' ? 'Recogerlo en' : 'Punto de encuentro', r.recogida.valor || '(no lo dijo)']);
  f.push(null);
  f.push(['Iba a pagar', dinero(r.pago.hoy, r.producto.cur) +
          (r.pago.modo === 'completo' ? '  (el tour completo)' : '  (apartar el cupo)')]);
  f.push(['Qué pasó', motivo || 'El banco rechazó el pago']);
  f.push(['Cuándo', new Date().toLocaleString('es-DO')]);
  if(r.peticion) f.push(['Había pedido', r.peticion]);
  return {
    etiqueta  : 'fallido',
    para      : CFG.dueno,
    responderA: r.cliente.email,
    asunto    : '⚠️ PAGO FALLIDO · ' + r.cliente.nombre + ' · ' + r.producto.nombre +
                ' · ' + fechaCorta(r.fecha),
    titulo    : quien + ' quiso reservar y le falló la tarjeta',
    filas     : f,
    pie       : 'Este cliente llegó hasta el final: dejó sus datos y quería ir. ' +
                'Escríbele por WhatsApp — casi siempre es un problema del banco, no de que se arrepintiera. ' +
                'Al cliente NO le llegó ningún correo.'
  };
}

/* ── EL ENVÍO ───────────────────────────────────────────────
   Un solo sitio. Hoy usa Resend, que es el más simple de contratar
   para un negocio pequeño: te das de alta, verificas tu dominio y te
   dan una clave. Si mañana se cambia a otro, se cambia aquí y ya.  */
export async function enviar(sobre){
  const clave = process.env.RESEND_API_KEY;

  if(!clave){
    // sin clave no se rompe nada: se deja escrito en el registro del
    // servidor para poder verlo mientras se prueba
    console.log('\n[CORREO NO ENVIADO — falta RESEND_API_KEY]\nPARA: ' + sobre.para +
                '\nASUNTO: ' + sobre.asunto + '\n\n' + aTexto(sobre) + '\n');
    return { ok:false, motivo:'sin-clave' };
  }

  const r = await fetch('https://api.resend.com/emails', {
    method : 'POST',
    headers: { Authorization:'Bearer ' + clave, 'Content-Type':'application/json' },
    body   : JSON.stringify({
      from    : CFG.desde,
      to      : [sobre.para],
      reply_to: sobre.responderA,
      subject : sobre.asunto,
      text    : aTexto(sobre),
      html    : aHtml(sobre)
    })
  });

  if(!r.ok){
    const detalle = await r.text().catch(() => '');
    console.error('[CORREO FALLÓ] ' + sobre.etiqueta + ' → ' + sobre.para + ' :: ' + r.status + ' ' + detalle);
    return { ok:false, motivo:'servicio-' + r.status };
  }
  return { ok:true };
}

/* Manda los que haya que mandar y NUNCA lanza: que un correo falle no
   puede tumbar la respuesta al cliente, que ya pagó. Lo que falle queda
   en el registro del servidor, que sí se puede mirar. */
export async function enviarTodos(sobres){
  const res = [];
  for(const s of sobres){
    try{ res.push({ etiqueta:s.etiqueta, ...(await enviar(s)) }); }
    catch(e){ res.push({ etiqueta:s.etiqueta, ok:false, motivo:e.message }); }
  }
  return res;
}

export const _pruebas = { aTexto, aHtml, filas, dinero, fechaLarga };
