document.addEventListener('DOMContentLoaded', () => {

    const API_PAYMENT = 'http://localhost:8085/api/payment';
    const API_CART    = 'http://localhost:8087/api/cart'; // ✅ FIX

    // ─── AUTH ───
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    function extractUsername(t) {
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return payload.sub || payload.username || 'Utente';
        } catch { return 'Utente'; }
    }

    const username = extractUsername(token);
    document.getElementById('usernameDisplay').textContent = `👤 ${username}`;

    // ─── LOAD BALANCE ───
    async function loadBalance() {
        try {
            const res = await fetch(`${API_PAYMENT}/wallet`, {
                headers: { 'username': username }
            });
            if (!res.ok) throw new Error();

            const wallet  = await res.json();
            const balance = wallet.balance || 0;
            const points  = wallet.points  || 0;

            document.getElementById('balanceDisplay').textContent = `€ ${balance.toFixed(2)}`;
            document.getElementById('loyaltyDisplay').textContent = `${points} pt`;

        } catch {
            document.getElementById('balanceDisplay').textContent = '— Errore';
        }
    }

    // ─── CART BADGE ───
    async function loadCartBadge() {
        try {
            const res = await fetch(API_CART, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'username': username
                }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const cart  = await res.json();
            console.log("Cart ricevuto:", cart); // ✅ DEBUG

            const count = (cart.items || []).length;
            const badge = document.getElementById('cartBadge');

            if (count > 0) {
                badge.textContent = count;
                badge.style.display = "inline-block";
            } else {
                badge.style.display = "none";
            }

        } catch (err) {
            console.error("Errore badge carrello:", err);
        }
    }

    // ─── PRESET BUTTONS ───
    let selectedAmount = null;

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAmount = parseFloat(btn.dataset.amount);
            document.getElementById('customAmount').value = '';
        });
    });

    document.getElementById('customAmount').addEventListener('input', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        selectedAmount = null;
    });

    // ─── RECHARGE ───
    document.getElementById('rechargeBtn').addEventListener('click', async () => {
        const errEl  = document.getElementById('rechargeError');
        errEl.style.display = 'none';

        const customVal = parseFloat(document.getElementById('customAmount').value);
        const amount    = selectedAmount !== null ? selectedAmount : (isNaN(customVal) ? null : customVal);

        if (!amount || amount <= 0) {
            errEl.textContent = 'Inserisci un importo valido oppure seleziona un preset.';
            errEl.style.display = 'block';
            return;
        }

        const btn = document.getElementById('rechargeBtn');
        btn.disabled = true;
        btn.textContent = 'Elaborazione…';

        try {
            const res = await fetch(`${API_PAYMENT}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'username': username
                },
                body: JSON.stringify({ amount })
            });

            if (!res.ok) throw new Error('Errore durante la ricarica');

            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('customAmount').value = '';
            selectedAmount = null;

            await loadBalance();

            btn.textContent = '✓ Ricaricato!';
            setTimeout(() => {
                btn.textContent = 'Ricarica';
                btn.disabled = false;
            }, 2000);

        } catch (err) {
            errEl.textContent = err.message || 'Errore sconosciuto.';
            errEl.style.display = 'block';
            btn.textContent = 'Ricarica';
            btn.disabled = false;
        }
    });

    // ─── LOGOUT ───
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/login.html';
    });

    // ─── INIT ───
    loadBalance();
    loadCartBadge();
});