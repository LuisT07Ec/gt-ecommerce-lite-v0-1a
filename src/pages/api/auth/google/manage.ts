import type { APIRoute } from 'astro';
import {
  getGoogleAuthConfig,
  saveGoogleAuthConfig,
  isGoogleConnected,
  disconnectGoogle,
} from '../../../../lib/google-auth';

export const GET: APIRoute = async () => {
  const conf = getGoogleAuthConfig();
  return new Response(
    JSON.stringify({
      connected: isGoogleConnected(),
      email: conf.email || null,
      hasCredentials: Boolean(conf.clientId && conf.clientSecret),
      clientIdPreview: conf.clientId ? `${conf.clientId.slice(0, 12)}...` : null,
      connectedAt: conf.connectedAt || null,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    if (action === 'save_credentials') {
      const { clientId, clientSecret } = body;
      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ status: '1', message: 'Client ID y Client Secret son requeridos.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const conf = getGoogleAuthConfig();
      saveGoogleAuthConfig({
        ...conf,
        clientId: String(clientId).trim(),
        clientSecret: String(clientSecret).trim(),
      });

      return new Response(
        JSON.stringify({ status: '0', message: 'Credenciales de Google OAuth guardadas exitosamente.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disconnect') {
      disconnectGoogle();
      return new Response(
        JSON.stringify({ status: '0', message: 'Cuenta de Google desvinculada exitosamente.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: '1', message: 'Acción no soportada.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ status: '-1', message: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

