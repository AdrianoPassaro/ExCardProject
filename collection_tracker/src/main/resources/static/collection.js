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
        // Crea modal
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.right = 0;
        modal.style.bottom = 0;
        modal.style.backgroundColor = "rgba(0,0,0,0.6)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = 2000;

        const content = document.createElement("div");
        content.style.backgroundColor = "white";
        content.style.padding = "20px";
        content.style.borderRadius = "8px";
        content.style.maxHeight = "80%";
        content.style.overflowY = "auto";

        let html = `<h3>Seleziona una carta</h3>`;
        html += `<select id="selectCard">`;
        catalog.forEach(c => {
            html += `<option value="${c.id}">${c.name} | ${c.rarity} | ${c.setName}</option>`;
        });
        html += `</select><br><br>`;
        html += `Condizione: <select id="selectCondition">
                    <option value="Near Mint">Near Mint</option>
                    <option value="Lightly Played">Lightly Played</option>
                    <option value="Moderately Played">Moderately Played</option>
                    <option value="Heavily Played">Heavily Played</option>
                 </select><br><br>`;
        html += `Quantità: <input type="number" id="inputQuantity" value="1" min="1" style="width:60px;"><br><br>`;
        html += `<button id="confirmAdd">Aggiungi</button> `;
        html += `<button id="cancelAdd">Annulla</button>`;

        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Eventi
        modal.querySelector("#cancelAdd").onclick = () => document.body.removeChild(modal);
        modal.querySelector("#confirmAdd").onclick = () => {
            const selectedCardId = modal.querySelector("#selectCard").value;
            const condition = modal.querySelector("#selectCondition").value;
            const quantity = parseInt(modal.querySelector("#inputQuantity").value);
            addCard(selectedCardId, condition, quantity);
            document.body.removeChild(modal);
        };
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