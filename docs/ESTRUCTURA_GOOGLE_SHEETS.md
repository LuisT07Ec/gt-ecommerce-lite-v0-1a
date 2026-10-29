# 📊 Estructura de Base de Datos en Google Sheets — GT E-commerce Lite (Wigoo Shop EC)

Este documento define la estructura exacta de las **6 pestañas (hojas)** requeridas en Google Sheets para el funcionamiento del backend serverless de la tienda, de acuerdo con el código base (`COD_BASE_appscript.txt`), el PRD y el servicio `src/lib/sheets-service.ts`.

---

## 🗂️ Resumen de Hojas (Tabs)

| Hoja | Propósito | Operación |
| :--- | :--- | :--- |
| **`Configuracion`** | Parámetros globales de la tienda (Logo, Nombre, WhatsApp, Moneda, etc.) | Lectura (`GET /api/config`) |
| **`Producto`** | Catálogo de productos, categorías, imágenes, precios, variantes y cantidad mínima | Lectura (`GET /api/config`) |
| **`Agencia`** | Métodos de entrega, costos y tiempos estimados | Lectura (`GET /api/config`) |
| **`FormaPago`** | Métodos de pago disponibles y su estado | Lectura (`GET /api/config`) |
| **`Venta`** | Cabecera y registro maestro de cada orden / pedido (con UUID único) | Escritura / Edición / Consulta (`POST`, `GET`, `PATCH /api/orders`) |
| **`DetalleVenta`** | Ítems individuales desglosados asociados a cada orden | Escritura / Edición (`POST /api/orders`) |

---

## 1. Hoja: `Configuracion`
Configuración vertical Clave-Valor. La columna **A** indica el parámetro y la columna **B** almacena el valor que consume el sistema por fila exacta.

| Fila | Columna A (Parámetro) | Columna B (Valor Ejemplo) | Descripción |
| :--- | :--- | :--- | :--- |
| **1** | `Logo` | `/fotos/logo-wigoo.svg` | Ruta o URL de la imagen del logotipo. |
| **2** | `Nombre` | `WIGGER SHOP 2` | Nombre de la tienda que se muestra en cabeceras y mensajes. |
| **3** | `URL` | `https://wigooshop.ec` | Dominio público de la tienda para generar enlaces de seguimiento. |
| **4** | `Carrusel` | `["/fotos/banner-mayorista-1.svg", "/fotos/banner-ofertas-2.svg", "/fotos/banner-envios-3.svg"]` | Array JSON con las URLs de los banners del Hero carrusel. |
| **5** | `FormaEntrega` | `["PASO RETIRAR", "ENVÍO A DOMICILIO"]` | Opciones rápidas de entrega. |
| **6** | `FormaPago` | `["Efectivo", "Transferencia", "Tarjeta de crédito"]` | Opciones rápidas de pago. |
| **7** | `Contactabilidad` | `593992576986` | Número de WhatsApp (código de país sin `+`). |
| **8** | `Moneda` | `$` | Símbolo de moneda. |
| **9** | `TipoFormato` | `es-EC` | Configuración regional de moneda y separadores. |
| **10** | `Decimales` | `2` | Cantidad de decimales en montos (2 por defecto). |

---

## 2. Hoja: `Producto`
Matriz de catálogo. **Regla de oro de variantes**: Las filas consecutivas con el mismo **Nombre** se agrupan automáticamente como variantes y subvariedades de un solo producto.

### Encabezados (Fila 1):
`[A] Nombre` | `[B] Descripcion` | `[C] Variedades` | `[D] Variedades2` | `[E] Precio` | `[F] Categoria` | `[G] Imagen` | `[H] Minima` | `[I] Badge` | `[J] PVP_Original` | `[K] Ref`

### Detalle de Columnas:
1. **`Nombre`** (Texto): Nombre del producto comercial (ej: `Buzz Lightyear`).
2. **`Descripcion`** (Texto): Descripción detallada para la ficha técnica y modal.
3. **`Variedades`** (Texto): Nombre de la variante principal (ej: `1 Docena - 20cm`, `Pack x3`, `Unidad`).
4. **`Variedades2`** (Texto): Sub-variedades separadas por comas (ej: `Clásico Espacial, Guardián Galáctico, Edición Glow`).
5. **`Precio`** (Número): Precio unitario de la variante (ej: `10.00`).
6. **`Categoria`** (Texto): Nombre de la categoría (ej: `DISNEY`, `OFERTAS`, `INFANTIL`, `ROPA`).
7. **`Imagen`** (JSON / URL): Array JSON con una o más fotos (ej: `["/fotos/buzz-lightyear.svg", "/fotos/buzz-lightyear-2.svg"]`).
8. **`Minima`** (Número entero): Cantidad mínima obligatoria de compra para esta variante (ej: `1`, `2`, `6`).
9. **`Badge`** (Texto, opcional): Etiqueta visual (ej: `Popular`, `Súper Oferta`, `Favorito`).
10. **`PVP_Original`** (Número, opcional): Precio anterior tachado para mostrar descuento (ej: `18.00`).
11. **`Ref`** (Texto, opcional): Código de referencia o SKU (ej: `WG-BZ2025-EC`).

---

## 3. Hoja: `Agencia`
Define las modalidades de despacho, sus tarifas y el tiempo estimado de entrega.

### Encabezados (Fila 1):
`[A] Agencia` | `[B] Costo` | `[C] Tiempo`

### Datos de Ejemplo:
| Agencia (Columna A) | Costo (Columna B) | Tiempo (Columna C) |
| :--- | :--- | :--- |
| `PASO RETIRAR` | `0.00` | `15 min` |
| `ENVÍO A DOMICILIO` | `1.50` | `35 min` |

---

## 4. Hoja: `FormaPago`
Controla las formas de pago aceptadas y permite activarlas o desactivarlas sin alterar el código.

### Encabezados (Fila 1):
`[A] ID` | `[B] Tipo` | `[C] Estado`

### Datos de Ejemplo:
| ID (Columna A) | Tipo (Columna B) | Estado (Columna C) |
| :--- | :--- | :--- |
| `1` | `Efectivo` | `ACTIVO` |
| `2` | `Transferencia` | `ACTIVO` |
| `3` | `Tarjeta de crédito` | `ACTIVO` |

---

## 5. Hoja: `Venta`
Registro maestro de pedidos generados en el checkout.

### Encabezados (Fila 1):
1. **`Codigo`**: UUID único del pedido (ej: `WIG-9482-UUID-2025` o UUIDv4).
2. **`Fecha`**: Fecha del pedido (`YYYY-MM-DD`).
3. **`Hora`**: Hora local del pedido (`HH:mm:ss`).
4. **`Nombre`**: Nombre y apellidos del cliente.
5. **`Documento`**: Cédula o RUC ecuatoriano.
6. **`Telefono`**: Número de WhatsApp del cliente.
7. **`Correo`**: Correo electrónico.
8. **`Direccion`**: Dirección detallada de entrega con referencias.
9. **`Agencia`**: Método de entrega seleccionado (`PASO RETIRAR` o `ENVÍO A DOMICILIO`).
10. **`Moneda`**: Símbolo monetario (`$`).
11. **`Total`**: Total final liquidado (Subtotal - Descuento + Costo Envío).
12. **`Json_Raw`**: Objeto JSON íntegro del pedido (respaldo estructurado completo).
13. **`Costo_Agencia`**: Costo de envío aplicado (`0.00` o `1.50`).
14. **`Tiempo_Agencia`**: Tiempo estimado de entrega (`15 min`, `35 min`).
15. **`Estado`**: Estado del pedido (`SOLICITADO` por defecto, cambia a `PAGADO` vía `PATCH /api/orders/[id]`).
16. **`Backup_Edicion`**: Respaldo del JSON anterior si el pedido fue editado vía `/?o=e&id=`.

---

## 6. Hoja: `DetalleVenta`
Desglose ítem por ítem para análisis de inventario, facturación y reportes.

### Encabezados (Fila 1):
1. **`Id_Venta`**: UUID de la orden correspondiente (coincide con `Codigo` de la hoja `Venta`).
2. **`Producto`**: Nombre completo del producto + variante seleccionada.
3. **`Categoria`**: Categoría del producto (`DISNEY`, `OFERTAS`, `INFANTIL`, `ROPA`).
4. **`Cantidad`**: Cantidad de unidades/paquetes comprados.
5. **`Precio`**: Precio unitario de la variante.
6. **`Subtotal`**: Monto total por ítem (`Cantidad × Precio`).

---

## 🚀 Script de Inicialización Automática (Google Apps Script)

Si deseas crear automáticamente todas las hojas con sus encabezados y formato desde Google Sheets, ve a **Extensiones > Apps Script** en tu hoja de cálculo, pega este código y ejecuta la función `inicializarEstructuraTienda()`:

```javascript
function inicializarEstructuraTienda() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Configuracion
  var sheetConf = ss.getSheetByName("Configuracion") || ss.insertSheet("Configuracion");
  sheetConf.clear();
  sheetConf.getRange(1, 1, 10, 2).setValues([
    ["Logo", "/fotos/logo-wigoo.svg"],
    ["Nombre", "WIGGER SHOP 2"],
    ["URL", "https://wigooshop.ec"],
    ["Carrusel", '["/fotos/banner-mayorista-1.svg", "/fotos/banner-ofertas-2.svg", "/fotos/banner-envios-3.svg"]'],
    ["FormaEntrega", '["PASO RETIRAR", "ENVÍO A DOMICILIO"]'],
    ["FormaPago", '["Efectivo", "Transferencia", "Tarjeta de crédito"]'],
    ["Contactabilidad", "593992576986"],
    ["Moneda", "$"],
    ["TipoFormato", "es-EC"],
    ["Decimales", 2]
  ]);
  sheetConf.getRange("A1:A10").setFontWeight("bold");

  // 2. Agencia
  var sheetAgencia = ss.getSheetByName("Agencia") || ss.insertSheet("Agencia");
  sheetAgencia.clear();
  sheetAgencia.appendRow(["Agencia", "Costo", "Tiempo"]);
  sheetAgencia.appendRow(["PASO RETIRAR", 0.00, "15 min"]);
  sheetAgencia.appendRow(["ENVÍO A DOMICILIO", 1.50, "35 min"]);
  sheetAgencia.getRange("A1:C1").setFontWeight("bold").setBackground("#e2e8f0");

  // 3. FormaPago
  var sheetPago = ss.getSheetByName("FormaPago") || ss.insertSheet("FormaPago");
  sheetPago.clear();
  sheetPago.appendRow(["ID", "Tipo", "Estado"]);
  sheetPago.appendRow([1, "Efectivo", "ACTIVO"]);
  sheetPago.appendRow([2, "Transferencia", "ACTIVO"]);
  sheetPago.appendRow([3, "Tarjeta de crédito", "ACTIVO"]);
  sheetPago.getRange("A1:C1").setFontWeight("bold").setBackground("#e2e8f0");

  // 4. Producto
  var sheetProd = ss.getSheetByName("Producto") || ss.insertSheet("Producto");
  sheetProd.clear();
  sheetProd.appendRow([
    "Nombre", "Descripcion", "Variedades", "Variedades2", "Precio",
    "Categoria", "Imagen", "Minima", "Badge", "PVP_Original", "Ref"
  ]);
  sheetProd.appendRow([
    "Buzz Lightyear",
    "Figura y peluche espacial coleccionable de 20cm con acabados de lujo.",
    "1 Docena - 20cm",
    "Clásico Espacial, Guardián Galáctico, Edición Glow",
    10.00,
    "DISNEY",
    '["/fotos/buzz-lightyear.svg", "/fotos/buzz-lightyear-2.svg"]',
    1,
    "Popular",
    18.00,
    "WG-BZ2025-EC"
  ]);
  sheetProd.getRange("A1:K1").setFontWeight("bold").setBackground("#e2e8f0");

  // 5. Venta
  var sheetVenta = ss.getSheetByName("Venta") || ss.insertSheet("Venta");
  sheetVenta.clear();
  sheetVenta.appendRow([
    "Codigo", "Fecha", "Hora", "Nombre", "Documento", "Telefono",
    "Correo", "Direccion", "Agencia", "Moneda", "Total", "Json_Raw",
    "Costo_Agencia", "Tiempo_Agencia", "Estado", "Backup_Edicion"
  ]);
  sheetVenta.getRange("A1:P1").setFontWeight("bold").setBackground("#e2e8f0");

  // 6. DetalleVenta
  var sheetDetalle = ss.getSheetByName("DetalleVenta") || ss.insertSheet("DetalleVenta");
  sheetDetalle.clear();
  sheetDetalle.appendRow(["Id_Venta", "Producto", "Categoria", "Cantidad", "Precio", "Subtotal"]);
  sheetDetalle.getRange("A1:F1").setFontWeight("bold").setBackground("#e2e8f0");

  SpreadsheetApp.getUi().alert("✅ Estructura de las 6 hojas creada con éxito.");
}
```
