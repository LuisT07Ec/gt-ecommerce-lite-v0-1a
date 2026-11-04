# Guía Fácil: Cómo Crear tu Propia Tienda en Línea en 10 Minutos (Sin Saber Programar)

¡Bienvenido! Con esta guía podrás tener tu propia tienda virtual moderna, rápida y profesional funcionando en internet, **totalmente gratis y sin pagar comisiones por venta ni mensualidades**.

---

## 💡 ¿Cómo funciona tu nueva tienda?

Para entenderlo de manera sencilla, imagina que tu negocio funciona así:
1. **Tu Tienda Web (Cloudflare Pages):** Es tu vitrina moderna en internet, visible en teléfonos y computadoras con diseño elegante.
2. **Tu Cuaderno de Negocio (Google Sheets):** Es tu hoja de cálculo en Google Drive donde tú mismo anotas tus productos, fotos y precios. No necesitas sistemas complicados; cuando cambias un precio en tu Google Sheets, cambia automáticamente en tu tienda.
3. **Tu Mostrador de Ventas (WhatsApp):** Cada vez que un cliente confirma una compra, el pedido te llega directamente redactado a tu WhatsApp para que coordines el pago y la entrega. Además, se anota solo en tu hoja de Google Sheets.

---

## 🎒 Lo único que necesitas antes de empezar (Todo es 100% Gratis)

1. Una cuenta de correo de **Google (Gmail)** para tu hoja de cálculo.
2. Una cuenta en **GitHub** ([https://github.com](https://github.com)) — *Es como una carpeta digital en la nube donde se guarda el diseño de tu tienda*.
3. Una cuenta en **Cloudflare** ([https://dash.cloudflare.com](https://dash.cloudflare.com)) — *Es la empresa que pone tu tienda a funcionar en internet de forma rápida y segura*.

---

## 🚀 Paso 1: Copiar la Tienda a tu Cuenta de GitHub (1 solo Clic)

1. Inicia sesión en tu cuenta de [GitHub](https://github.com).
2. Entra al enlace oficial de la plantilla de la tienda (el enlace que te compartió el creador).
3. Arriba a la derecha, verás un botón verde grande que dice: **"Use this template"** (Usar esta plantilla). Haz clic en él y selecciona **"Create a new repository"**.
4. En la pantalla que aparece:
   - **Repository name:** Escribe el nombre que quieras para tu proyecto (por ejemplo: `mi-tienda` o `catalogo-online`).
   - Elige la opción **Public** (Público).
5. Haz clic en el botón verde al final: **"Create repository"**.
6. ¡Listo! En 3 segundos, todo el código de la tienda ya está copiado dentro de tu propia cuenta.

---

## 🌐 Paso 2: Encender tu Tienda en Internet con Cloudflare Pages (Gratis)

Ahora vamos a hacer que tu tienda sea visible para todo el mundo con un enlace web:

1. Entra a tu cuenta en [Cloudflare Dashboard](https://dash.cloudflare.com).
2. En el menú del lado izquierdo, haz clic en **Workers y Pages** (o *Compute*).
3. Haz clic en el botón azul **Crear aplicación** y luego selecciona la pestaña **Pages**.
4. Haz clic en el botón que dice **Conectar a Git**.
5. Selecciona tu cuenta de GitHub y elige el repositorio que creaste en el Paso 1 (ejemplo: `mi-tienda`). Haz clic en **Comenzar la configuración**.
6. En la pantalla de ajustes de construcción (Build settings), completa esto:
   - **Configuración predeterminada (Framework preset):** Elige **Astro**.
   - Haz clic en **Variables de entorno** y añade una variable:
     - Nombre: `CLOUDFLARE_BUILD`
     - Valor: `true`
7. Haz clic en el botón azul al final: **Guardar e implementar**.
8. Espera aproximadamente 1 minuto mientras Cloudflare enciende tu página. 
9. ¡Felicidades! Cloudflare te mostrará un enlace terminado en `.pages.dev` (por ejemplo: `https://mi-tienda.pages.dev`). **Esa es la dirección de tu tienda web en vivo**.

---

## 📊 Paso 3: Crear tu Propia Hoja de Productos en Google Sheets (1 Clic)

Ahora vas a crear tu propia base de datos donde manejarás tus productos y recibirás las ventas:

1. Abre tu tienda en el navegador y agrega al final `/setup` (por ejemplo: `https://mi-tienda.pages.dev/setup`).
2. Verás el **Asistente de Configuración**. En el Paso 1, haz clic en el botón morado que dice **"Clonar Plantilla (/copy)"**.
3. Se abrirá Google Drive preguntándote si deseas hacer una copia. Haz clic en el botón azul **Hacer una copia**.
4. Se abrirá tu hoja de cálculo propia con 6 pestañas listas: `Configuracion`, `Producto`, `Agencia`, `FormaPago`, `Venta` y `DetalleVenta`.
5. **Permiso importante de lectura:**
   - En tu hoja de cálculo, haz clic en el botón verde **Compartir** (arriba a la derecha).
   - Abajo donde dice *Acceso general*, cámbialo a **"Cualquier persona con el enlace"** en modo **Lector**.
   - Haz clic en **Hecho**.
6. **Copiar el identificador (ID) de tu hoja:**
   - Mira la barra de direcciones de tu navegador donde está tu hoja. Verás un enlace largo como este:
     `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
   - Copia únicamente el código largo de letras y números que está entre `/d/` y `/edit`.
7. Vuelve a tu tienda en la página `/setup`, pega ese código en la casilla **Google Spreadsheet ID** y haz clic en **Validar y Conectar Hoja**.
8. Verás un mensaje en verde con vistos ✅ confirmando que tu tienda ya está conectada a tu hoja de cálculo.

---

## ⚡ Paso 4: Activar el Registro Automático de Ventas (Apps Script)

Para que cada venta que hagan tus clientes se escriba automáticamente en tu hoja de cálculo:

1. En tu misma hoja de Google Sheets, abre el menú superior: **Extensiones > Apps Script**.
2. Se abrirá una pantalla con un editor de código. Borra todo lo que esté escrito ahí.
3. Abre el archivo [`APPSCRIPT_WEBHOOK_SEGURO.js`](./APPSCRIPT_WEBHOOK_SEGURO.js) de tu repositorio de GitHub, copia todo su texto y pégalo en la pantalla de Google Apps Script.
4. Haz clic en el icono del **Disquete (Guardar)** arriba.
5. Haz clic en el botón azul **Implementar** (arriba a la derecha) y elige **Nueva implementación**.
6. Haz clic en el engranaje ⚙️ junto a *Seleccionar tipo* y elige **Aplicación web**.
7. Llena estos 3 datos:
   - **Descripción:** `Ventas de mi tienda`
   - **Ejecutar como:** `Yo (tu correo)`
   - **Quién tiene acceso:** `Cualquier persona`
8. Haz clic en **Implementar**. Google te pedirá autorizar los permisos de tu cuenta (haz clic en *Revisar permisos > Avanzado > Ir a proyecto > Permitir*).
9. Google te entregará una **URL de la aplicación web** (un enlace que termina en `/exec`). Cópialo.
10. Entra a tu tienda en la sección de administración agregando `/admin` a tu enlace (ejemplo: `https://mi-tienda.pages.dev/admin`).
11. En la sección **Sincronización en la Nube con Google Sheets**, pega esa URL en el campo y haz clic en **Guardar Sincronización**.

---

## 🎉 ¡Listo! Tu Tienda está 100% Operativa

A partir de este momento:
- **Para cambiar tu número de WhatsApp:** Ve a tu hoja de cálculo, pestaña `Configuracion`, busca la fila *Contactabilidad* y pon tu número con código de país (ejemplo: `593991234567` para Ecuador).
- **Para cambiar el nombre de tu tienda:** Cámbialo en la pestaña `Configuracion`, celda de *Nombre*.
- **Para agregar o quitar productos:** Ve a la pestaña `Producto`, añade filas con el nombre, descripción, precio, categoría y el enlace de la foto del producto.
- **Tus ventas:** Cada vez que alguien complete una orden, te llegará el pedido con el detalle a tu WhatsApp y se guardará solo en la pestaña `Venta`.

---

## ❓ Preguntas Frecuentes y Solución Rápida de Dudas

**1. ¿Por qué mi tienda no muestra los productos de mi hoja?**
Casi siempre es porque tu hoja de Google Sheets está en modo privado. Abre tu hoja, dale clic al botón verde **Compartir** y asegúrate de que en *Acceso general* diga **"Cualquier persona con el enlace"** en modo **Lector**.

**2. ¿Dónde puedo subir las fotos de mis productos?**
Puedes subir las fotos a servidores gratuitos de imágenes como [Postimages.org](https://postimages.org) o [Imgur.com](https://imgur.com), copiar el enlace directo de la imagen (el que termina en `.jpg` o `.png`) y pegarlo en la columna *Imagen* de tu pestaña `Producto`.

**3. ¿Tengo que pagar alguna mensualidad o porcentaje de comisión?**
No. Cloudflare Pages, GitHub y Google Sheets ofrecen planes gratuitos extremadamente generosos que cubren sobradamente tiendas con miles de visitas diarias sin ningún costo.
