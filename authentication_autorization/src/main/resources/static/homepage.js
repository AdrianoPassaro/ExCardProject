document.addEventListener('DOMContentLoaded', () => {

    const API_PAYMENT = 'http://localhost:8085/api/payment';
    const API_CART    = 'http://localhost:8087/api/cart';

    // ─── AUTH ───
    const token = localStorage.getItem('jwtToken');

    function parseJwt(t) {
        try {
            const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
            // check expiry
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
            return payload.sub || payload.username || 'Utente';
        } catch { return null; }
    }

    const username = token ? parseJwt(token) : null;

    if (username) {
        // ── LOGGED IN ──
        document.getElementById('navGuest').style.display    = 'none';
        document.getElementById('navUser').style.display     = 'flex';
        document.getElementById('heroGuest').style.display   = 'none';
        document.getElementById('dashboardUser').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('dashUsername').textContent   = username;

        loadWallet();
        loadCartBadge();
        setupDropdown();
        setupLogout();
    } else {
        localStorage.removeItem('jwtToken');
        document.getElementById('navGuest').style.display    = 'flex';
        document.getElementById('navUser').style.display     = 'none';
        document.getElementById('heroGuest').style.display   = 'flex';
        document.getElementById('dashboardUser').style.display = 'none';
    }

    // ─── WALLET ───
    async function loadWallet() {
        try {
            const res = await fetch(`${API_PAYMENT}/balance`, {
                headers: { 'username': username }
            });
            if (!res.ok) return;
            const bal = parseFloat(await res.text()) || 0;
            document.getElementById('walletAmount').textContent = `€ ${bal.toFixed(2)}`;
        } catch { /* silent */ }
    }

    // ─── CART BADGE ───
    async function loadCartBadge() {
        try {
            const res = await fetch(API_CART, {
                headers: { 'Authorization': `Bearer ${token}`, 'username': username }
            });
            if (!res.ok) return;
            const cart  = await res.json();
            const count = (cart.items || []).length;
            const badge = document.getElementById('cartBadge');
            if (count > 0) { badge.textContent = count; badge.removeAttribute('style'); }
        } catch { /* silent */ }
    }

    // ─── DROPDOWN ───
    function setupDropdown() {
        const trigger  = document.getElementById('userMenuTrigger');
        const dropdown = document.getElementById('userDropdown');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = dropdown.classList.toggle('open');
            trigger.classList.toggle('open', open);
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
            trigger.classList.remove('open');
        });

        dropdown.addEventListener('click', e => e.stopPropagation());
    }

    // ─── LOGOUT ───
    function setupLogout() {
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            localStorage.removeItem('jwtToken');
            await deleteTokenAcrossPorts([8081, 8083, 8084, 8085, 8086, 8087]);
            window.location.reload();
        });
    }

    async function deleteTokenAcrossPorts(ports) {
        const iframePromises = ports.map(port => new Promise(resolve => {
            const iframe = document.createElement('iframe');
            iframe.src   = `http://localhost:${port}/del-token.html`;
            iframe.style.display = 'none';

            const handler = (e) => {
                if (e.source === iframe.contentWindow && e.data === 'token_deleted') {
                    window.removeEventListener('message', handler);
                    iframe.remove();
                    resolve();
                }
            };
            window.addEventListener('message', handler);
            // Safety timeout — risolvi comunque dopo 2s
            setTimeout(resolve, 2000);
            document.body.appendChild(iframe);
        }));
        await Promise.all(iframePromises);
    }
});