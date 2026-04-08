// ─── CONFIG ───
const API_CART    = "http://localhost:8087/api/cart";
const API_PAYMENT = "http://localhost:8085/api/payment";
const API_CATALOG = "http://localhost:8082/cards";
const API_ORDER   = "http://localhost:8086/api/orders";
const API_USER    = "http://localhost:8081/api/user";
const SHIPPING_COST  = 3.00;
const POINTS_TO_EURO = 0.01;   // 1 punto = € 0.01

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
let cartItems      = [];
let catalogMap     = {};
let walletBalance  = 0;
let loyaltyPoints  = 0;
let pointsUsed     = 0;
let grandTotal     = 0;
let totalShipping  = 0;
let subtotalGlobal = 0;
let userProfile    = null;

// ─── CATALOG ───
async function loadCatalog() {
    try {
        const res = await fetch(API_CATALOG);
        if (!res.ok) return;
        const cards = await res.json();
        cards.forEach(c => { catalogMap[c.id] = c; });
    } catch (err) { console.warn("Catalog non raggiungibile:", err); }
}

// ─── CART ───
async function loadCart() {
    try {
        const res = await fetch(API_CART, {
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cart = await res.json();
        cartItems = cart.items || [];
    } catch (err) { console.error("Errore loadCart:", err); cartItems = []; }
}

// ─── WALLET (balance + points dal DB) ───
async function loadWallet() {
    try {
        const res = await fetch(`${API_PAYMENT}/wallet`, {
            headers: { "username": username }
        });
        if (!res.ok) return;
        const wallet  = await res.json();
        walletBalance = wallet.balance || 0;
        loyaltyPoints = wallet.points  || 0;
    } catch (err) { console.warn("Wallet non raggiungibile:", err); }
}

// ─── CART BADGE ───
function updateBadge() {
    const badge = document.getElementById("cartBadge");
    if (cartItems.length > 0) {
        badge.textContent = cartItems.length;
        badge.removeAttribute("style");
    } else {
        badge.style.display = "none";
    }
}

// ─── GROUP BY SELLER ───
function groupBySeller() {
    const groups = {};
    cartItems.forEach(item => {
        const sid = item.sellerId || "sconosciuto";
        if (!groups[sid]) groups[sid] = [];
        groups[sid].push(item);
    });
    return groups;
}

// ─── RENDER ───
function render() {
    const container  = document.getElementById("sellerGroups");
    const emptyState = document.getElementById("emptyState");
    const payPanel   = document.getElementById("paymentPanel");

    updateBadge();

    if (cartItems.length === 0) {
        emptyState.style.display = "flex";
        payPanel.style.display   = "none";
        return;
    }

    emptyState.style.display = "none";
    payPanel.style.display   = "flex";

    const groups  = groupBySeller();
    const sellers = Object.keys(groups);
    totalShipping = sellers.length * SHIPPING_COST;

    let subtotal = 0;
    container.innerHTML = "";

    sellers.forEach((sellerId, si) => {
        const items     = groups[sellerId];
        const sellerSub = items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
        subtotal += sellerSub;

        const group = document.createElement("div");
        group.classList.add("seller-group");
        group.style.animationDelay = `${si * 80}ms`;

        group.innerHTML = `
            <div class="seller-header">
                <span class="seller-name">🏪 ${sellerId}</span>
                <span class="seller-shipping">+ € ${SHIPPING_COST.toFixed(2)} spedizione</span>
            </div>
            <div class="seller-items" id="items-${si}"></div>
            <div class="seller-footer">
                <span>Subtotale venditore</span>
                <span class="seller-footer-total">€ ${(sellerSub + SHIPPING_COST).toFixed(2)}</span>
            </div>
        `;

        const itemsEl = group.querySelector(`#items-${si}`);
        items.forEach(item => {
            const cat  = catalogMap[item.cardId] || {};
            const name = cat.name     || "Carta sconosciuta";
            const img  = cat.imageUrl || "";
            const set  = cat.setName  || "";
            const qty  = item.quantity || 1;

            const div = document.createElement("div");
            div.classList.add("checkout-item");
            div.innerHTML = `
                <img class="checkout-item-img" src="${img}" alt="${name}"
                     onerror="this.style.opacity='0.3'">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${name}</div>
                    <div class="checkout-item-meta">
                        ${set}${item.condition ? ' · ' + item.condition : ''}${qty > 1 ? ' · Qtà: ' + qty : ''}
                    </div>
                </div>
                <div class="checkout-item-price">€ ${(item.price * qty).toFixed(2)}</div>
            `;
            itemsEl.appendChild(div);
        });

        container.appendChild(group);
    });

    subtotalGlobal = subtotal;
    updateTotals();
}


// ─── ADDRESS ───
async function loadAddress() {
    try {
        const res = await fetch(`${API_USER}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        userProfile = await res.json();
        renderAddress();
    } catch {
        document.getElementById("addressLoading").style.display = "none";
        document.getElementById("addressMissing").style.display = "block";
    }
}

function renderAddress() {
    const loading = document.getElementById("addressLoading");
    const display = document.getElementById("addressDisplay");
    const missing = document.getElementById("addressMissing");
    loading.style.display = "none";

    const p = userProfile;
    const hasAddress = p && p.indirizzo && p.citta;

    if (!hasAddress) {
        missing.style.display = "block";
        display.style.display = "none";
        return;
    }
    missing.style.display = "none";
    display.style.display = "flex";

    const nome = [p.nome, p.cognome].filter(Boolean).join(" ") || "—";
    document.getElementById("addrName").textContent  = nome;
    document.getElementById("addrLine1").textContent = p.indirizzo || "";
    document.getElementById("addrLine2").textContent = [p.cap, p.citta, p.provincia].filter(Boolean).join(" ");
}

function buildAddressString(p) {
    if (!p) return "";
    return [
        [p.nome, p.cognome].filter(Boolean).join(" "),
        p.indirizzo,
        [p.cap, p.citta, p.provincia].filter(Boolean).join(" ")
    ].filter(Boolean).join(" · ");
}

// ─── ADDRESS EDIT TOGGLE ───
document.getElementById("editAddressBtn").addEventListener("click", async () => {
    const btn      = document.getElementById("editAddressBtn");
    const viewEl   = document.getElementById("addressView");
    const editEl   = document.getElementById("addressEdit");
    const errEl    = document.getElementById("addrError");
    const isEditing = editEl.style.display !== "none";

    if (!isEditing) {
        const p = userProfile || {};
        document.getElementById("addrInputNome").value      = p.nome      || "";
        document.getElementById("addrInputCognome").value   = p.cognome   || "";
        document.getElementById("addrInputIndirizzo").value = p.indirizzo || "";
        document.getElementById("addrInputCap").value       = p.cap       || "";
        document.getElementById("addrInputCitta").value     = p.citta     || "";
        document.getElementById("addrInputProvincia").value = p.provincia || "";
        viewEl.style.display = "none";
        editEl.style.display = "block";
        btn.textContent = "Conferma modifica";
        btn.classList.add("saving");
    } else {
        errEl.style.display = "none";
        const indirizzo = document.getElementById("addrInputIndirizzo").value.trim();
        const citta     = document.getElementById("addrInputCitta").value.trim();
        if (!indirizzo || !citta) {
            errEl.textContent   = "Indirizzo e città sono obbligatori.";
            errEl.style.display = "block";
            return;
        }
        const updates = {
            nome:      document.getElementById("addrInputNome").value.trim(),
            cognome:   document.getElementById("addrInputCognome").value.trim(),
            indirizzo: indirizzo,
            cap:       document.getElementById("addrInputCap").value.trim(),
            citta:     citta,
            provincia: document.getElementById("addrInputProvincia").value.trim()
        };
        try {
            btn.disabled = true;
            btn.textContent = "Salvataggio…";
            const res = await fetch(`${API_USER}/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error();
            userProfile = await res.json();
            viewEl.style.display = "block";
            editEl.style.display = "none";
            btn.textContent = "Modifica";
            btn.classList.remove("saving");
            btn.disabled = false;
            renderAddress();
            updateTotals();
        } catch {
            errEl.textContent   = "Errore durante il salvataggio. Riprova.";
            errEl.style.display = "block";
            btn.textContent = "Conferma modifica";
            btn.disabled = false;
        }
    }
});

function updateTotals() {
    const discount = Math.min(pointsUsed * POINTS_TO_EURO, totalShipping);
    grandTotal     = Math.max(0, subtotalGlobal + totalShipping - discount);

    document.getElementById("subtotalEl").textContent    = `€ ${subtotalGlobal.toFixed(2)}`;
    document.getElementById("shippingEl").textContent    = `€ ${totalShipping.toFixed(2)}`;
    document.getElementById("shipCountEl").textContent   = Object.keys(groupBySeller()).length;
    document.getElementById("grandTotalEl").textContent  = `€ ${grandTotal.toFixed(2)}`;
    document.getElementById("pointsDisplay").textContent = `${loyaltyPoints} pt`;
    document.getElementById("walletBalance").textContent = `€ ${walletBalance.toFixed(2)}`;

    const earnedPoints = Math.floor(subtotalGlobal * 3);
    document.getElementById("earnedPointsEl").textContent = `${earnedPoints} pt`;

    const walletErr = document.getElementById("walletError");
    const payBtn    = document.getElementById("payBtn");
    const addressOk = userProfile && userProfile.indirizzo && userProfile.citta;
    if (walletBalance < grandTotal) {
        walletErr.style.display = "block";
        payBtn.disabled = true;
    } else {
        walletErr.style.display = "none";
        payBtn.disabled = !addressOk;
    }
}

// ─── POINTS INPUT ───
document.getElementById("pointsInput").addEventListener("input", (e) => {
    const val      = parseInt(e.target.value) || 0;
    const errEl    = document.getElementById("pointsError");
    const savingEl = document.getElementById("pointsSaving");

    errEl.style.display    = "none";
    savingEl.style.display = "none";
    pointsUsed = 0;

    if (val < 0) {
        errEl.textContent   = "Il numero di punti non può essere negativo.";
        errEl.style.display = "block";
    } else if (val > loyaltyPoints) {
        errEl.textContent   = `Punti insufficienti. Hai ${loyaltyPoints} pt disponibili.`;
        errEl.style.display = "block";
    } else {
        const maxPoints = Math.ceil(totalShipping / POINTS_TO_EURO);
        if (val > maxPoints) {
            errEl.textContent   = `Puoi usare al massimo ${maxPoints} pt per coprire la spedizione (€ ${totalShipping.toFixed(2)}).`;
            errEl.style.display = "block";
        } else {
            pointsUsed = val;
            if (val > 0) {
                document.getElementById("pointsUsedLabel").textContent     = val;
                document.getElementById("pointsDiscountLabel").textContent = `€ ${(val * POINTS_TO_EURO).toFixed(2)}`;
                savingEl.style.display = "block";
            }
        }
    }
    updateTotals();
});

// ─── PAY ───
document.getElementById("payBtn").addEventListener("click", async () => {
    const payBtn = document.getElementById("payBtn");
    payBtn.disabled    = true;
    payBtn.textContent = "Elaborazione…";

    try {
        // 1. Scala il wallet e accredita punti (tutto gestito dal backend)
        const payRes = await fetch(`${API_PAYMENT}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                amount:   grandTotal,
                subtotal: subtotalGlobal
            })
        });

        if (!payRes.ok) throw new Error("Risposta non valida dal server");
        const ok = await payRes.json();
        if (!ok) throw new Error("Saldo insufficiente");

        // 2. Se l'utente ha usato punti, scalali dal DB
        if (pointsUsed > 0) {
            await fetch(`${API_PAYMENT}/points/use?points=${pointsUsed}`, {
                method: "POST",
                headers: { "username": username }
            });
        }

        // 3. Crea ordini nel microservizio ordini
        const orderItems = cartItems.map(item => {
            const cat = catalogMap[item.cardId] || {};
            return {
                listingId: item.listingId,
                cardId:    item.cardId,
                cardName:  cat.name || "Carta sconosciuta",
                sellerId:  item.sellerId,
                condition: item.condition,
                quantity:  item.quantity || 1,
                price:     item.price
            };
        });

        await fetch(`${API_ORDER}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                buyerUsername: username,
                buyerAddress:  buildAddressString(userProfile),
                items:         orderItems
            })
        });

        // 4. Svuota carrello
        await fetch(`${API_CART}/clear`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}`, "username": username }
        });

        // 5. Leggi punti aggiornati e mostra conferma
        const wRes  = await fetch(`${API_PAYMENT}/wallet`, { headers: { "username": username } });
        const wData = await wRes.json();
        const newPts = wData.points || 0;
        const earned = Math.floor(subtotalGlobal * 3);

        alert(`Pagamento completato!\n\nHai guadagnato ${earned} punti fedeltà.\nPunti totali ora: ${newPts} pt`);
        window.location.href = "http://localhost:8086/orders.html";

    } catch (err) {
        console.error("Errore pagamento:", err);
        alert("Errore durante il pagamento: " + err.message);
        payBtn.disabled    = false;
        payBtn.textContent = "Conferma e paga";
    }
});

// ─── LOGOUT ───
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "http://localhost:8080/login.html";
});

// ─── INIT ───
(async () => {
    await Promise.all([loadCatalog(), loadCart(), loadWallet(), loadAddress()]);
    render();
})();