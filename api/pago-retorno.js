import { leerReserva, guardarReserva } from './_lib/almacen.js';
import { leerRespuesta } from './_lib/azul.js';
import { sobreDueno, sobreCliente, sobreFallido, enviarTodos } from './_lib/correos.js';

/* ============================================================
   PASO 2 — LA VUELTA DE AZUL

   ESTE ARCHIVO ES LA RESPUESTA A TU PREGUNTA. Aquí es donde salen los
   correos, y por eso salen SIEMPRE.

   Azul llama a esta dirección cuando el cliente termina de pagar. La
   llamada la hace AZUL, no el navegador del cliente: aunque el cliente
   haya cerrado la página, se haya quedado sin datos o haya tirado el
   teléfono, Azul ya nos avisó y los correos salen igual.

   Lo que pasa aquí, en orden:
     1. se busca la reserva por su número
     2. se mira si Azul dijo que sí o que no
     3. SÍ  → se marca pagada, salen los dos correos (cliente + Ivonne)
        NO  → NO se marca nada, sale UN correo solo a Ivonne (el aviso
              de intento fallido) y al cliente no le llega nada
     4. se devuelve al cliente a la página, a la confirmación o al
        formulario con el aviso del fallo

   El importe NUNCA se lee de lo que manda Azul: se usa el que
   guardamos nosotros al iniciar. Así, aunque alguien intentara
   falsificar la vuelta, no puede cambiar lo que se cobró.
   ============================================================ */

export default async function handler(req, res){
  // Azul vuelve por POST, pero durante las pruebas viene bien poder
  // abrir la dirección a mano por GET
  const cuerpo = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const inicio = process.env.URL_BASE || '';

  try{
    const r = leerRespuesta(cuerpo);

    if(!r.codigo) return redirigir(res, inicio + '/reservar.html?pago=sin-codigo');

    const reserva = await leerReserva(r.codigo);
    if(!reserva) return redirigir(res, inicio + '/reservar.html?pago=no-encontrada');

    // ── ya la habíamos procesado: Azul a veces avisa dos veces, y no
    //    vamos a cobrar ni avisar dos veces por lo mismo
    if(reserva.estado !== 'pendiente-de-pago'){
      return redirigir(res, vuelta(inicio, reserva, reserva.estado === 'fallida' ? 'fallo' : 'ok'));
    }

    /* ═══════════ EL BANCO DIJO QUE SÍ ═══════════ */
    if(r.aprobado){
      reserva.estado          = reserva.pago.modo === 'completo' ? 'pagada' : 'apartada';
      reserva.pago.cobrado    = true;
      reserva.pago.referencia = r.referencia;
      reserva.pagadaEn        = new Date().toISOString();
      await guardarReserva(reserva);

      // LOS DOS CORREOS. Aquí. Desde el servidor.
      const envios = await enviarTodos([ sobreCliente(reserva), sobreDueno(reserva) ]);
      reserva.avisos = {
        cliente: envios.find(e => e.etiqueta === 'cliente')?.ok ? 'enviado' : 'fallo',
        dueno  : envios.find(e => e.etiqueta === 'dueno')?.ok   ? 'enviado' : 'fallo'
      };
      await guardarReserva(reserva);

      return redirigir(res, vuelta(inicio, reserva, 'ok'));
    }

    /* ═══════════ EL BANCO DIJO QUE NO ═══════════
       No hay reserva. Pero SÍ hay un cliente que llegó hasta el final,
       dejó su WhatsApp y quería ir. Ese aviso vale dinero: va solo
       para Ivonne, para que le escriba. Al cliente no le llega nada. */
    reserva.estado       = 'fallida';
    reserva.fallo        = { motivo:r.motivo, cuando:new Date().toISOString() };
    reserva.avisado      = true;
    await guardarReserva(reserva);

    await enviarTodos([ sobreFallido(reserva, r.motivo) ]);

    return redirigir(res, vuelta(inicio, reserva, 'fallo'));

  }catch(e){
    console.error('[pago-retorno]', e);
    return redirigir(res, inicio + '/reservar.html?pago=error');
  }
}

/* La dirección a la que vuelve el cliente.
   Lleva SIEMPRE el id y el tipo del tour, y no por capricho: la página
   se recarga desde cero al volver del banco y, sin el id, no sabe qué
   excursión pintar — enseñaría la lista de "elige una" en vez de la
   confirmación de la que el cliente acaba de pagar. */
function vuelta(inicio, reserva, resultado){
  const q = new URLSearchParams({
    tipo  : reserva.producto.tipo,
    id    : reserva.producto.id,
    pago  : resultado,
    codigo: reserva.codigo
  });
  return inicio + '/reservar.html?' + q.toString();
}

/* Se devuelve al cliente con una redirección normal para que la barra
   de direcciones quede limpia y no se quede en una página nuestra que
   no es una página, sino un trámite. */
function redirigir(res, url){
  res.writeHead(303, { Location: url });
  res.end();
}
