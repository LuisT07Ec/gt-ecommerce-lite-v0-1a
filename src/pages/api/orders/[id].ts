import type { APIRoute } from 'astro';
import { cargarVenta, pagarVenta } from '../../../lib/sheets-service';

export const GET: APIRoute = async ({ params }) => {
  const id = params.id || '';
  const result = cargarVenta(id);

  return new Response(JSON.stringify(result), {
    status: result.status === '0' ? 200 : 404,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

export const PATCH: APIRoute = async ({ params }) => {
  const id = params.id || '';
  const result = pagarVenta(id);

  return new Response(JSON.stringify(result), {
    status: result.status === '0' ? 200 : 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

