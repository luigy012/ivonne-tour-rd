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

function aHtml(sobre){
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));
  const filasHtml = sobre.filas.map(l => l
    ? `<tr><td style="padding:7px 14px 7px 0;color:#5c6b60;font-size:13px;white-space:nowrap;vertical-align:top">${esc(l[0])}</td>
           <td style="padding:7px 0;font-size:14px;font-weight:600;color:#1b241e">${esc(l[1])}</td></tr>`
    : `<tr><td colspan="2" style="padding:6px 0"><div style="border-top:1px dashed #e8e1d5"></div></td></tr>`
  ).join('');
  return `<div style="background:#fbf7ef;padding:26px 14px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e1d5;border-radius:18px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#12854c,#0b5a34);padding:22px 24px">
      <div style="color:rgba(255,255,255,.75);font-size:10px;letter-spacing:.22em;font-weight:700">IVONNE TOUR RD</div>
      <div style="color:#fff;font-size:19px;font-weight:800;margin-top:7px;line-height:1.3">${esc(sobre.titulo)}</div>
    </div>
    <div style="padding:22px 24px">
      <table style="width:100%;border-collapse:collapse">${filasHtml}</table>
      <div style="margin-top:20px;padding:14px 16px;background:#f2f9f4;border:1px solid #cfe4d7;border-left:4px solid #12854c;border-radius:10px;font-size:13.5px;color:#0b5a34;line-height:1.55">${esc(sobre.pie)}</div>
      <a href="https://wa.me/${CFG.whatsapp}" style="display:block;margin-top:18px;text-align:center;background:#12854c;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px;border-radius:11px">Escribir por WhatsApp</a>
    </div>
  </div>
</div>`;
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
