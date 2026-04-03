document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("cardGrid");
    const addBtn = document.getElementById("addCardBtn");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const logoutBtn = document.getElementById("logoutBtn");

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
    usernameDisplay.textContent = `👤 ${username}`;
    usernameDisplay.style.color = "#1f4e99";

    let collection = [];
    let catalog = [];

    // ---------- FUNZIONI BACKEND ----------

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
            renderCollection();
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
                body: JSON.stringify({
                    cardId: cardId,
                    condition: condition,
                    quantity: quantity
                })
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
                    delta: delta
                })
            });
            if (!res.ok) throw new Error("Errore updateQuantity");
            const data = await res.json();
            collection = data.cards;
            renderCollection();
        } catch (err) {
            console.error("Errore updateQuantity:", err);
        }
    }

    // ---------- RENDER COLLECTION ----------

    function createCardElement(card) {
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}">
            <div class="card-info">
                <strong>${card.name}</strong><br>
                ${card.rarity}<br>
                ${card.setName}<br>
                ${card.condition}<br>
                <div class="quantity-controls">
                    <button class="minus-btn">-</button>
                    <span class="quantity">${card.quantity}</span>
                    <button class="plus-btn">+</button>
                </div>
            </div>
        `;
        div.querySelector(".plus-btn").addEventListener("click", () => updateQuantity(card, 1));
        div.querySelector(".minus-btn").addEventListener("click", () => updateQuantity(card, -1));
        return div;
    }

    function renderCollection() {
        grid.innerHTML = "";
        collection.forEach(card => {
            if (card.quantity > 0) grid.appendChild(createCardElement(card));
        });
    }

    // ---------- MODAL AGGIUNGI CARTA ----------

    function openAddCardModal() {
        const modal = document.createElement("div");
        modal.classList.add("modal-overlay");

        modal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">✨ Aggiungi una carta</h3>

                <div class="modal-field">
                    <label for="searchCard">🔍 Cerca carta</label>
                    <input type="text" id="searchCard" placeholder="Scrivi il nome della carta..." autocomplete="off">
                    <div id="cardCount" class="card-count"></div>
                </div>

                <div class="modal-field">
                    <label for="selectCard">Carta</label>
                    <select id="selectCard" size="6"></select>
                </div>

                <div class="modal-field">
                    <label for="selectCondition">Condizione</label>
                    <select id="selectCondition">
                        <option value="Near Mint">Near Mint</option>
                        <option value="Lightly Played">Lightly Played</option>
                        <option value="Moderately Played">Moderately Played</option>
                        <option value="Heavily Played">Heavily Played</option>
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
            const query = filter.toLowerCase().trim();
            const words = query.split(/\s+/).filter(Boolean);

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

            // Auto-seleziona il primo risultato
            if (selectCard.options.length > 0) selectCard.selectedIndex = 0;

            cardCount.textContent = filtered.length === catalog.length
                ? `${catalog.length} carte disponibili`
                : `${filtered.length} risultati su ${catalog.length}`;
        }

        // Popola subito con tutte le carte
        populateSelect("");

        searchInput.addEventListener("input", () => populateSelect(searchInput.value));

        modal.querySelector("#cancelAdd").onclick = () => document.body.removeChild(modal);
        modal.querySelector("#confirmAdd").onclick = () => {
            if (!selectCard.value) {
                alert("Nessuna carta selezionata.");
                return;
            }
            const selectedCardId = selectCard.value;
            const condition = modal.querySelector("#selectCondition").value;
            const quantity = parseInt(modal.querySelector("#inputQuantity").value);
            addCard(selectedCardId, condition, quantity);
            document.body.removeChild(modal);
        };

        // Chiudi cliccando fuori
        modal.addEventListener("click", (e) => {
            if (e.target === modal) document.body.removeChild(modal);
        });

        // Focus automatico sulla ricerca
        setTimeout(() => searchInput.focus(), 50);
    }

    addBtn.addEventListener("click", openAddCardModal);

    // ---------- LOGOUT ----------
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "http://localhost:8080/login.html";
    });

    // ---------- CARICA DATI ----------
    await loadCatalog();
    await loadCollection();
});