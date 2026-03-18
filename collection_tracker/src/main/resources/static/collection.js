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

    const cardTemplate = {
        name: "Pikachu",
        rarity: "Ultra Rare",
        expansion: "Ascended Heroes",
        condition: "Near Mint",
        imageUrl: "https://storage.googleapis.com/images.pricecharting.com/o7oe255flanpc7fa/1600.jpg",
        quantity: 1
    };

    let collection = [];

    async function loadCollection() {
        const res = await fetch("/api/collection", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "username": username
            }
        });
        if (res.ok) {
            const data = await res.json();
            collection = data.cards || [];
            renderCollection();
        }
    }

    async function updateQuantity(card, delta) {
        const res = await fetch("/api/collection/card", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "username": username
            },
            body: JSON.stringify({
                name: card.name,
                rarity: card.rarity,
                condition: card.condition,
                delta: delta
            })
        });
        if (res.ok) {
            const data = await res.json();
            collection = data.cards;
            renderCollection();
        }
    }

    async function addCard(card) {
        const exists = collection.find(c =>
            c.name === card.name &&
            c.rarity === card.rarity &&
            c.condition === card.condition
        );

        if (exists) {
            await updateQuantity(card, 1);
        } else {
            await fetch("/api/collection/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "username": username
                },
                body: JSON.stringify(card)
            });
            await loadCollection();
        }
    }

    function createCardElement(card) {
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <img src="${card.imageUrl}" alt="${card.name}">
            <div class="card-info">
                <strong>${card.name}</strong><br>
                ${card.rarity}<br>
                ${card.expansion}<br>
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

    addBtn.addEventListener("click", () => addCard(cardTemplate));

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "http://localhost:8080/login.html";
    });

    await loadCollection();
});