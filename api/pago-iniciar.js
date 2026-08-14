import { guardarReserva, nuevoCodigo } from './_lib/almacen.js';
import { camposDePago } from './_lib/azul.js';

/* ============================================================
   PASO 1 — EMPEZAR EL PAGO

   Recibe la reserva que el cliente acaba de llenar, la guarda como
   'pendiente-de-pago' y devuelve los campos firmados para mandarlo a
   Azul.

   REGLA QUE NO SE ROMPE: los importes SE CALCULAN AQUÍ, no se creen.
   El navegador manda qué excursión, qué día y cuánta gente; el precio
   sale del catálogo del servidor. Si nos fiáramos del importe que
   manda el navegador, cualquiera podría abrir las herramientas de
   desarrollo y pagar un dólar por una excursión de doscientos.
   ============================================================ */

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ error:'metodo-no-permitido' });

  try{
    const p = req.body || {};

    // ── lo mínimo para que esto sea una reserva
    const falta = ['tipo','id','fecha','cliente','pago'].filter(k => !p[k]);
    if(falta.length) return res.status(400).json({ error:'faltan-datos', falta });

    const cat = await catalogo();
    const prod = (p.tipo === 'paquete' ? cat.TOURS : cat.EXCURSIONES).find(t => t.id === p.id);
    if(!prod) return res.status(400).json({ error:'excursion-no-existe' });

    // ── LAS CUENTAS, DE NUESTRO LADO
    const adultos = Math.max(1, Math.min(30, parseInt(p.adultos, 10) || 1));
    const ninos   = Math.max(0, Math.min(30, parseInt(p.ninos, 10)   || 0));
    const total   = adultos + ninos;

    const precio   = p.tipo === 'paquete' ? prod.now : prod.price;
    const subtotal = precio * total;
    const extras   = sumaExtras(cat.EXTRAS, p.extras);
    const granTotal= subtotal + extras;
    const abono    = prod.abono * total;

    const modo = p.pago === 'abono' ? 'abono' : 'completo';
    const hoy  = modo === 'completo' ? granTotal : abono;

    const reserva = {
      codigo  : nuevoCodigo(),
      creada  : new Date().toISOString(),
      estado  : 'pendiente-de-pago',
      producto: { tipo:p.tipo, id:prod.id, nombre:prod.name, precio, cur:prod.cur || '$', abono:prod.abono },
      fecha   : String(p.fecha).slice(0, 10),
      hora    : String(p.hora || '').slice(0, 20),
      personas: { adultos, ninos, total },
      recogida: {
        tipo : p.recogida?.tipo === 'punto' ? 'punto' : 'hotel',
        valor: String(p.recogida?.valor || '').slice(0, 120)
      },
      extras  : limpiarExtras(cat.EXTRAS, p.extras),
      peticion: String(p.peticion || '').slice(0, 500),
      cliente : {
        nombre   : String(p.cliente.nombre   || '').slice(0, 120),
        email    : String(p.cliente.email    || '').slice(0, 160),
        whatsapp : String(p.cliente.whatsapp || '').slice(0, 40),
        whatsapp2: String(p.cliente.whatsapp2|| '').slice(0, 40)
      },
      totales : { subtotal, extras, total:granTotal, abono },
      pago    : {
        modo, hoy,
        pendiente : granTotal - hoy,
        proveedor : 'azul',
        referencia: '',
        cobrado   : false
      },
      avisos  : { dueno:'sin-enviar', cliente:'sin-enviar' }
    };

    await guardarReserva(reserva);

    // ── los campos firmados para el formulario de Azul
    const { url, campos } = camposDePago(reserva);
    return res.status(200).json({ ok:true, codigo:reserva.codigo, url, campos });

  }catch(e){
    // 'azul-sin-configurar' es el caso normal mientras no haya contrato:
    // se dice claro para que la página pueda avisar en condiciones
    const conocido = ['azul-sin-configurar','azul-sin-llave','falta-url-base'].includes(e.message);
    if(conocido) return res.status(503).json({ error:e.message });
    console.error('[pago-iniciar]', e);
    return res.status(500).json({ error:'error-inesperado' });
  }
}

/* ── el catálogo, leído del mismo datos.js que usa la web ──────
   Un solo sitio para los precios: si un día cambia el de Saona, cambia
   en la tarjeta, en el formulario y en lo que se le cobra. Nunca puede
   decir una cosa la página y otra el cobro. */
let _cat = null;
async function catalogo(){
  if(_cat) return _cat;
  const fs   = await import('fs/promises');
  const path = await import('path');
  const src  = await fs.readFile(path.join(process.cwd(), 'datos.js'), 'utf8');
  const sandbox = {};
  new Function('g', src + '; g.EXCURSIONES=EXCURSIONES; g.TOURS=TOURS; g.EXTRAS=EXTRAS;')(sandbox);
  _cat = sandbox;
  return _cat;
}

/* Los extras también se recalculan aquí: llegan los identificadores y
   las opciones elegidas, y el precio lo pone el catálogo. */
function limpiarExtras(EXTRAS, elegidos){
  if(!Array.isArray(elegidos)) return [];
  return elegidos.map(e => {
    const def = EXTRAS.find(x => x.id === e.id);
    if(!def) return null;
    return {
      id      : def.id,
      nombre  : def.name,
      opciones: e.opciones && typeof e.opciones === 'object' ? e.opciones : {},
      cantidad: Math.max(1, Math.min(50, parseInt(e.cantidad, 10) || 1)),
      precio  : precioExtra(def, e)
    };
  }).filter(Boolean);
}

function precioExtra(def, elegido){
  const idx = elegido.indices || {};
  let base = 0;
  def.groups.forEach(g => {
    if(g.type === 'precio'){
      const i = Math.max(0, Math.min(g.opts.length - 1, parseInt(idx[g.key], 10) || 0));
      base += g.opts[i].price;
    }
    if(g.type === 'cantidad' && g.unit) base += g.unit;
  });
  const qg = def.groups.find(g => g.type === 'cantidad');
  if(qg){
    const c = Math.max(1, Math.min(50, parseInt(elegido.cantidad, 10) || 1));
    base = (qg.unit ? qg.unit : base) * c;
  }
  return base;
}

function sumaExtras(EXTRAS, elegidos){
  return limpiarExtras(EXTRAS, elegidos).reduce((s, e) => s + e.precio, 0);
}
