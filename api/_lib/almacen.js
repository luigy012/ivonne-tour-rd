/* ============================================================
   DÓNDE VIVE UNA RESERVA

   Hasta ahora vivía en el localStorage del navegador del cliente —
   o sea, en su teléfono, donde Ivonne no puede mirar. Eso servía para
   probar y para nada más.

   Ahora vive aquí, en el servidor, y por un motivo muy concreto: entre
   que el cliente pulsa "pagar" y que Azul lo devuelve ya pagado, el
   cliente SE VA DE NUESTRA PÁGINA. Cuando vuelve, la página está
   recién cargada y no se acuerda de nada. La reserva tiene que estar
   esperándolo aquí, con su número, para poder terminar el trabajo.

   Dos adaptadores:
     memoria  → para desarrollo y pruebas. Se borra al reiniciar.
     upstash  → para producción. Es un Redis que se habla por HTTPS,
                tiene plan gratis y no hay ningún servidor que mantener.
                Se contrata en upstash.com y da dos variables.
   ============================================================ */

const MODO = process.env.UPSTASH_REDIS_REST_URL ? 'upstash' : 'memoria';

/* Cuánto aguanta una reserva sin terminar de pagarse. Pasado eso se
   borra sola: es basura de alguien que abandonó a mitad. Las que sí se
   pagan se guardan un año, que es lo que puede tardar una reclamación. */
const HORAS_PENDIENTE = 6;
const DIAS_PAGADA     = 365;

/* ── memoria ────────────────────────────────────────────────── */
const cajon = new Map();

const memoria = {
  async guardar(clave, valor, segundos){
    cajon.set(clave, { valor, expira: Date.now() + segundos * 1000 });
  },
  async leer(clave){
    const x = cajon.get(clave);
    if(!x) return null;
    if(Date.now() > x.expira){ cajon.delete(clave); return null; }
    return x.valor;
  },
  async listar(prefijo){
    const out = [];
    for(const [k, x] of cajon){
      if(k.startsWith(prefijo) && Date.now() <= x.expira) out.push(x.valor);
    }
    return out;
  }
};

/* ── upstash ────────────────────────────────────────────────── */
async function upstashCmd(...partes){
  const r = await fetch(process.env.UPSTASH_REDIS_REST_URL + '/' + partes.map(encodeURIComponent).join('/'), {
    headers: { Authorization: 'Bearer ' + process.env.UPSTASH_REDIS_REST_TOKEN }
  });
  if(!r.ok) throw new Error('almacen-no-responde-' + r.status);
  const j = await r.json();
  return j.result;
}

const upstash = {
  async guardar(clave, valor, segundos){
    await upstashCmd('set', clave, JSON.stringify(valor), 'EX', String(segundos));
  },
  async leer(clave){
    const v = await upstashCmd('get', clave);
    return v ? JSON.parse(v) : null;
  },
  async listar(prefijo){
    const claves = await upstashCmd('keys', prefijo + '*');
    if(!claves || !claves.length) return [];
    const out = [];
    for(const k of claves){
      const v = await this.leer(k);
      if(v) out.push(v);
    }
    return out;
  }
};

const almacen = MODO === 'upstash' ? upstash : memoria;

/* ── lo que usa el resto del código ─────────────────────────── */

export const modoAlmacen = MODO;

export async function guardarReserva(reserva){
  const segundos = reserva.estado === 'pendiente-de-pago'
    ? HORAS_PENDIENTE * 3600
    : DIAS_PAGADA * 86400;
  await almacen.guardar('reserva:' + reserva.codigo, reserva, segundos);
  return reserva;
}

export async function leerReserva(codigo){
  return almacen.leer('reserva:' + codigo);
}

export async function listarReservas(){
  const todas = await almacen.listar('reserva:');
  return todas.sort((a, b) => (b.creada || '').localeCompare(a.creada || ''));
}

/* El número de reserva. Sin I, O, 0 ni 1: se confunden al dictarlos por
   teléfono, y este número se dicta por teléfono. */
export function nuevoCodigo(){
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for(let i = 0; i < 5; i++) c += letras[Math.floor(Math.random() * letras.length)];
  return 'IVT-' + c;
}
