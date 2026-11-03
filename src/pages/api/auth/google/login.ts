import type { APIRoute } from 'astro';
import { getGoogleAuthUrl, getGoogleAuthConfig } from '../../../../lib/google-auth';

export const GET: APIRoute = async ({ url, redirect }) => {
  try {
    const conf = getGoogleAuthConfig();
    if (!conf.clientId) {
      return redirect('/admin?google_error=Falta_configurar_Google_Client_ID');
    }

    const authUrl = getGoogleAuthUrl(url.origin);
    return redirect(authUrl);
  } catch (err) {
    const msg = err instanceof Error ? encodeURIComponent(err.message) : 'error_oauth';
    return redirect(`/admin?google_error=${msg}`);
  }
};
