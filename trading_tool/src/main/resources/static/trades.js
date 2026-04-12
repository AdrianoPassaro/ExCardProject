document.addEventListener("DOMContentLoaded", async () => {
    // ─── CONFIG ───
    const API_TRADES = "http://localhost:8088/trades";
    const API_CARDS = "http://localhost:8082/cards";
    const API_CART = "http://localhost:8087/api/cart";

    // ─── AUTH ───
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "http://localhost:8080/login.html";
        return;
    }

    function extractUsername(t) {
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return payload.sub || payload.username || 'Utente';
        } catch { return 'Utente'; }
    }

    const username = extractUsername(token);
    document.getElementById("usernameDisplay").textContent = `👤 ${username}`;

    // ─── STATE ───
    let incomingTrades = [];
    let outgoingTrades = [];
    let cardsCache = new Map();
    let pendingActionId = null;
    let pendingActionType = null;

    // DOM elements
    const incomingList = document.getElementById("incomingList");
    const outgoingList = document.getElementById("outgoingList");
    const completedList = document.getElementById("completedList");
    const rejectedList = document.getElementById("rejectedList");
    const emptyIncoming = document.getElementById("emptyIncoming");
    const emptyOutgoing = document.getElementById("emptyOutgoing");
    const emptyCompleted = document.getElementById("emptyCompleted");
    const emptyRejected = document.getElementById("emptyRejected");
    const incomingCountSpan = document.getElementById("incomingCount");
    const outgoingCountSpan = document.getElementById("outgoingCount");
    const completedCountSpan = document.getElementById("completedCount");
    const rejectedCountSpan = document.getElementById("rejectedCount");

    const tabIncoming = document.getElementById("tabIncoming");
    const tabOutgoing = document.getElementById("tabOutgoing");
    const tabCompleted = document.getElementById("tabCompleted");
    const tabRejected = document.getElementById("tabRejected");

    const panelIncoming = document.getElementById("panelIncoming");
    const panelOutgoing = document.getElementById("panelOutgoing");
    const panelCompleted = document.getElementById("panelCompleted");
    const panelRejected = document.getElementById("panelRejected");

    // Modals
    const acceptModal = document.getElementById("acceptModal");
    const rejectModal = document.getElementById("rejectModal");
    const cancelModal = document.getElementById("cancelModal");

    // ─── HELPER: load card details ───
    async function loadCardDetails(cardId) {
        if (cardsCache.has(cardId)) return cardsCache.get(cardId);
        try {
            const res = await fetch(`${API_CARDS}/${cardId}`);
            if (!res.ok) throw new Error("Card not found");
            const card = await res.json();
            cardsCache.set(cardId, card);
            return card;
        } catch (err) {
            console.warn(`Errore caricamento carta ${cardId}:`, err);
            return {
                id: cardId,
                name: "Carta sconosciuta",
                imageUrl: "",
                setName: "",
                number: "",
                rarity: ""
            };
        }
    }

    // ─── HELPER: format date ───
    function formatDate(isoString) {
        if (!isoString) return "—";
        const d = new Date(isoString);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
    }

    // ─── HELPER: status badge ───
    function getStatusBadge(status) {
        const statusMap = {
            "PENDING": '<span class="trade-status-badge status-pending">⏳ In attesa</span>',
            "COUNTERED": '<span class="trade-status-badge status-countered">🔄 Controproposta</span>',
            "ACCEPTED": '<span class="trade-status-badge status-accepted">✓ Accettata</span>',
            "COMPLETED": '<span class="trade-status-badge status-completed">✅ Completata</span>',
            "REJECTED": '<span class="trade-status-badge status-rejected">✗ Rifiutata</span>',
            "CANCELLED": '<span class="trade-status-badge status-cancelled">🗑 Annullata</span>'
        };
        return statusMap[status] || `<span class="trade-status-badge">${status}</span>`;
    }

    function createTradeCardItem(card) {
        const div = document.createElement("div");
        div.classList.add("trade-offered-card");
        div.innerHTML = `
            <img class="trade-card-img" src="${card.imageUrl || ''}" alt="${card.name || 'Carta'}"
                 onerror="this.style.opacity='0.3'">
            <div class="trade-card-details">
                <div class="trade-card-name">${escapeHtml(card.name || "Carta sconosciuta")}</div>
                <div class="trade-card-meta">
                    ${card.setName || ''}${card.number ? ` · Nº ${card.number}` : ''}
                </div>
                <span class="trade-card-condition">${card.condition || ''}</span>
                ${card.quantity && card.quantity > 1 ? `<span class="trade-card-condition" style="margin-left:4px">Qtà: ${card.quantity}</span>` : ''}
            </div>
        `;
        return div;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ─── BUILD TRADE CARD ───
    async function buildTradeCard(trade, type) {
        const isIncoming = type === "incoming";
        const otherUser = isIncoming ? trade.proposerUsername : trade.recipientUsername;
        const userRole = isIncoming ? "Da:" : "A:";

        const offeredCardsDetails = await Promise.all(
            (trade.offeredItems || []).map(async (item) => {
                const card = await loadCardDetails(item.cardId);
                return { ...card, condition: item.condition, quantity: item.quantity };
            })
        );

        const targetCard = await loadCardDetails(trade.targetCardId);
        const targetWithCondition = { ...targetCard, condition: trade.targetCondition };

        let youGiveCards, youReceiveCards;
        if (isIncoming) {
            youGiveCards = [{ ...targetWithCondition, quantity: trade.targetQuantity || 1 }];
            youReceiveCards = offeredCardsDetails;
        } else {
            youGiveCards = offeredCardsDetails;
            youReceiveCards = [{ ...targetWithCondition, quantity: trade.targetQuantity || 1 }];
        }

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("trade-card");
        cardDiv.style.animationDelay = "0ms";

        const isPending = trade.status === "PENDING" || trade.status === "COUNTERED";
        let buttonsHtml = "";

        if (isIncoming && isPending) {
            buttonsHtml = `
                <button class="btn-trade btn-accept" data-action="accept" data-id="${trade.id}">✅ Accetta</button>
                <button class="btn-trade btn-reject" data-action="reject" data-id="${trade.id}">❌ Rifiuta</button>
            `;
        } else if (!isIncoming && isPending) {
            buttonsHtml = `
                <button class="btn-trade btn-cancel" data-action="cancel" data-id="${trade.id}">🗑️ Annulla</button>
            `;
        }

        cardDiv.innerHTML = `
            <div class="trade-header">
                <div class="trade-header-left">
                    <span class="trade-id">Scambio #${trade.id.substring(0, 8)}</span>
                    <span class="trade-date">${formatDate(trade.createdAt)}</span>
                    <span class="trade-counterpart">${userRole} <strong>${otherUser}</strong></span>
                </div>
                <div class="trade-header-right">
                    ${getStatusBadge(trade.status)}
                </div>
            </div>
            <div class="trade-cards-row">
                <div class="trade-card-col">
                    <div class="trade-col-title"><span class="emoji">📤</span> TU DAI</div>
                    <div id="giveCards-${trade.id}"></div>
                </div>
                <div class="trade-card-col">
                    <div class="trade-col-title"><span class="emoji">📥</span> TU RICEVI</div>
                    <div id="receiveCards-${trade.id}"></div>
                </div>
            </div>
            <div class="trade-message-row">
                <span class="trade-message-label">💬 Messaggio</span>
                <div class="trade-message-text">${escapeHtml(trade.proposerMessage || trade.recipientMessage || "Nessun messaggio")}</div>
            </div>
            ${buttonsHtml ? `<div class="trade-footer">${buttonsHtml}</div>` : ''}
        `;

        const giveContainer = cardDiv.querySelector(`#giveCards-${trade.id}`);
        const receiveContainer = cardDiv.querySelector(`#receiveCards-${trade.id}`);

        youGiveCards.forEach(card => giveContainer.appendChild(createTradeCardItem(card)));
        youReceiveCards.forEach(card => receiveContainer.appendChild(createTradeCardItem(card)));

        if (isIncoming && isPending) {
            cardDiv.querySelectorAll("[data-action='accept']").forEach(btn => {
                btn.addEventListener("click", () => openAcceptModal(trade.id));
            });
            cardDiv.querySelectorAll("[data-action='reject']").forEach(btn => {
                btn.addEventListener("click", () => openRejectModal(trade.id));
            });
        } else if (!isIncoming && isPending) {
            cardDiv.querySelectorAll("[data-action='cancel']").forEach(btn => {
                btn.addEventListener("click", () => openCancelModal(trade.id));
            });
        }

        return cardDiv;
    }

    // ─── LOAD TRADES ───
    async function loadIncomingTrades() {
        try {
            const res = await fetch(`${API_TRADES}/incoming`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Errore caricamento proposte ricevute");
            incomingTrades = await res.json();
            incomingCountSpan.textContent = incomingTrades.length;
            return incomingTrades;
        } catch (err) {
            console.error(err);
            incomingTrades = [];
            incomingCountSpan.textContent = "0";
            return [];
        }
    }

    async function loadOutgoingTrades() {
        try {
            const res = await fetch(`${API_TRADES}/outgoing`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Errore caricamento proposte inviate");
            outgoingTrades = await res.json();
            outgoingCountSpan.textContent = outgoingTrades.length;
            return outgoingTrades;
        } catch (err) {
            console.error(err);
            outgoingTrades = [];
            outgoingCountSpan.textContent = "0";
            return [];
        }
    }

    // ─── RENDER ───
    async function renderIncoming() {
        incomingList.innerHTML = "";
        const pendingOnly = incomingTrades.filter(t => t.status === "PENDING" || t.status === "COUNTERED");
        if (!pendingOnly.length) {
            emptyIncoming.style.display = "flex";
            incomingCountSpan.textContent = "0";
            return;
        }
        emptyIncoming.style.display = "none";
        incomingCountSpan.textContent = pendingOnly.length;

        for (const trade of pendingOnly) {
            const card = await buildTradeCard(trade, "incoming");
            incomingList.appendChild(card);
        }
    }

    async function renderOutgoing() {
        outgoingList.innerHTML = "";
        const pendingOnly = outgoingTrades.filter(t => t.status === "PENDING" || t.status === "COUNTERED");
        if (!pendingOnly.length) {
            emptyOutgoing.style.display = "flex";
            outgoingCountSpan.textContent = "0";
            return;
        }
        emptyOutgoing.style.display = "none";
        outgoingCountSpan.textContent = pendingOnly.length;

        for (const trade of pendingOnly) {
            const card = await buildTradeCard(trade, "outgoing");
            outgoingList.appendChild(card);
        }
    }

    async function renderCompleted() {
        completedList.innerHTML = "";
        const completedOnly = [...incomingTrades, ...outgoingTrades]
            .filter(t => t.status === "ACCEPTED" || t.status === "COMPLETED");

        if (!completedOnly.length) {
            emptyCompleted.style.display = "flex";
            completedCountSpan.textContent = "0";
            return;
        }
        emptyCompleted.style.display = "none";
        completedCountSpan.textContent = completedOnly.length;

        for (const trade of completedOnly) {
            const isIncoming = incomingTrades.some(t => t.id === trade.id);
            const card = await buildTradeCard(trade, isIncoming ? "incoming" : "outgoing");
            completedList.appendChild(card);
        }
    }

    async function renderRejected() {
        rejectedList.innerHTML = "";
        const rejectedOnly = [...incomingTrades, ...outgoingTrades]
            .filter(t => t.status === "REJECTED" || t.status === "CANCELLED");

        if (!rejectedOnly.length) {
            emptyRejected.style.display = "flex";
            rejectedCountSpan.textContent = "0";
            return;
        }
        emptyRejected.style.display = "none";
        rejectedCountSpan.textContent = rejectedOnly.length;

        for (const trade of rejectedOnly) {
            const isIncoming = incomingTrades.some(t => t.id === trade.id);
            const card = await buildTradeCard(trade, isIncoming ? "incoming" : "outgoing");
            rejectedList.appendChild(card);
        }
    }

    // ─── ACTIONS ───
    function openAcceptModal(tradeId) {
        pendingActionId = tradeId;
        pendingActionType = "accept";
        acceptModal.style.display = "flex";
    }

    function openRejectModal(tradeId) {
        pendingActionId = tradeId;
        pendingActionType = "reject";
        rejectModal.style.display = "flex";
    }

    function openCancelModal(tradeId) {
        pendingActionId = tradeId;
        pendingActionType = "cancel";
        cancelModal.style.display = "flex";
    }

    async function executeAccept() {
        if (!pendingActionId) return;
        const btn = document.getElementById("acceptConfirmBtn");
        btn.disabled = true;
        btn.textContent = "Elaborazione...";
        try {
            const res = await fetch(`${API_TRADES}/${pendingActionId}/accept`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Errore durante l'accettazione");

            await loadIncomingTrades();
            await loadOutgoingTrades();
            await renderIncoming();
            await renderOutgoing();
            await renderCompleted();
            await renderRejected();
        } catch (err) {
            alert("Errore: " + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Sì, accetta";
            closeAllModals();
            pendingActionId = null;
        }
    }

    async function executeReject() {
        if (!pendingActionId) return;
        const btn = document.getElementById("rejectConfirmBtn");
        btn.disabled = true;
        btn.textContent = "Elaborazione...";
        try {
            const res = await fetch(`${API_TRADES}/${pendingActionId}/reject`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Errore durante il rifiuto");

            await loadIncomingTrades();
            await renderIncoming();
            await renderCompleted();
            await renderRejected();
        } catch (err) {
            alert("Errore: " + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Sì, rifiuta";
            closeAllModals();
            pendingActionId = null;
        }
    }

    async function executeCancel() {
        if (!pendingActionId) return;
        const btn = document.getElementById("cancelConfirmBtn");
        btn.disabled = true;
        btn.textContent = "Elaborazione...";
        try {
            const res = await fetch(`${API_TRADES}/${pendingActionId}/cancel`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Errore durante l'annullamento");

            await loadOutgoingTrades();
            await renderOutgoing();
            await renderCompleted();
            await renderRejected();
        } catch (err) {
            alert("Errore: " + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = "Sì, annulla";
            closeAllModals();
            pendingActionId = null;
        }
    }

    function closeAllModals() {
        acceptModal.style.display = "none";
        rejectModal.style.display = "none";
        cancelModal.style.display = "none";
    }

    // ─── TAB SWITCH ───
    function switchTab(tab) {
        tabIncoming.classList.remove("active");
        tabOutgoing.classList.remove("active");
        tabCompleted.classList.remove("active");
        tabRejected.classList.remove("active");
        panelIncoming.style.display = "none";
        panelOutgoing.style.display = "none";
        panelCompleted.style.display = "none";
        panelRejected.style.display = "none";

        if (tab === "incoming") {
            tabIncoming.classList.add("active");
            panelIncoming.style.display = "block";
        } else if (tab === "outgoing") {
            tabOutgoing.classList.add("active");
            panelOutgoing.style.display = "block";
        } else if (tab === "completed") {
            tabCompleted.classList.add("active");
            panelCompleted.style.display = "block";
        } else if (tab === "rejected") {
            tabRejected.classList.add("active");
            panelRejected.style.display = "block";
        }
    }

    tabIncoming.addEventListener("click", () => switchTab("incoming"));
    tabOutgoing.addEventListener("click", () => switchTab("outgoing"));
    tabCompleted.addEventListener("click", () => switchTab("completed"));
    tabRejected.addEventListener("click", () => switchTab("rejected"));

    // ─── MODAL LISTENERS ───
    document.getElementById("acceptConfirmBtn").addEventListener("click", executeAccept);
    document.getElementById("acceptCancelBtn").addEventListener("click", closeAllModals);
    document.getElementById("rejectConfirmBtn").addEventListener("click", executeReject);
    document.getElementById("rejectCancelBtn").addEventListener("click", closeAllModals);
    document.getElementById("cancelConfirmBtn").addEventListener("click", executeCancel);
    document.getElementById("cancelCancelBtn").addEventListener("click", closeAllModals);

    [acceptModal, rejectModal, cancelModal].forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // ─── CART BADGE ───
    async function loadCartBadge() {
        try {
            const res = await fetch(API_CART, {
                headers: { "Authorization": `Bearer ${token}`, "username": username }
            });
            if (!res.ok) return;
            const cart = await res.json();
            const count = (cart.items || []).length;
            const badge = document.getElementById("cartBadge");
            if (count > 0) {
                badge.textContent = count;
                badge.removeAttribute("style");
            }
        } catch { /* silent */ }
    }

    // ─── LOGOUT ───
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "http://localhost:8080/login.html";
    });

    // ─── INIT ───
    await Promise.all([loadIncomingTrades(), loadOutgoingTrades(), loadCartBadge()]);
    await renderIncoming();
    await renderOutgoing();
    await renderCompleted();
    await renderRejected();
});