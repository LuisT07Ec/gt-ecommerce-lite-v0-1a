import type { APIRoute } from 'astro';
import { handleOAuthCallback } from '../../../../lib/google-auth';

export const GET: APIRoute = async ({ url, redirect }) => {
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return redirect(`/admin?google_error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    return redirect('/admin?google_error=Codigo_de_autorizacion_vacio');
  }

  const result = await handleOAuthCallback(code, url.origin);
  if (result.success) {
    return redirect(`/admin?google_connected=true&email=${encodeURIComponent(result.email || '')}`);
  } else {
    return redirect(`/admin?google_error=${encodeURIComponent(result.error || 'Error_vinculando_cuenta')}`);
  }
};
