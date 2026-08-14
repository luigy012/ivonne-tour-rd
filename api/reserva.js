import { leerReserva } from './_lib/almacen.js';

/* ============================================================
   CONSULTAR UNA RESERVA

   Cuando Azul devuelve al cliente, la página vuelve a cargarse desde
   cero y no se acuerda de nada. Lo único que trae es el número de
   reserva en la dirección. Con ese número pide aquí sus datos y pinta
   la confirmación.

   Se devuelve una versión RECORTADA. La reserva guardada lleva cosas
   que el cliente no tiene por qué recibir de vuelta —el segundo
   teléfono, notas internas, el motivo técnico de un fallo— y lo que no
   se manda no se puede filtrar.
   ============================================================ */

export default async function handler(req, res){
  const codigo = String(req.query.codigo || '').trim().toUpperCase();

  if(!/^IVT-[A-Z0-9]{5}$/.test(codigo))
    return res.status(400).json({ error:'codigo-mal-formado' });

  const r = await leerReserva(codigo);
  if(!r) return res.status(404).json({ error:'no-encontrada' });

  // solo se devuelven las reservas que llegaron a cobrarse: una
  // 'pendiente-de-pago' no es nada todavía, y una 'fallida' no debe
  // poder consultarse como si fuera buena
  if(!['pagada','apartada'].includes(r.estado))
    return res.status(409).json({ error:'sin-pagar', estado:r.estado });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    codigo  : r.codigo,
    estado  : r.estado,
    producto: r.producto,
    fecha   : r.fecha,
    hora    : r.hora,
    personas: r.personas,
    recogida: r.recogida,
    extras  : r.extras,
    peticion: r.peticion,
    cliente : { nombre:r.cliente.nombre, email:r.cliente.email },   // el resto no vuelve
    totales : r.totales,
    pago    : { modo:r.pago.modo, hoy:r.pago.hoy, pendiente:r.pago.pendiente, referencia:r.pago.referencia }
  });
}
