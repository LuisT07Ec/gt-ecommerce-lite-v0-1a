import type {
  CategoriaCatalogo,
  DetallePedidoItem,
  ProductoCatalogo,
  VentaPayload,
} from '../lib/sheets-service';

const STORAGE_KEY = 'venta_wigoo_v3';
const LAST_ORDER_KEY = 'last_confirmed_order_wigoo_v3';

export const SHIPPING_RATES: Record<string, { costo: number; tiempo: string }> = {
  'PASO RETIRAR': { costo: 0.0, tiempo: '15 min' },
  'ENVÍO A DOMICILIO': { costo: 1.5, tiempo: '35 min' },
};

export function formatMoney(amount: number | string): string {
  const num = Number.parseFloat(String(amount)) || 0;
  return num.toLocaleString('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getDefaultCart(): VentaPayload {
  return {
    op: 'venta',
    operacion: '',
    id: '',
    nombre_entrega: '',
    rut_entrega: '',
    telefono_entrega: '',
    correo_entrega: '',
    direccion_entrega: '',
    agencia_entrega: 'PASO RETIRAR',
    forma_pago: 'Transferencia',
    moneda: '$',
    subtotal: 30.0,
    costo_envio: 0.0,
    descuento: 0.0,
    total: 30.0,
    detalle: [
      {
        codigo: 1,
        nombre: 'Buzz Lightyear ( 1 Docena - 20cm - Clásico Espacial )',
        descripcion: 'Figura y peluche espacial coleccionable de 20cm con acabados de lujo.',
        idcategoria: 1,
        categoria: 'DISNEY',
        variante: '1 Docena - 20cm',
        sub_variante: 'Clásico Espacial',
        precio: 10.0,
        cantidad: 1,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/buzz-lightyear.svg',
        total: 10.0,
        key_completo: '1_1Docena-20cm_ClásicoEspacial_10',
      },
      {
        codigo: 4,
        nombre: 'Capitán América Manos ( 1 Docena - 20cm - Escudo Clásico )',
        descripcion: 'Cojín y peluche de Capitán América con manos grandes y escudo estilizado.',
        idcategoria: 2,
        categoria: 'OFERTAS',
        variante: '1 Docena - 20cm',
        sub_variante: 'Escudo Clásico',
        precio: 10.0,
        cantidad: 1,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/capitan-america-manos.svg',
        total: 10.0,
        key_completo: '4_1Docena-20cm_EscudoClásico_10',
      },
      {
        codigo: 2,
        nombre: 'Minnie Fucsia ( 1 Docena - 20cm - Fucsia Clásico )',
        descripcion: 'Peluche clásico de Minnie Mouse con vestido y lazo fucsia brillante.',
        idcategoria: 1,
        categoria: 'DISNEY',
        variante: '1 Docena - 20cm',
        sub_variante: 'Fucsia Clásico',
        precio: 10.0,
        cantidad: 1,
        minima: 1,
        moneda: '$',
        imagen: '/fotos/minnie-fucsia.svg',
        total: 10.0,
        key_completo: '2_1Docena-20cm_FucsiaClásico_10',
      },
    ],
  };
}

export function getCart(): VentaPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultCart();
      saveCart(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as VentaPayload;
    if (!Array.isArray(parsed.detalle)) {
      parsed.detalle = [];
    }
    if (!parsed.agencia_entrega || !SHIPPING_RATES[parsed.agencia_entrega]) {
      parsed.agencia_entrega = 'PASO RETIRAR';
    }
    if (!parsed.forma_pago) {
      parsed.forma_pago = 'Transferencia';
    }
    recalculateTotals(parsed);
    return parsed;
  } catch {
    return getDefaultCart();
  }
}

export function recalculateTotals(cart: VentaPayload): VentaPayload {
  let subtotal = 0;
  for (const item of cart.detalle) {
    const min = Math.max(1, Number(item.minima) || 1);
    if (item.cantidad < min) {
      item.cantidad = min;
    }
    item.total = Number((Number(item.precio) * Number(item.cantidad)).toFixed(2));
    subtotal += item.total;
  }
  const shippingInfo = SHIPPING_RATES[cart.agencia_entrega] || SHIPPING_RATES['PASO RETIRAR'];
  cart.subtotal = Number(subtotal.toFixed(2));
  cart.costo_envio = shippingInfo.costo;
  cart.tiempo_entrega = shippingInfo.tiempo;
  const discount = Number(cart.descuento) || 0;
  cart.total = Number(Math.max(0, cart.subtotal - discount + cart.costo_envio).toFixed(2));
  return cart;
}

export function saveCart(cart: VentaPayload): void {
  recalculateTotals(cart);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent('wigoo:cart-updated', { detail: cart }));
}

export function addOrUpdateCartItem(item: DetallePedidoItem): void {
  const cart = getCart();
  const minQty = Math.max(1, Number(item.minima) || 1);
  const qtyToAdd = Math.max(minQty, Number(item.cantidad) || minQty);
  const key =
    item.key_completo ||
    `${item.codigo}_${item.variante}_${item.sub_variante || ''}_${item.precio}`.replace(/\s+/g, '');

  const existingIndex = cart.detalle.findIndex((i) => i.key_completo === key);
  if (existingIndex >= 0) {
    cart.detalle[existingIndex].cantidad += qtyToAdd;
    cart.detalle[existingIndex].total = Number(
      (cart.detalle[existingIndex].cantidad * cart.detalle[existingIndex].precio).toFixed(2)
    );
  } else {
    cart.detalle.push({
      ...item,
      cantidad: qtyToAdd,
      minima: minQty,
      key_completo: key,
      total: Number((qtyToAdd * Number(item.precio)).toFixed(2)),
    });
  }
  saveCart(cart);
}

export function updateCartItemQty(keyCompleto: string, delta: number): {
  hitMin: boolean;
  minima: number;
} {
  const cart = getCart();
  const idx = cart.detalle.findIndex((i) => i.key_completo === keyCompleto);
  if (idx === -1) return { hitMin: false, minima: 1 };

  const item = cart.detalle[idx];
  const minQty = Math.max(1, Number(item.minima) || 1);
  const nextQty = item.cantidad + delta;

  if (nextQty < minQty) {
    item.cantidad = minQty;
    saveCart(cart);
    return { hitMin: true, minima: minQty };
  }

  item.cantidad = nextQty;
  saveCart(cart);
  return { hitMin: false, minima: minQty };
}

export function removeCartItem(keyCompleto: string): void {
  const cart = getCart();
  cart.detalle = cart.detalle.filter((i) => i.key_completo !== keyCompleto);
  saveCart(cart);
}

export function clearCart(): void {
  const cart = getCart();
  cart.detalle = [];
  cart.descuento = 0;
  cart.operacion = '';
  cart.id = '';
  saveCart(cart);
}

export function setShippingMethod(agencia: string): void {
  const cart = getCart();
  if (SHIPPING_RATES[agencia]) {
    cart.agencia_entrega = agencia;
    saveCart(cart);
  }
}

export function setPaymentMethod(formaPago: string): void {
  const cart = getCart();
  cart.forma_pago = formaPago;
  saveCart(cart);
}

// ============================================================================
// INICIALIZACIÓN GLOBAL DE INTERACCIONES Y MODALES
// ============================================================================

export function initStorefront(catalogCategories: CategoriaCatalogo[] = []) {
  // Light-dismiss fallback for <dialog closedby="any"> (Modern Web Guidance)
  if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e: PointerEvent, dialog: HTMLDialogElement) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      });
    }
  }

  const allProducts: ProductoCatalogo[] = [];
  for (const cat of catalogCategories) {
    for (const prod of cat.producto) {
      allProducts.push(prod);
    }
  }

  // Sidebar & Cart Drawer Toggles
  const toggleSidebar = (open?: boolean) => {
    const drawer = document.getElementById('sidebarDrawer');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!drawer || !backdrop) return;
    const isCurrentlyOpen = !drawer.classList.contains('-translate-x-full');
    const targetOpen = open !== undefined ? open : !isCurrentlyOpen;
    if (targetOpen) {
      drawer.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      drawer.classList.add('-translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  const toggleCartDrawer = (open?: boolean) => {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (!drawer || !backdrop) return;
    const isCurrentlyOpen = !drawer.classList.contains('translate-x-full');
    const targetOpen = open !== undefined ? open : !isCurrentlyOpen;
    if (targetOpen) {
      drawer.classList.remove('translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      drawer.classList.add('translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  // Modal 2: Order Confirmation Dialog
  const orderConfirmDialog = document.getElementById(
    'orderConfirmDialog'
  ) as HTMLDialogElement | null;

  const openOrderModal = () => {
    const cart = getCart();
    if (cart.detalle.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos un producto antes de confirmar tu pedido.');
      return;
    }
    toggleCartDrawer(false);
    toggleSidebar(false);
    syncOrderModalFields();
    if (orderConfirmDialog && !orderConfirmDialog.open) {
      orderConfirmDialog.showModal();
    }
  };

  const closeOrderModal = () => {
    if (orderConfirmDialog && orderConfirmDialog.open) {
      orderConfirmDialog.close();
    }
  };

  const syncOrderModalFields = () => {
    const cart = getCart();
    const totalCount = cart.detalle.reduce((sum, i) => sum + i.cantidad, 0);
    const countEl = document.getElementById('modalOrderItemsCount');
    const timeEl = document.getElementById('modalOrderTimeBadge');
    const breakdownEl = document.getElementById('modalOrderBreakdownText');
    const totalEl = document.getElementById('modalOrderTotalAmount');
    const modeBadge = document.getElementById('orderModalModeBadge');

    if (countEl) countEl.textContent = `${totalCount} unidad(es) en ${cart.detalle.length} ítem(s)`;
    if (timeEl) timeEl.textContent = cart.tiempo_entrega || '15 min';
    if (breakdownEl) {
      breakdownEl.textContent = `Subtotal: $${formatMoney(cart.subtotal || 0)} + Envío (${cart.agencia_entrega}): $${formatMoney(cart.costo_envio || 0)}`;
    }
    if (totalEl) totalEl.textContent = `$${formatMoney(cart.total)}`;
    if (modeBadge) {
      modeBadge.textContent =
        cart.operacion === 'e' && cart.id
          ? `Editando Pedido #${cart.id.slice(0, 8)}`
          : 'Checkout Directo • WIGGER SHOP 2';
    }

    const nameInput = document.getElementById('orderCustomerName') as HTMLInputElement | null;
    const docInput = document.getElementById('orderCustomerDoc') as HTMLInputElement | null;
    const phoneInput = document.getElementById('orderCustomerPhone') as HTMLInputElement | null;
    const emailInput = document.getElementById('orderCustomerEmail') as HTMLInputElement | null;
    const addrInput = document.getElementById('orderCustomerAddress') as HTMLInputElement | null;
    const shipSelect = document.getElementById('orderCustomerShipping') as HTMLSelectElement | null;
    const paySelect = document.getElementById('orderCustomerPayment') as HTMLSelectElement | null;

    if (nameInput && cart.nombre_entrega && !nameInput.value) nameInput.value = cart.nombre_entrega;
    if (docInput && cart.rut_entrega && !docInput.value) docInput.value = cart.rut_entrega;
    if (phoneInput && cart.telefono_entrega && !phoneInput.value)
      phoneInput.value = cart.telefono_entrega;
    if (emailInput && cart.correo_entrega && !emailInput.value)
      emailInput.value = cart.correo_entrega;
    if (addrInput && cart.direccion_entrega && !addrInput.value)
      addrInput.value = cart.direccion_entrega;
    if (shipSelect) shipSelect.value = cart.agencia_entrega;
    if (paySelect) paySelect.value = cart.forma_pago || 'Transferencia';
  };

  document.getElementById('closeOrderModalBtn')?.addEventListener('click', closeOrderModal);

  const shipSelectEl = document.getElementById('orderCustomerShipping') as HTMLSelectElement | null;
  shipSelectEl?.addEventListener('change', () => {
    setShippingMethod(shipSelectEl.value);
    syncOrderModalFields();
  });

  const paySelectEl = document.getElementById('orderCustomerPayment') as HTMLSelectElement | null;
  paySelectEl?.addEventListener('change', () => {
    setPaymentMethod(paySelectEl.value);
  });

  // Order Form Submission -> Astro Proxy API -> WhatsApp + Order Success Redirect
  const orderForm = document.getElementById('orderConfirmForm') as HTMLFormElement | null;
  orderForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('orderFormAlert');
    const submitBtn = document.getElementById('submitOrderBtn') as HTMLButtonElement | null;
    const submitBtnText = document.getElementById('submitOrderBtnText');

    const nameVal = (
      document.getElementById('orderCustomerName') as HTMLInputElement | null
    )?.value.trim() || '';
    const docVal = (
      document.getElementById('orderCustomerDoc') as HTMLInputElement | null
    )?.value.trim() || '';
    const phoneVal = (
      document.getElementById('orderCustomerPhone') as HTMLInputElement | null
    )?.value.trim() || '';
    const emailVal = (
      document.getElementById('orderCustomerEmail') as HTMLInputElement | null
    )?.value.trim() || '';
    const addrVal = (
      document.getElementById('orderCustomerAddress') as HTMLInputElement | null
    )?.value.trim() || '';
    const shipVal =
      (document.getElementById('orderCustomerShipping') as HTMLSelectElement | null)?.value ||
      'PASO RETIRAR';
    const payVal =
      (document.getElementById('orderCustomerPayment') as HTMLSelectElement | null)?.value ||
      'Transferencia';

    if (!nameVal || !docVal || !phoneVal || !emailVal || !addrVal) {
      if (alertBox) {
        alertBox.textContent =
          'Por favor completa todos los campos obligatorios: Nombre, Cédula/RUC, Teléfono, Correo y Dirección.';
        alertBox.classList.remove('hidden');
      }
      return;
    }

    if (alertBox) alertBox.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.textContent = 'Registrando pedido...';

    const cart = getCart();
    cart.nombre_entrega = nameVal;
    cart.rut_entrega = docVal;
    cart.telefono_entrega = phoneVal;
    cart.correo_entrega = emailVal;
    cart.direccion_entrega = addrVal;
    cart.agencia_entrega = shipVal;
    cart.forma_pago = payVal;
    recalculateTotals(cart);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cart,
          op: 'venta',
          url: window.location.origin,
        }),
      });

      const resData = await response.json();
      if (resData.status === '0') {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(resData));
        clearCart();
        closeOrderModal();

        // Disparar ventana de WhatsApp hacia 593992576986 y redirigir inmediatamente a Página 3
        if (resData.whatsapp_url) {
          window.open(resData.whatsapp_url, '_blank', 'noopener,noreferrer');
        }
        window.location.href = `/pedido-confirmado?id=${encodeURIComponent(resData.idpedido)}`;
      } else {
        if (alertBox) {
          alertBox.textContent = resData.message || 'No se pudo procesar el pedido.';
          alertBox.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (alertBox) {
        alertBox.textContent =
          err instanceof Error ? err.message : 'Error de red al confirmar el pedido.';
        alertBox.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnText) submitBtnText.textContent = 'Confirmar Pedido y Enviar a WhatsApp';
    }
  });

  // ============================================================================
  // MODAL 1: DETALLE DE PRODUCTO Y SELECTOR DE VARIANTES / SUB-VARIANTES
  // ============================================================================
  const productDetailDialog = document.getElementById(
    'productDetailDialog'
  ) as HTMLDialogElement | null;
  let activeModalProduct: ProductoCatalogo | null = null;
  let activeVariantIndex = 0;
  let activeSubVariant = '';
  let activeModalQty = 1;

  const renderProductDetailModal = () => {
    if (!activeModalProduct) return;
    const prod = activeModalProduct;
    const variant = prod.variedad[activeVariantIndex] || prod.variedad[0];
    const minQty = Math.max(1, Number(variant.minima) || 1);
    if (activeModalQty < minQty) activeModalQty = minQty;

    const catBadge = document.getElementById('modalProductCategoryBadge');
    const refEl = document.getElementById('modalProductRef');
    const titleEl = document.getElementById('modalProductTitle');
    const descEl = document.getElementById('modalProductDescription');
    const minBadge = document.getElementById('modalMinQtyBadge');
    const mainImg = document.getElementById('modalMainProductImg') as HTMLImageElement | null;
    const thumbsContainer = document.getElementById('modalThumbnailsContainer');
    const selectedVarLabel = document.getElementById('modalSelectedVariantLabel');
    const activePriceEl = document.getElementById('modalActivePriceDisplay');
    const origPriceEl = document.getElementById('modalOriginalPriceDisplay');
    const variantsGrid = document.getElementById('modalVariantsGrid');
    const subVariantsSection = document.getElementById('modalSubVariantsSection');
    const subVariantsList = document.getElementById('modalSubVariantsList');
    const qtyValueEl = document.getElementById('modalQuantityValue');
    const ctaTotalEl = document.getElementById('modalCtaTotalPrice');

    if (catBadge) catBadge.textContent = `CATEGORÍA • ${prod.categoria}`;
    if (refEl) refEl.textContent = `Ref: ${prod.ref || `WG-00${prod.codigo}`}`;
    if (titleEl) titleEl.textContent = prod.nombre;
    if (descEl) descEl.textContent = prod.descripcion;
    if (minBadge) minBadge.textContent = `Cantidad Mínima: ${minQty}`;
    if (selectedVarLabel) {
      selectedVarLabel.textContent = `${variant.variedad}${activeSubVariant ? ` • ${activeSubVariant}` : ''}`;
    }
    if (activePriceEl) activePriceEl.textContent = `$${formatMoney(variant.precio)}`;
    if (origPriceEl) {
      const pvp = prod.pvp_original || Number((variant.precio * 1.5).toFixed(2));
      origPriceEl.textContent = `$${formatMoney(pvp)}`;
    }
    if (qtyValueEl) qtyValueEl.textContent = String(activeModalQty);
    if (ctaTotalEl) ctaTotalEl.textContent = `$${formatMoney(variant.precio * activeModalQty)}`;

    // Render Thumbnails
    const images = prod.imagenes?.length ? prod.imagenes : [prod.imagen];
    if (mainImg && !mainImg.dataset.userSelected) {
      mainImg.src = images[0];
      mainImg.alt = prod.nombre;
    }
    if (thumbsContainer) {
      thumbsContainer.innerHTML = images
        .map(
          (imgSrc, idx) => `
        <button
          type="button"
          data-thumb-src="${imgSrc}"
          aria-label="Ver imagen ${idx + 1} de ${prod.nombre}"
          class="w-16 h-16 rounded-xl bg-[#1a1c24] overflow-hidden p-1 relative transition-all ${
            (mainImg?.getAttribute('src') || images[0]) === imgSrc
              ? 'ring-2 ring-[#FF5722] scale-95'
              : 'border border-white/10 hover:border-white/30'
          }"
        >
          <img src="${imgSrc}" alt="${prod.nombre} vista ${idx + 1}" width="64" height="64" loading="lazy" class="w-full h-full object-contain rounded-lg" />
        </button>
      `
        )
        .join('');

      thumbsContainer.querySelectorAll<HTMLButtonElement>('[data-thumb-src]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const src = btn.dataset.thumbSrc;
          if (src && mainImg) {
            mainImg.src = src;
            mainImg.dataset.userSelected = 'true';
            renderProductDetailModal();
          }
        });
      });
    }

    // Render Variants Grid
    if (variantsGrid) {
      variantsGrid.innerHTML = prod.variedad
        .map((v, idx) => {
          const isSelected = idx === activeVariantIndex;
          return `
          <button
            type="button"
            data-variant-idx="${idx}"
            class="text-left p-3.5 rounded-xl transition-all flex items-center justify-between ${
              isSelected
                ? 'bg-[#FF5722]/15 ring-2 ring-[#FF5722] shadow-md shadow-orange-950/40'
                : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]'
            }"
          >
            <div class="flex flex-col">
              <span class="text-xs font-extrabold text-white">${v.variedad}</span>
              <span class="text-[11px] text-slate-400">Mínimo: ${v.minima || 1} u.</span>
            </div>
            <div class="text-right">
              <span class="text-sm font-black ${isSelected ? 'text-[#FF5722]' : 'text-white'}">$${formatMoney(v.precio)}</span>
            </div>
          </button>
        `;
        })
        .join('');

      variantsGrid.querySelectorAll<HTMLButtonElement>('[data-variant-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.variantIdx) || 0;
          activeVariantIndex = idx;
          const nextVar = prod.variedad[activeVariantIndex];
          const subs = nextVar?.sub_variedad
            ? nextVar.sub_variedad
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          activeSubVariant = subs[0] || '';
          activeModalQty = Math.max(1, Number(nextVar?.minima) || 1);
          renderProductDetailModal();
        });
      });
    }

    // Render Sub-variants (Variedades2)
    const subOptions = variant.sub_variedad
      ? variant.sub_variedad
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (subVariantsSection && subVariantsList) {
      if (subOptions.length === 0) {
        subVariantsSection.classList.add('hidden');
      } else {
        subVariantsSection.classList.remove('hidden');
        if (!activeSubVariant || !subOptions.includes(activeSubVariant)) {
          activeSubVariant = subOptions[0];
        }
        subVariantsList.innerHTML = subOptions
          .map((sub) => {
            const isSelected = sub === activeSubVariant;
            return `
            <button
              type="button"
              data-subvariant="${sub}"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#FF5722] text-white shadow-md shadow-orange-950/60'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }"
            >
              ${sub}
            </button>
          `;
          })
          .join('');

        subVariantsList.querySelectorAll<HTMLButtonElement>('[data-subvariant]').forEach((btn) => {
          btn.addEventListener('click', () => {
            activeSubVariant = btn.dataset.subvariant || '';
            renderProductDetailModal();
          });
        });
      }
    }
  };

  const openProductModal = (productCode: number) => {
    const found = allProducts.find((p) => Number(p.codigo) === Number(productCode));
    if (!found) return;
    activeModalProduct = found;
    activeVariantIndex = 0;
    const firstVar = found.variedad[0];
    const subs = firstVar?.sub_variedad
      ? firstVar.sub_variedad
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    activeSubVariant = subs[0] || '';
    activeModalQty = Math.max(1, Number(firstVar?.minima) || 1);

    const mainImg = document.getElementById('modalMainProductImg') as HTMLImageElement | null;
    if (mainImg) delete mainImg.dataset.userSelected;

    renderProductDetailModal();
    if (productDetailDialog && !productDetailDialog.open) {
      productDetailDialog.showModal();
    }
  };

  document.getElementById('closeProductModalBtn')?.addEventListener('click', () => {
    productDetailDialog?.close();
  });

  document.getElementById('modalQtyMinusBtn')?.addEventListener('click', () => {
    if (!activeModalProduct) return;
    const variant = activeModalProduct.variedad[activeVariantIndex] || activeModalProduct.variedad[0];
    const minQty = Math.max(1, Number(variant.minima) || 1);
    if (activeModalQty > minQty) {
      activeModalQty -= 1;
      renderProductDetailModal();
    }
  });

  document.getElementById('modalQtyPlusBtn')?.addEventListener('click', () => {
    activeModalQty += 1;
    renderProductDetailModal();
  });

  const buildCurrentModalCartItem = (): DetallePedidoItem | null => {
    if (!activeModalProduct) return null;
    const prod = activeModalProduct;
    const variant = prod.variedad[activeVariantIndex] || prod.variedad[0];
    const minQty = Math.max(1, Number(variant.minima) || 1);
    const qty = Math.max(minQty, activeModalQty);
    const fullVariantLabel = activeSubVariant
      ? `${variant.variedad} - ${activeSubVariant}`
      : variant.variedad;

    return {
      codigo: prod.codigo,
      nombre: `${prod.nombre} ( ${fullVariantLabel} )`,
      descripcion: prod.descripcion,
      categoria: prod.categoria,
      variante: variant.variedad,
      sub_variante: activeSubVariant,
      precio: Number(variant.precio),
      cantidad: qty,
      minima: minQty,
      moneda: variant.moneda || '$',
      imagen: prod.imagen,
      total: Number((Number(variant.precio) * qty).toFixed(2)),
      key_completo: `${prod.codigo}_${fullVariantLabel}_${variant.precio}`.replace(/\s+/g, ''),
    };
  };

  document.getElementById('modalAddToCartBtn')?.addEventListener('click', () => {
    const item = buildCurrentModalCartItem();
    if (!item) return;
    addOrUpdateCartItem(item);
    productDetailDialog?.close();
    toggleCartDrawer(true);
  });

  document.getElementById('modalBuyNowBtn')?.addEventListener('click', () => {
    const item = buildCurrentModalCartItem();
    if (!item) return;
    addOrUpdateCartItem(item);
    productDetailDialog?.close();
    openOrderModal();
  });

  // ============================================================================
  // RENDERIZADO REACTIVO DE BADGES, DRAWER Y TARJETAS DE CATÁLOGO
  // ============================================================================
  const renderCartUI = () => {
    const cart = getCart();
    const totalQty = cart.detalle.reduce((sum, i) => sum + i.cantidad, 0);

    const headerBadge = document.getElementById('headerCartCount');
    const bottomBadge = document.getElementById('bottomNavBadge');
    const drawerBadge = document.getElementById('drawerCartBadge');
    const drawerDelivery = document.getElementById('drawerDeliveryLabel');
    const drawerTotal = document.getElementById('drawerTotalPrice');
    const drawerList = document.getElementById('cartDrawerItemsList');

    if (headerBadge) headerBadge.textContent = String(totalQty);
    if (bottomBadge) bottomBadge.textContent = String(totalQty);
    if (drawerBadge) drawerBadge.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
    if (drawerDelivery) {
      drawerDelivery.textContent = `${cart.agencia_entrega} ($${formatMoney(cart.costo_envio || 0)})`;
    }
    if (drawerTotal) drawerTotal.textContent = `$${formatMoney(cart.subtotal || 0)}`;

    // Actualizar estado "EN CARRITO" en las tarjetas del catálogo
    document.querySelectorAll<HTMLElement>('[data-product-card]').forEach((card) => {
      const code = Number(card.dataset.productCard);
      const inCart = cart.detalle.some((i) => Number(i.codigo) === code);
      const inCartPill = card.querySelector('[data-in-cart-pill]');
      if (inCart) {
        card.classList.add('ring-1', 'ring-[#FF5722]/60');
        inCartPill?.classList.remove('hidden');
      } else {
        card.classList.remove('ring-1', 'ring-[#FF5722]/60');
        inCartPill?.classList.add('hidden');
      }
    });

    // Renderizar items del Cart Drawer
    if (drawerList) {
      if (cart.detalle.length === 0) {
        drawerList.innerHTML = `
          <div class="text-center py-12 px-4 space-y-3">
            <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
              🛍️
            </div>
            <p class="text-sm font-bold text-white">Tu carrito está vacío</p>
            <p class="text-xs text-slate-400">Explora nuestro catálogo Liquid Glass y agrega tus productos favoritos.</p>
          </div>
        `;
      } else {
        drawerList.innerHTML = cart.detalle
          .map(
            (item) => `
          <div class="glass-card rounded-2xl p-3.5 border border-white/10 flex gap-3 relative">
            <img
              src="${item.imagen}"
              alt="${item.nombre}"
              width="64"
              height="64"
              loading="lazy"
              class="w-16 h-16 rounded-xl bg-[#181a22] object-contain p-1 shrink-0 border border-white/5"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#FF5722]">${item.categoria} • Mín: ${item.minima}</span>
                <h3 class="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">${item.nombre}</h3>
                <span class="text-sm font-black text-[#FF5722] mt-0.5 block">$${formatMoney(item.total)} <span class="text-[10px] font-normal text-slate-400">($${formatMoney(item.precio)} c/u)</span></span>
              </div>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div class="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
                  <button
                    type="button"
                    data-drawer-qty-key="${item.key_completo}"
                    data-drawer-qty-delta="-1"
                    aria-label="Restar cantidad"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold"
                  >−</button>
                  <span class="w-7 text-center font-bold text-xs text-white">${item.cantidad}</span>
                  <button
                    type="button"
                    data-drawer-qty-key="${item.key_completo}"
                    data-drawer-qty-delta="1"
                    aria-label="Sumar cantidad"
                    class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold"
                  >+</button>
                </div>
                <button
                  type="button"
                  data-drawer-remove-key="${item.key_completo}"
                  aria-label="Eliminar producto del carrito"
                  class="text-xs font-semibold text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        `
          )
          .join('');

        drawerList.querySelectorAll<HTMLButtonElement>('[data-drawer-qty-key]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const key = btn.dataset.drawerQtyKey || '';
            const delta = Number(btn.dataset.drawerQtyDelta) || 0;
            updateCartItemQty(key, delta);
          });
        });

        drawerList
          .querySelectorAll<HTMLButtonElement>('[data-drawer-remove-key]')
          .forEach((btn) => {
            btn.addEventListener('click', () => {
              const key = btn.dataset.drawerRemoveKey || '';
              removeCartItem(key);
            });
          });
      }
    }
  };

  // Global Event Delegation for Action Buttons
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'toggle-sidebar') {
      toggleSidebar();
    } else if (action === 'close-sidebar') {
      toggleSidebar(false);
    } else if (action === 'open-cart-drawer') {
      toggleCartDrawer(true);
    } else if (action === 'close-cart-drawer') {
      toggleCartDrawer(false);
    } else if (action === 'open-order-modal') {
      openOrderModal();
    } else if (action === 'open-product-modal') {
      const code = Number(target.dataset.productCode);
      openProductModal(code);
    } else if (action === 'quick-add-product') {
      e.stopPropagation();
      const code = Number(target.dataset.productCode);
      openProductModal(code);
    } else if (action === 'focus-search') {
      const searchInput = document.getElementById('catalogSearchInput') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInput.focus();
      } else {
        window.location.href = '/#catalogSearchInput';
      }
    }
  });

  // Soporte de parámetros heredados de index.txt (?o=d&id=UUID, ?o=e&id=UUID, ?o=p&id=UUID)
  const urlParams = new URLSearchParams(window.location.search);
  const opParam = urlParams.get('o');
  const idParam = urlParams.get('id');

  if (idParam && (opParam === 'd' || opParam === 'p') && window.location.pathname === '/') {
    window.location.href = `/pedido-confirmado?id=${encodeURIComponent(idParam)}${opParam === 'p' ? '&o=p' : ''}`;
    return;
  }

  if (idParam && opParam === 'e') {
    fetch(`/api/orders/${encodeURIComponent(idParam)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === '0' && res.pedido) {
          const editedCart: VentaPayload = {
            ...res.pedido,
            operacion: 'e',
            id: idParam,
          };
          saveCart(editedCart);
          const editBanner = document.getElementById('editModeBanner');
          const editBannerId = document.getElementById('editModeOrderId');
          if (editBanner) editBanner.classList.remove('hidden');
          if (editBannerId) editBannerId.textContent = idParam;
        }
      })
      .catch(() => {});
  }

  window.addEventListener('wigoo:cart-updated', renderCartUI);
  renderCartUI();
}

