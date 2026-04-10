// ─── CONFIG ───
const API_ORDER   = "http://localhost:8086/api/orders";
const API_CART    = "http://localhost:8087/api/cart";
const API_CATALOG = "http://localhost:8082/cards";
const API_USER    = "http://localhost:8081/api/user";

// ─── AUTH ───
const token = localStorage.getItem("jwtToken");
if (!token) window.location.href = "http://localhost:8080/login.html";

function extractUsername(t) {
    try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        return payload.sub || payload.username || 'Utente';
    } catch { return 'Utente'; }
}

const username = extractUsername(token);
document.getElementById("usernameDisplay").textContent = `👤 ${username}`;

// ─── STATE ───
let catalogMap  = {};
let purchases   = [];
let sales       = [];
let pendingConfirmId  = null;   // orderId in attesa di conferma modal
let pendingSellerUsername = null; // sellerUsername per la recensione

// ─── CATALOG ───
async function loadCatalog() {
    try {
        const res = await fetch(API_CATALOG);
        if (!res.ok) return;
        const cards = await res.json();
        cards.forEach(c => { catalogMap[c.id] = c; });
    } catch { console.warn("Catalog non raggiungibile"); }
}

// ─── LOAD ORDERS ───
async function loadPurchases() {
    try {
        const res = await fetch(`${API_ORDER}/purchases`, {
            headers: { "username": username, "Authorization": `Bearer ${token}` }
        });
        purchases = res.ok ? await res.json() : [];
    } catch { purchases = []; }
}

async function loadSales() {
    try {
        const res = await fetch(`${API_ORDER}/sales`, {
            headers: { "username": username, "Authorization": `Bearer ${token}` }
        });
        sales = res.ok ? await res.json() : [];
    } catch { sales = []; }
}

// ─── CART BADGE ───
async function loadCartBadge() {
    try {
        const res = await fetch(API_CART, {
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        if (!res.ok) return;
        const cart  = await res.json();
        const count = (cart.items || []).length;
        const badge = document.getElementById("cartBadge");
        if (count > 0) { badge.textContent = count; badge.removeAttribute("style"); }
    } catch { /* silent */ }
}

// ─── FORMAT DATE ───
function formatDate(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return d.toLocaleDateString("it-IT", { day:"2-digit", month:"short", year:"numeric" });
}

// ─── STATUS BADGE ───
function statusBadge(status) {
    if (status === "COMPLETATO") {
        return `<span class="status-badge status-completato">✓ Completato</span>`;
    }
    return `<span class="status-badge status-in-attesa">⏳ In attesa</span>`;
}

// ─── BUILD ORDER CARD (PURCHASE) ───
function buildPurchaseCard(order, idx) {
    const card = document.createElement("div");
    card.classList.add("order-card");
    card.style.animationDelay = `${idx * 60}ms`;

    const canConfirm = order.status === "IN_ATTESA";
    const confirmBtn = canConfirm
        ? `<button class="btn-confirm-receipt" data-id="${order.id}">Conferma ricezione</button>`
        : '';

    card.innerHTML = `
        <div class="order-header">
            <div class="order-header-left">
                <span class="order-id">Ordine #${order.id}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
                <span class="order-counterpart">Venduto da <strong>${order.sellerUsername}</strong></span>
            </div>
            <div class="order-header-right">
                ${statusBadge(order.status)}
                ${confirmBtn}
            </div>
        </div>
        <div class="order-items" id="items-p-${order.id}"></div>
        <div class="order-footer">
            <span class="order-footer-address">📍 ${order.buyerAddress || "Indirizzo non disponibile"}</span>
            <span class="order-footer-total">
                Totale: € ${order.totalPrice.toFixed(2)} + € ${order.shippingCost.toFixed(2)} spedizione
                = <strong>€ ${order.finalPrice.toFixed(2)}</strong>
            </span>
        </div>
    `;

    // Render items
    const itemsContainer = card.querySelector(`#items-p-${order.id}`);
    (order.items || []).forEach(item => {
        const cat = catalogMap[item.cardId] || {};
        const img = cat.imageUrl || "";
        const set = cat.setName  || "";
        const qty = item.quantity || 1;
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
            <img class="order-item-img" src="${img}" alt="${item.cardName}"
                 onerror="this.style.opacity='0.3'">
            <div class="order-item-info">
                <div class="order-item-name">${item.cardName || cat.name || "Carta sconosciuta"}</div>
                <div class="order-item-meta">
                    ${set}${item.condition ? ' · ' + item.condition : ''}${qty > 1 ? ' · Qtà: ' + qty : ''}
                </div>
            </div>
            <div class="order-item-price">€ ${(item.price * qty).toFixed(2)}</div>
        `;
        itemsContainer.appendChild(div);
    });

    // Confirm button listener
    if (canConfirm) {
        card.querySelector(".btn-confirm-receipt").addEventListener("click", () => {
            pendingConfirmId      = order.id;
            pendingSellerUsername = order.sellerUsername;
            document.getElementById("confirmModal").style.display = "flex";
        });
    }

    return card;
}

// ─── BUILD ORDER CARD (SALE) ───
// Stesso ma SENZA indirizzo e SENZA pulsante conferma
function buildSaleCard(order, idx) {
    const card = document.createElement("div");
    card.classList.add("order-card");
    card.style.animationDelay = `${idx * 60}ms`;

    card.innerHTML = `
        <div class="order-header">
            <div class="order-header-left">
                <span class="order-id">Ordine #${order.id}</span>
                <span class="order-date">${formatDate(order.createdAt)}</span>
                <span class="order-counterpart">Acquistato da <strong>${order.buyerUsername}</strong></span>
            </div>
            <div class="order-header-right">
                ${statusBadge(order.status)}
            </div>
        </div>
        <div class="order-items" id="items-s-${order.id}"></div>
        <div class="order-footer">
            <span></span>
            <span class="order-footer-total">
                Totale: € ${order.totalPrice.toFixed(2)} + € ${order.shippingCost.toFixed(2)} spedizione
                = <strong>€ ${order.finalPrice.toFixed(2)}</strong>
            </span>
        </div>
    `;

    const itemsContainer = card.querySelector(`#items-s-${order.id}`);
    (order.items || []).forEach(item => {
        const cat = catalogMap[item.cardId] || {};
        const img = cat.imageUrl || "";
        const set = cat.setName  || "";
        const qty = item.quantity || 1;
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
            <img class="order-item-img" src="${img}" alt="${item.cardName}"
                 onerror="this.style.opacity='0.3'">
            <div class="order-item-info">
                <div class="order-item-name">${item.cardName || cat.name || "Carta sconosciuta"}</div>
                <div class="order-item-meta">
                    ${set}${item.condition ? ' · ' + item.condition : ''}${qty > 1 ? ' · Qtà: ' + qty : ''}
                </div>
            </div>
            <div class="order-item-price">€ ${(item.price * qty).toFixed(2)}</div>
        `;
        itemsContainer.appendChild(div);
    });

    return card;
}

// ─── RENDER ───
function renderPurchases() {
    const list  = document.getElementById("purchasesList");
    const empty = document.getElementById("emptyPurchases");
    const count = document.getElementById("purchasesCount");

    list.innerHTML = "";
    count.textContent = purchases.length;

    if (purchases.length === 0) { empty.style.display = "flex"; return; }
    empty.style.display = "none";
    purchases.forEach((o, i) => list.appendChild(buildPurchaseCard(o, i)));
}

function renderSales() {
    const list  = document.getElementById("salesList");
    const empty = document.getElementById("emptySales");
    const count = document.getElementById("salesCount");

    list.innerHTML = "";
    count.textContent = sales.length;

    if (sales.length === 0) { empty.style.display = "flex"; return; }
    empty.style.display = "none";
    sales.forEach((o, i) => list.appendChild(buildSaleCard(o, i)));
}

// ─── TABS ───
document.getElementById("tabPurchases").addEventListener("click", () => {
    document.getElementById("tabPurchases").classList.add("active");
    document.getElementById("tabSales").classList.remove("active");
    document.getElementById("panelPurchases").style.display = "block";
    document.getElementById("panelSales").style.display     = "none";
});

document.getElementById("tabSales").addEventListener("click", () => {
    document.getElementById("tabSales").classList.add("active");
    document.getElementById("tabPurchases").classList.remove("active");
    document.getElementById("panelSales").style.display     = "block";
    document.getElementById("panelPurchases").style.display = "none";
});

// ─── CONFIRM MODAL ───
document.getElementById("modalCancelBtn").addEventListener("click", () => {
    document.getElementById("confirmModal").style.display = "none";
    pendingConfirmId = null;
});

document.getElementById("modalConfirmBtn").addEventListener("click", async () => {
    if (!pendingConfirmId) return;

    const confirmBtn = document.getElementById("modalConfirmBtn");
    confirmBtn.disabled    = true;
    confirmBtn.textContent = "Elaborazione…";

    try {
        const res = await fetch(`${API_ORDER}/${pendingConfirmId}/confirm`, {
            method: "PUT",
            headers: { "username": username, "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Errore conferma");

        document.getElementById("confirmModal").style.display = "none";

        // Ricarica acquisti aggiornati
        await loadPurchases();
        renderPurchases();

        // Show rating modal
        selectedRating = 0;
        updateStarUI(0);
        document.getElementById("ratingSubmitBtn").disabled = true;
        document.getElementById("ratingModal").style.display = "flex";

    } catch (err) {
        alert("Errore durante la conferma: " + err.message);
        pendingConfirmId = null;
    } finally {
        confirmBtn.disabled    = false;
        confirmBtn.textContent = "Sì, confermo";
    }
});

// Chiudi modal cliccando fuori
document.getElementById("confirmModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("confirmModal")) {
        document.getElementById("confirmModal").style.display = "none";
        pendingConfirmId = null;
    }
});

// ─── LOGOUT ───
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "http://localhost:8080/login.html";
});


// ─── RATING MODAL ───
let selectedRating = 0;

function updateStarUI(hoverVal) {
    document.querySelectorAll(".rating-star").forEach(star => {
        const val = parseInt(star.dataset.value);
        star.style.color     = val <= (hoverVal || selectedRating) ? "#fbbf24" : "rgba(122,163,212,0.3)";
        star.style.transform = val <= (hoverVal || selectedRating) ? "scale(1.15)" : "scale(1)";
    });
    const labels = ["", "Pessimo", "Scarso", "Nella media", "Buono", "Eccellente"];
    document.getElementById("ratingHint").textContent =
        hoverVal ? labels[hoverVal] : (selectedRating ? labels[selectedRating] : "Passa il mouse sulle stelle per selezionare");
}

document.querySelectorAll(".rating-star").forEach(star => {
    star.addEventListener("mouseover", () => updateStarUI(parseInt(star.dataset.value)));
    star.addEventListener("mouseout",  () => updateStarUI(0));
    star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        updateStarUI(0);
        document.getElementById("ratingSubmitBtn").disabled = false;
    });
});

document.getElementById("ratingSubmitBtn").addEventListener("click", async () => {
    if (!selectedRating || !pendingSellerUsername) return;
    try {
        await fetch(`${API_USER}/rate/${pendingSellerUsername}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ stars: selectedRating })
        });
    } catch (err) {
        console.warn("Errore invio recensione:", err);
    } finally {
        document.getElementById("ratingModal").style.display = "none";
        pendingConfirmId      = null;
        pendingSellerUsername = null;
        selectedRating        = 0;
    }
});

document.getElementById("ratingSkipBtn").addEventListener("click", () => {
    document.getElementById("ratingModal").style.display = "none";
    pendingConfirmId      = null;
    pendingSellerUsername = null;
    selectedRating        = 0;
});

// Close rating modal on backdrop click
document.getElementById("ratingModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("ratingModal")) {
        document.getElementById("ratingModal").style.display = "none";
        pendingConfirmId = null; pendingSellerUsername = null;
    }
});

// ─── INIT ───
(async () => {
    await Promise.all([loadCatalog(), loadPurchases(), loadSales(), loadCartBadge()]);
    renderPurchases();
    renderSales();
})();