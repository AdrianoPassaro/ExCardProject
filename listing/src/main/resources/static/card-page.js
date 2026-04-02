let currentListings = [];

function getCardIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("cardId");
}

async function loadCard(cardId) {
    const response = await fetch(`/cards/${cardId}`);

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
    document.getElementById("cardName").textContent = card.name;
    document.getElementById("cardSet").textContent = card.setName || "-";
    document.getElementById("cardNumber").textContent = card.number || "-";
    document.getElementById("cardRarity").textContent = card.rarity || "-";
    document.getElementById("cardImage").src = card.imageUrl || "";
    document.getElementById("cardImage").alt = card.name;
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
            return "condition-good";
    }
}

function renderListings(listings) {
    const container = document.getElementById("listingContainer");
    container.innerHTML = "";

    if (!listings || listings.length === 0) {
        container.innerHTML = `<div class="empty-message">Nessun annuncio disponibile per questa carta.</div>`;
        return;
    }

    listings.forEach(listing => {
        const row = document.createElement("div");
        row.className = "listing-row";

        const badgeClass = getConditionBadgeClass(listing.condition);

        row.innerHTML = `
            <div>${listing.sellerUsername}</div>
            <div><span class="condition-badge ${badgeClass}">${listing.condition}</span></div>
            <div>${listing.quantity}</div>
            <div class="price">€ ${Number(listing.price).toFixed(2)}</div>
            <div><button class="buy-button" data-listing-id="${listing.id}">Compra</button></div>
        `;

        container.appendChild(row);
    });

    setupBuyButtons();
}

function sortListingsByPriceAscending() {
    currentListings.sort((a, b) => a.price - b.price);
    renderListings(currentListings);
}

function setupSortButton() {
    const sortButton = document.getElementById("sortPriceButton");
    sortButton.addEventListener("click", () => {
        sortListingsByPriceAscending();
    });
}

function setupSellButton() {
    const sellButton = document.getElementById("sellButton");
    const sellFormSection = document.getElementById("sellFormSection");

    sellButton.addEventListener("click", () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Devi effettuare il login per creare un annuncio.");
            window.location.href = "/login.html";
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

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Devi effettuare il login.");
            window.location.href = "/login.html";
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
                    cardId: cardId,
                    condition: condition,
                    quantity: quantity,
                    price: price
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Errore durante la creazione dell'annuncio");
            }

            sellMessage.textContent = "Annuncio creato con successo.";
            sellMessage.style.color = "green";

            sellForm.reset();

            currentListings = await loadListings(cardId);
            sortListingsByPriceAscending();

        } catch (error) {
            console.error(error);
            sellMessage.textContent = "Errore: " + error.message;
            sellMessage.style.color = "red";
        }
    });
}

function setupBuyButtons() {
    const buttons = document.querySelectorAll(".buy-button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Devi effettuare il login per comprare.");
                window.location.href = "/login.html";
                return;
            }

            const listingId = button.getAttribute("data-listing-id");

            alert(`Funzione acquisto da implementare. Listing selezionato: ${listingId}`);
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

        currentListings = listings;

        renderCard(card);
        sortListingsByPriceAscending();
        setupSortButton();
        setupSellButton();
        setupSellForm(cardId);

    } catch (error) {
        console.error(error);
        alert("Errore nel caricamento della pagina della carta");
    }
}

initPage();