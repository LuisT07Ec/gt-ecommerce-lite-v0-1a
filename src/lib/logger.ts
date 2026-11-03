import fs from 'node:fs';
import path from 'node:path';

export interface SystemErrorParams {
  title: string;
  description: string;
  pointOfFailure: string;
  error?: unknown;
}

const LOG_FILE_PATH = path.resolve(process.cwd(), 'error_log.txt');

/**
 * Función macro de registro de fallos del sistema.
 * Registra eventos atómicos en error_log.txt para auditoría en el backend.
 */
export function logSystemError({ title, description, pointOfFailure, error }: SystemErrorParams): void {
  try {
    const timestamp = new Date().toISOString();
    let errorDetail = 'N/A';

    if (error instanceof Error) {
      errorDetail = `${error.name}: ${error.message}\nStack: ${error.stack || 'No stack'}`;
    } else if (typeof error === 'string') {
      errorDetail = error;
    } else if (error) {
      try {
        errorDetail = JSON.stringify(error);
      } catch {
        errorDetail = String(error);
      }
    }

    const logEntry = [
      '================================================================================',
      `[${timestamp}] [ERROR] ${title.toUpperCase()}`,
      `PUNTO DE FALLO: ${pointOfFailure}`,
      `DESCRIPCIÓN:    ${description}`,
      `DETALLE TÉCNICO:`,
      `${errorDetail}`,
      '================================================================================\n',
    ].join('\n');

    // Escribir en error_log.txt en la raíz del proyecto
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf-8');

    // También mostrar en consola del servidor
    console.error(`\x1b[31m[SYSTEM_ERROR]\x1b[0m ${title} (${pointOfFailure}): ${description}`);
  } catch (fsErr) {
    console.error('[LOGGER_FALLBACK] Error escribiendo en error_log.txt:', fsErr);
  }
}

