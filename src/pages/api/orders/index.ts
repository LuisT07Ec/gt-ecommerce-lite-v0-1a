import type { APIRoute } from 'astro';
import { cargarVenta, pagarVenta, registrarVenta, type VentaPayload } from '../../../lib/sheets-service';
import { logSystemError } from '../../../lib/logger';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const payload = (await request.json()) as VentaPayload;
    const op = payload.op || 'venta';

    if (op === 'cargar_venta') {
      const id = payload.id || payload.idpedido || '';
      const result = cargarVenta(id);
      return new Response(JSON.stringify(result), {
        status: result.status === '0' ? 200 : 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    if (op === 'pagar') {
      const id = payload.idpedido || payload.id || '';
      const result = pagarVenta(id);
      return new Response(JSON.stringify(result), {
        status: result.status === '0' ? 200 : 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    // Validación básica de campos requeridos
    if (
      !payload.nombre_entrega ||
      !payload.rut_entrega ||
      !payload.telefono_entrega ||
      !payload.correo_entrega ||
      !payload.direccion_entrega
    ) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'Por favor completa todos los campos requeridos: Nombre, Cédula/RUC, Teléfono, Correo y Dirección.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 1. Validación de seguridad contra inyecciones de código (bloquear /*[]{}())
    const forbiddenPattern = /[/*[\]{}()]/;
    const fieldsToInspect = [
      { name: 'Nombre y Apellidos', val: payload.nombre_entrega || '' },
      { name: 'Cédula / RUC', val: payload.rut_entrega || '' },
      { name: 'Dirección de Entrega', val: payload.direccion_entrega || '' },
      { name: 'Correo Electrónico', val: payload.correo_entrega || '' },
      { name: 'Teléfono', val: payload.telefono_entrega || '' },
    ];

    for (const f of fieldsToInspect) {
      if (forbiddenPattern.test(f.val)) {
        logSystemError({
          title: 'SEGURIDAD_CARACTERES_PROHIBIDOS',
          pointOfFailure: `api/orders/index.ts -> Campo "${f.name}"`,
          description: `Se detectaron caracteres prohibidos de inyección en el campo "${f.name}".`,
          error: `Valor recibido: ${f.val}`,
        });
        return new Response(
          JSON.stringify({
            status: '1',
            message: `El campo ${f.name} contiene caracteres especiales no permitidos (como /*[]{}()).`,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }
    }

    // 2. Validación de Nombre y Apellidos (máx. 50 caracteres, solo letras y espacios)
    const nombreClean = (payload.nombre_entrega || '').trim();
    if (nombreClean.length < 3 || nombreClean.length > 50) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Nombre y Apellidos debe tener entre 3 y 50 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombreClean)) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Nombre y Apellidos solo puede contener letras y espacios.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 3. Validación de Cédula / RUC (10 dígitos o 13 dígitos terminado en 001)
    const docClean = (payload.rut_entrega || '').trim();
    if (!/^\d+$/.test(docClean)) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Cédula / RUC solo debe contener números.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    const isCedula = docClean.length === 10;
    const isRuc = docClean.length === 13 && docClean.endsWith('001');
    if (!isCedula && !isRuc) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El documento debe ser una Cédula de 10 dígitos o un RUC de 13 dígitos terminado en 001.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 4. Validación de Teléfono (10 dígitos exactos, inicia con 09)
    const phoneClean = (payload.telefono_entrega || '').trim();
    if (!/^\d+$/.test(phoneClean) || phoneClean.length !== 10 || !phoneClean.startsWith('09')) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El teléfono debe ser un número celular de 10 dígitos que inicie con 09 (ej: 09XXXXXXXX).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 5. Validación de Correo Electrónico (máx. 50 caracteres, formato estándar con dominio)
    const emailClean = (payload.correo_entrega || '').trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailClean.length > 50 || !emailRegex.test(emailClean)) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Correo Electrónico debe ser una dirección válida (ej: nombre@dominio.com).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 6. Validación de Dirección de Entrega (máx. 100 caracteres, letras, números y guion -)
    const addrClean = (payload.direccion_entrega || '').trim();
    if (addrClean.length < 5 || addrClean.length > 100) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Dirección de Entrega debe tener entre 5 y 100 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-]+$/.test(addrClean)) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'La Dirección de Entrega solo puede contener letras, números, espacios y guiones (-).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    if (!Array.isArray(payload.detalle) || payload.detalle.length === 0) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El carrito está vacío. Agrega al menos un producto al pedido.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    payload.url = payload.url || url.origin;
    const result = await registrarVenta(payload);

    return new Response(JSON.stringify(result), {
      status: result.status === '0' ? 200 : 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    logSystemError({
      title: 'API_ORDERS_ERROR',
      pointOfFailure: 'api/orders/index.ts -> POST',
      description: 'Error procesando la solicitud del pedido.',
      error,
    });
    return new Response(
      JSON.stringify({
        status: '-1',
        message: error instanceof Error ? error.message : 'Error procesando el pedido',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

