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

    async function loadBalance() {

        const res = await fetch('http://localhost:8085/api/payment/balance', {
            headers: { 'username': username }
        });

        const balance = await res.text();

        document.getElementById('balance').innerText =
            "Saldo: €" + balance;
    }

    async function addMoney() {

        const amount = document.getElementById('amount').value;

        await fetch('http://localhost:8085/api/payment/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': username
            },
            body: JSON.stringify({ amount })
        });

        alert("Ricarica effettuata");
        loadBalance();
    }

    logoutBtn.onclick = () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/login.html';
    };

    document.getElementById('addBtn').onclick = addMoney;

    loadBalance();
});