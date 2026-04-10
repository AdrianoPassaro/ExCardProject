document.addEventListener("DOMContentLoaded", async () => {
    const sellerUsernameEl   = document.getElementById("sellerUsername");
    const infoUsernameEl     = document.getElementById("infoUsername");
    const infoNomeEl         = document.getElementById("infoNome");
    const infoCognomeEl      = document.getElementById("infoCognome");
    const infoRatingEl       = document.getElementById("infoRating");
    const infoSalesEl        = document.getElementById("infoSales");
    const contactButton      = document.getElementById("contactButton");

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

    // ─── RENDER PROFILE ───
    function renderProfile(profile) {
        sellerUsernameEl.textContent = profile.username || "Venditore";
        infoUsernameEl.textContent = profile.username || "-";
        infoNomeEl.textContent = profile.nome || "-";
        infoCognomeEl.textContent = profile.cognome || "-";
        infoRatingEl.textContent = `${Number(profile.averageRating || 0).toFixed(1)} ★`;
        infoSalesEl.textContent = profile.totalSales ?? 0;
        sellerEmail = profile.email || null;
    }

    function setupContactButton() {
        contactButton.addEventListener("click", () => {
            if (!sellerEmail) {
                alert("Email non disponibile.");
                return;
            }
            alert(`Email venditore:\n${sellerEmail}`);
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
        row.classList.add("seller-listing-row");

        row.innerHTML = `
            <div class="seller-listing-card-cell">
                <img class="seller-listing-thumb" src="${listing.card?.imageUrl || ''}" alt="${listing.card?.name || ''}">
                <div class="seller-listing-card-text">
                    <div class="seller-listing-card-name">${listing.card?.name || ''}</div>
                    <div class="seller-listing-card-meta">${listing.card?.setName || ''} • ${listing.card?.rarity || ''}</div>
                </div>
            </div>
            <div><span class="condition-badge ${conditionClass(listing.condition)}">${listing.condition || '-'}</span></div>
            <div class="seller-listing-qty">${listing.quantity}</div>
            <div class="seller-listing-price">€ ${Number(listing.price).toFixed(2)}</div>
            <div>
                <a class="view-card-btn" href="http://localhost:8084/card-page.html?cardId=${listing.cardId}">Vedi carta</a>
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
            <img src="${card.imageUrl || ''}" alt="${card.name || ''}">
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
        setupContactButton();

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
});