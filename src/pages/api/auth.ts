import type { APIRoute } from 'astro';
import {
  isFirstRun,
  setupAdminCredentials,
  verifyAdminLogin,
  revokeSessionToken,
} from '../../lib/auth-service';

export const GET: APIRoute = async ({ cookies }) => {
  return new Response(
    JSON.stringify({
      firstRun: isFirstRun(),
      authenticated: Boolean(cookies.get('admin_session')?.value),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    }
  );
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    // 1. Registro en Primer Inicio
    if (action === 'first_run_setup') {
      if (!isFirstRun()) {
        return new Response(
          JSON.stringify({ success: false, message: 'El administrador ya fue inicializado.' }),
          { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
      }

      const res = await setupAdminCredentials(body.username, body.password);
      if (res.success) {
        // Iniciar sesión automáticamente
        const loginRes = await verifyAdminLogin(body.username, body.password);
        if (loginRes.token) {
          cookies.set('admin_session', loginRes.token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 días
          });
        }
        return new Response(JSON.stringify({ success: true, message: res.message }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
      return new Response(JSON.stringify(res), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    // 2. Iniciar Sesión Normal
    if (action === 'login') {
      const res = await verifyAdminLogin(body.username, body.password);
      if (res.success && res.token) {
        cookies.set('admin_session', res.token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
        });
        return new Response(JSON.stringify({ success: true, message: res.message }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
      return new Response(JSON.stringify({ success: false, message: res.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    // 3. Cerrar Sesión
    if (action === 'logout') {
      const token = cookies.get('admin_session')?.value;
      revokeSessionToken(token);
      cookies.delete('admin_session', { path: '/' });
      return new Response(JSON.stringify({ success: true, message: 'Sesión cerrada.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Acción no reconocida.' }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err instanceof Error ? err.message : 'Error interno de autenticación',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};
