/* Pruebas del servidor: el cobro, los correos y lo que pasa cuando el
   banco dice que no.  Se corren con:   node pruebas/servidor.test.js   */

process.env.URL_BASE        = 'https://ejemplo.test';
process.env.AZUL_MERCHANT_ID= '39038540035';
process.env.AZUL_AUTH_KEY   = 'llave-de-mentira-para-las-pruebas';
process.env.CORREO_DUENO    = 'ivonne@ejemplo.test';

const { guardarReserva, leerReserva, nuevoCodigo } = await import('../api/_lib/almacen.js');
const { sobreDueno, sobreCliente, sobreFallido, _pruebas } = await import('../api/_lib/correos.js');
const { camposDePago, aCentavos, firmar, leerRespuesta } = await import('../api/_lib/azul.js');
const iniciar = (await import('../api/pago-iniciar.js')).default;
const retorno = (await import('../api/pago-retorno.js')).default;
const consultar = (await import('../api/reserva.js')).default;

let fallos = 0;
const ok = (c, t) => { if(!c) fallos++; console.log((c ? '  ok   ' : '  MAL  ') + t); };
const seccion = t => console.log('\n== ' + t + ' ==');

/* respuestas de mentira para poder llamar a los endpoints sin servidor */
function resFalsa(){
  const r = { code:0, cuerpo:null, cabeceras:{}, _fin:false };
  r.status = c => { r.code = c; return r; };
  r.json   = j => { r.cuerpo = j; r._fin = true; return r; };
  r.setHeader = (k,v) => { r.cabeceras[k] = v; };
  r.writeHead = (c,h) => { r.code = c; Object.assign(r.cabeceras, h); };
  r.end = () => { r._fin = true; };
  return r;
}

const CLIENTE = {
  nombre:'Jose Ramirez', email:'jose@correo.test',
  whatsapp:'+1 809 555 4433', whatsapp2:''
};
const PEDIDO = {
  tipo:'excursion', id:'saona', fecha:'2026-09-15', hora:'7:00 AM',
  adultos:2, ninos:1,
  recogida:{ tipo:'hotel', valor:'Hotel Riu Bavaro' },
  peticion:'', pago:'completo', cliente:CLIENTE, extras:[]
};

/* ═══════════════════════════════════════════════════════ */
seccion('EL PRECIO LO PONE EL SERVIDOR, NO EL NAVEGADOR');
{
  // se manda un precio ridículo a ver si cuela
  const res = resFalsa();
  await iniciar({ method:'POST', body:{ ...PEDIDO, precio:1, total:1, pago:'completo' } }, res);
  ok(res.code === 200, 'la reserva se acepta');
  const r = await leerReserva(res.cuerpo.codigo);
  ok(r.totales.total === 267, 'ignora el precio del navegador y cobra el del catalogo: ' + r.totales.total);
  ok(r.pago.hoy === 267, 'cobra hoy ' + r.pago.hoy + ' (el tour completo)');
  ok(r.estado === 'pendiente-de-pago', 'y nace como pendiente-de-pago');
  ok(r.pago.cobrado === false, 'sin cobrar todavia');
}
{
  const res = resFalsa();
  await iniciar({ method:'POST', body:{ ...PEDIDO, adultos:999 } }, res);
  const r = await leerReserva(res.cuerpo.codigo);
  ok(r.personas.adultos === 30, 'limita la cantidad de gente (999 -> ' + r.personas.adultos + ')');
}
{
  const res = resFalsa();
  await iniciar({ method:'POST', body:{ ...PEDIDO, id:'no-existe-esta' } }, res);
  ok(res.code === 400 && res.cuerpo.error === 'excursion-no-existe', 'una excursion inventada se rechaza');
}
{
  const res = resFalsa();
  await iniciar({ method:'POST', body:{ tipo:'excursion' } }, res);
  ok(res.code === 400 && res.cuerpo.error === 'faltan-datos', 'sin datos no hay reserva: falta ' + res.cuerpo.falta.join(','));
}

seccion('LOS CAMPOS QUE VAN A AZUL');
{
  const res = resFalsa();
  await iniciar({ method:'POST', body:PEDIDO }, res);
  const { url, campos } = res.cuerpo;
  ok(/pruebas\.azul\.com\.do/.test(url), 'apunta al entorno de PRUEBAS: ' + url);
  ok(campos.Amount === '26700', 'el importe va en centavos: ' + campos.Amount + ' (no 267)');
  ok(campos.OrderNumber === res.cuerpo.codigo, 'el numero de orden es nuestro codigo: ' + campos.OrderNumber);
  ok(campos.ApprovedUrl === 'https://ejemplo.test/api/pago-retorno', 'vuelve a nuestro servidor');
  ok(campos.ApprovedUrl === campos.DeclinedUrl, 'y tambien si la rechazan (asi nos enteramos del fallo)');
  ok(/^[0-9a-f]{128}$/.test(campos.AuthHash), 'la firma es un HMAC-SHA512 de 128 caracteres');
  ok(!('CardNumber' in campos), 'NO se manda ningun dato de tarjeta (no la vemos nunca)');
}
{
  ok(aCentavos(267) === '26700' && aCentavos(5.5) === '550' && aCentavos(1234.56) === '123456',
     'los centavos se calculan bien en todos los casos');
  const a = firmar({ MerchantId:'1', Amount:'100' }, ['MerchantId','Amount']);
  const b = firmar({ MerchantId:'1', Amount:'100' }, ['Amount','MerchantId']);
  ok(a !== b, 'el ORDEN de los campos cambia la firma (por eso hace falta el manual de Azul)');
}

seccion('CUANDO EL BANCO DICE QUE SI');
{
  const res1 = resFalsa();
  await iniciar({ method:'POST', body:PEDIDO }, res1);
  const codigo = res1.cuerpo.codigo;

  const correos = [];
  const original = console.log;
  console.log = (...a) => { correos.push(a.join(' ')); };
  const res2 = resFalsa();
  await retorno({ method:'POST', body:{
    OrderNumber:codigo, IsoCode:'00', ResponseCode:'ISO8583', AuthorizationCode:'OK1234'
  }}, res2);
  console.log = original;

  ok(res2.code === 303, 'devuelve al cliente con una redireccion');
  ok(/pago=ok/.test(res2.cabeceras.Location), 'a la confirmacion: ' + res2.cabeceras.Location.replace('https://ejemplo.test',''));
  ok(/id=saona/.test(res2.cabeceras.Location), 'llevando el id del tour (si no, la pagina no sabria que pintar)');

  const r = await leerReserva(codigo);
  ok(r.estado === 'pagada', 'la reserva pasa a: ' + r.estado);
  ok(r.pago.cobrado === true, 'marcada como cobrada');
  ok(r.pago.referencia === 'OK1234', 'con la referencia del banco: ' + r.pago.referencia);

  const texto = correos.join('\n');
  ok(/PARA: jose@correo\.test/.test(texto), 'SALE el correo del cliente');
  ok(/PARA: ivonne@ejemplo\.test/.test(texto), 'SALE el correo de Ivonne');
  ok((texto.match(/\[CORREO NO ENVIADO/g) || []).length === 2, 'dos correos, ni uno mas');
  ok(/PAGADO COMPLETO/.test(texto), 'el de Ivonne dice PAGADO COMPLETO');
}

seccion('CUANDO EL BANCO DICE QUE NO');
{
  const res1 = resFalsa();
  await iniciar({ method:'POST', body:{ ...PEDIDO, pago:'abono' } }, res1);
  const codigo = res1.cuerpo.codigo;

  const correos = [];
  const original = console.log;
  console.log = (...a) => { correos.push(a.join(' ')); };
  const res2 = resFalsa();
  await retorno({ method:'POST', body:{
    OrderNumber:codigo, IsoCode:'05', ResponseCode:'Declined', ErrorDescription:'Fondos insuficientes'
  }}, res2);
  console.log = original;

  const r = await leerReserva(codigo);
  ok(r.estado === 'fallida', 'la reserva queda como: ' + r.estado);
  ok(r.pago.cobrado === false, 'NO se marca como cobrada');
  ok(/pago=fallo/.test(res2.cabeceras.Location), 'y se devuelve al cliente al formulario');

  const texto = correos.join('\n');
  ok((texto.match(/\[CORREO NO ENVIADO/g) || []).length === 1, 'sale UN SOLO correo');
  ok(/PARA: ivonne@ejemplo\.test/.test(texto), 'y va a Ivonne');
  ok(!/PARA: jose@correo\.test/.test(texto), 'al CLIENTE no le llega nada (no le mentimos)');
  ok(/PAGO FALLIDO/.test(texto), 'el asunto avisa: PAGO FALLIDO');
  ok(/ESCRIBELE AL WHATSAPP|ESCRÍBELE AL WHATSAPP/.test(texto), 'y lo primero que dice es el WhatsApp del cliente');
  ok(/809 555 4433/.test(texto), 'con su numero: 809 555 4433');
  ok(/Fondos insuficientes/.test(texto), 'y el motivo del banco');
}

seccion('NO SE COBRA NI SE AVISA DOS VECES');
{
  const res1 = resFalsa();
  await iniciar({ method:'POST', body:PEDIDO }, res1);
  const codigo = res1.cuerpo.codigo;
  const aprobar = () => retorno({ method:'POST', body:{
    OrderNumber:codigo, IsoCode:'00', ResponseCode:'ISO8583', AuthorizationCode:'OK9' }}, resFalsa());

  await aprobar();
  const correos = [];
  const original = console.log;
  console.log = (...a) => { correos.push(a.join(' ')); };
  await aprobar();                    // Azul avisando por segunda vez
  console.log = original;
  ok(correos.filter(c => /CORREO NO ENVIADO/.test(c)).length === 0,
     'si Azul avisa dos veces, NO se manda el correo otra vez');
}

seccion('CONSULTAR LA RESERVA AL VOLVER');
{
  const res1 = resFalsa();
  await iniciar({ method:'POST', body:PEDIDO }, res1);
  const codigo = res1.cuerpo.codigo;

  const sinPagar = resFalsa();
  await consultar({ query:{ codigo } }, sinPagar);
  ok(sinPagar.code === 409, 'una reserva sin pagar NO se puede consultar (' + sinPagar.cuerpo.error + ')');

  await retorno({ method:'POST', body:{ OrderNumber:codigo, IsoCode:'00', ResponseCode:'ISO8583' }}, resFalsa());
  const buena = resFalsa();
  await consultar({ query:{ codigo } }, buena);
  ok(buena.code === 200, 'una vez pagada, si');
  ok(buena.cuerpo.codigo === codigo, 'devuelve la reserva ' + buena.cuerpo.codigo);
  ok(buena.cuerpo.cliente.whatsapp === undefined, 'y NO devuelve los telefonos (lo que no se manda no se filtra)');

  const mala = resFalsa();
  await consultar({ query:{ codigo:'ABC' } }, mala);
  ok(mala.code === 400, 'un codigo mal formado se rechaza sin mirar nada');
  const noHay = resFalsa();
  await consultar({ query:{ codigo:'IVT-ZZZZZ' } }, noHay);
  ok(noHay.code === 404, 'y uno que no existe da 404');
}

seccion('LA RESPUESTA DE AZUL SE LEE BIEN');
{
  ok(leerRespuesta({ IsoCode:'00', ResponseCode:'ISO8583' }).aprobado === true, '00 + ISO8583 = cobrado');
  ok(leerRespuesta({ IsoCode:'05', ResponseCode:'ISO8583' }).aprobado === false, 'otro IsoCode = NO cobrado');
  ok(leerRespuesta({ IsoCode:'00', ResponseCode:'Error' }).aprobado === false, 'sin ISO8583 = NO cobrado');
  ok(leerRespuesta({}).aprobado === false, 'una respuesta vacia NO se toma por buena');
}

seccion('LOS TEXTOS DE LOS CORREOS');
{
  const r = await leerReserva((await (async () => {
    const x = resFalsa();
    await iniciar({ method:'POST', body:{ ...PEDIDO, pago:'abono', peticion:'Un pastel sin gluten' } }, x);
    await retorno({ method:'POST', body:{ OrderNumber:x.cuerpo.codigo, IsoCode:'00', ResponseCode:'ISO8583' }}, resFalsa());
    return x.cuerpo.codigo;
  })()));

  const d = sobreDueno(r), c = sobreCliente(r), f = sobreFallido(r, 'Tarjeta vencida');
  console.log('\n  --- lo que ve Ivonne en la bandeja ---');
  console.log('  ' + d.asunto);
  console.log('  ' + f.asunto);
  console.log('  --- lo que ve el cliente ---');
  console.log('  ' + c.asunto + '\n');

  ok(/CUPO APARTADO/.test(d.asunto), 'apartado: el asunto lo dice');
  ok(/RECORDAR: cobrarle/.test(d.pie), 'y recuerda cobrar el resto: "' + d.pie + '"');
  ok(d.responderA === 'jose@correo.test', 'responder al aviso escribe al cliente');
  ok(c.responderA === 'ivonne@ejemplo.test', 'y responder al voucher escribe a Ivonne');
  const txt = _pruebas.aTexto(d);
  ['Jose Ramirez','jose@correo.test','809','Isla Saona','2 adultos, 1 niño','Hotel Riu Bavaro','pastel sin gluten']
    .forEach(x => ok(txt.includes(x), 'el aviso lleva "' + x + '"'));
  ok(/cobrar el día del tour/.test(txt), 'y marca lo que queda por cobrar');
  const html = _pruebas.aHtml(d);
  ok(/<table/.test(html) && /IVONNE TOUR RD/.test(html), 'hay version HTML ademas de la de texto');
}

console.log(fallos ? ('\n>>> ' + fallos + ' FALLOS\n') : '\n>>> TODO PASA\n');
process.exit(fallos ? 1 : 0);
