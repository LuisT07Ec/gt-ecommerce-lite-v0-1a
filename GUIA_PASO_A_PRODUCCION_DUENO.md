# Guía de Paso a Producción y Gestión de Plantilla Pública
**Documento Exclusivo para el Propietario del Proyecto (Luis Tituaña / Wigoo EC)**

---

## 1. Estrategia de Distribución: Repositorio Plantilla Oficial (Template Repository)

Para lograr que cientos o miles de comerciantes utilicen tu software con **CERO fricción y CERO riesgo para tu infraestructura**, el modelo de distribución correcto no es un simple clon o descarga en ZIP, sino un **Repositorio Plantilla en GitHub (GitHub Template Repository)**.

### ¿Por qué este modelo es el más seguro y escalable?
1. **1 Clic para el Usuario:** El comerciante solo hace clic en el botón verde **"Use this template"** en GitHub y el sistema copia todo el código a su propia cuenta en 3 segundos.
2. **Cero Dependencia de Servidores Centrales:** Cada tienda se ejecuta en la cuenta gratuita de Cloudflare Pages y Google Sheets de ese comerciante. Tú no pagas servidores ni bases de datos.
3. **Aislamiento Total de Responsabilidad:** Quien despliega la tienda es el único administrador y titular legal de su instancia. Si una tienda tiene 100,000 visitas o vende productos regulados, opera bajo la titularidad de ese comerciante, sin afectar tu cuenta ni tus cuotas.

---

## 2. Preparación del Repositorio Público en GitHub

Sigue este paso a paso para publicar el repositorio maestro que servirá de base:

### Paso 2.1. Crear el Repositorio en GitHub
1. Inicia sesión en tu cuenta de GitHub ([https://github.com](https://github.com)).
2. Haz clic en **New repository** (Nuevo repositorio).
3. Asigna un nombre claro y profesional, por ejemplo:
   - `gt-ecommerce-lite-template` o `wigoo-ecommerce-lite`
4. Descripción:
   - `E-commerce ultrarrápido con diseño Liquid Glass, catálogo en Google Sheets, pedidos a WhatsApp y despliegue gratuito en Cloudflare Pages.`
5. Selecciona la opción: **Public** (Público).
6. Haz clic en **Create repository**.

### Paso 2.2. Activar la Función "Template Repository" (VITAL)
Este paso es el que habilita el botón de 1 clic para los usuarios:
1. Dentro de tu nuevo repositorio en GitHub, ve a la pestaña superior **Settings** (Configuración).
2. En la sección **General**, busca el apartado **Template repository**.
3. Marca la casilla de verificación:
   - ☑️ **Template repository** *(Permite que los usuarios generen nuevos repositorios con la misma estructura de directorios y archivos)*.
4. GitHub guardará el cambio automáticamente. Al volver a la página principal del repositorio, verás el botón verde oficial: **"Use this template"**.

### Paso 2.3. Subir el Código Limpio al Repositorio Plantilla
Desde tu terminal de desarrollo, añade el nuevo repositorio remoto y sube la rama `main`:
```bash
# Ejemplo si tu nuevo repo es wigoo-ecommerce-lite:
git remote add template https://github.com/TuUsuario/wigoo-ecommerce-lite.git
git push template main
```

---

## 3. Puesta a Punto de los Recursos Maestros del Ecosistema

Para que la experiencia "Zero-Code" funcione sin que el usuario tenga que configurar nada al inicio:

### 3.1. Hoja Maestra Oficial de Demostración
- **ID de la Hoja:** `1DyK0gKSc5v81Fv5c-NR_f74HvO2-EXjuyEJaRO3JAKk`
- **Configuración obligatoria en Google Drive:**
  1. Abre la hoja: [Abrir Hoja Maestra](https://docs.google.com/spreadsheets/d/1DyK0gKSc5v81Fv5c-NR_f74HvO2-EXjuyEJaRO3JAKk/edit).
  2. Haz clic en **Compartir** (botón verde superior derecho).
  3. En **Acceso general**, asegúrate de que esté configurado como:
     - **Cualquier persona con el enlace** en rol de **Lector**.
     *(Esto permite que cualquier tienda nueva lea el catálogo de muestra inmediatamente sin dar errores 401).*
- **Enlace de clonación de 1 clic para los usuarios:**
  ```text
  https://docs.google.com/spreadsheets/d/1DyK0gKSc5v81Fv5c-NR_f74HvO2-EXjuyEJaRO3JAKk/copy
  ```
  *(Al abrir este enlace, Google Sheets le pregunta al comerciante si desea crear una copia privada en su propio Drive).*

### 3.2. Activación del Apps Script en la Hoja Maestra
Para que la tienda de demostración pueda recibir pedidos de prueba:
1. En la hoja maestra, ve a **Extensiones > Apps Script**.
2. Pega el código de [`APPSCRIPT_WEBHOOK_SEGURO.js`](./APPSCRIPT_WEBHOOK_SEGURO.js).
3. Haz clic en **Implementar > Nueva implementación > Aplicación web**.
4. Configura:
   - **Ejecutar como:** `Yo (tu correo)`
   - **Quién tiene acceso:** `Cualquier persona`
5. Copia la URL terminada en `/exec`.

---

## 4. Despliegue de Demostración en Cloudflare Pages

Para tener tu propia versión demo en vivo que puedas mostrar a los comerciantes (por ejemplo, `demo.wigooshop.ec` o `https://gt-ecommerce-demo.pages.dev`):

1. Ingresa a [https://dash.cloudflare.com](https://dash.cloudflare.com).
2. En el menú lateral izquierdo, haz clic en **Compute (Workers & Pages)** > **Create application** > pestaña **Pages**.
3. Selecciona **Connect to Git** y autoriza tu cuenta de GitHub.
4. Elige tu repositorio del proyecto.
5. Configuración de Construcción (Build Settings):
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. En el apartado **Environment variables (Variables de entorno)**, agrega:
   - `CLOUDFLARE_BUILD` = `true`
   - `NODE_VERSION` = `20`
   - `GOOGLE_SPREADSHEET_ID` = `1DyK0gKSc5v81Fv5c-NR_f74HvO2-EXjuyEJaRO3JAKk`
7. Haz clic en **Save and Deploy**.
8. En 90 segundos, tu tienda estará en línea con certificado SSL gratuito y red global ultrarrápida.

---

## 5. Marco Legal, Licencia y Blindaje de Responsabilidad

El archivo de licencia legal ya ha sido creado en la raíz del proyecto como [`LICENSE.md`](./LICENSE.md). 

### Resumen de la Protección Legal para ti como Desarrollador:
1. **Licencia MIT con Cláusula de Cero Conocimiento (Zero-Knowledge):**
   - El código es libre para que los usuarios lo usen, modifiquen y comercialicen.
   - Establece de forma explícita que **tú NO almacenas, NO procesas y NO tienes acceso a ningún dato de ventas, clientes, facturas o cuentas bancarias de las tiendas de terceros**.
2. **Exención Absoluta de Responsabilidad ("AS IS" - Tal cual):**
   - No ofreces garantías explícitas ni implícitas sobre continuidad del servicio, lucro cesante o pérdidas financieras.
   - Si un comerciante sufre una interrupción por caída de Google Sheets o Cloudflare, no puede imputarte responsabilidad civil ni contractual.
3. **Cláusula de Indemnidad Legal y Tributaria:**
   - Cada comerciante es el único responsable fiscal (SRI en Ecuador o la entidad tributaria correspondiente en su país) de emitir comprobantes de venta válidos.
   - Cualquier litigio entre el comerciante y su cliente final debe ser resuelto exclusivamente entre ellos, manteniendo indemne al autor del software.

---

## 6. Checklist de Verificación Final para el Lanzamiento

- [ ] Repositorio en GitHub creado y marcado como **Template repository**.
- [ ] Archivo `LICENSE.md` presente en la raíz con la cláusula de indemnidad.
- [ ] Archivo `APPSCRIPT_WEBHOOK_SEGURO.js` accesible para copia de los usuarios.
- [ ] Hoja Maestra de Google Sheets compartida como "Cualquier persona con el enlace (Lector)".
- [ ] Enlace `/copy` verificado en navegación privada.
- [ ] Formulario de pedido probado con validaciones de Cédula (10), RUC (13 terminado en 001), Teléfono (10 dígitos `09...`), espacios y correo sin caracteres especiales.
- [ ] Despliegue en Cloudflare Pages verificado y respondiendo en menos de 100 ms.
