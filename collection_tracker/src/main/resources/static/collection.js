document.addEventListener("DOMContentLoaded", async () => {
    const grid          = document.getElementById("cardGrid");
    const addBtn        = document.getElementById("addCardBtn");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const logoutBtn     = document.getElementById("logoutBtn");
    const collectionStats = document.getElementById("collectionStats");
    const resultsBar    = document.getElementById("resultsBar");
    const emptyState    = document.getElementById("emptyState");
    const filtersBar    = document.getElementById("filtersBar");

    // Filter elements
    const filterSearch    = document.getElementById("filterSearch");
    const filterRarity    = document.getElementById("filterRarity");
    const filterSet       = document.getElementById("filterSet");
    const filterCondition = document.getElementById("filterCondition");
    const filterSort      = document.getElementById("filterSort");
    const resetFilters    = document.getElementById("resetFilters");
    const activeFiltersEl = document.getElementById("activeFilters");

    // ─── AUTH ───
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
        } catch { return 'Utente'; }
    }

    const username = extractUsername(token);
    usernameDisplay.textContent = `👤 ${username}`;

    let collection = [];
    let catalog    = [];

    // ─── STICKY FILTER BAR ───
    const navbarHeight = 72;
    window.addEventListener("scroll", () => {
        const top = filtersBar.getBoundingClientRect().top;
        filtersBar.classList.toggle("stuck", top <= navbarHeight);
    });

    // ─── BACKEND ───
    async function loadCollection() {
        try {
            const res = await fetch("/api/collection", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "username": username
                }
            });
            if (!res.ok) throw new Error("Errore fetch collection");
            const data = await res.json();
            collection = data.cards || [];
            populateFilterDropdowns();
            applyFilters();
            updateStats();
        } catch (err) {
            console.error("Errore loadCollection:", err);
        }
    }

    async function loadCatalog() {
        try {
            const res = await fetch("http://localhost:8082/cards");
            if (!res.ok) throw new Error("Errore fetch catalog");
            catalog = await res.json();
        } catch (err) {
            console.error("Errore fetch catalog:", err);
        }
    }

    async function addCard(cardId, condition, quantity) {
        try {
            const res = await fetch("/api/collection/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "username": username
                },
                body: JSON.stringify({ cardId, condition, quantity })
            });
            if (!res.ok) throw new Error("Errore aggiunta carta");
            await loadCollection();
        } catch (err) {
            console.error("Errore addCard:", err);
            alert("Errore durante l'aggiunta della carta");
        }
    }

    async function updateQuantity(card, delta) {
        try {
            const res = await fetch("/api/collection/card", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "username": username
                },
                body: JSON.stringify({
                    cardId: card.cardId,
                    condition: card.condition,
                    delta
                })
            });
            if (!res.ok) throw new Error("Errore updateQuantity");
            const data = await res.json();
            collection = data.cards;
            populateFilterDropdowns();
            applyFilters();
            updateStats();
        } catch (err) {
            console.error("Errore updateQuantity:", err);
        }
    }

    // ─── STATS ───
    function updateStats() {
        const visible = collection.filter(c => c.quantity > 0);
        const total   = visible.reduce((s, c) => s + c.quantity, 0);
        const unique  = visible.length;
        collectionStats.textContent = `${unique} carte uniche · ${total} totali nel tuo archivio`;
    }

    // ─── POPULATE DYNAMIC DROPDOWNS ───
    function populateFilterDropdowns() {
        const rarities = [...new Set(collection.map(c => c.rarity).filter(Boolean))].sort();
        const sets     = [...new Set(collection.map(c => c.setName).filter(Boolean))].sort();

        const prevRarity = filterRarity.value;
        const prevSet    = filterSet.value;

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
    }

    // ─── CONDITION BADGE ───
    // ─── CONDITION BADGE ───
    function conditionClass(cond) {
        if (!cond) return '';
        const c = cond.toLowerCase().trim();

        if (c === 'mint') return 'condition-mint';
        if (c === 'near mint') return 'condition-near-mint';
        if (c === 'excellent') return 'condition-excellent';
        if (c === 'good') return 'condition-good';
        if (c === 'played') return 'condition-played';
        if (c === 'poor') return 'condition-poor';

        return 'condition-default';
    }

    // ─── CARD ELEMENT ───
    function createCardElement(card) {
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <span class="condition-badge ${conditionClass(card.condition)}">${card.condition || ''}</span>
            <a href="http://localhost:8084/card-page.html?cardId=${encodeURIComponent(card.cardId || card.id || '')}"
               class="card-img-link" title="Vedi carta">
                <img src="${card.imageUrl || ''}" alt="${card.name || ''}">
                <span class="card-img-overlay">Vedi carta</span>
            </a>
            <div class="card-info">
                <span class="card-name" title="${card.name || ''}">${card.name || ''}</span>
                <span class="card-rarity">${card.rarity || ''}</span>
                <div class="card-meta">${card.setName || ''}</div>
                <div class="quantity-controls">
                    <button class="minus-btn" aria-label="Riduci quantità">−</button>
                    <span class="quantity">${card.quantity}</span>
                    <button class="plus-btn" aria-label="Aumenta quantità">+</button>
                </div>
            </div>
        `;
        div.querySelector(".plus-btn").addEventListener("click", () => updateQuantity(card, 1));
        div.querySelector(".minus-btn").addEventListener("click", () => updateQuantity(card, -1));
        return div;
    }

    // ─── SORT ───
    const rarityOrder = ['Common','Uncommon','Rare','Ultra Rare','Secret Rare','Hyper Rare'];

    function sortCards(cards) {
        const mode = filterSort.value;
        return [...cards].sort((a, b) => {
            if (mode === 'name-asc')  return (a.name || '').localeCompare(b.name || '');
            if (mode === 'name-desc') return (b.name || '').localeCompare(a.name || '');
            if (mode === 'qty-desc')  return b.quantity - a.quantity;
            if (mode === 'qty-asc')   return a.quantity - b.quantity;
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
        const search    = filterSearch.value.toLowerCase().trim();
        const rarity    = filterRarity.value;
        const set       = filterSet.value;
        const condition = filterCondition.value;

        let filtered = collection.filter(card => {
            if (card.quantity <= 0) return false;
            if (rarity    && card.rarity    !== rarity)    return false;
            if (set       && card.setName   !== set)       return false;
            if (condition && card.condition !== condition) return false;
            if (search) {
                const text = `${card.name} ${card.rarity} ${card.setName} ${card.condition}`.toLowerCase();
                if (!search.split(/\s+/).every(w => text.includes(w))) return false;
            }
            return true;
        });

        filtered = sortCards(filtered);

        // Render
        grid.innerHTML = "";
        filtered.forEach((card, i) => {
            const el = createCardElement(card);
            el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
            grid.appendChild(el);
        });

        const total = collection.filter(c => c.quantity > 0).length;
        resultsBar.textContent = filtered.length < total
            ? `${filtered.length} di ${total} carte`
            : `${total} carte`;

        emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';

        updateActiveChips();
    }

    // ─── ACTIVE CHIPS ───
    function updateActiveChips() {
        activeFiltersEl.innerHTML = '';

        const chips = [];
        if (filterSearch.value)    chips.push({ label: `"${filterSearch.value}"`, clear: () => { filterSearch.value = ''; applyFilters(); } });
        if (filterRarity.value)    chips.push({ label: `Rarità: ${filterRarity.value}`, clear: () => { filterRarity.value = ''; applyFilters(); } });
        if (filterSet.value)       chips.push({ label: `Set: ${filterSet.value}`, clear: () => { filterSet.value = ''; applyFilters(); } });
        if (filterCondition.value) chips.push({ label: `Cond: ${filterCondition.value}`, clear: () => { filterCondition.value = ''; applyFilters(); } });

        chips.forEach(chip => {
            const el = document.createElement("div");
            el.classList.add("filter-chip");
            el.innerHTML = `<span>${chip.label}</span><span class="chip-remove">✕</span>`;
            el.querySelector(".chip-remove").addEventListener("click", chip.clear);
            activeFiltersEl.appendChild(el);
        });
    }

    // ─── FILTER EVENTS ───
    filterSearch.addEventListener("input", applyFilters);
    filterRarity.addEventListener("change", applyFilters);
    filterSet.addEventListener("change", applyFilters);
    filterCondition.addEventListener("change", applyFilters);
    filterSort.addEventListener("change", applyFilters);

    resetFilters.addEventListener("click", () => {
        filterSearch.value    = '';
        filterRarity.value    = '';
        filterSet.value       = '';
        filterCondition.value = '';
        filterSort.value      = 'name-asc';
        applyFilters();
    });

    // ─── MODAL ADD CARD ───
    function openAddCardModal() {
        const modal = document.createElement("div");
        modal.classList.add("modal-overlay");

        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">Aggiungi una carta</h3>

                <div class="modal-field">
                    <label for="searchCard">Cerca carta</label>
                    <input type="text" id="searchCard" placeholder="Nome, rarità, set…" autocomplete="off">
                    <div id="cardCount" class="card-count"></div>
                </div>

                <div class="modal-field">
                    <label for="selectCard">Carta</label>
                    <select id="selectCard" size="6"></select>
                </div>

                <div class="modal-field">
                    <label for="selectCondition">Condizione</label>
                    <select id="selectCondition">
                        <option value="Mint">Mint</option>
                        <option value="Near Mint">Near Mint</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Played">Played</option>
                        <option value="Poor">Poor</option>
                    </select>
                </div>

                <div class="modal-field">
                    <label for="inputQuantity">Quantità</label>
                    <input type="number" id="inputQuantity" value="1" min="1">
                </div>

                <div class="modal-actions">
                    <button class="modal-btn-confirm" id="confirmAdd">➕ Aggiungi</button>
                    <button class="modal-btn-cancel" id="cancelAdd">Annulla</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const searchInput = modal.querySelector("#searchCard");
        const selectCard  = modal.querySelector("#selectCard");
        const cardCount   = modal.querySelector("#cardCount");

        function populateSelect(filter) {
            const words = filter.toLowerCase().trim().split(/\s+/).filter(Boolean);
            const filtered = catalog.filter(c => {
                const text = `${c.name} ${c.rarity} ${c.setName}`.toLowerCase();
                return words.every(w => text.includes(w));
            });
            selectCard.innerHTML = "";
            filtered.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = `${c.name} | ${c.rarity} | ${c.setName}`;
                selectCard.appendChild(opt);
            });
            if (selectCard.options.length > 0) selectCard.selectedIndex = 0;
            cardCount.textContent = filtered.length === catalog.length
                ? `${catalog.length} carte disponibili`
                : `${filtered.length} risultati su ${catalog.length}`;
        }

        populateSelect("");
        searchInput.addEventListener("input", () => populateSelect(searchInput.value));

        modal.querySelector("#cancelAdd").onclick = () => document.body.removeChild(modal);
        modal.querySelector("#confirmAdd").onclick = () => {
            if (!selectCard.value) { alert("Nessuna carta selezionata."); return; }
            addCard(selectCard.value, modal.querySelector("#selectCondition").value, parseInt(modal.querySelector("#inputQuantity").value));
            document.body.removeChild(modal);
        };

        modal.addEventListener("click", (e) => { if (e.target === modal) document.body.removeChild(modal); });
        setTimeout(() => searchInput.focus(), 50);
    }

    addBtn.addEventListener("click", openAddCardModal);

    // logout gestito da navbar.js

    // ─── INIT ───
    await loadCatalog();
    await loadCollection();
    // cart badge gestito da navbar.js
    function animateBadge(badge, count) {
        if (count > 0) {
            badge.style.display = "flex";
            badge.textContent = count;

            // reset animazione
            badge.style.animation = "none";
            badge.offsetHeight;
            badge.style.animation = "badgePop 0.25s cubic-bezier(0.34,1.56,0.64,1)";
        } else {
            badge.style.display = "none";
        }
    }

    loadCartBadge();
});