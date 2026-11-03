import fs from 'node:fs';
import path from 'node:path';
import { logSystemError } from './logger';

export interface GoogleAuthConfig {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
  connectedAt?: string;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const AUTH_FILE = path.resolve(DATA_DIR, 'google_auth.json');
const CONSENT_LOG_FILE = path.resolve(process.cwd(), 'consent_log.txt');

/**
 * Lee la configuración y credenciales OAuth2 de Google guardadas localmente.
 * Nunca se expone a terceros ni en el frontend.
 */
export function getGoogleAuthConfig(): GoogleAuthConfig {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      return {
        clientId: process.env.GOOGLE_CLIENT_ID || import.meta.env?.GOOGLE_CLIENT_ID || data.clientId,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || import.meta.env?.GOOGLE_CLIENT_SECRET || data.clientSecret,
        ...data,
      };
    }
  } catch (err) {
    console.error('[GOOGLE_AUTH] Error leyendo google_auth.json:', err);
  }

  return {
    clientId: process.env.GOOGLE_CLIENT_ID || import.meta.env?.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || import.meta.env?.GOOGLE_CLIENT_SECRET || '',
  };
}

/**
 * Guarda las credenciales OAuth2 de forma segura en .data/google_auth.json
 */
export function saveGoogleAuthConfig(config: GoogleAuthConfig): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('[GOOGLE_AUTH] Error guardando google_auth.json:', err);
  }
}

/**
 * Registra un evento de consentimiento o desvinculación en consent_log.txt.
 * Archivo local privado con estricta responsabilidad delegada al usuario.
 */
export function recordConsentLog(action: string, email: string, details: string): void {
  try {
    const timestamp = new Date().toISOString();
    const entry = [
      '================================================================================',
      `[${timestamp}] [CONSENTIMIENTO_OAUTH2] ${action.toUpperCase()}`,
      `CUENTA AUTORIZADA: ${email || 'Desconocida'}`,
      `DETALLE:           ${details}`,
      `RESPONSABILIDAD:   Consentimiento otorgado directamente por el usuario titular a Google.`,
      `                   El software GT E-commerce Lite opera 100% descentralizado.`,
      '================================================================================\n',
    ].join('\n');

    fs.appendFileSync(CONSENT_LOG_FILE, entry, 'utf-8');
  } catch (err) {
    console.error('[CONSENT_LOG] Error escribiendo consent_log.txt:', err);
  }
}

/**
 * Verifica si hay una cuenta de Google conectada con refresh token
 */
export function isGoogleConnected(): boolean {
  const conf = getGoogleAuthConfig();
  return Boolean(conf.refreshToken || (conf.accessToken && conf.expiresAt && conf.expiresAt > Date.now()));
}

/**
 * Desvincula la cuenta de Google eliminando los tokens locales
 */
export function disconnectGoogle(): void {
  const conf = getGoogleAuthConfig();
  const oldEmail = conf.email || 'N/A';
  saveGoogleAuthConfig({
    clientId: conf.clientId,
    clientSecret: conf.clientSecret,
  });
  recordConsentLog('DESVINCULACION_CUENTA', oldEmail, 'El usuario desvinculó su cuenta de Google Sheets desde el panel admin.');
}

/**
 * Construye la URL oficial de autorización OAuth 2.0 de Google
 */
export function getGoogleAuthUrl(origin: string): string {
  const conf = getGoogleAuthConfig();
  const clientId = conf.clientId;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID no está configurado. Por favor ingresa tus credenciales en el panel.');
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email');

  return (
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `prompt=consent`
  );
}

/**
 * Procesa el callback OAuth 2.0 intercambiando el código por tokens
 */
export function handleOAuthCallback(code: string, origin: string): Promise<{ success: boolean; email?: string; error?: string }> {
  return (async () => {
    try {
      const conf = getGoogleAuthConfig();
      if (!conf.clientId || !conf.clientSecret) {
        return { success: false, error: 'Falta configurar Google Client ID o Client Secret.' };
      }

      const redirectUri = `${origin}/api/auth/google/callback`;

      // 1. Intercambiar código por tokens en el endpoint oficial de Google
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: conf.clientId,
          client_secret: conf.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        const errorMsg = tokenData.error_description || tokenData.error || 'Error canjeando código por tokens';
        logSystemError({
          title: 'GOOGLE_OAUTH_TOKEN_ERROR',
          pointOfFailure: 'google-auth.ts -> handleOAuthCallback()',
          description: 'Fallo al solicitar tokens de acceso a Google OAuth2.',
          error: tokenData,
        });
        return { success: false, error: errorMsg };
      }

      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token || conf.refreshToken;
      const expiresIn = Number(tokenData.expires_in) || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      // 2. Obtener el email de la cuenta para mostrarlo en el panel
      let userEmail = 'Usuario de Google';
      try {
        const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          if (infoData.email) userEmail = infoData.email;
        }
      } catch {
        // Fallback
      }

      // 3. Guardar credenciales de forma segura
      saveGoogleAuthConfig({
        ...conf,
        accessToken,
        refreshToken,
        expiresAt,
        email: userEmail,
        connectedAt: new Date().toISOString(),
      });

      // 4. Registrar consentimiento en consent_log.txt
      recordConsentLog(
        'VINCULACION_EXITOSA',
        userEmail,
        `Se autorizó acceso de lectura y escritura a Google Sheets (Scope: spreadsheets). Expira en ${expiresIn}s (Auto-renovable con refresh_token).`
      );

      return { success: true, email: userEmail };
    } catch (err) {
      logSystemError({
        title: 'GOOGLE_OAUTH_CALLBACK_EXCEPTION',
        pointOfFailure: 'google-auth.ts -> handleOAuthCallback()',
        description: 'Excepción procesando el callback de Google OAuth2.',
        error: err,
      });
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  })();
}

/**
 * Obtiene un access_token válido. Si expiró, lo renueva automáticamente usando refresh_token.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const conf = getGoogleAuthConfig();
  if (!conf.accessToken && !conf.refreshToken) return null;

  // Si el token actual todavía es válido (con margen de 60 segundos), usarlo
  if (conf.accessToken && conf.expiresAt && conf.expiresAt - Date.now() > 60000) {
    return conf.accessToken;
  }

  // Renovar token usando refresh_token
  if (conf.refreshToken && conf.clientId && conf.clientSecret) {
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: conf.clientId,
          client_secret: conf.clientSecret,
          refresh_token: conf.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        const expiresIn = Number(data.expires_in) || 3600;
        conf.accessToken = data.access_token;
        conf.expiresAt = Date.now() + expiresIn * 1000;
        if (data.refresh_token) conf.refreshToken = data.refresh_token;
        saveGoogleAuthConfig(conf);
        return conf.accessToken;
      } else {
        logSystemError({
          title: 'GOOGLE_TOKEN_REFRESH_FALLIDO',
          pointOfFailure: 'google-auth.ts -> getValidAccessToken()',
          description: 'No se pudo renovar el token de Google Sheets.',
          error: data,
        });
      }
    } catch (err) {
      logSystemError({
        title: 'GOOGLE_TOKEN_REFRESH_EXCEPTION',
        pointOfFailure: 'google-auth.ts -> getValidAccessToken()',
        description: 'Excepción renovando token de Google.',
        error: err,
      });
    }
  }

  return conf.accessToken || null;
}

/**
 * Inserta filas en una pestaña de Google Sheets mediante la API oficial Google Sheets REST v4.
 */
export async function appendRowsToGoogleSheet(
  spreadsheetId: string,
  tabName: string,
  rows: (string | number)[][]
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return { success: false, error: 'No hay token de acceso válido de Google Sheets.' };
    }

    const range = `${encodeURIComponent(tabName)}!A1`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${tabName}!A1`,
        majorDimension: 'ROWS',
        values: rows,
      }),
    });

    const resData = await res.json();
    if (res.ok) {
      return { success: true };
    }

    const errorMsg = resData?.error?.message || `Error HTTP ${res.status} de Google Sheets API`;
    return { success: false, error: errorMsg };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
