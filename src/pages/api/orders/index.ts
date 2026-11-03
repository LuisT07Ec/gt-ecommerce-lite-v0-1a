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
    if (!payload.nombre_entrega || !payload.telefono_entrega || !payload.direccion_entrega) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'Por favor completa Nombre, Teléfono y Dirección de entrega.',
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

    // 2. Límites de longitud: Dirección máx 50, los demás campos máx 30
    if ((payload.direccion_entrega || '').length > 50) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Dirección de Entrega no puede superar los 50 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    if ((payload.nombre_entrega || '').length > 30) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Nombre y Apellidos no puede superar los 30 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    if ((payload.rut_entrega || '').length > 30) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Cédula / RUC no puede superar los 30 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    if ((payload.correo_entrega || '').length > 30) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Correo Electrónico no puede superar los 30 caracteres.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // 3. Teléfono: solo dígitos numéricos y máximo 30 caracteres
    const phoneClean = (payload.telefono_entrega || '').trim();
    if (!/^\d+$/.test(phoneClean)) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Teléfono solo debe contener números.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    if (phoneClean.length > 30) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'El campo Teléfono no puede superar los 30 dígitos.',
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

