// ─── CONFIG ───
const API_CART    = "/api/cart";
const API_CATALOG = "http://localhost:8082/cards";
const API_LISTING = "http://localhost:8084/listings";
const SHIPPING    = 3.00;  // € per venditore (preview)

// ─── AUTH ───
const token = localStorage.getItem("jwtToken");
if (!token) window.location.href = "http://localhost:8080/login.html";

function getUsernameFromToken(t) {
    try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        return payload.sub || payload.username || 'Utente';
    } catch { return 'Utente'; }
}

const username = getUsernameFromToken(token);
document.getElementById("usernameDisplay").textContent = `👤 ${username}`;

// ─── CATALOG CACHE ───
let catalogMap = {};

async function loadCatalog() {
    try {
        const res = await fetch(API_CATALOG);
        if (!res.ok) return;
        const cards = await res.json();
        cards.forEach(c => { catalogMap[c.id] = c; });
    } catch (err) { console.warn("Catalog non raggiungibile:", err); }
}

// ─── CONDITION CHIP CLASS ───
function conditionChipClass(cond) {
    if (!cond) return 'chip-cond-default';
    const c = cond.toLowerCase().trim();

    if (c === 'mint') return 'chip-cond-mint';
    if (c === 'near mint') return 'chip-cond-near-mint';
    if (c === 'excellent') return 'chip-cond-excellent';
    if (c === 'good') return 'chip-cond-good';
    if (c === 'played') return 'chip-cond-played';
    if (c === 'poor') return 'chip-cond-poor';

    return 'chip-cond-default';
}

// ─── RENDER CART (grouped by seller) ───
function renderCart(items) {
    const list       = document.getElementById("cartList");
    const emptyState = document.getElementById("emptyState");
    const summary    = document.getElementById("cartSummary");
    const stats      = document.getElementById("cartStats");
    const badge      = document.getElementById("cartBadge");

    list.innerHTML = "";

    const activeItems = items || [];
    const totalItems  = activeItems.length;
    const subtotal    = activeItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);

    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }

    stats.textContent = totalItems === 0
        ? "Il carrello è vuoto"
        : `${totalItems} articol${totalItems === 1 ? 'o' : 'i'} · € ${subtotal.toFixed(2)}`;

    if (totalItems === 0) {
        emptyState.style.display = "flex";
        summary.style.display    = "none";
        return;
    }

    emptyState.style.display = "none";
    summary.style.display    = "flex";

    // ─── GROUP BY SELLER ───
    const groups = {};
    activeItems.forEach(item => {
        const sid = item.sellerId || "sconosciuto";
        if (!groups[sid]) groups[sid] = [];
        groups[sid].push(item);
    });

    const sellers       = Object.keys(groups);
    const numSellers    = sellers.length;
    const totalShipping = numSellers * SHIPPING;
    const grandTotal    = subtotal + totalShipping;

    document.getElementById("summaryCount").textContent       = totalItems;
    document.getElementById("summarySellerCount").textContent = numSellers;
    document.getElementById("summaryShipping").textContent    = `€ ${totalShipping.toFixed(2)}`;
    document.getElementById("summaryTotal").textContent       = `€ ${grandTotal.toFixed(2)}`;

    // ─── RENDER GROUPS ───
    sellers.forEach((sellerId, si) => {
        const sellerItems    = groups[sellerId];
        const sellerSubtotal = sellerItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);

        const groupEl = document.createElement("div");
        groupEl.classList.add("cart-seller-group");
        groupEl.style.animationDelay = `${si * 70}ms`;

        groupEl.innerHTML = `
            <div class="cart-seller-header">
                <span class="cart-seller-name">🏪 ${sellerId}</span>
                <span class="cart-seller-shipping">+ € ${SHIPPING.toFixed(2)} spedizione</span>
            </div>
            <div class="cart-seller-items" id="seller-items-${si}"></div>
            <div class="cart-seller-footer">
                <span>Subtotale venditore</span>
                <span class="cart-seller-total">€ ${(sellerSubtotal + SHIPPING).toFixed(2)}</span>
            </div>
        `;

        const itemsContainer = groupEl.querySelector(`#seller-items-${si}`);

        sellerItems.forEach((item, idx) => {
            const catalog  = catalogMap[item.cardId] || {};
            const imageUrl = catalog.imageUrl || "";
            const setName  = catalog.setName  || "—";
            const name     = catalog.name     || "Carta sconosciuta";
            const qty      = item.quantity    || 1;
            const lineTotal = (item.price * qty).toFixed(2);

            const itemEl = document.createElement("div");
            itemEl.classList.add("cart-item");
            itemEl.style.animationDelay = `${idx * 40}ms`;

            itemEl.innerHTML = `
                <img class="cart-item-img"
                     src="${imageUrl}" alt="${name}"
                     onerror="this.style.opacity='0.3'">

                <div class="cart-item-info">
                    <div class="cart-item-name">${name}</div>
                    <div class="cart-item-set">${setName}</div>
                    <div class="cart-item-meta">
                        <span class="meta-chip ${conditionChipClass(item.condition)}">${item.condition || 'N/D'}</span>
                    </div>
                    <div class="cart-item-price">
                        € ${lineTotal}
                        <span>(${qty} × € ${Number(item.price).toFixed(2)} cad.)</span>
                    </div>
                </div>

                <div class="cart-item-controls">
                    <div class="cart-qty-row">
                        <label class="cart-qty-label">Qtà</label>
                        <div class="cart-qty-wrap">
                            <button class="qty-btn qty-minus">−</button>
                            <input type="number"
                                class="cart-qty-input"
                                id="cart-qty-${item.listingId}"
                                value="${qty}" min="1"
                                data-original="${qty}">
                            <button class="qty-btn qty-plus">+</button>
                        </div>
                        <button class="btn-qty-confirm"
                            id="confirm-qty-${item.listingId}"
                            style="display:none"
                            title="Conferma modifica">✓</button>
                    </div>
                    <button class="btn-remove" title="Rimuovi dal carrello">Rimuovi</button>
                </div>
            `;

            const qtyInput   = itemEl.querySelector(".cart-qty-input");
            const confirmBtn = itemEl.querySelector(".btn-qty-confirm");
            const removeBtn  = itemEl.querySelector(".btn-remove");

            // Show/hide confirm button
            const checkChanged = () => {
                const newVal = parseInt(qtyInput.value);
                confirmBtn.style.display = (newVal >= 1 && newVal !== qty) ? "flex" : "none";
            };

            itemEl.querySelector(".qty-minus").addEventListener("click", () => {
                if (parseInt(qtyInput.value) > 1) { qtyInput.value = parseInt(qtyInput.value) - 1; checkChanged(); }
            });
            itemEl.querySelector(".qty-plus").addEventListener("click", () => {
                qtyInput.value = parseInt(qtyInput.value) + 1; checkChanged();
            });
            qtyInput.addEventListener("input", checkChanged);

            // ── CONFIRM QTY UPDATE ──
            confirmBtn.addEventListener("click", async () => {
                const newQty = parseInt(qtyInput.value);
                if (isNaN(newQty) || newQty < 1) {
                    qtyInput.value = qty; checkChanged(); return;
                }
                const delta = newQty - qty;
                confirmBtn.disabled = true;
                confirmBtn.textContent = "…";

                try {
                    if (delta > 0) {
                        // Need more → reserve additional
                        const rr = await fetch(`${API_LISTING}/${item.listingId}/reserve?qty=${delta}`, { method: "PATCH" });
                        if (!rr.ok) throw new Error("Quantità non disponibile nell'annuncio");
                    } else if (delta < 0) {
                        // Need fewer → release difference
                        await fetch(`${API_LISTING}/${item.listingId}/release?qty=${Math.abs(delta)}`, { method: "PATCH" }).catch(() => {});
                    }

                    // Remove old cart entry and re-add with new qty
                    await fetch(`${API_CART}/${item.listingId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}`, "username": username }
                    });
                    await fetch(`${API_CART}/add`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                            "username": username
                        },
                        body: JSON.stringify({
                            listingId:  item.listingId,
                            cardId:     item.cardId,
                            sellerId:   item.sellerId,
                            condition:  item.condition,
                            price:      item.price,
                            quantity:   newQty
                        })
                    });

                    await loadCart();

                } catch (err) {
                    alert("Errore: " + err.message);
                    qtyInput.value = qty;
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = "✓";
                    checkChanged();
                }
            });

            // ── REMOVE ──
            removeBtn.addEventListener("click", () => removeItem(item.listingId, qty));

            itemsContainer.appendChild(itemEl);
        });

        list.appendChild(groupEl);
    });
}

// ─── LOAD CART ───
async function loadCart() {
    try {
        const res = await fetch(API_CART, {
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cart = await res.json();
        renderCart(cart.items || []);
    } catch (err) { console.error("Errore loadCart:", err); }
}

// ─── REMOVE ITEM ─── (passes the exact qty so listing gets it back)
async function removeItem(listingId, qtyInCart) {
    try {
        await fetch(`${API_CART}/${listingId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        // Release the exact quantity reserved for this cart item
        await fetch(`${API_LISTING}/${listingId}/release?qty=${qtyInCart}`, { method: "PATCH" }).catch(() => {});
        await loadCart();
    } catch (err) { console.error("Errore removeItem:", err); }
}

// ─── CLEAR CART ───
document.getElementById("clearCartBtn").addEventListener("click", async () => {
    if (!confirm("Svuotare il carrello?")) return;
    try {
        const cartRes = await fetch(API_CART, {
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        if (cartRes.ok) {
            const cart = await cartRes.json();
            // Release each item with its specific quantity
            await Promise.all((cart.items || []).map(item =>
                fetch(`${API_LISTING}/${item.listingId}/release?qty=${item.quantity || 1}`, { method: "PATCH" }).catch(() => {})
            ));
        }
        await fetch(`${API_CART}/clear`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        await loadCart();
    } catch (err) { console.error("Errore clearCart:", err); }
});

// ─── CHECKOUT ───
document.getElementById("checkoutBtn").addEventListener("click", () => {
    window.location.href = "http://localhost:8085/checkout.html";
});

// ─── LOGOUT ───
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "http://localhost:8080/login.html";
});

// ─── INIT ───
(async () => {
    await loadCatalog();
    await loadCart();
})();