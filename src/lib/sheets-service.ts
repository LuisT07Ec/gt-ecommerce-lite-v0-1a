import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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
// MODELO DE DATOS ESTRUCTURADO DE LAS 6 HOJAS DE GOOGLE SHEETS (PRD SECCIÓN 5)
// ============================================================================

const RAW_CONFIGURACION = {
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
  Contactabilidad: import.meta.env?.PUBLIC_WHATSAPP_NUMBER || '593992576986',
  Moneda: '$',
  TipoFormato: 'es-EC',
  Decimales: 2,
};

const RAW_FORMA_PAGO: FormaPagoItem[] = [
  { id: 1, tipo: 'Efectivo', estado: 'ACTIVO' },
  { id: 2, tipo: 'Transferencia', estado: 'ACTIVO' },
  { id: 3, tipo: 'Tarjeta de crédito', estado: 'ACTIVO' },
];

// Hoja Agencias / Envíos (PRD Sección 2 y 5: PASO RETIRAR $0.00 15 min / ENVÍO A DOMICILIO $1.50 35 min)
const RAW_AGENCIAS: [string, number, string][] = [
  ['PASO RETIRAR', 0.0, '15 min'],
  ['ENVÍO A DOMICILIO', 1.5, '35 min'],
];

// Hoja Productos: [Nombre, Descripcion, Variedades, Variedades2 (sub_variedad), Precio, Categoria, Imagen(es), Cantidad Minima, Badge, PVP_Original, Ref]
// Múltiples filas consecutivas con el mismo Nombre se agrupan automáticamente en producto.variedad[] igual que en COD_BASE_appscript.txt
const RAW_PRODUCTOS_ROWS: [
  string,
  string,
  string,
  string,
  number,
  string,
  string,
  number,
  string,
  number,
  string,
][] = [
  // CATEGORÍA: DISNEY
  [
    'Buzz Lightyear',
    'Figura y peluche espacial coleccionable de 20cm con acabados de lujo, detalles bordados e iluminación de contraste.',
    '1 Docena - 20cm',
    'Clásico Espacial, Guardián Galáctico, Edición Glow',
    10.0,
    'DISNEY',
    JSON.stringify([
      '/fotos/buzz-lightyear.svg',
      '/fotos/buzz-lightyear-2.svg',
      '/fotos/buzz-lightyear-3.svg',
      '/fotos/buzz-lightyear-4.svg',
    ]),
    1,
    'Popular',
    18.0,
    'WG-BZ2025-EC',
  ],
  [
    'Buzz Lightyear',
    'Figura y peluche espacial coleccionable de 20cm con acabados de lujo, detalles bordados e iluminación de contraste.',
    'Pack x3 Unidades',
    'Clásico Espacial, Surtido Pixar',
    9.0,
    'DISNEY',
    JSON.stringify([
      '/fotos/buzz-lightyear.svg',
      '/fotos/buzz-lightyear-2.svg',
      '/fotos/buzz-lightyear-3.svg',
      '/fotos/buzz-lightyear-4.svg',
    ]),
    1,
    'Popular',
    18.0,
    'WG-BZ2025-EC',
  ],
  [
    'Buzz Lightyear',
    'Figura y peluche espacial coleccionable de 20cm con acabados de lujo, detalles bordados e iluminación de contraste.',
    'Unidad Individual',
    'Clásico Espacial, Guardián Galáctico',
    3.5,
    'DISNEY',
    JSON.stringify([
      '/fotos/buzz-lightyear.svg',
      '/fotos/buzz-lightyear-2.svg',
      '/fotos/buzz-lightyear-3.svg',
      '/fotos/buzz-lightyear-4.svg',
    ]),
    2,
    'Popular',
    18.0,
    'WG-BZ2025-EC',
  ],
  [
    'Buzz Lightyear',
    'Figura y peluche espacial coleccionable de 20cm con acabados de lujo, detalles bordados e iluminación de contraste.',
    'Caja Master x36',
    'Lote Mayorista Sellado',
    27.0,
    'DISNEY',
    JSON.stringify([
      '/fotos/buzz-lightyear.svg',
      '/fotos/buzz-lightyear-2.svg',
      '/fotos/buzz-lightyear-3.svg',
      '/fotos/buzz-lightyear-4.svg',
    ]),
    1,
    'Popular',
    18.0,
    'WG-BZ2025-EC',
  ],
  [
    'Minnie Fucsia',
    'Peluche clásico de Minnie Mouse con vestido y lazo fucsia brillante con lunares blancos y felpa hipoalergénica.',
    '1 Docena - 20cm',
    'Fucsia Clásico, Rosa Pastel, Edición Dorada',
    10.0,
    'DISNEY',
    JSON.stringify(['/fotos/minnie-fucsia.svg']),
    1,
    'Disney',
    17.0,
    'WG-MN2025-EC',
  ],
  [
    'Minnie Fucsia',
    'Peluche clásico de Minnie Mouse con vestido y lazo fucsia brillante con lunares blancos y felpa hipoalergénica.',
    'Media Docena (6 u)',
    'Fucsia Clásico, Rosa Pastel',
    6.0,
    'DISNEY',
    JSON.stringify(['/fotos/minnie-fucsia.svg']),
    1,
    'Disney',
    17.0,
    'WG-MN2025-EC',
  ],
  [
    'Stitch Peluche',
    'Peluche adorable de Stitch sentado de Lilo & Stitch, orejas grandes suaves con bordado premium de exportación.',
    '1 Docena - 20cm',
    'Azul Clásico, Angel Rosa, Surtido Pareja',
    10.0,
    'DISNEY',
    JSON.stringify(['/fotos/stitch-peluche.svg']),
    1,
    'Favorito',
    18.5,
    'WG-ST2025-EC',
  ],
  [
    'Stitch Peluche',
    'Peluche adorable de Stitch sentado de Lilo & Stitch, orejas grandes suaves con bordado premium de exportación.',
    'Caja Mayorista x24',
    'Surtido Azul y Angel Rosa',
    19.0,
    'DISNEY',
    JSON.stringify(['/fotos/stitch-peluche.svg']),
    1,
    'Favorito',
    18.5,
    'WG-ST2025-EC',
  ],

  // CATEGORÍA: OFERTAS
  [
    'Capitán América Manos',
    'Cojín y peluche de Capitán América con manos grandes y escudo estilizado, colores vibrantes y costura reforzada.',
    '1 Docena - 20cm',
    'Escudo Clásico, Traje Avengers, Surtido Marvel',
    10.0,
    'OFERTAS',
    JSON.stringify([
      '/fotos/capitan-america-manos.svg',
      '/fotos/capitan-america-manos-2.svg',
    ]),
    1,
    'Súper Oferta',
    16.5,
    'WG-CA2025-EC',
  ],
  [
    'Capitán América Manos',
    'Cojín y peluche de Capitán América con manos grandes y escudo estilizado, colores vibrantes y costura reforzada.',
    'Pack x6 Unidades',
    'Escudo Clásico, Traje Avengers',
    5.5,
    'OFERTAS',
    JSON.stringify([
      '/fotos/capitan-america-manos.svg',
      '/fotos/capitan-america-manos-2.svg',
    ]),
    2,
    'Súper Oferta',
    16.5,
    'WG-CA2025-EC',
  ],
  [
    'Rayo Mc Queen',
    'Peluche suave con forma de auto de carreras Rayo McQueen #95 Copa Pistón, ideal para regalos y piñatería.',
    '1 Docena - 20cm',
    'Rojo #95 Clásico, Dinoco Azul, Surtido Cars',
    10.0,
    'OFERTAS',
    JSON.stringify(['/fotos/rayo-mcqueen.svg']),
    1,
    'Oferta Activa',
    16.0,
    'WG-RM2025-EC',
  ],
  [
    'Pack Marcianitos Pizza Planet',
    'Set coleccionable de figuras y peluches de los Marcianitos de Toy Story Pizza Planet con traje espacial.',
    '1 Docena Sets',
    'Verde Clásico, Disfraz Pixar',
    10.0,
    'OFERTAS',
    JSON.stringify(['/fotos/marcianitos-pack.svg']),
    1,
    'Edición Limitada',
    15.5,
    'WG-MP2025-EC',
  ],

  // CATEGORÍA: INFANTIL
  [
    'Mike Wazowski',
    'Peluche de felpa verde lima de Mike Wazowski (Monsters Inc) con ojo bordado de alta definición y textura ultra suave.',
    '1 Docena - 20cm',
    'Verde Lima Clásico, Con Casco MU, Surtido Monsters',
    10.0,
    'INFANTIL',
    JSON.stringify(['/fotos/mike-wazowski.svg']),
    1,
    'Stock Alto',
    15.0,
    'WG-MW2025-EC',
  ],
  [
    'Mike Wazowski',
    'Peluche de felpa verde lima de Mike Wazowski (Monsters Inc) con ojo bordado de alta definición y textura ultra suave.',
    'Unidad Mayorista',
    'Verde Lima Clásico',
    1.25,
    'INFANTIL',
    JSON.stringify(['/fotos/mike-wazowski.svg']),
    6,
    'Stock Alto',
    15.0,
    'WG-MW2025-EC',
  ],
  [
    'Woody Sheriff con Sonido',
    'Muñeco y peluche del Sheriff Woody con sombrero vaquero clásico, estrella dorada y detalles auténticos.',
    '1 Docena - 25cm',
    'Edición Clásica, Con Frases en Español',
    15.0,
    'INFANTIL',
    JSON.stringify(['/fotos/woody-sheriff.svg']),
    1,
    'Nuevo Lote',
    22.0,
    'WG-WD2025-EC',
  ],

  // CATEGORÍA: ROPA
  [
    'Conjunto Infantil Disney',
    'Conjunto deportivo de algodón peinado hipoalergénico con estampados licenciados de alta durabilidad.',
    'Docena Surtida',
    'Tallas 2-4-6-8, Colores Surtidos Niño/Niña',
    24.0,
    'ROPA',
    JSON.stringify(['/fotos/conjunto-disney-infantil.svg']),
    1,
    'Textil EC',
    36.0,
    'WG-CD2025-EC',
  ],
  [
    'Conjunto Infantil Disney',
    'Conjunto deportivo de algodón peinado hipoalergénico con estampados licenciados de alta durabilidad.',
    'Pack x3 Conjuntos',
    'Talla 2, Talla 4, Talla 6, Talla 8',
    7.5,
    'ROPA',
    JSON.stringify(['/fotos/conjunto-disney-infantil.svg']),
    2,
    'Textil EC',
    36.0,
    'WG-CD2025-EC',
  ],
  [
    'Set Ropa Bebé Premium',
    'Ajuar de 5 piezas en algodón pima 100% suave para recién nacido y bebés de 0 a 12 meses.',
    'Docena Ajuares',
    '0-3 Meses, 3-6 Meses, 6-12 Meses',
    30.0,
    'ROPA',
    JSON.stringify(['/fotos/set-ropa-bebe.svg']),
    1,
    'Bebés',
    45.0,
    'WG-RB2025-EC',
  ],
];

const CATEGORY_ICONS: Record<string, string> = {
  DISNEY: '🏰',
  OFERTAS: '💥',
  INFANTIL: '🧸',
  ROPA: '👕',
};

// ============================================================================
// PERSISTENCIA LOCAL RESILIENTE + SINCRONIZACIÓN CON GOOGLE SHEETS
// ============================================================================

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'sheets-db.json');

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
      {
        codigo: 2,
        nombre: 'Minnie Fucsia ( 1 Docena - 20cm )',
        categoria: 'DISNEY',
        variante: '1 Docena - 20cm',
        precio: 10.0,
        cantidad: 1,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/minnie-fucsia.svg',
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

function readLocalDB(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const demo = getInitialDemoOrder();
      const initial: LocalDatabase = {
        ventas: [demo.venta],
        detalleVentas: demo.detalles,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as LocalDatabase;
  } catch {
    const demo = getInitialDemoOrder();
    return { ventas: [demo.venta], detalleVentas: demo.detalles };
  }
}

function writeLocalDB(db: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Ignorar en entornos de solo lectura
  }
}

/**
 * Función heredada exacta de COD_BASE_appscript.txt: formatomonto
 */
export function formatomonto(
  monto: number | string,
  formato_numero: string = RAW_CONFIGURACION.TipoFormato,
  formato_decimal: number = RAW_CONFIGURACION.Decimales
): string {
  const num = Number.parseFloat(String(monto)) || 0;
  return num.toLocaleString(formato_numero, {
    minimumFractionDigits: formato_decimal,
    maximumFractionDigits: formato_decimal,
  });
}

/**
 * Función heredada de COD_BASE_appscript.txt: listar_configuracion()
 * Agrupa productos por categoría y sus variedades/sub-variedades.
 */
export function listarConfiguracion(idPedido?: string) {
  const moneda = RAW_CONFIGURACION.Moneda;
  const dataArrayAgencia: AgenciaItem[] = RAW_AGENCIAS.map((row) => ({
    codigo: row[0],
    descripcion: row[0],
    costo: row[1],
    tiempo: row[2],
  }));

  const dataArray: CategoriaCatalogo[] = [];
  let categoriaActual = '';
  let nombreProductoActual = '';
  let contadorCategoria = 0;
  let contadorProductoGlobal = 0;
  let dataArrayProducto: ProductoCatalogo[] = [];
  let recordProductoActual: ProductoCatalogo | null = null;

  for (let j = 0; j < RAW_PRODUCTOS_ROWS.length; j++) {
    const row = RAW_PRODUCTOS_ROWS[j];
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

    if (!nombre || !descripcion || !categoria) {
      continue;
    }

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
      moneda,
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

    if (j + 1 === RAW_PRODUCTOS_ROWS.length && categoriaActual) {
      dataArray.push({
        codigo: contadorCategoria,
        nombre: categoriaActual,
        icono: CATEGORY_ICONS[categoriaActual] || '✨',
        producto: dataArrayProducto,
      });
    }
  }

  const respuesta: Record<string, unknown> = {
    status: '0',
    message: 'Exito',
    pagina_logo: RAW_CONFIGURACION.Logo,
    pagina_nombre: RAW_CONFIGURACION.Nombre,
    pagina_nombre_comercial: RAW_CONFIGURACION.NombreComercial,
    formato_numero: RAW_CONFIGURACION.TipoFormato,
    formato_decimal: RAW_CONFIGURACION.Decimales,
    moneda: RAW_CONFIGURACION.Moneda,
    pagina_url: RAW_CONFIGURACION.URL,
    pagina_carrusel: JSON.parse(RAW_CONFIGURACION.Carrusel),
    contactabilidad: RAW_CONFIGURACION.Contactabilidad,
    formas_pago: RAW_FORMA_PAGO.filter((f) => f.estado === 'ACTIVO'),
    content: dataArray,
    contentagencia: dataArrayAgencia,
  };

  if (idPedido) {
    const resPedido = cargarVenta(idPedido);
    if (resPedido.status === '0' && resPedido.pedido) {
      respuesta.pedido = resPedido.pedido;
    }
  }

  return respuesta;
}

/**
 * Función heredada de COD_BASE_appscript.txt: cargar_venta(id)
 */
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

    if (!cleanId) {
      return { status: '1', message: 'ID de pedido vacío' };
    }

    const db = readLocalDB();
    const found = db.ventas.find((r) => r.codigo === cleanId);
    if (!found) {
      return { status: '1', message: `No se encontró el pedido ${cleanId}` };
    }

    const pedido = JSON.parse(found.json_raw) as VentaPayload;
    pedido.idpedido = found.codigo;
    pedido.estado = found.estado;
    pedido.fecha = found.fecha;
    pedido.hora = found.hora;
    return {
      status: '0',
      message: 'OK',
      pedido,
    };
  } catch (error) {
    return {
      status: '-1',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Función heredada de COD_BASE_appscript.txt: pagar_venta(idpedido)
 */
export function pagarVenta(idPedido: string): { status: string; message: string } {
  try {
    const db = readLocalDB();
    const index = db.ventas.findLastIndex((r) => r.codigo === String(idPedido).trim());
    if (index === -1) {
      return { status: '1', message: `No se encontró el pedido ${idPedido}` };
    }
    db.ventas[index].estado = 'PAGADO';
    try {
      const parsed = JSON.parse(db.ventas[index].json_raw) as VentaPayload;
      parsed.estado = 'PAGADO';
      db.ventas[index].json_raw = JSON.stringify(parsed);
    } catch {
      // mantener json_raw
    }
    writeLocalDB(db);
    return {
      status: '0',
      message: 'Se registró el pago de la venta exitosamente',
    };
  } catch (error) {
    return {
      status: '-1',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Función heredada de COD_BASE_appscript.txt: registrar_venta(informacion)
 * Registra o edita un pedido en las hojas Ventas y DetalleVentas, genera UUID y construye el mensaje WhatsApp.
 */
export async function registrarVenta(ventaInput: VentaPayload) {
  try {
    const db = readLocalDB();
    const isEdit = ventaInput.operacion === 'e' && Boolean(ventaInput.id);
    const codigoventa = isEdit && ventaInput.id ? String(ventaInput.id) : crypto.randomUUID();
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

    // Buscar agencia en hoja Agencias
    const agenciaRow =
      RAW_AGENCIAS.find((r) => r[0] === ventaInput.agencia_entrega) || RAW_AGENCIAS[0];
    const nombreAgencia = agenciaRow[0];
    const costoAgencia = Number(agenciaRow[1]);
    const tiempoAgencia = agenciaRow[2];

    const moneda = RAW_CONFIGURACION.Moneda;
    const formatoNumero = RAW_CONFIGURACION.TipoFormato;
    const formatoDecimal = RAW_CONFIGURACION.Decimales;

    // Calcular subtotal de items respetando cantidad mínima
    let subtotalItems = 0;
    let detallePedidoTexto = '';

    const itemsLimpios: DetallePedidoItem[] = (ventaInput.detalle || []).map((item) => {
      const minima = Math.max(1, Number(item.minima) || 1);
      const cantidad = Math.max(minima, Number(item.cantidad) || minima);
      const precio = Number(item.precio) || 0;
      const totalItem = Number((precio * cantidad).toFixed(formatoDecimal));
      subtotalItems += totalItem;

      const nombreLimpio = String(item.nombre || '')
        .replace(/<b>/g, '')
        .replace(/<\/b>/g, '')
        .trim();

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
    const siteUrl = ventaInput.url || RAW_CONFIGURACION.URL;
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

    // Si existe APPS_SCRIPT_WEBHOOK_URL configurado en .env en el servidor, reenviar de forma segura
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL || import.meta.env?.APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ op: 'venta', ...ventaCompleta }),
        });
      } catch {
        // Fallback local ya completado
      }
    }

    // Composición del mensaje de WhatsApp siguiendo COD_BASE_appscript.txt + PRD Sección 4
    let messageWhatsapp = `🛍️ *NUEVO PEDIDO — ${RAW_CONFIGURACION.Nombre}*\n`;
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
    messageWhatsapp += `*Subtotal:* ${moneda}${formatomonto(
      subtotalItems,
      formatoNumero,
      formatoDecimal
    )}\n`;
    if (descuento > 0) {
      messageWhatsapp += `*Descuento:* -${moneda}${formatomonto(
        descuento,
        formatoNumero,
        formatoDecimal
      )}\n`;
    }
    messageWhatsapp += `*Costo Envío:* ${moneda}${formatomonto(
      costoAgencia,
      formatoNumero,
      formatoDecimal
    )}\n`;
    messageWhatsapp += `💰 *TOTAL PEDIDO:* ${moneda}${formatomonto(
      totalFinal,
      formatoNumero,
      formatoDecimal
    )}`;

    const whatsappUrl = `https://wa.me/${
      RAW_CONFIGURACION.Contactabilidad
    }?text=${encodeURIComponent(messageWhatsapp)}`;

    return {
      status: '0',
      message: isEdit
        ? 'Se editó la venta exitosamente'
        : 'Se grabó la venta exitosamente',
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

