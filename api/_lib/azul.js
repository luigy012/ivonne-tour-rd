import crypto from 'crypto';

/* ============================================================
   AZUL — PÁGINA DE PAGOS (redirección)

   Cómo funciona, en una línea: no cobramos nosotros. Mandamos al
   cliente al formulario de Azul con los datos del cobro firmados, él
   paga allí, y Azul lo devuelve a una dirección nuestra con el
   resultado. La tarjeta NUNCA pasa por aquí — por eso no hace falta
   ninguna certificación PCI, y por eso este archivo es corto.

   El viaje:

     1. cliente pulsa pagar
     2. /api/pago-iniciar  → guarda la reserva como 'pendiente-de-pago'
                             y devuelve los campos firmados
     3. el navegador hace POST a Azul y se va de nuestra web
     4. el cliente paga (o no) en la página de Azul
     5. Azul hace POST a /api/pago-retorno con el resultado
     6. ahí se verifica, SE MANDAN LOS CORREOS y se devuelve al cliente
        a la confirmación

   El paso 6 es la razón de todo esto: los correos salen de ahí, del
   servidor, y no del teléfono del cliente. Aunque cierre la página
   nada más pagar, Azul ya nos avisó y el correo sale igual.
   ============================================================ */

export const AZUL = {
  // ── de tu contrato con Azul (van en variables de entorno, NUNCA aquí)
  merchantId  : process.env.AZUL_MERCHANT_ID   || '',
  merchantName: process.env.AZUL_MERCHANT_NAME || 'IVONNE TOUR RD',
  merchantType: process.env.AZUL_MERCHANT_TYPE || 'Tours y excursiones',
  authKey     : process.env.AZUL_AUTH_KEY      || '',   // la llave de la firma
  // ── dónde nos devuelve
  urlBase     : process.env.URL_BASE           || '',
  // ── pruebas o de verdad
  pruebas     : process.env.AZUL_PRUEBAS !== 'false'
};

/* Las dos direcciones del formulario de Azul. Las de pruebas y las de
   producción son distintas; te las confirman al darte de alta. */
export const URL_AZUL = AZUL.pruebas
  ? 'https://pruebas.azul.com.do/PaymentPage/Default.aspx'
  : 'https://pagos.azul.com.do/PaymentPage/Default.aspx';

/* Azul cobra en centavos y SIN punto: US$267.00 se manda como 26700.
   Es el error número uno de todas las integraciones — mandar 267 y
   cobrarle al cliente dos dólares con sesenta y siete. */
export const aCentavos = n => String(Math.round(Number(n) * 100));

/* Código de moneda de Azul: $ para dólares, RD para pesos. */
export const monedaAzul = cur => (cur === 'RD$' ? '$' : '$');

/* ═══════════════════════════════════════════════════════════════════
   ⚠️  EL ÚNICO HUECO QUE FALTA POR RELLENAR  ⚠️

   Azul firma cada cobro con un HMAC-SHA512: se pegan ciertos campos
   uno detrás de otro EN UN ORDEN CONCRETO y se firman con tu llave.
   Si el orden no es exactamente el suyo, Azul rechaza el pago con un
   error de firma y no hay forma de adivinarlo.

   ESE ORDEN NO ES PÚBLICO. Viene en el manual que Azul te entrega
   junto con tus credenciales al firmar el contrato — normalmente un
   PDF llamado algo como "Manual de integración Página de Pagos".

   QUÉ TIENES QUE HACER:
     Buscar en ese manual la lista de campos del AuthHash y copiarla
     aquí abajo, en ORDEN_FIRMA, tal cual viene. Nada más.

   El orden de abajo es el que se usa habitualmente, pero está SIN
   CONFIRMAR contra tu manual: trátalo como un borrador.
   Si el pago de prueba devuelve un error de firma, es esto.
   ═══════════════════════════════════════════════════════════════════ */
export const ORDEN_FIRMA = [
  'MerchantId',
  'MerchantName',
  'MerchantType',
  'CurrencyCode',
  'OrderNumber',
  'Amount',
  'ITBIS',
  'ApprovedUrl',
  'DeclinedUrl',
  'CancelUrl',
  'ResponseCode',
  'ReturnUrl',
  'UseCustomField1',
  'CustomField1Label',
  'CustomField1Value',
  'UseCustomField2',
  'CustomField2Label',
  'CustomField2Value'
];

export function firmar(campos, orden = ORDEN_FIRMA){
  if(!AZUL.authKey) throw new Error('azul-sin-llave');
  const cadena = orden.map(k => campos[k] ?? '').join('');
  return crypto.createHmac('sha512', AZUL.authKey).update(cadena, 'utf8').digest('hex');
}

/* Arma los campos del formulario que el navegador va a enviar a Azul. */
export function camposDePago(reserva){
  if(!AZUL.merchantId) throw new Error('azul-sin-configurar');
  if(!AZUL.urlBase)    throw new Error('falta-url-base');

  const vuelta = AZUL.urlBase + '/api/pago-retorno';

  const campos = {
    MerchantId       : AZUL.merchantId,
    MerchantName     : AZUL.merchantName,
    MerchantType     : AZUL.merchantType,
    CurrencyCode     : monedaAzul(reserva.producto.cur),
    OrderNumber      : reserva.codigo,
    // El ITBIS va aparte del importe. Nuestros precios ya lo llevan
    // dentro ("precio final con impuestos incluidos"), así que aquí se
    // manda 0 y el total entero en Amount. Si tu contador dice otra
    // cosa, este es el sitio donde se separa.
    Amount           : aCentavos(reserva.pago.hoy),
    ITBIS            : '0',
    ApprovedUrl      : vuelta,
    DeclinedUrl      : vuelta,
    CancelUrl        : vuelta,
    ResponseCode     : '',
    ReturnUrl        : '',
    UseCustomField1  : '1',
    CustomField1Label: 'Excursion',
    CustomField1Value: String(reserva.producto.nombre).slice(0, 50),
    UseCustomField2  : '1',
    CustomField2Label: 'Fecha del tour',
    CustomField2Value: String(reserva.fecha)
  };

  campos.AuthHash = firmar(campos);
  return { url: URL_AZUL, campos };
}

/* ── LA VUELTA ──────────────────────────────────────────────
   Azul contesta con un ResponseCode. 'ISO8583' + IsoCode '00' es la
   única combinación que significa "cobrado". Todo lo demás es que no.

   Se mira el IsoCode y no el texto, porque el texto cambia según el
   banco emisor y no se puede comparar de forma fiable.             */
export function leerRespuesta(cuerpo){
  const iso   = (cuerpo.IsoCode || '').trim();
  const resp  = (cuerpo.ResponseCode || '').trim();
  const aprobado = iso === '00' && /ISO8583/i.test(resp);

  return {
    aprobado,
    codigo     : (cuerpo.OrderNumber || '').trim(),   // nuestro IVT-XXXXX
    referencia : (cuerpo.AuthorizationCode || cuerpo.RRN || '').trim(),
    // el motivo se le enseña a Ivonne en el aviso de fallido, no al cliente
    motivo     : aprobado ? '' : (cuerpo.ErrorDescription || cuerpo.ResponseMessage ||
                                  ('El banco respondió ' + (iso || resp || 'sin código'))),
    crudo      : cuerpo
  };
}

/* ⚠️ Azul también firma SU respuesta. Cuando tengas el manual, aquí va
   la comprobación de esa firma — sin ella, alguien que conozca la
   dirección de vuelta podría inventarse un pago aprobado.

   Mientras tanto, /api/pago-retorno hace la defensa que sí podemos
   hacer sin el manual: solo acepta un código de reserva que exista y
   que esté 'pendiente-de-pago', y jamás se fía del importe que venga
   en la respuesta — usa el que guardamos nosotros al iniciar.       */
export function verificarFirmaRespuesta(cuerpo){
  return { verificada:false, motivo:'pendiente-del-manual-de-azul' };
}
