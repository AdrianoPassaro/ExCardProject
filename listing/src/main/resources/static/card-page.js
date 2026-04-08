let currentListings = [];
let sortAscending = true;

function getCardIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("cardId");
}

async function loadCard(cardId) {
    const response = await fetch(`http://localhost:8082/cards/${cardId}`);

    if (!response.ok) {
        throw new Error("Carta non trovata");
    }

    return await response.json();
}

async function loadListings(cardId) {
    const response = await fetch(`/listings/card/${cardId}`);

    if (!response.ok) {
        throw new Error("Errore nel caricamento degli annunci");
    }

    return await response.json();
}

function renderCard(card) {
    document.getElementById("cardName").textContent = card.name || "-";
    document.getElementById("cardSet").textContent = card.setName || "-";
    document.getElementById("cardNumber").textContent = card.number || "-";
    document.getElementById("cardRarity").textContent = card.rarity || "-";

    document.getElementById("summarySet").textContent = card.setName || "-";
    document.getElementById("summaryNumber").textContent = card.number || "-";
    document.getElementById("summaryRarity").textContent = card.rarity || "-";

    const img = document.getElementById("cardImage");
    img.src = card.imageUrl || "";
    img.alt = card.name || "Carta";
}

function updateListingStats(listings) {
    const count = listings.length;
    document.getElementById("summaryListings").textContent = count;
    document.getElementById("resultsBar").textContent = `${count} annunci`;

    if (!listings.length) {
        document.getElementById("summaryLowestPrice").textContent = "-";
        document.getElementById("summaryAveragePrice").textContent = "-";
        return;
    }

    const prices = listings.map(l => Number(l.price)).filter(p => !isNaN(p));
    const lowest = Math.min(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    document.getElementById("summaryLowestPrice").textContent = `€ ${lowest.toFixed(2)}`;
    document.getElementById("summaryAveragePrice").textContent = `€ ${average.toFixed(2)}`;
}

function getConditionBadgeClass(condition) {
    switch (condition) {
        case "Mint":
            return "condition-mint";
        case "Near Mint":
            return "condition-near-mint";
        case "Excellent":
            return "condition-excellent";
        case "Good":
            return "condition-good";
        case "Played":
            return "condition-played";
        case "Poor":
            return "condition-poor";
        default:
            return "condition-default";
    }
}

function renderListings(listings) {
    const container = document.getElementById("listingContainer");
    container.innerHTML = "";

    updateListingStats(listings);

    if (!listings || listings.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🃏</div>
                <div class="empty-title">Nessun annuncio disponibile</div>
                <div class="empty-subtitle">Al momento nessun utente sta vendendo questa carta.</div>
            </div>
        `;
        return;
    }

    listings.forEach((listing, index) => {
        const row = document.createElement("div");
        row.className = "listing-row";
        row.style.animationDelay = `${Math.min(index * 40, 240)}ms`;

        const badgeClass = getConditionBadgeClass(listing.condition);

        row.innerHTML = `
            <div class="seller-cell">
                <a class="seller-link"
                    href="http://localhost:8081/seller-profile.html?username=${encodeURIComponent(listing.sellerUsername)}">
                    ${listing.sellerUsername}
                </a>
            </div>

            <div>
                <span class="condition-badge ${badgeClass}">${listing.condition}</span>
            </div>

            <div class="qty-cell">${listing.quantity}</div>

            <div class="price-cell">€ ${Number(listing.price).toFixed(2)}</div>

            <div class="actions-cell">
                <button class="icon-cart-button buy-button" data-listing-id="${listing.id}" title="Aggiungi al carrello" aria-label="Aggiungi al carrello">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </button>

                <button class="trade-button" data-listing-id="${listing.id}" data-seller="${listing.sellerUsername}">
                    Scambia
                </button>
            </div>
        `;

        container.appendChild(row);
    });

    setupBuyButtons();
    setupTradeButtons();
}

function sortListingsByPrice() {
    currentListings.sort((a, b) => {
        return sortAscending ? a.price - b.price : b.price - a.price;
    });

    renderListings(currentListings);

    const sortButton = document.getElementById("sortPriceButton");
    sortButton.textContent = sortAscending ? "Ordina per prezzo ↓" : "Ordina per prezzo ↑";
    sortAscending = !sortAscending;
}

function setupSortButton() {
    const sortButton = document.getElementById("sortPriceButton");
    sortButton.addEventListener("click", sortListingsByPrice);
}

function setupSellButton() {
    const sellButton = document.getElementById("sellButton");
    const sellFormSection = document.getElementById("sellFormSection");

    sellButton.addEventListener("click", () => {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            alert("Devi effettuare il login per creare un annuncio.");
            window.location.href = "http://localhost:8080/login.html";
            return;
        }

        sellFormSection.classList.toggle("hidden");
    });
}

function setupSellForm(cardId) {
    const sellForm = document.getElementById("sellForm");
    const sellMessage = document.getElementById("sellMessage");

    sellForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("jwtToken");

        if (!token) {
            alert("Devi effettuare il login.");
            window.location.href = "http://localhost:8080/login.html";
            return;
        }

        const condition = document.getElementById("condition").value;
        const quantity = Number(document.getElementById("quantity").value);
        const price = Number(document.getElementById("price").value);

        try {
            const response = await fetch("/listings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    cardId,
                    condition,
                    quantity,
                    price
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Errore durante la creazione dell'annuncio");
            }

            sellMessage.textContent = "Annuncio creato con successo.";
            sellMessage.className = "sell-message success";

            sellForm.reset();

            currentListings = await loadListings(cardId);
            currentListings.sort((a, b) => a.price - b.price);
            renderListings(currentListings);

        } catch (error) {
            console.error(error);
            sellMessage.textContent = "Errore: " + error.message;
            sellMessage.className = "sell-message error";
        }
    });
}

function setupBuyButtons() {
    const buttons = document.querySelectorAll(".buy-button");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const token = localStorage.getItem("jwtToken");

            if (!token) {
                alert("Devi effettuare il login per comprare.");
                window.location.href = "http://localhost:8080/login.html";
                return;
            }

            const listingId = button.getAttribute("data-listing-id");

            alert(`Funzione acquisto/carrello da collegare. Listing selezionato: ${listingId}`);
        });
    });
}

function setupTradeButtons() {
    const buttons = document.querySelectorAll(".trade-button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const token = localStorage.getItem("jwtToken");

            if (!token) {
                alert("Devi effettuare il login per proporre uno scambio.");
                window.location.href = "http://localhost:8080/login.html";
                return;
            }

            const listingId = button.getAttribute("data-listing-id");
            const seller = button.getAttribute("data-seller");

            window.location.href = `http://localhost:8088/trade.html?listingId=${encodeURIComponent(listingId)}&seller=${encodeURIComponent(seller)}`;
        });
    });
}

async function initPage() {
    const cardId = getCardIdFromUrl();

    if (!cardId) {
        alert("cardId mancante nell'URL");
        return;
    }

    try {
        const [card, listings] = await Promise.all([
            loadCard(cardId),
            loadListings(cardId)
        ]);

        currentListings = listings.sort((a, b) => a.price - b.price);

        renderCard(card);
        renderListings(currentListings);
        setupSortButton();
        setupSellButton();
        setupSellForm(cardId);

    } catch (error) {
        console.error(error);
        alert("Errore nel caricamento della pagina della carta");
    }
}

initPage();