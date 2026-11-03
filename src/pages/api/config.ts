import type { APIRoute } from 'astro';
import {
  listarConfiguracion,
  validarEstructuraSheet,
  setActiveSpreadsheetId,
  getActiveSpreadsheetId,
  setActiveWebhookUrl,
  getActiveWebhookUrl,
} from '../../lib/sheets-service';

export const GET: APIRoute = async ({ url }) => {
  const idPedido = url.searchParams.get('id') || undefined;
  const forceRefresh = url.searchParams.get('refresh') === 'true';
  const validateParam = url.searchParams.get('validate') === 'true';
  const sheetIdParam = url.searchParams.get('sheetId');

  // Si se solicita validación de estructura para /setup o /admin
  if (validateParam) {
    const targetSheetId = sheetIdParam || getActiveSpreadsheetId();
    const resultadoValidacion = await validarEstructuraSheet(targetSheetId);
    return new Response(JSON.stringify(resultadoValidacion), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  const data = await listarConfiguracion(idPedido, forceRefresh);

  // PRD V2 Sección 4: Cache-Control Header Perimetral con bypass en ?refresh=true
  const cacheControlHeader = forceRefresh
    ? 'no-store, no-cache, must-revalidate'
    : 'public, max-age=15, s-maxage=60, stale-while-revalidate=300';

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControlHeader,
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    // Acción para configurar nuevo Spreadsheet ID desde /setup o /admin
    if (action === 'set_sheet_id' && body?.sheetId) {
      const sheetId = String(body.sheetId).trim();
      const validacion = await validarEstructuraSheet(sheetId);
      if (validacion.valido) {
        setActiveSpreadsheetId(sheetId);
        return new Response(
          JSON.stringify({
            status: '0',
            message: 'Spreadsheet ID configurado exitosamente',
            validacion,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      } else {
        return new Response(
          JSON.stringify({
            status: '1',
            message: validacion.mensaje,
            detalles: validacion.detalles,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }
    }

    // Acción para configurar la URL de sincronización Webhook (Apps Script)
    if (action === 'set_webhook_url') {
      const webhookUrl = String(body?.webhookUrl || '').trim();
      setActiveWebhookUrl(webhookUrl);
      return new Response(
        JSON.stringify({
          status: '0',
          message: webhookUrl
            ? 'URL de sincronización Webhook guardada exitosamente.'
            : 'URL de Webhook eliminada.',
          webhookUrl,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const idPedido = body?.id ? String(body.id) : undefined;
    const forceRefresh = body?.refresh === true;
    const data = await listarConfiguracion(idPedido, forceRefresh);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: '-1',
        message: err instanceof Error ? err.message : 'Error al procesar configuración',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};
