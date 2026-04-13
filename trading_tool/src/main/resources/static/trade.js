document.addEventListener("DOMContentLoaded", async () => {
    const grid             = document.getElementById("cardGrid");
    const resultsBar       = document.getElementById("resultsBar");
    const emptyState       = document.getElementById("emptyState");
    const filtersBar       = document.getElementById("filtersBar");
    const sendTradeBtn     = document.getElementById("sendTradeBtn");
    const tradeSubtitle    = document.getElementById("tradeSubtitle");
    const targetListingBox = document.getElementById("targetListingBox");
    const proposerMessage  = document.getElementById("proposerMessage");
    const tradeMessage     = document.getElementById("tradeMessage");
    const selectionChips   = document.getElementById("selectionChips");

    // Filter elements
    const filterSearch     = document.getElementById("filterSearch");
    const filterRarity     = document.getElementById("filterRarity");
    const filterSet        = document.getElementById("filterSet");
    const filterCondition  = document.getElementById("filterCondition");
    const filterSort       = document.getElementById("filterSort");
    const resetFilters     = document.getElementById("resetFilters");
    const activeFiltersEl  = document.getElementById("activeFilters");

    // ─── AUTH (navbar.js gestisce token e username) ───
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "http://localhost:8080/login.html";
        return;
    }

    function extractUsername(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload).sub || 'Utente';
        } catch {
            return 'Utente';
        }
    }

    const username = extractUsername(token);
    // Aggiorna usernameDisplay se navbar.js non lo ha già fatto
    const usernameDisplay = document.getElementById("usernameDisplay");
    if (usernameDisplay && !usernameDisplay.textContent.includes(username)) {
        usernameDisplay.textContent = `👤 ${username}`;
    }

    let collection = [];
    let selectedItems = [];
    let targetListing = null;
    let targetCard = null;

    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    const listingId = getQueryParam("listingId");

    if (!listingId) {
        alert("Listing mancante nell'URL");
        return;
    }

    // ─── STICKY FILTER BAR ───
    const navbarHeight = 72;
    window.addEventListener("scroll", () => {
        const top = filtersBar.getBoundingClientRect().top;
        filtersBar.classList.toggle("stuck", top <= navbarHeight);
    });

    // ─── BACKEND ───
    async function loadTargetListing() {
        const res = await fetch(`http://localhost:8084/listings/${encodeURIComponent(listingId)}`);
        if (!res.ok) throw new Error("Errore nel caricamento del listing target");
        targetListing = await res.json();
    }

    async function loadTargetCard() {
        if (!targetListing?.cardId) throw new Error("cardId non trovato nel listing");
        const res = await fetch(`http://localhost:8082/cards/${encodeURIComponent(targetListing.cardId)}`);
        if (!res.ok) throw new Error("Errore nel caricamento della carta target");
        targetCard = await res.json();
    }

    async function loadCollection() {
        const res = await fetch("http://localhost:8083/api/collection", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "username": username
            }
        });

        if (!res.ok) throw new Error("Errore nel caricamento della collezione");

        const data = await res.json();
        collection = (data.cards || []).filter(card => (card.quantity || 0) > 0);
        populateFilterDropdowns();
        applyFilters();
        renderSelectionChips();
    }

    // ─── TARGET RENDER ───
    function renderTargetListing() {
        if (!targetListing || !targetCard) return;

        tradeSubtitle.textContent =
            `Proponi uno scambio a ${targetListing.sellerUsername} per ${targetCard.name}`;

        targetListingBox.innerHTML = `
            <div class="target-card">
                <div class="target-card-image-wrap">
                    <img src="${targetCard.imageUrl || ''}" alt="${targetCard.name || ''}" class="target-card-image">
                </div>

                <div class="target-card-info">
                    <div class="target-card-name">${targetCard.name || ''}</div>
                    <div class="target-card-meta">${targetCard.rarity || ''}</div>
                    <div class="target-card-meta">${targetCard.setName || ''} • Nº ${targetCard.number || ''}</div>

                    <div class="target-card-details-row">
                        <span class="target-detail-pill">Venditore: ${targetListing.sellerUsername || '-'}</span>
                        <span class="target-detail-pill">Condizione: ${targetListing.condition || '-'}</span>
                        <span class="target-detail-pill">Quantità: ${targetListing.quantity || 1}</span>
                    </div>

                    <div class="target-card-price">
                        Valore di riferimento: € ${Number(targetListing.price || 0).toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    }

    // ─── FILTER DROPDOWNS ───
    function populateFilterDropdowns() {
        const rarities = [...new Set(collection.map(c => c.rarity).filter(Boolean))].sort();
        const sets = [...new Set(collection.map(c => c.setName).filter(Boolean))].sort();
        const conditions = [...new Set(collection.map(c => c.condition).filter(Boolean))].sort();

        const prevRarity = filterRarity.value;
        const prevSet = filterSet.value;
        const prevCondition = filterCondition.value;

        filterRarity.innerHTML = `<option value="">Tutte</option>`;
        rarities.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r;
            opt.textContent = r;
            if (r === prevRarity) opt.selected = true;
            filterRarity.appendChild(opt);
        });

        filterSet.innerHTML = `<option value="">Tutti</option>`;
        sets.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            if (s === prevSet) opt.selected = true;
            filterSet.appendChild(opt);
        });

        filterCondition.innerHTML = `<option value="">Tutte</option>`;
        conditions.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.textContent = c;
            if (c === prevCondition) opt.selected = true;
            filterCondition.appendChild(opt);
        });
    }

    // ─── CONDITION BADGE ───
    function conditionClass(cond) {
        if (!cond) return '';
        const c = cond.toLowerCase().replace(/\s+/g, '-');

        if (c.includes('mint') && !c.includes('near')) return 'cond-mint';
        if (c.includes('near')) return 'cond-nm';
        if (c.includes('lightly')) return 'cond-lp';
        if (c.includes('moderate')) return 'cond-mp';
        if (c.includes('heavily')) return 'cond-hp';
        if (c.includes('excellent')) return 'cond-ex';
        if (c.includes('good')) return 'cond-good';
        if (c.includes('played')) return 'cond-played';
        if (c.includes('poor')) return 'cond-poor';

        return '';
    }

    function cardKey(card) {
        return `${card.cardId}__${card.condition}`;
    }

    function isSelected(card) {
        return selectedItems.some(item => item.key === cardKey(card));
    }

    function toggleSelected(card) {
        const key = cardKey(card);
        const index = selectedItems.findIndex(item => item.key === key);

        if (index >= 0) {
            selectedItems.splice(index, 1);
        } else {
            selectedItems.push({
                key,
                cardId: card.cardId,
                condition: card.condition,
                quantity: 1,
                name: card.name,
                rarity: card.rarity,
                setName: card.setName
            });
        }

        applyFilters();
        renderSelectionChips();
    }

    // ─── CARD ELEMENT ───
    function createCardElement(card) {
        const div = document.createElement("div");
        div.classList.add("card");
        if (isSelected(card)) div.classList.add("selected");

        div.innerHTML = `
            <span class="condition-badge ${conditionClass(card.condition)}">${card.condition || ''}</span>
            <button class="select-toggle-btn" aria-label="Seleziona carta">
                ${isSelected(card) ? '✓' : '+'}
            </button>
            <img src="${card.imageUrl || ''}" alt="${card.name || ''}">
            <div class="card-info">
                <span class="card-name" title="${card.name || ''}">${card.name || ''}</span>
                <span class="card-rarity">${card.rarity || ''}</span>
                <div class="card-meta">${card.setName || ''}</div>
                <div class="trade-card-footer">
                    <span class="trade-card-qty">Disponibili: ${card.quantity}</span>
                </div>
            </div>
        `;

        div.addEventListener("click", (e) => {
            if (!e.target.closest('.select-toggle-btn')) {
                toggleSelected(card);
            }
        });

        div.querySelector(".select-toggle-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleSelected(card);
        });

        return div;
    }

    // ─── SORT ───
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare', 'Hyper Rare'];

    function sortCards(cards) {
        const mode = filterSort.value;
        return [...cards].sort((a, b) => {
            if (mode === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            if (mode === 'name-desc') return (b.name || '').localeCompare(a.name || '');
            if (mode === 'qty-desc') return (b.quantity || 0) - (a.quantity || 0);
            if (mode === 'qty-asc') return (a.quantity || 0) - (b.quantity || 0);
            if (mode === 'rarity') {
                const ai = rarityOrder.indexOf(a.rarity);
                const bi = rarityOrder.indexOf(b.rarity);
                return (bi === -1 ? -1 : bi) - (ai === -1 ? -1 : ai);
            }
            return 0;
        });
    }

    // ─── APPLY FILTERS ───
    function applyFilters() {
        const search = filterSearch.value.toLowerCase().trim();
        const rarity = filterRarity.value;
        const set = filterSet.value;
        const condition = filterCondition.value;

        let filtered = collection.filter(card => {
            if ((card.quantity || 0) <= 0) return false;
            if (rarity && card.rarity !== rarity) return false;
            if (set && card.setName !== set) return false;
            if (condition && card.condition !== condition) return false;

            if (search) {
                const text = `${card.name || ''} ${card.rarity || ''} ${card.setName || ''} ${card.condition || ''}`.toLowerCase();
                if (!search.split(/\s+/).every(w => text.includes(w))) return false;
            }

            return true;
        });

        filtered = sortCards(filtered);

        grid.innerHTML = "";
        filtered.forEach((card, i) => {
            const el = createCardElement(card);
            el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
            grid.appendChild(el);
        });

        const total = collection.length;
        resultsBar.textContent = filtered.length < total
            ? `${filtered.length} di ${total} carte disponibili per lo scambio`
            : `${total} carte disponibili per lo scambio`;

        emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';

        updateActiveChips();
    }

    // ─── ACTIVE CHIPS ───
    function updateActiveChips() {
        activeFiltersEl.innerHTML = '';

        const chips = [];

        if (filterSearch.value) {
            chips.push({
                label: `"${filterSearch.value}"`,
                clear: () => {
                    filterSearch.value = '';
                    applyFilters();
                }
            });
        }

        if (filterRarity.value) {
            chips.push({
                label: `Rarità: ${filterRarity.value}`,
                clear: () => {
                    filterRarity.value = '';
                    applyFilters();
                }
            });
        }

        if (filterSet.value) {
            chips.push({
                label: `Set: ${filterSet.value}`,
                clear: () => {
                    filterSet.value = '';
                    applyFilters();
                }
            });
        }

        if (filterCondition.value) {
            chips.push({
                label: `Cond: ${filterCondition.value}`,
                clear: () => {
                    filterCondition.value = '';
                    applyFilters();
                }
            });
        }

        chips.forEach(chip => {
            const el = document.createElement("div");
            el.classList.add("filter-chip");
            el.innerHTML = `<span>${chip.label}</span><span class="chip-remove">✕</span>`;
            el.querySelector(".chip-remove").addEventListener("click", chip.clear);
            activeFiltersEl.appendChild(el);
        });
    }

    // ─── SELECTED CHIPS ───
    function renderSelectionChips() {
        selectionChips.innerHTML = "";

        if (!selectedItems.length) {
            selectionChips.innerHTML = `<span class="selection-empty">Nessuna carta selezionata</span>`;
            return;
        }

        selectedItems.forEach(item => {
            const chip = document.createElement("div");
            chip.classList.add("selection-chip");
            chip.innerHTML = `
                <span>${item.name || item.cardId} • ${item.condition}</span>
                <span class="selection-chip-remove">✕</span>
            `;
            chip.querySelector(".selection-chip-remove").addEventListener("click", () => {
                selectedItems = selectedItems.filter(s => s.key !== item.key);
                applyFilters();
                renderSelectionChips();
            });
            selectionChips.appendChild(chip);
        });
    }

    // ─── SEND TRADE ───
    async function sendTrade() {
        tradeMessage.textContent = "";
        tradeMessage.className = "trade-message-status";

        if (!selectedItems.length) {
            tradeMessage.textContent = "Seleziona almeno una carta da offrire.";
            tradeMessage.classList.add("error");
            return;
        }

        const payload = {
            targetListingId: listingId,
            offeredItems: selectedItems.map(item => ({
                cardId: item.cardId,
                condition: item.condition,
                quantity: item.quantity
            })),
            proposerMessage: proposerMessage.value.trim()
        };

        try {
            const res = await fetch("http://localhost:8088/trades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Errore durante l'invio della proposta");
            }

            tradeMessage.textContent = "Proposta di scambio inviata con successo.";
            tradeMessage.classList.add("success");

            selectedItems = [];
            proposerMessage.value = "";
            applyFilters();
            renderSelectionChips();

        } catch (err) {
            console.error("Errore sendTrade:", err);
            tradeMessage.textContent = `Errore: ${err.message}`;
            tradeMessage.classList.add("error");
        }
    }

    // ─── FILTER EVENTS ───
    filterSearch.addEventListener("input", applyFilters);
    filterRarity.addEventListener("change", applyFilters);
    filterSet.addEventListener("change", applyFilters);
    filterCondition.addEventListener("change", applyFilters);
    filterSort.addEventListener("change", applyFilters);

    resetFilters.addEventListener("click", () => {
        filterSearch.value = '';
        filterRarity.value = '';
        filterSet.value = '';
        filterCondition.value = '';
        filterSort.value = 'name-asc';
        applyFilters();
    });

    sendTradeBtn.addEventListener("click", sendTrade);

    // ─── INIT (rimosso logout duplicato e cart badge, gestiti da navbar.js) ───
    try {
        await loadTargetListing();
        await loadTargetCard();
        renderTargetListing();
        await loadCollection();
    } catch (err) {
        console.error("Errore init trade:", err);
        alert("Errore nel caricamento della pagina di scambio");
    }
});