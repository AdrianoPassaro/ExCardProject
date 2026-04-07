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
        container.innerHTML = `<p>Nessuna carta corrisponde alla ricerca.</p>`;
        return;
    }

    cards.forEach(card => {
        const cardElement = document.createElement("a");
        cardElement.className = "card-result";
        cardElement.href = `card-page.html?cardId=${card.cardId}`;

        const averagePriceText =
            card.averagePrice != null
                ? `€ ${Number(card.averagePrice).toFixed(2)}`
                : "Nessun annuncio attivo";

        cardElement.innerHTML = `
            <img src="${card.imageUrl || ""}" alt="${card.name}">
            <div class="card-result-body">
                <div class="card-result-title">${card.name}</div>
                <div class="card-result-meta"><strong>Set:</strong> ${card.setName || "-"}</div>
                <div class="card-result-meta"><strong>Numero:</strong> ${card.number || "-"}</div>
                <div class="card-result-price"><strong>Prezzo medio:</strong> ${averagePriceText}</div>
            </div>
        `;

        container.appendChild(cardElement);
    });
}

async function initSearchPage() {
    const query = getQueryFromUrl();

    if (!query.trim()) {
        document.getElementById("resultsTitle").textContent = "Inserisci un termine di ricerca";
        document.getElementById("resultsContainer").innerHTML =
            `<p>Inserisci il nome di una carta per avviare la ricerca.</p>`;
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