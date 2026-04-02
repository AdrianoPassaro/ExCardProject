document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

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