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

function renderResults(query, cards) {
    const title = document.getElementById("resultsTitle");
    const container = document.getElementById("resultsContainer");
    const searchInput = document.getElementById("searchInput");

    title.textContent = `Risultati per: "${query}"`;
    searchInput.value = query;
    container.innerHTML = "";

    if (!cards || cards.length === 0) {
        container.innerHTML = `<p>Nessuna carta trovata con annunci attivi.</p>`;
        return;
    }

    cards.forEach(card => {
        const cardElement = document.createElement("a");
        cardElement.className = "card-result";
        cardElement.href = `card-page.html?cardId=${card.cardId}`;

        cardElement.innerHTML = `
            <img src="${card.imageUrl || ""}" alt="${card.name}">
            <div class="card-result-body">
                <div class="card-result-title">${card.name}</div>
                <div class="card-result-meta"><strong>Set:</strong> ${card.setName || "-"}</div>
                <div class="card-result-meta"><strong>Numero:</strong> ${card.number || "-"}</div>
                <div class="card-result-price">Prezzo medio: € ${card.averagePrice != null ? "€ " + Numeber(card.averagePrice).toFixed(2) : "N/A"}</div>
            </div>
        `;

        container.appendChild(cardElement);
    });
}

async function initSearchPage() {
    const query = getQueryFromUrl();

    if (!query.trim()) {
        document.getElementById("resultsTitle").textContent = "Inserisci un termine di ricerca";
        return;
    }

    try {
        const cards = await searchCards(query);
        renderResults(query, cards);
    } catch (error) {
        console.error(error);
        document.getElementById("resultsContainer").innerHTML =
            `<p>Errore durante il caricamento dei risultati.</p>`;
    }
}

initSearchPage();