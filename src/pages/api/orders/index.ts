import type { APIRoute } from 'astro';
import { cargarVenta, pagarVenta, registrarVenta, type VentaPayload } from '../../../lib/sheets-service';

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

    // Validación y desinfección de campos de entrada
    if (!payload.nombre_entrega || !payload.telefono_entrega || !payload.direccion_entrega) {
      return new Response(
        JSON.stringify({
          status: '1',
          message: 'Por favor completa Nombre, Teléfono y Dirección de entrega.',
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
    return new Response(
      JSON.stringify({
        status: '-1',
        message: error instanceof Error ? error.message : 'Error procesando el pedido',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

