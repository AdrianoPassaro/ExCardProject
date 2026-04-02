document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartDiv = document.getElementById('cart');
    const totalDiv = document.getElementById('total');

    function extractUsernameFromToken(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    }

    const username = extractUsernameFromToken(token);
    usernameDisplay.innerText = "👤 " + username;

    async function loadCart() {

        const res = await fetch('http://localhost:8083/api/orders/cart-preview');
        const data = await res.json();

        let total = 0;

        data.forEach(item => {
            cartDiv.innerHTML += `
                <div class="card">
                    <b>${item.name}</b><br>
                    €${item.price}<br>
                    Venditore: ${item.sellerUsername}
                </div>
            `;
            total += item.price;
        });

        totalDiv.innerText = "Totale: €" + (total + 5);
    }

    async function checkout() {

        const res = await fetch('http://localhost:8083/api/orders/checkout', {
            method: 'POST',
            headers: {
                'username': username
            }
        });

        const data = await res.json();

        alert(data.message);

        if (data.success) {
            window.location.href = 'orders.html';
        }
    }

    logoutBtn.onclick = () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/login.html';
    };

    document.getElementById('payBtn').onclick = checkout;

    loadCart();
});