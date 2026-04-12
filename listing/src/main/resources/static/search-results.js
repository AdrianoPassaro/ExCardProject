let allCards = [];

function getQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
}

async function searchCards(query) {
    const response = await fetch(`/listings/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
        throw new Error("Errore durante la ricerca");
    }

    return await response.json();
}

function populateSetFilter(cards) {
    const filterSet = document.getElementById("filterSet");
    const previousValue = filterSet.value;

    const sets = [...new Set(cards.map(card => card.setName).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "it", { sensitivity: "base" })
    );

    filterSet.innerHTML = `<option value="">Tutti</option>`;

    sets.forEach(setName => {
        const option = document.createElement("option");
        option.value = setName;
        option.textContent = setName;
        if (setName === previousValue) {
            option.selected = true;
        }
        filterSet.appendChild(option);
    });
}

function sortCards(cards) {
    const mode = document.getElementById("filterSort").value;

    return [...cards].sort((a, b) => {
        if (mode === "name-asc") {
            return (a.name || "").localeCompare((b.name || ""), "it", { sensitivity: "base" });
        }

        if (mode === "name-desc") {
            return (b.name || "").localeCompare((a.name || ""), "it", { sensitivity: "base" });
        }

        if (mode === "set-asc") {
            return (a.setName || "").localeCompare((b.setName || ""), "it", { sensitivity: "base" });
        }

        if (mode === "set-desc") {
            return (b.setName || "").localeCompare((a.setName || ""), "it", { sensitivity: "base" });
        }

        if (mode === "price-asc") {
            const priceA = a.averagePrice == null ? Number.POSITIVE_INFINITY : Number(a.averagePrice);
            const priceB = b.averagePrice == null ? Number.POSITIVE_INFINITY : Number(b.averagePrice);
            return priceA - priceB;
        }

        if (mode === "price-desc") {
            const priceA = a.averagePrice == null ? Number.NEGATIVE_INFINITY : Number(a.averagePrice);
            const priceB = b.averagePrice == null ? Number.NEGATIVE_INFINITY : Number(b.averagePrice);
            return priceB - priceA;
        }

        return 0;
    });
}

function createCardElement(card) {
    const cardElement = document.createElement("a");
    cardElement.className = "card-result";
    cardElement.href = `card-page.html?cardId=${card.cardId}`;

    const averagePriceText =
        card.averagePrice != null
            ? `€ ${Number(card.averagePrice).toFixed(2)}`
            : "Nessun annuncio attivo";

    cardElement.innerHTML = `
        <img src="${card.imageUrl || ""}" alt="${card.name || "Carta"}">
        <div class="card-result-body">
            <div class="card-result-title" title="${card.name || ""}">${card.name || "-"}</div>
            <div class="card-result-rarity">${card.number || "-"}</div>
            <div class="card-result-meta">${card.setName || "-"}</div>
            <div class="card-result-price"><strong>Prezzo medio:</strong> ${averagePriceText}</div>
        </div>
    `;

    return cardElement;
}

function updateActiveChips() {
    const activeFilters = document.getElementById("activeFilters");
    const filterSet = document.getElementById("filterSet");
    const filterSort = document.getElementById("filterSort");

    activeFilters.innerHTML = "";

    const chips = [];

    if (filterSet.value) {
        chips.push({
            label: `Set: ${filterSet.value}`,
            clear: () => {
                filterSet.value = "";
                applyFilters();
            }
        });
    }

    if (filterSort.value !== "name-asc") {
        const selectedText = filterSort.options[filterSort.selectedIndex]?.textContent || "Ordine";
        chips.push({
            label: selectedText,
            clear: () => {
                filterSort.value = "name-asc";
                applyFilters();
            }
        });
    }

    chips.forEach(chip => {
        const chipEl = document.createElement("div");
        chipEl.className = "filter-chip";
        chipEl.innerHTML = `<span>${chip.label}</span><span class="chip-remove">✕</span>`;
        chipEl.querySelector(".chip-remove").addEventListener("click", chip.clear);
        activeFilters.appendChild(chipEl);
    });
}

function applyFilters() {
    const filterSet = document.getElementById("filterSet");
    const resultsContainer = document.getElementById("resultsContainer");
    const resultsBar = document.getElementById("resultsBar");
    const emptyState = document.getElementById("emptyState");

    let filtered = [...allCards];

    if (filterSet.value) {
        filtered = filtered.filter(card => card.setName === filterSet.value);
    }

    filtered = sortCards(filtered);

    resultsContainer.innerHTML = "";

    filtered.forEach((card, index) => {
        const cardEl = createCardElement(card);
        cardEl.style.animationDelay = `${Math.min(index * 30, 300)}ms`;
        resultsContainer.appendChild(cardEl);
    });

    const total = allCards.length;
    resultsBar.textContent = filtered.length < total
        ? `${filtered.length} di ${total} carte`
        : `${total} carte`;

    emptyState.style.display = filtered.length === 0 ? "flex" : "none";

    updateActiveChips();
}

function setupFiltersBarSticky() {
    const filtersBar = document.getElementById("filtersBar");
    const navbarHeight = 72;

    window.addEventListener("scroll", () => {
        const top = filtersBar.getBoundingClientRect().top;
        filtersBar.classList.toggle("stuck", top <= navbarHeight);
    });
}

function setupFilterEvents() {
    const filterSet = document.getElementById("filterSet");
    const filterSort = document.getElementById("filterSort");
    const resetFilters = document.getElementById("resetFilters");

    filterSet.addEventListener("change", applyFilters);
    filterSort.addEventListener("change", applyFilters);

    resetFilters.addEventListener("click", () => {
        filterSet.value = "";
        filterSort.value = "name-asc";
        applyFilters();
    });
}

async function initSearchPage() {
    const query = getQueryFromUrl();

    const resultsTitle = document.getElementById("resultsTitle");
    const resultsSubtitle = document.getElementById("resultsSubtitle");
    const resultsContainer = document.getElementById("resultsContainer");
    const searchInput = document.getElementById("searchInput");
    const resultsBar = document.getElementById("resultsBar");
    const emptyState = document.getElementById("emptyState");

    searchInput.value = query;

    setupFiltersBarSticky();
    setupFilterEvents();

    if (!query.trim()) {
        resultsTitle.textContent = "Inserisci un termine di ricerca";
        resultsSubtitle.textContent = "Cerca una carta per visualizzare i risultati";
        resultsContainer.innerHTML = "";
        resultsBar.textContent = "";
        emptyState.style.display = "flex";
        return;
    }

    resultsTitle.textContent = `Risultati per: "${query}"`;
    resultsSubtitle.textContent = "Carte trovate nel catalogo e negli annunci";

    try {
        allCards = await searchCards(query);
        populateSetFilter(allCards);
        applyFilters();
    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = "";
        resultsBar.textContent = "";
        emptyState.style.display = "flex";
        emptyState.innerHTML = `
            <div class="empty-icon">⚠️</div>
            <p class="empty-title">Errore durante il caricamento</p>
            <p class="empty-sub">Riprova tra qualche istante</p>
        `;
    }
}

initSearchPage();