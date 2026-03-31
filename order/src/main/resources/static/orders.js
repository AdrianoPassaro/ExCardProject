document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    function extractUsernameFromToken(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    }

    const username = extractUsernameFromToken(token);
    usernameDisplay.innerText = "👤 " + username;

    async function loadOrders() {

        const res = await fetch('http://localhost:8083/api/orders', {
            headers: { 'username': username }
        });

        const data = await res.json();
        const div = document.getElementById('orders');

        data.forEach(o => {

            let items = "";
            o.items.forEach(i => {
                items += `${i.name} - €${i.price}<br>`;
            });

            div.innerHTML += `
                <div class="card">
                    <b>Ordine ${o.id}</b><br>
                    Stato: ${o.status}<br>
                    Totale: €${o.finalPrice}<br>
                    ${items}
                    <button onclick="confirmOrder('${o.id}')">
                        Conferma
                    </button>
                </div>
            `;
        });
    }

    window.confirmOrder = async (id) => {
        await fetch(`http://localhost:8083/api/orders/${id}/confirm`, {
            method: 'PUT'
        });
        location.reload();
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/login.html';
    };

    loadOrders();
});