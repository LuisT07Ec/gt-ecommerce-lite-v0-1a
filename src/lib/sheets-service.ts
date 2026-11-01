export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface VariedadItem {
  moneda: string;
  precio: number;
  variedad: string;
  minima: number;
  sub_variedad: string;
}

export interface ProductoCatalogo {
  codigo: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  imagenes: string[];
  badge?: string;
  pvp_original?: number;
  ref?: string;
  variedad: VariedadItem[];
}

export interface CategoriaCatalogo {
  codigo: number;
  nombre: string;
  icono: string;
  producto: ProductoCatalogo[];
}

export interface AgenciaItem {
  codigo: string;
  descripcion: string;
  costo: number;
  tiempo: string;
}

export interface FormaPagoItem {
  id: number;
  tipo: string;
  estado: string;
}

export interface DetallePedidoItem {
  codigo: number | string;
  nombre: string;
  descripcion?: string;
  idcategoria?: number | string;
  categoria: string;
  variante: string;
  sub_variante?: string;
  precio: number;
  cantidad: number;
  minima: number;
  moneda: string;
  imagen: string;
  total: number;
  key_completo?: string;
}

export interface VentaPayload {
  op?: string;
  operacion?: string; // "" (nuevo) | "e" (edición) | "d" (detalle) | "p" (pagar)
  id?: string;
  idpedido?: string;
  nombre_entrega: string;
  rut_entrega: string;
  telefono_entrega: string;
  correo_entrega: string;
  direccion_entrega: string;
  ciudad_entrega?: string;
  agencia_entrega: string;
  forma_pago: string;
  notas_entrega?: string;
  moneda: string;
  subtotal?: number;
  costo_envio?: number;
  descuento?: number;
  total: number;
  url?: string;
  fecha?: string;
  hora?: string;
  tiempo_entrega?: string;
  estado?: 'SOLICITADO' | 'PAGADO';
  detalle: DetallePedidoItem[];
}

export interface VentaRow {
  codigo: string;
  fecha: string;
  hora: string;
  nombre: string;
  documento: string;
  telefono: string;
  correo: string;
  direccion: string;
  agencia: string;
  forma_pago: string;
  moneda: string;
  subtotal: number;
  costo_agencia: number;
  tiempo_agencia: string;
  total: number;
  estado: 'SOLICITADO' | 'PAGADO';
  json_raw: string;
  backup_edicion: string;
}

export interface DetalleVentaRow {
  id_venta: string;
  producto: string;
  categoria: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

// ============================================================================
// VALORES POR DEFECTO RESILIENTES (INICIALES)
// ============================================================================

const RAW_CONFIGURACION_DEFAULT = {
  Logo: '/fotos/logo-wigoo.svg',
  Nombre: import.meta.env?.PUBLIC_STORE_NAME || 'WIGGER SHOP 2',
  NombreComercial: 'Wigoo Shop EC',
  URL: import.meta.env?.PUBLIC_SITE_URL || 'https://wigooshop.ec',
  Carrusel: JSON.stringify([
    '/fotos/banner-mayorista-1.svg',
    '/fotos/banner-ofertas-2.svg',
    '/fotos/banner-envios-3.svg',
  ]),
  FormaEntrega: ['PASO RETIRAR', 'ENVÍO A DOMICILIO'],
  FormaPago: ['Efectivo', 'Transferencia', 'Tarjeta de crédito'],
  Contactabilidad: import.meta.env?.PUBLIC_WHATSAPP_NUMBER || '',
  Moneda: '$',
  TipoFormato: 'es-EC',
  Decimales: 2,
};

const RAW_FORMA_PAGO_DEFAULT: FormaPagoItem[] = [
  { id: 1, tipo: 'Efectivo', estado: 'ACTIVO' },
  { id: 2, tipo: 'Transferencia', estado: 'ACTIVO' },
  { id: 3, tipo: 'Tarjeta de crédito', estado: 'ACTIVO' },
];

const RAW_AGENCIAS_DEFAULT: [string, number, string][] = [
  ['PASO RETIRAR', 0.0, '15 min'],
  ['ENVÍO A DOMICILIO', 1.5, '35 min'],
];

const RAW_PRODUCTOS_ROWS_DEFAULT: [
  string, string, string, string, number, string, string, number, string, number, string
][] = [
  ['Buzz Lightyear', 'Figura y peluche espacial de 20cm con acabados de lujo.', '1 Docena - 20cm', 'Clásico Espacial, Guardián Galáctico, Edición Glow', 10.0, 'DISNEY', JSON.stringify(['/fotos/buzz-lightyear.svg', '/fotos/buzz-lightyear-2.svg', '/fotos/buzz-lightyear-3.svg', '/fotos/buzz-lightyear-4.svg']), 1, 'Popular', 18.0, 'WG-BZ2025-EC'],
  ['Buzz Lightyear', 'Figura y peluche espacial de 20cm con acabados de lujo.', 'Pack x3 Unidades', 'Clásico Espacial, Surtido Pixar', 9.0, 'DISNEY', JSON.stringify(['/fotos/buzz-lightyear.svg']), 1, 'Popular', 18.0, 'WG-BZ2025-EC'],
  ['Buzz Lightyear', 'Figura y peluche espacial de 20cm con acabados de lujo.', 'Unidad Individual', 'Clásico Espacial, Guardián Galáctico', 3.5, 'DISNEY', JSON.stringify(['/fotos/buzz-lightyear.svg']), 2, 'Popular', 18.0, 'WG-BZ2025-EC'],
  ['Buzz Lightyear', 'Figura y peluche espacial de 20cm con acabados de lujo.', 'Caja Master x36', 'Lote Mayorista Sellado', 27.0, 'DISNEY', JSON.stringify(['/fotos/buzz-lightyear.svg']), 1, 'Popular', 18.0, 'WG-BZ2025-EC'],
  ['Minnie Fucsia', 'Peluche clásico de Minnie Mouse con vestido fucsia brillante.', '1 Docena - 20cm', 'Fucsia Clásico, Rosa Pastel, Edición Dorada', 10.0, 'DISNEY', JSON.stringify(['/fotos/minnie-fucsia.svg']), 1, 'Disney', 17.0, 'WG-MN2025-EC'],
  ['Minnie Fucsia', 'Peluche clásico de Minnie Mouse con vestido fucsia brillante.', 'Media Docena (6 u)', 'Fucsia Clásico, Rosa Pastel', 6.0, 'DISNEY', JSON.stringify(['/fotos/minnie-fucsia.svg']), 1, 'Disney', 17.0, 'WG-MN2025-EC'],
  ['Stitch Peluche', 'Peluche adorable de Stitch sentado de Lilo & Stitch.', '1 Docena - 20cm', 'Azul Clásico, Angel Rosa, Surtido Pareja', 10.0, 'DISNEY', JSON.stringify(['/fotos/stitch-peluche.svg']), 1, 'Favorito', 18.5, 'WG-ST2025-EC'],
  ['Stitch Peluche', 'Peluche adorable de Stitch sentado de Lilo & Stitch.', 'Caja Mayorista x24', 'Surtido Azul y Angel Rosa', 19.0, 'DISNEY', JSON.stringify(['/fotos/stitch-peluche.svg']), 1, 'Favorito', 18.5, 'WG-ST2025-EC'],
  ['Capitán América Manos', 'Cojín y peluche de Capitán América con manos grandes.', '1 Docena - 20cm', 'Escudo Clásico, Traje Avengers, Surtido Marvel', 10.0, 'OFERTAS', JSON.stringify(['/fotos/capitan-america-manos.svg', '/fotos/capitan-america-manos-2.svg']), 1, 'Súper Oferta', 16.5, 'WG-CA2025-EC'],
  ['Capitán América Manos', 'Cojín y peluche de Capitán América con manos grandes.', 'Pack x6 Unidades', 'Escudo Clásico, Traje Avengers', 5.5, 'OFERTAS', JSON.stringify(['/fotos/capitan-america-manos.svg']), 2, 'Súper Oferta', 16.5, 'WG-CA2025-EC'],
  ['Rayo Mc Queen', 'Peluche con forma de auto de carreras Rayo McQueen #95.', '1 Docena - 20cm', 'Rojo #95 Clásico, Dinoco Azul, Surtido Cars', 10.0, 'OFERTAS', JSON.stringify(['/fotos/rayo-mcqueen.svg']), 1, 'Oferta Activa', 16.0, 'WG-RM2025-EC'],
  ['Pack Marcianitos Pizza Planet', 'Set coleccionable de figuras y peluches de los Marcianitos.', '1 Docena Sets', 'Verde Clásico, Disfraz Pixar', 10.0, 'OFERTAS', JSON.stringify(['/fotos/marcianitos-pack.svg']), 1, 'Edición Limitada', 15.5, 'WG-MP2025-EC'],
  ['Mike Wazowski', 'Peluche de felpa verde lima de Mike Wazowski.', '1 Docena - 20cm', 'Verde Lima Clásico, Con Casco MU', 10.0, 'INFANTIL', JSON.stringify(['/fotos/mike-wazowski.svg']), 1, 'Stock Alto', 15.0, 'WG-MW2025-EC'],
  ['Woody Sheriff con Sonido', 'Muñeco y peluche del Sheriff Woody con sombrero vaquero.', '1 Docena - 25cm', 'Edición Clásica, Con Frases', 15.0, 'INFANTIL', JSON.stringify(['/fotos/woody-sheriff.svg']), 1, 'Nuevo Lote', 22.0, 'WG-WD2025-EC'],
  ['Conjunto Infantil Disney', 'Conjunto deportivo de algodón peinado hipoalergénico.', 'Docena Surtida', 'Tallas 2-4-6-8, Colores Surtidos', 24.0, 'ROPA', JSON.stringify(['/fotos/conjunto-disney-infantil.svg']), 1, 'Textil EC', 36.0, 'WG-CD2025-EC'],
  ['Set Ropa Bebé Premium', 'Ajuar de 5 piezas en algodón pima 100% suave.', 'Docena Ajuares', '0-3 Meses, 3-6 Meses, 6-12 Meses', 30.0, 'ROPA', JSON.stringify(['/fotos/set-ropa-bebe.svg']), 1, 'Bebés', 45.0, 'WG-RB2025-EC']
];

const CATEGORY_ICONS: Record<string, string> = {
  DISNEY: '🏰',
  OFERTAS: '💥',
  INFANTIL: '🧸',
  ROPA: '👕',
};

// ============================================================================
// PERSISTENCIA LOCAL Y GESTIÓN DE CONFIGURACIÓN DINÁMICA
// ============================================================================

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'sheets-db.json');
const CONFIG_FILE = path.join(DATA_DIR, 'store-config.json');

interface LocalDatabase {
  ventas: VentaRow[];
  detalleVentas: DetalleVentaRow[];
}

function getInitialDemoOrder(): { venta: VentaRow; detalles: DetalleVentaRow[] } {
  const demoId = 'WIG-9482-UUID-2025';
  const demoPayload: VentaPayload = {
    op: 'venta',
    idpedido: demoId,
    nombre_entrega: 'Juan Pérez',
    rut_entrega: '1723490812',
    telefono_entrega: '0962888777',
    correo_entrega: 'juan.perez@ejemplo.com',
    direccion_entrega: 'Av. Amazonas N24-11 y Cordero, Edificio Sky, Depto 402 — Quito',
    agencia_entrega: 'ENVÍO A DOMICILIO',
    forma_pago: 'Transferencia',
    moneda: '$',
    subtotal: 40.0,
    costo_envio: 1.5,
    total: 41.5,
    tiempo_entrega: '35 min',
    fecha: '2025-05-15',
    hora: '14:30:00',
    estado: 'SOLICITADO',
    detalle: [
      {
        codigo: 1,
        nombre: 'Buzz Lightyear ( 1 Docena - 20cm )',
        categoria: 'DISNEY',
        variante: '1 Docena - 20cm',
        precio: 10.0,
        cantidad: 2,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/buzz-lightyear.svg',
        total: 20.0,
      },
      {
        codigo: 4,
        nombre: 'Capitán América Manos ( 1 Docena - 20cm )',
        categoria: 'OFERTAS',
        variante: '1 Docena - 20cm',
        precio: 10.0,
        cantidad: 1,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/capitan-america-manos.svg',
        total: 10.0,
      },
    ],
  };

  return {
    venta: {
      codigo: demoId,
      fecha: '2025-05-15',
      hora: '14:30:00',
      nombre: demoPayload.nombre_entrega,
      documento: demoPayload.rut_entrega,
      telefono: demoPayload.telefono_entrega,
      correo: demoPayload.correo_entrega,
      direccion: demoPayload.direccion_entrega,
      agencia: demoPayload.agencia_entrega,
      forma_pago: demoPayload.forma_pago,
      moneda: '$',
      subtotal: 40.0,
      costo_agencia: 1.5,
      tiempo_agencia: '35 min',
      total: 41.5,
      estado: 'SOLICITADO',
      json_raw: JSON.stringify(demoPayload),
      backup_edicion: '',
    },
    detalles: demoPayload.detalle.map((d) => ({
      id_venta: demoId,
      producto: d.nombre,
      categoria: d.categoria,
      cantidad: d.cantidad,
      precio: d.precio,
      subtotal: d.total,
    })),
  };
}

// Storage en memoria resiliente (compatible con Workers/Edge sin Node fs)
let memoryDB: LocalDatabase = {
  ventas: [getInitialDemoOrder().venta],
  detalleVentas: getInitialDemoOrder().detalles,
};
let memorySpreadsheetId: string = '';

function readLocalDB(): LocalDatabase {
  return memoryDB;
}

function writeLocalDB(db: LocalDatabase): void {
  memoryDB = db;
}

export function getActiveSpreadsheetId(): string {
  if (memorySpreadsheetId) return memorySpreadsheetId;
  if (typeof process !== 'undefined' && process.env?.GOOGLE_SPREADSHEET_ID) {
    return process.env.GOOGLE_SPREADSHEET_ID.trim();
  }
  if (import.meta.env?.GOOGLE_SPREADSHEET_ID) {
    return String(import.meta.env.GOOGLE_SPREADSHEET_ID).trim();
  }
  return '';
}

export function setActiveSpreadsheetId(sheetId: string): void {
  const cleanId = String(sheetId || '').trim();
  memorySpreadsheetId = cleanId;
  if (typeof process !== 'undefined' && process.env) {
    process.env.GOOGLE_SPREADSHEET_ID = cleanId;
  }
  cachedConfigData = null;
  lastCacheTime = 0;
}

// ============================================================================
// CONEXIÓN DIRECTA Y PARSEO DE GOOGLE SHEETS
// ============================================================================

// Memoria caché de borde (Edge / Memory)
let cachedConfigData: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 segundos s-maxage

function parseTsvRows(tsvText: string): string[][] {
  return tsvText
    .split(/\r?\n/)
    .map((line) => line.split('\t').map((c) => c.trim()))
    .filter((row) => row.some((c) => c.length > 0));
}

export async function fetchSheetTabTsv(spreadsheetId: string, sheetName: string): Promise<string[][] | null> {
  try {
    // URL estándar pública de exportación TSV de Google Sheets (no requiere OAuth ni scripts)
    const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'WigooStore/2.0' } });
    if (!res.ok) return null;
    const text = await res.text();
    // Parseador CSV simple resiliente
    const rows: string[][] = [];
    const lines = text.split(/\r?\n/);
    for (const l of lines) {
      if (!l.trim()) continue;
      // Regex para campos CSV con comillas
      const matches = l.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches) {
        rows.push(matches.map((m) => m.replace(/^"|"$/g, '').trim()));
      } else {
        rows.push(l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()));
      }
    }
    return rows;
  } catch {
    return null;
  }
}

/**
 * Valida la estructura de las 6 hojas de cálculo
 */
export async function validarEstructuraSheet(spreadsheetId: string): Promise<{
  valido: boolean;
  mensaje: string;
  detalles: Record<string, boolean>;
  contactabilidad?: string;
  storeName?: string;
}> {
  const tabs = ['Configuracion', 'Producto', 'Agencia', 'FormaPago', 'Venta', 'DetalleVenta'];
  const detalles: Record<string, boolean> = {};

  if (!spreadsheetId) {
    return {
      valido: false,
      mensaje: 'Spreadsheet ID vacío o no configurado.',
      detalles: tabs.reduce((acc, t) => ({ ...acc, [t]: false }), {}),
    };
  }

  try {
    // Comprobar la hoja maestra Configuracion
    const confRows = await fetchSheetTabTsv(spreadsheetId, 'Configuracion');
    if (!confRows || confRows.length === 0) {
      return {
        valido: false,
        mensaje: 'No se pudo leer la hoja. Asegúrate de haberla publicado en la web (Archivo > Compartir > Publicar en la web).',
        detalles: tabs.reduce((acc, t) => ({ ...acc, [t]: false }), {}),
      };
    }

    detalles['Configuracion'] = true;
    let contactabilidad = '';
    let storeName = '';

    for (const row of confRows) {
      const key = (row[0] || '').toLowerCase();
      const val = row[1] || '';
      if (key.includes('contactabilidad')) contactabilidad = val;
      if (key.includes('nombre') && !storeName) storeName = val;
    }

    // Verificar las demás pestañas
    for (const t of ['Producto', 'Agencia', 'FormaPago', 'Venta', 'DetalleVenta']) {
      const r = await fetchSheetTabTsv(spreadsheetId, t);
      detalles[t] = Boolean(r && r.length > 0);
    }

    const todasPresentes = Object.values(detalles).every(Boolean);

    return {
      valido: todasPresentes,
      mensaje: todasPresentes
        ? 'CONEXIÓN Y ESTRUCTURA VALIDADA EXITOSAMENTE'
        : 'ESTADO: NO CONFIGURADO - ESTRUCTURA INCOMPLETA. Faltan pestañas requeridas.',
      detalles,
      contactabilidad,
      storeName,
    };
  } catch (err) {
    return {
      valido: false,
      mensaje: err instanceof Error ? err.message : 'Error al conectar con Google Sheets.',
      detalles: tabs.reduce((acc, t) => ({ ...acc, [t]: false }), {}),
    };
  }
}

export function formatomonto(
  monto: number | string,
  formato_numero: string = RAW_CONFIGURACION_DEFAULT.TipoFormato,
  formato_decimal: number = RAW_CONFIGURACION_DEFAULT.Decimales
): string {
  const num = Number.parseFloat(String(monto)) || 0;
  return num.toLocaleString(formato_numero, {
    minimumFractionDigits: formato_decimal,
    maximumFractionDigits: formato_decimal,
  });
}

/**
 * Función central de obtención de configuración y catálogo (con soporte de Sheets en vivo)
 */
export async function listarConfiguracion(idPedido?: string, forceRefresh: boolean = false) {
  const now = Date.now();
  const spreadsheetId = getActiveSpreadsheetId();

  if (!forceRefresh && cachedConfigData && now - lastCacheTime < CACHE_TTL_MS) {
    const copia = { ...cachedConfigData };
    if (idPedido) {
      const resPedido = cargarVenta(idPedido);
      if (resPedido.status === '0' && resPedido.pedido) copia.pedido = resPedido.pedido;
    }
    return copia;
  }

  let conf = { ...RAW_CONFIGURACION_DEFAULT };
  let formasPago = [...RAW_FORMA_PAGO_DEFAULT];
  let agencias: AgenciaItem[] = RAW_AGENCIAS_DEFAULT.map((r) => ({
    codigo: r[0],
    descripcion: r[0],
    costo: r[1],
    tiempo: r[2],
  }));
  let productosRaw = [...RAW_PRODUCTOS_ROWS_DEFAULT];

  // Si existe Spreadsheet ID configurado, intentar sincronizar en vivo
  if (spreadsheetId) {
    try {
      const [confData, prodData, agenData, pagoData] = await Promise.all([
        fetchSheetTabTsv(spreadsheetId, 'Configuracion'),
        fetchSheetTabTsv(spreadsheetId, 'Producto'),
        fetchSheetTabTsv(spreadsheetId, 'Agencia'),
        fetchSheetTabTsv(spreadsheetId, 'FormaPago'),
      ]);

      if (confData && confData.length >= 2) {
        for (const row of confData) {
          const k = (row[0] || '').trim();
          const v = (row[1] || '').trim();
          if (!k || !v) continue;
          if (k.toLowerCase() === 'logo') conf.Logo = v;
          if (k.toLowerCase() === 'nombre') conf.Nombre = v;
          if (k.toLowerCase() === 'url') conf.URL = v;
          if (k.toLowerCase() === 'carrusel') conf.Carrusel = v;
          if (k.toLowerCase() === 'contactabilidad') conf.Contactabilidad = v;
          if (k.toLowerCase() === 'moneda') conf.Moneda = v;
          if (k.toLowerCase() === 'tipoformato') conf.TipoFormato = v;
          if (k.toLowerCase() === 'decimales') conf.Decimales = Number(v) || 2;
        }
      }

      if (agenData && agenData.length > 1) {
        const ags: AgenciaItem[] = [];
        for (let i = 1; i < agenData.length; i++) {
          const row = agenData[i];
          if (row[0]) {
            ags.push({
              codigo: row[0],
              descripcion: row[0],
              costo: Number(row[1]) || 0,
              tiempo: row[2] || '30 min',
            });
          }
        }
        if (ags.length > 0) agencias = ags;
      }

      if (pagoData && pagoData.length > 1) {
        const pagos: FormaPagoItem[] = [];
        for (let i = 1; i < pagoData.length; i++) {
          const row = pagoData[i];
          if (row[1]) {
            pagos.push({
              id: Number(row[0]) || i,
              tipo: row[1],
              estado: (row[2] || 'ACTIVO').toUpperCase(),
            });
          }
        }
        if (pagos.length > 0) formasPago = pagos;
      }

      if (prodData && prodData.length > 1) {
        const prods: typeof RAW_PRODUCTOS_ROWS_DEFAULT = [];
        for (let i = 1; i < prodData.length; i++) {
          const r = prodData[i];
          if (r[0] && r[1] && r[5]) {
            prods.push([
              r[0], // Nombre
              r[1], // Descripcion
              r[2] || 'Unidad', // Variedades
              r[3] || '', // Variedades2
              Number(r[4]) || 0, // Precio
              r[5] || 'GENERAL', // Categoria
              r[6] || JSON.stringify(['/fotos/buzz-lightyear.svg']), // Imagen
              Number(r[7]) || 1, // Minima
              r[8] || '', // Badge
              Number(r[9]) || 0, // PVP_Original
              r[10] || '', // Ref
            ]);
          }
        }
        if (prods.length > 0) productosRaw = prods;
      }
    } catch {
      // Usar defaults resilientes
    }
  }

  // Agrupar catálogo respetando la lógica de COD_BASE_appscript
  const dataArray: CategoriaCatalogo[] = [];
  let categoriaActual = '';
  let nombreProductoActual = '';
  let contadorCategoria = 0;
  let contadorProductoGlobal = 0;
  let dataArrayProducto: ProductoCatalogo[] = [];
  let recordProductoActual: ProductoCatalogo | null = null;

  for (let j = 0; j < productosRaw.length; j++) {
    const row = productosRaw[j];
    const [
      nombre,
      descripcion,
      variedadNombre,
      subVariedad,
      precio,
      categoria,
      imagenRaw,
      minima,
      badge,
      pvpOriginal,
      ref,
    ] = row;

    if (!nombre || !descripcion || !categoria) continue;

    if (categoria !== categoriaActual) {
      if (categoriaActual) {
        dataArray.push({
          codigo: contadorCategoria,
          nombre: categoriaActual,
          icono: CATEGORY_ICONS[categoriaActual] || '✨',
          producto: dataArrayProducto,
        });
        dataArrayProducto = [];
      }
      categoriaActual = categoria;
      contadorCategoria += 1;
    }

    const variedadObj: VariedadItem = {
      moneda: conf.Moneda,
      precio: Number(precio),
      variedad: variedadNombre,
      minima: Number(minima) || 1,
      sub_variedad: subVariedad || '',
    };

    if (nombreProductoActual !== nombre) {
      contadorProductoGlobal += 1;
      let parsedImages: string[] = [];
      try {
        const parsed = JSON.parse(imagenRaw);
        parsedImages = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        parsedImages = [imagenRaw];
      }

      recordProductoActual = {
        codigo: contadorProductoGlobal,
        categoria,
        nombre,
        descripcion,
        imagen: parsedImages[0] || '/fotos/buzz-lightyear.svg',
        imagenes: parsedImages,
        badge,
        pvp_original: pvpOriginal,
        ref,
        variedad: [variedadObj],
      };
      dataArrayProducto.push(recordProductoActual);
      nombreProductoActual = nombre;
    } else if (recordProductoActual) {
      recordProductoActual.variedad.push(variedadObj);
    }

    if (j + 1 === productosRaw.length && categoriaActual) {
      dataArray.push({
        codigo: contadorCategoria,
        nombre: categoriaActual,
        icono: CATEGORY_ICONS[categoriaActual] || '✨',
        producto: dataArrayProducto,
      });
    }
  }

  let carruselParsed: string[] = [];
  try {
    carruselParsed = JSON.parse(conf.Carrusel);
    if (!Array.isArray(carruselParsed)) carruselParsed = [conf.Carrusel];
  } catch {
    carruselParsed = ['/fotos/banner-mayorista-1.svg', '/fotos/banner-ofertas-2.svg', '/fotos/banner-envios-3.svg'];
  }

  const respuesta: Record<string, unknown> = {
    status: '0',
    message: 'Exito',
    pagina_logo: conf.Logo,
    pagina_nombre: conf.Nombre,
    pagina_nombre_comercial: conf.NombreComercial,
    formato_numero: conf.TipoFormato,
    formato_decimal: conf.Decimales,
    moneda: conf.Moneda,
    pagina_url: conf.URL,
    pagina_carrusel: carruselParsed,
    contactabilidad: conf.Contactabilidad,
    formas_pago: formasPago.filter((f) => f.estado === 'ACTIVO'),
    content: dataArray,
    contentagencia: agencias,
    spreadsheet_id: spreadsheetId || 'NO_CONFIGURADO',
  };

  cachedConfigData = respuesta;
  lastCacheTime = now;

  if (idPedido) {
    const resPedido = cargarVenta(idPedido);
    if (resPedido.status === '0' && resPedido.pedido) {
      respuesta.pedido = resPedido.pedido;
    }
  }

  return respuesta;
}

export function cargarVenta(idRaw: string): {
  status: string;
  message: string;
  pedido?: VentaPayload;
} {
  try {
    const cleanId = String(idRaw || '')
      .replace('&m=1', '')
      .replace('?m=1', '')
      .trim();

    if (!cleanId) return { status: '1', message: 'ID de pedido vacío' };

    const db = readLocalDB();
    const found = db.ventas.find((r) => r.codigo === cleanId);
    if (!found) return { status: '1', message: `No se encontró el pedido ${cleanId}` };

    const pedido = JSON.parse(found.json_raw) as VentaPayload;
    pedido.idpedido = found.codigo;
    pedido.estado = found.estado;
    pedido.fecha = found.fecha;
    pedido.hora = found.hora;
    return { status: '0', message: 'OK', pedido };
  } catch (error) {
    return { status: '-1', message: error instanceof Error ? error.message : String(error) };
  }
}

export function pagarVenta(idPedido: string): { status: string; message: string } {
  try {
    const db = readLocalDB();
    const index = db.ventas.findLastIndex((r) => r.codigo === String(idPedido).trim());
    if (index === -1) return { status: '1', message: `No se encontró el pedido ${idPedido}` };

    db.ventas[index].estado = 'PAGADO';
    try {
      const parsed = JSON.parse(db.ventas[index].json_raw) as VentaPayload;
      parsed.estado = 'PAGADO';
      db.ventas[index].json_raw = JSON.stringify(parsed);
    } catch {
      // mantener
    }
    writeLocalDB(db);
    return { status: '0', message: 'Se registró el pago de la venta exitosamente' };
  } catch (error) {
    return { status: '-1', message: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Inserción atómica y resiliencia con Exponential Backoff y Jitter
 */
export async function registrarVenta(ventaInput: VentaPayload) {
  try {
    const db = readLocalDB();
    const isEdit = ventaInput.operacion === 'e' && Boolean(ventaInput.id);
    const codigoventa = isEdit && ventaInput.id ? String(ventaInput.id) : generateUUID();
    let backupEdicion = '';

    if (isEdit) {
      for (let i = db.ventas.length - 1; i >= 0; i--) {
        if (db.ventas[i].codigo === codigoventa) {
          backupEdicion = db.ventas[i].json_raw;
          db.ventas.splice(i, 1);
          break;
        }
      }
      db.detalleVentas = db.detalleVentas.filter((d) => d.id_venta !== codigoventa);
    }

    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 8);

    const config = await listarConfiguracion();
    const agencias = (config.contentagencia || []) as AgenciaItem[];
    const agenciaRow =
      agencias.find((r) => r.codigo === ventaInput.agencia_entrega) ||
      agencias[0] || { codigo: 'PASO RETIRAR', costo: 0, tiempo: '15 min' };

    const nombreAgencia = agenciaRow.codigo;
    const costoAgencia = Number(agenciaRow.costo) || 0;
    const tiempoAgencia = agenciaRow.tiempo;

    const moneda = String(config.moneda || '$');
    const formatoNumero = String(config.formato_numero || 'es-EC');
    const formatoDecimal = Number(config.formato_decimal) || 2;

    let subtotalItems = 0;
    let detallePedidoTexto = '';

    const itemsLimpios: DetallePedidoItem[] = (ventaInput.detalle || []).map((item) => {
      const minima = Math.max(1, Number(item.minima) || 1);
      const cantidad = Math.max(minima, Number(item.cantidad) || minima);
      const precio = Number(item.precio) || 0;
      const totalItem = Number((precio * cantidad).toFixed(formatoDecimal));
      subtotalItems += totalItem;

      const nombreLimpio = String(item.nombre || '').replace(/<\/?b>/g, '').trim();

      detallePedidoTexto += `• ${nombreLimpio} | Cant: ${cantidad} x ${moneda}${formatomonto(
        precio,
        formatoNumero,
        formatoDecimal
      )} = ${moneda}${formatomonto(totalItem, formatoNumero, formatoDecimal)}\n`;

      return {
        ...item,
        nombre: nombreLimpio,
        cantidad,
        minima,
        precio,
        moneda,
        total: totalItem,
      };
    });

    const descuento = Number(ventaInput.descuento) || 0;
    const totalFinal = Number(
      Math.max(0, subtotalItems - descuento + costoAgencia).toFixed(formatoDecimal)
    );
    const siteUrl = ventaInput.url || String(config.pagina_url || 'https://wigooshop.ec');
    const formaPago = ventaInput.forma_pago || 'Transferencia';

    const ventaCompleta: VentaPayload = {
      ...ventaInput,
      idpedido: codigoventa,
      agencia_entrega: nombreAgencia,
      forma_pago: formaPago,
      moneda,
      subtotal: Number(subtotalItems.toFixed(formatoDecimal)),
      costo_envio: costoAgencia,
      descuento,
      total: totalFinal,
      tiempo_entrega: tiempoAgencia,
      fecha,
      hora,
      estado: 'SOLICITADO',
      detalle: itemsLimpios,
    };

    const nuevaFilaVenta: VentaRow = {
      codigo: codigoventa,
      fecha,
      hora,
      nombre: ventaCompleta.nombre_entrega,
      documento: ventaCompleta.rut_entrega,
      telefono: ventaCompleta.telefono_entrega,
      correo: ventaCompleta.correo_entrega,
      direccion: ventaCompleta.direccion_entrega,
      agencia: nombreAgencia,
      forma_pago: formaPago,
      moneda,
      subtotal: ventaCompleta.subtotal || subtotalItems,
      costo_agencia: costoAgencia,
      tiempo_agencia: tiempoAgencia,
      total: totalFinal,
      estado: 'SOLICITADO',
      json_raw: JSON.stringify(ventaCompleta),
      backup_edicion: backupEdicion,
    };

    db.ventas.push(nuevaFilaVenta);
    for (const item of itemsLimpios) {
      db.detalleVentas.push({
        id_venta: codigoventa,
        producto: item.nombre,
        categoria: item.categoria,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.total,
      });
    }

    writeLocalDB(db);

    // Push con Exponential Backoff y Jitter si hay Webhook o API de Sheets
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL || import.meta.env?.APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
      const maxRetries = 3;
      let attempt = 0;
      while (attempt < maxRetries) {
        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              op: 'venta',
              batchUpdate: true,
              ...ventaCompleta,
            }),
          });
          if (res.ok) break;
        } catch {
          // Fallo transitorio
        }
        attempt++;
        const jitter = Math.random() * 200;
        const delay = Math.pow(2, attempt) * 300 + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Armar mensaje WhatsApp usando estrictamente Contactabilidad de Google Sheets
    const contactNumber = String(config.contactabilidad || '').replace(/\D/g, '');

    let messageWhatsapp = `🛍️ *NUEVO PEDIDO — ${config.pagina_nombre}*\n`;
    messageWhatsapp += `🔖 *Código Orden:* ${codigoventa}\n`;
    messageWhatsapp += `🔗 *Seguimiento:* ${siteUrl}/pedido-confirmado?id=${codigoventa}\n\n`;
    messageWhatsapp += `*NOMBRE Y APELLIDOS:*\n${ventaCompleta.nombre_entrega}\n`;
    messageWhatsapp += `*DOCUMENTO (Cédula/RUC):*\n${ventaCompleta.rut_entrega || 'Consumidor Final'}\n`;
    messageWhatsapp += `*TELÉFONO:*\n${ventaCompleta.telefono_entrega}\n`;
    messageWhatsapp += `*CORREO:*\n${ventaCompleta.correo_entrega || 'No especificado'}\n`;
    messageWhatsapp += `*DIRECCIÓN DE ENTREGA:*\n${ventaCompleta.direccion_entrega}\n`;
    messageWhatsapp += `*FORMA DE ENVÍO:*\n${nombreAgencia} (${moneda}${formatomonto(
      costoAgencia,
      formatoNumero,
      formatoDecimal
    )} • ${tiempoAgencia})\n`;
    messageWhatsapp += `*FORMA DE PAGO:*\n${formaPago}\n\n`;
    messageWhatsapp += `*DETALLE DEL PEDIDO:*\n${detallePedidoTexto}\n`;
    messageWhatsapp += `*Subtotal:* ${moneda}${formatomonto(subtotalItems, formatoNumero, formatoDecimal)}\n`;
    if (descuento > 0) {
      messageWhatsapp += `*Descuento:* -${moneda}${formatomonto(descuento, formatoNumero, formatoDecimal)}\n`;
    }
    messageWhatsapp += `*Costo Envío:* ${moneda}${formatomonto(costoAgencia, formatoNumero, formatoDecimal)}\n`;
    messageWhatsapp += `💰 *TOTAL PEDIDO:* ${moneda}${formatomonto(totalFinal, formatoNumero, formatoDecimal)}`;

    const whatsappUrl = contactNumber
      ? `https://wa.me/${contactNumber}?text=${encodeURIComponent(messageWhatsapp)}`
      : '';

    return {
      status: '0',
      message: isEdit ? 'Se editó la venta exitosamente' : 'Se grabó la venta exitosamente',
      idpedido: codigoventa,
      pedido: ventaCompleta,
      message_whatsapp: messageWhatsapp,
      whatsapp_url: whatsappUrl,
    };
  } catch (error) {
    return {
      status: '-1',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
