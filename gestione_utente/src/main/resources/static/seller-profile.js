document.addEventListener("DOMContentLoaded", async () => {
    const sellerUsernameEl   = document.getElementById("sellerUsername");
    const infoNomeEl         = document.getElementById("infoNome");
    const infoCognomeEl      = document.getElementById("infoCognome");
    const infoRatingEl       = document.getElementById("infoRating");
    const infoSalesEl        = document.getElementById("infoSales");
    const contactButton      = document.getElementById("contactButton");
    const contactFlip = document.getElementById("contactFlip");
    const contactFlipInner = document.getElementById("contactFlipInner");
    const contactEmailText = document.getElementById("contactEmailText");
    const infoCountryFlagEl = document.getElementById("infoCountryFlag");
    const infoCountryNameEl = document.getElementById("infoCountryName");

    const filtersBar         = document.getElementById("filtersBar");
    const filterSearch       = document.getElementById("filterSearch");
    const filterCondition    = document.getElementById("filterCondition");
    const filterSortOffers   = document.getElementById("filterSortOffers");
    const filterRarity       = document.getElementById("filterRarity");
    const filterSet          = document.getElementById("filterSet");
    const filterCollectionCondition = document.getElementById("filterCollectionCondition");
    const filterSortCollection = document.getElementById("filterSortCollection");
    const resetFilters       = document.getElementById("resetFilters");
    const activeFiltersEl    = document.getElementById("activeFilters");
    const resultsBar         = document.getElementById("resultsBar");
    const emptyState         = document.getElementById("emptyState");

    const tabOffers          = document.getElementById("tabOffers");
    const tabCollection      = document.getElementById("tabCollection");
    const offersSection      = document.getElementById("offersSection");
    const collectionSection  = document.getElementById("collectionSection");
    const offersFilters      = document.getElementById("offersFilters");
    const collectionFilters  = document.getElementById("collectionFilters");

    const listingContainer   = document.getElementById("listingContainer");
    const collectionGrid     = document.getElementById("collectionGrid");

    const API_LISTING = "http://localhost:8084/listings";
    const API_CART = "http://localhost:8085/api/cart";
    const API_USER    = 'http://localhost:8081/api/user';

    const token = localStorage.getItem("token");
    const loggedUsername = localStorage.getItem("username");

    let sellerEmail = null;
    let activeTab = "offers";
    let listings = [];
    let collection = [];

    function getUsernameFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("username");
    }

    const sellerUsername = getUsernameFromUrl();

    if (!sellerUsername) {
        alert("Username venditore mancante nell'URL");
        return;
    }

    // ─── STICKY FILTER BAR ───
    const navbarHeight = 72;
    window.addEventListener("scroll", () => {
        const top = filtersBar.getBoundingClientRect().top;
        filtersBar.classList.toggle("stuck", top <= navbarHeight);
    });

    // ─── BACKEND ───
    async function loadSellerProfile() {
        const res = await fetch(`/api/user/public/${encodeURIComponent(sellerUsername)}`);
        if (!res.ok) throw new Error("Errore nel caricamento del profilo venditore");
        return await res.json();
    }

    async function loadSellerListings() {
        const res = await fetch(`http://localhost:8084/listings/seller/${encodeURIComponent(sellerUsername)}`);
        if (!res.ok) throw new Error("Errore nel caricamento delle offerte");
        return await res.json();
    }

    async function loadSellerCollection() {
        const res = await fetch(`http://localhost:8083/api/collection/public/${encodeURIComponent(sellerUsername)}`);
        if (!res.ok) throw new Error("Errore nel caricamento della collezione");
        return await res.json();
    }

    async function loadCard(cardId) {
        const res = await fetch(`http://localhost:8082/cards/${encodeURIComponent(cardId)}`);
        if (!res.ok) throw new Error("Errore nel caricamento della carta");
        return await res.json();
    }

    async function enrichListings(rawListings) {
        return await Promise.all(
            rawListings.map(async (listing) => {
                try {
                    const card = await loadCard(listing.cardId);
                    return { ...listing, card };
                } catch (err) {
                    console.warn("Errore enrich listing:", err);
                    return {
                        ...listing,
                        card: {
                            id: listing.cardId,
                            name: "Carta",
                            setName: "-",
                            number: "-",
                            rarity: "-",
                            imageUrl: ""
                        }
                    };
                }
            })
        );
    }

    async function enrichCollection(rawCollection) {
        const positiveCards = (rawCollection.cards || []).filter(card => (card.quantity || 0) > 0);

        return await Promise.all(
            positiveCards.map(async (cardEntry) => {
                try {
                    const card = await loadCard(cardEntry.cardId);
                    return {
                        ...cardEntry,
                        ...card
                    };
                } catch (err) {
                    console.warn("Errore enrich collection:", err);
                    return {
                        ...cardEntry,
                        name: "Carta",
                        setName: "-",
                        number: "-",
                        rarity: "-",
                        imageUrl: ""
                    };
                }
            })
        );
    }

    function adaptContactFlipWidth(email) {
        const contactFlip = document.getElementById("contactFlip");
        if (!contactFlip) return;

        const text = email && email.trim() ? email.trim() : "Email non disponibile";

        const temp = document.createElement("span");
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.whiteSpace = "nowrap";
        temp.style.fontSize = "0.78rem";
        temp.style.fontWeight = "700";
        temp.style.fontFamily = "'DM Sans', 'Segoe UI', sans-serif";
        temp.textContent = text;

        document.body.appendChild(temp);

        const measuredWidth = Math.ceil(temp.getBoundingClientRect().width);
        document.body.removeChild(temp);

        const minWidth = 150;
        const horizontalPadding = 36; // padding + bordo + un po' di margine visivo
        const maxWidth = 420;

        const finalWidth = Math.max(minWidth, Math.min(measuredWidth + horizontalPadding, maxWidth));

        contactFlip.style.width = `${finalWidth}px`;
    }

    function countryCodeToFlagEmoji(code) {
        if (!code || code.length !== 2) return "🏳️";
        return code
            .toUpperCase()
            .split("")
            .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
            .join("");
    }

    // ─── RENDER PROFILE ───
    function renderProfile(profile) {
        sellerUsernameEl.textContent = profile.username || "Venditore";
        infoNomeEl.textContent = profile.nome || "-";
        infoCognomeEl.textContent = profile.cognome || "-";
        infoRatingEl.textContent = `${Number(profile.averageRating || 0).toFixed(1)} ★`;
        infoSalesEl.textContent = profile.totalSales ?? 0;
        sellerEmail = profile.email || "Email non disponibile";
        contactEmailText.textContent = sellerEmail;
        adaptContactFlipWidth(sellerEmail);
        infoCountryNameEl.textContent = profile.paese || "-";
        infoCountryFlagEl.textContent = countryCodeToFlagEmoji(profile.paeseCode);
    }

    function setupContactFlip() {
        contactFlip.addEventListener("click", () => {
            contactFlipInner.classList.toggle("flipped");
        });
    }

    // ─── FILTER OPTIONS ───
    function populateCollectionFilterDropdowns() {
        const rarities = [...new Set(collection.map(c => c.rarity).filter(Boolean))].sort();
        const sets = [...new Set(collection.map(c => c.setName).filter(Boolean))].sort();

        const prevRarity = filterRarity.value;
        const prevSet = filterSet.value;

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

    // ─── OFFERS RENDER ───
    function createListingRow(listing) {
        const row = document.createElement("div");
        row.classList.add("seller-listing-row"); // usa la stessa del card-page

        row.innerHTML = `
        <div class="seller-listing-card-cell">
            <a href="http://localhost:8084/card-page.html?cardId=${encodeURIComponent(listing.cardId)}"
            style="display:flex; align-items:center; gap:12px; text-decoration:none; color:inherit;">

                <img class="seller-listing-thumb"
                     src="${listing.card?.imageUrl || ''}"
                     alt="">

                <div class="seller-listing-card-text">
                    <div class="seller-listing-card-name">
                       ${listing.card?.name || 'Carta'}
                 </div>
                    <div class="seller-listing-card-meta">
                     ${listing.card?.setName || ''}
                    </div>
                </div>
            </a>
        </div>

        <div>
            <span class="condition-badge ${conditionClass(listing.condition)}">
                ${listing.condition || '-'}
            </span>
        </div>

        <div class="qty-cell">
            ${listing.quantity}
        </div>

        <div class="price-cell">
            € ${Number(listing.price).toFixed(2)}
        </div>

        <div class="actions-cell">

            <!-- INPUT QUANTITÀ (COME CARD-PAGE) -->
            <input
                id="qty-${listing.id}"
                type="number"
                class="buy-qty-input"
                min="1"
                max="${listing.quantity}"
                value="1"
            >

            <!-- BOTTONE CARRELLO -->
            <button class="icon-cart-button buy-button"
                data-listing-id="${listing.id}"
                data-card-id="${listing.cardId}"
                data-seller="${listing.sellerUsername}"
                data-condition="${listing.condition}"
                data-price="${listing.price}"
                data-max-quantity="${listing.quantity}"
                aria-label="Aggiungi al carrello">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                     viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </button>

            <!-- TRADE -->
            <button class="trade-button"
                data-listing-id="${listing.id}"
                data-seller="${listing.sellerUsername}">
                Scambia
            </button>
        </div>
    `;

        return row;
    }

    // ─── COLLECTION RENDER ───
    function createCollectionCard(card) {
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <span class="condition-badge ${conditionClass(card.condition)}">${card.condition || ''}</span>
            <a href="http://localhost:8084/card-page.html?cardId=${card.cardId}">
                <img src="${card.imageUrl || ''}" alt="${card.name || ''}">
            </a>
            <div class="card-info">
                <span class="card-name" title="${card.name || ''}">${card.name || ''}</span>
                <span class="card-rarity">${card.rarity || ''}</span>
                <div class="card-meta">${card.setName || ''}</div>
                <div class="profile-card-qty">Quantità: ${card.quantity}</div>
            </div>
        `;

        return div;
    }

    // ─── SORT ───
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Secret Rare', 'Hyper Rare'];

    function sortOffers(items) {
        const mode = filterSortOffers.value;

        return [...items].sort((a, b) => {
            if (mode === 'price-asc') return a.price - b.price;
            if (mode === 'price-desc') return b.price - a.price;
            if (mode === 'name-asc') return (a.card?.name || '').localeCompare(b.card?.name || '');
            if (mode === 'name-desc') return (b.card?.name || '').localeCompare(a.card?.name || '');
            return 0;
        });
    }

    function sortCollection(cards) {
        const mode = filterSortCollection.value;

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

    // ─── ACTIVE FILTER CHIPS ───
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

        if (activeTab === 'offers') {
            if (filterCondition.value) {
                chips.push({
                    label: `Condizione: ${filterCondition.value}`,
                    clear: () => {
                        filterCondition.value = '';
                        applyFilters();
                    }
                });
            }
        } else {
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

            if (filterCollectionCondition.value) {
                chips.push({
                    label: `Condizione: ${filterCollectionCondition.value}`,
                    clear: () => {
                        filterCollectionCondition.value = '';
                        applyFilters();
                    }
                });
            }
        }

        chips.forEach(chip => {
            const el = document.createElement("div");
            el.classList.add("filter-chip");
            el.innerHTML = `<span>${chip.label}</span><span class="chip-remove">✕</span>`;
            el.querySelector(".chip-remove").addEventListener("click", chip.clear);
            activeFiltersEl.appendChild(el);
        });
    }

    // ─── APPLY FILTERS ───
    function applyFilters() {
        const search = filterSearch.value.toLowerCase().trim();

        if (activeTab === 'offers') {
            let filtered = listings.filter(item => {
                if (filterCondition.value && item.condition !== filterCondition.value) return false;

                if (search) {
                    const text = `${item.card?.name || ''} ${item.card?.rarity || ''} ${item.card?.setName || ''} ${item.condition || ''}`.toLowerCase();
                    if (!search.split(/\s+/).every(w => text.includes(w))) return false;
                }

                return true;
            });

            filtered = sortOffers(filtered);

            listingContainer.innerHTML = '';
            filtered.forEach((listing, i) => {
                const el = createListingRow(listing);
                el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
                listingContainer.appendChild(el);
            });
            setupBuyButtons();
            setupTradeButtons();

            resultsBar.textContent = `${filtered.length} offerte`;
            offersSection.classList.remove("hidden");
            collectionSection.classList.add("hidden");
            emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
        } else {
            let filtered = collection.filter(card => {
                if ((card.quantity || 0) <= 0) return false;
                if (filterRarity.value && card.rarity !== filterRarity.value) return false;
                if (filterSet.value && card.setName !== filterSet.value) return false;
                if (filterCollectionCondition.value && card.condition !== filterCollectionCondition.value) return false;

                if (search) {
                    const text = `${card.name || ''} ${card.rarity || ''} ${card.setName || ''} ${card.condition || ''}`.toLowerCase();
                    if (!search.split(/\s+/).every(w => text.includes(w))) return false;
                }

                return true;
            });

            filtered = sortCollection(filtered);

            collectionGrid.innerHTML = '';
            filtered.forEach((card, i) => {
                const el = createCollectionCard(card);
                el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
                collectionGrid.appendChild(el);
            });

            resultsBar.textContent = `${filtered.length} carte`;
            offersSection.classList.add("hidden");
            collectionSection.classList.remove("hidden");
            emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
        }

        updateActiveChips();
    }

    // ─── TAB SWITCH ───
    function switchTab(tab) {
        activeTab = tab;

        tabOffers.classList.toggle("active", tab === "offers");
        tabCollection.classList.toggle("active", tab === "collection");

        offersFilters.classList.toggle("hidden", tab !== "offers");
        collectionFilters.classList.toggle("hidden", tab !== "collection");

        filterSearch.placeholder = tab === "offers"
            ? "Cerca tra le offerte del venditore…"
            : "Cerca nella collezione del venditore…";

        applyFilters();
    }

    tabOffers.addEventListener("click", () => switchTab("offers"));
    tabCollection.addEventListener("click", () => switchTab("collection"));

    // ─── FILTER EVENTS ───
    filterSearch.addEventListener("input", applyFilters);
    filterCondition.addEventListener("change", applyFilters);
    filterSortOffers.addEventListener("change", applyFilters);
    filterRarity.addEventListener("change", applyFilters);
    filterSet.addEventListener("change", applyFilters);
    filterCollectionCondition.addEventListener("change", applyFilters);
    filterSortCollection.addEventListener("change", applyFilters);

    resetFilters.addEventListener("click", () => {
        filterSearch.value = '';
        filterCondition.value = '';
        filterSortOffers.value = 'price-asc';
        filterRarity.value = '';
        filterSet.value = '';
        filterCollectionCondition.value = '';
        filterSortCollection.value = 'name-asc';
        applyFilters();
    });

    // ─── INIT ───
    try {
        const profile = await loadSellerProfile();
        renderProfile(profile);
        setupContactFlip();

        const rawListings = await loadSellerListings();
        listings = await enrichListings(rawListings);

        const rawCollection = await loadSellerCollection();
        collection = await enrichCollection(rawCollection);

        populateCollectionFilterDropdowns();

        filterSearch.value = '';
        filterCondition.value = '';
        filterSortOffers.value = 'price-asc';
        filterRarity.value = '';
        filterSet.value = '';
        filterCollectionCondition.value = '';
        filterSortCollection.value = 'name-asc';

        switchTab("offers");

        applyFilters();
    } catch (err) {
        console.error("Errore init seller profile:", err);
        alert("Errore nel caricamento del profilo venditore");
    }

    function setupTradeButtons() {
        document.querySelectorAll('.trade-button:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!token) { window.location.href = 'http://localhost:8080/login.html'; return; }
                const listingId = btn.dataset.listingId;
                const seller    = btn.dataset.seller;
                window.location.href = `http://localhost:8088/trade.html?listingId=${encodeURIComponent(listingId)}&seller=${encodeURIComponent(seller)}`;
            });
        });
    }

    function setupBuyButtons() {
        document.querySelectorAll('.buy-button:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', async () => {
                const listingId = btn.dataset.listingId;
                const maxQty    = parseInt(btn.dataset.maxQuantity);

                // Leggi la quantità selezionata dall'utente
                const qtyInput  = document.getElementById(`qty-${listingId}`);
                const selectedQty = qtyInput ? parseInt(qtyInput.value) : 1;

                // Validazione base
                if (selectedQty > maxQty || selectedQty < 1) {
                    alert('Quantità non valida');
                    return;
                }

                btn.disabled = true;
                const cardId    = btn.dataset.cardId;
                const sellerId  = btn.dataset.seller;
                const condition = btn.dataset.condition;
                const price     = parseFloat(btn.dataset.price);

                try {
                    // 1. Reserve parziale (aggiunto ?qty=...)
                    const rr = await fetch(`${API_LISTING}/${listingId}/reserve?qty=${selectedQty}`, { method: 'PATCH' });
                    if (!rr.ok) throw new Error('Impossibile riservare le carte');

                    // 2. Add to cart (invia selectedQty invece di tutta la quantity)
                    const cr = await fetch(`${API_CART}/add`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'username': loggedUsername
                        },
                        body: JSON.stringify({
                            listingId, cardId, sellerId, condition, price,
                            quantity: selectedQty // Qui mandiamo la quantità scelta!
                        })
                    });

                    if (!cr.ok) {
                        // Se fallisce, rilascia la quantità bloccata
                        await fetch(`${API_LISTING}/${listingId}/release?qty=${selectedQty}`, { method: 'PATCH' }).catch(() => {});
                        throw new Error('Errore aggiunta al carrello');
                    }

                    // 3. Ricarica gli annunci dal server per aggiornare le quantità a schermo!
                    const rawListings = await loadSellerListings();
                    listings = await enrichListings(rawListings);
                    applyFilters();

                } catch (err) {
                    alert('Errore: ' + err.message);
                    btn.disabled = false;
                }
            });
        });
    }
});