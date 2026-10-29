import type { APIRoute } from 'astro';
import { listarConfiguracion } from '../../lib/sheets-service';

export const GET: APIRoute = async ({ url }) => {
  const idPedido = url.searchParams.get('id') || undefined;
  const data = listarConfiguracion(idPedido);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const idPedido = body?.id ? String(body.id) : undefined;
    const data = listarConfiguracion(idPedido);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: '-1',
        message: err instanceof Error ? err.message : 'Error al obtener configuración',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

