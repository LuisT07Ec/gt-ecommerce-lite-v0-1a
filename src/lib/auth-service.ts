// Servicio de Autenticación de Administrador (Ligero, seguro y compatible con Edge/Cloudflare)

interface AdminCredentials {
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Memoria compartida y persistencia ligera
let adminCredentials: AdminCredentials | null = null;
const activeSessions = new Set<string>();

// Generador de hash seguro compatible con Web Crypto (Edge / Node)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':gt_ecommerce_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isFirstRun(): boolean {
  // Si hay variable de entorno ADMIN_PASSWORD ya configurada en dashboard, no es first-run
  if (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) {
    return false;
  }
  if (import.meta.env?.ADMIN_PASSWORD) {
    return false;
  }
  return adminCredentials === null;
}

export async function setupAdminCredentials(username: string, password: string): Promise<{ success: boolean; message: string }> {
  if (!username || username.trim().length < 3) {
    return { success: false, message: 'El usuario debe tener al menos 3 caracteres.' };
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const passwordHash = await hashPassword(password);
  adminCredentials = {
    username: username.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  return { success: true, message: 'Credenciales creadas exitosamente.' };
}

export async function verifyAdminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message: string }> {
  // Si está configurado por variables de entorno de Cloudflare
  const envUser = (typeof process !== 'undefined' && process.env?.ADMIN_USER) || import.meta.env?.ADMIN_USER || 'admin';
  const envPass = (typeof process !== 'undefined' && process.env?.ADMIN_PASSWORD) || import.meta.env?.ADMIN_PASSWORD;

  if (envPass) {
    if (username === envUser && password === envPass) {
      const token = crypto.randomUUID();
      activeSessions.add(token);
      return { success: true, token, message: 'Acceso correcto.' };
    }
    return { success: false, message: 'Credenciales incorrectas.' };
  }

  if (!adminCredentials) {
    return { success: false, message: 'El sistema no ha sido inicializado. Crea tus credenciales primero.' };
  }

  const inputHash = await hashPassword(password);
  if (username.trim() === adminCredentials.username && inputHash === adminCredentials.passwordHash) {
    const token = crypto.randomUUID();
    activeSessions.add(token);
    return { success: true, token, message: 'Acceso correcto.' };
  }

  return { success: false, message: 'Usuario o contraseña incorrectos.' };
}

export function validateSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

export function revokeSessionToken(token: string | undefined | null): void {
  if (token) {
    activeSessions.delete(token);
  }
}

