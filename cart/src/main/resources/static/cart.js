// ─── CONFIG ───
const API_CART    = "/api/cart";           // tuo gateway → cart microservice
const API_CATALOG = "http://localhost:8082/cards"; // catalog microservice
const API_LISTING = "http://localhost:8084/listings"; // listing microservice

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
let catalogMap = {};   // cardId → { name, imageUrl, setName, rarity, ... }

async function loadCatalog() {
    try {
        const res = await fetch(API_CATALOG);
        if (!res.ok) return;
        const cards = await res.json();
        cards.forEach(c => { catalogMap[c.id] = c; });
    } catch (err) {
        console.warn("Catalog non raggiungibile:", err);
    }
}

// ─── CONDITION CHIP ───
function conditionChipClass(cond) {
    if (!cond) return 'chip-cond-nm';
    const c = cond.toLowerCase();
    if (c.includes('near'))     return 'chip-cond-nm';
    if (c.includes('lightly'))  return 'chip-cond-lp';
    if (c.includes('moderate')) return 'chip-cond-mp';
    if (c.includes('heavily'))  return 'chip-cond-hp';
    return 'chip-cond-nm';
}

// ─── RENDER CART ───
function renderCart(items) {
    const list       = document.getElementById("cartList");
    const emptyState = document.getElementById("emptyState");
    const summary    = document.getElementById("cartSummary");
    const stats      = document.getElementById("cartStats");
    const badge      = document.getElementById("cartBadge");

    list.innerHTML = "";

    const activeItems = items || [];
    const totalItems  = activeItems.length;
    const totalPrice  = activeItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);

    // Badge navbar
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }

    // Stats subtitle
    stats.textContent = totalItems === 0
        ? "Il carrello è vuoto"
        : `${totalItems} articol${totalItems === 1 ? 'o' : 'i'} · € ${totalPrice.toFixed(2)}`;

    if (totalItems === 0) {
        emptyState.style.display = "flex";
        summary.style.display    = "none";
        return;
    }

    emptyState.style.display = "none";
    summary.style.display    = "flex";

    // Summary
    document.getElementById("summaryCount").textContent = totalItems;
    document.getElementById("summaryTotal").textContent = `€ ${totalPrice.toFixed(2)}`;

    // Items
    activeItems.forEach((item, idx) => {
        const catalog = catalogMap[item.cardId] || {};

        const imageUrl = catalog.imageUrl || "";
        const setName  = catalog.setName  || "—";
        const name     = catalog.name     || "Carta sconosciuta";
        const qty      = item.quantity    || 1;
        const lineTotal = (item.price * qty).toFixed(2);

        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.style.animationDelay = `${idx * 60}ms`;

        div.innerHTML = `
            <img class="cart-item-img"
                 src="${imageUrl}"
                 alt="${name}"
                 onerror="this.style.opacity='0.3'">

            <div class="cart-item-info">
                <div class="cart-item-name">${name}</div>
                <div class="cart-item-set">${setName}</div>
                <div class="cart-item-meta">
                    <span class="meta-chip ${conditionChipClass(item.condition)}">${item.condition || 'N/D'}</span>
                    <span class="meta-chip chip-qty">Qtà: ${qty}</span>
                </div>
                <div class="cart-item-price">
                    € ${lineTotal}
                    ${qty > 1 ? `<span>(${qty} × € ${item.price.toFixed(2)} cad.)</span>` : ''}
                </div>
            </div>

            <button class="btn-remove" data-listing="${item.listingId}" title="Rimuovi">✕</button>
        `;

        div.querySelector(".btn-remove").addEventListener("click", () => removeItem(item.listingId));
        list.appendChild(div);
    });
}

// ─── LOAD CART ───
async function loadCart() {
    try {
        const res = await fetch(API_CART, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "username": username
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cart = await res.json();
        renderCart(cart.items || []);
    } catch (err) {
        console.error("Errore loadCart:", err);
    }
}

// ─── REMOVE ITEM ───
async function removeItem(listingId) {
    try {
        await fetch(`${API_CART}/${listingId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "username": username
            }
        });
        // Release the listing back to ACTIVE so others can see it
        await fetch(`${API_LISTING}/${listingId}/release`, { method: "PATCH" }).catch(() => {});
        await loadCart();
    } catch (err) {
        console.error("Errore removeItem:", err);
    }
}

// ─── CLEAR CART ───
document.getElementById("clearCartBtn").addEventListener("click", async () => {
    if (!confirm("Svuotare il carrello?")) return;
    try {
        // Release all reserved listings before clearing
        const cartRes = await fetch(API_CART, {
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        if (cartRes.ok) {
            const cart = await cartRes.json();
            await Promise.all((cart.items || []).map(item =>
                fetch(`${API_LISTING}/${item.listingId}/release`, { method: "PATCH" }).catch(() => {})
            ));
        }
        await fetch(`${API_CART}/clear`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        await loadCart();
    } catch (err) {
        console.error("Errore clearCart:", err);
    }
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

// ─── DEBUG PANEL ───
const debugToggle = document.getElementById("debugToggle");
const debugBody   = document.getElementById("debugBody");
const debugArrow  = document.getElementById("debugArrow");

debugToggle.addEventListener("click", () => {
    const open = debugBody.classList.toggle("open");
    debugArrow.classList.toggle("open", open);
});

document.getElementById("debugAdd").addEventListener("click", async () => {
    const feedback = document.getElementById("debugFeedback");

    const listingId = document.getElementById("dbListingId").value.trim();
    const cardId    = document.getElementById("dbCardId").value.trim();
    const name      = document.getElementById("dbName").value.trim();
    const sellerId  = document.getElementById("dbSellerId").value.trim();
    const condition = document.getElementById("dbCondition").value;
    const price     = parseFloat(document.getElementById("dbPrice").value) || 0;
    const quantity  = parseInt(document.getElementById("dbQuantity").value)  || 1;

    if (!listingId || !cardId) {
        feedback.textContent = "⚠ Listing ID e Card ID sono obbligatori";
        feedback.className   = "debug-feedback err";
        return;
    }

    const payload = { listingId, cardId, name, sellerId, condition, price, quantity };

    try {
        const res = await fetch(`${API_CART}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "username": username
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        feedback.textContent = "✓ Carta aggiunta al carrello";
        feedback.className   = "debug-feedback ok";
        setTimeout(() => { feedback.textContent = ""; }, 3000);

        await loadCart();
    } catch (err) {
        console.error("Debug add error:", err);
        feedback.textContent = `✕ Errore: ${err.message}`;
        feedback.className   = "debug-feedback err";
    }
});

// ─── INIT ───
(async () => {
    await loadCatalog();
    await loadCart();
})();