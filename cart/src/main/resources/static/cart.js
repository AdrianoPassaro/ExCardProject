const API_CART = "http://localhost:8082/api/cart";
const API_ORDER = "http://localhost:8083/api/order/checkout";

const token = localStorage.getItem("jwtToken");

// 🔥 estrai username dal JWT
function getUsernameFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.username;
}

const username = getUsernameFromToken(token);
document.getElementById("username").innerText = username;

// 🔥 carica carrello
async function loadCart() {

    const res = await fetch(API_CART, {
        headers: {
            "username": username
        }
    });

    const cart = await res.json();
    const container = document.getElementById("cart-list");
    container.innerHTML = "";

    if (!cart.items || cart.items.length === 0) {
        container.innerHTML = "<p>Carrello vuoto</p>";
        return;
    }

    cart.items.forEach(item => {

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <img src="${item.imageUrl}" />
            <div class="info">
                <div><b>${item.name}</b></div>
                <div>Venditore: ${item.sellerUsername}</div>
                <div class="price">€ ${item.price}</div>
            </div>
            <button class="remove" onclick="removeItem('${item.listingId}')">Rimuovi</button>
        `;

        container.appendChild(div);
    });
}

// 🔥 rimuovi item
async function removeItem(listingId) {
    await fetch(`${API_CART}/${listingId}`, {
        method: "DELETE",
        headers: {
            "username": username
        }
    });

    loadCart();
}

// 🔥 svuota carrello
async function clearCart() {
    await fetch(`${API_CART}/clear`, {
        method: "DELETE",
        headers: {
            "username": username
        }
    });

    loadCart();
}

// 🔥 checkout
async function checkout() {

    const res = await fetch(API_ORDER, {
        method: "POST",
        headers: {
            "username": username
        }
    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {
        loadCart();
    }
}

// init
loadCart();