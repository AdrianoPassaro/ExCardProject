document.addEventListener('DOMContentLoaded', () => {

    // ─── AUTH STATE (homepage-specific: hero vs dashboard) ───
    const token = localStorage.getItem('jwtToken');

    function parseJwt(t) {
        try {
            const p = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
            if (p.exp && p.exp < Math.floor(Date.now()/1000)) return null;
            return p.sub || p.username || 'Utente';
        } catch { return null; }
    }

    const username = token ? parseJwt(token) : null;

    if (username) {
        document.getElementById('navGuest').style.display     = 'none';
        document.getElementById('navUser').style.display      = 'flex';
        document.getElementById('heroGuest').style.display    = 'none';
        document.getElementById('dashboardUser').style.display = 'block';
        document.getElementById('usernameDisplay').textContent = username;
        document.getElementById('dashUsername').textContent    = username;
    } else {
        localStorage.removeItem('jwtToken');
        document.getElementById('navGuest').style.display     = 'flex';
        document.getElementById('navUser').style.display      = 'none';
        document.getElementById('heroGuest').style.display    = 'flex';
        document.getElementById('dashboardUser').style.display = 'none';
    }
    // Wallet, cart badge, dropdown, logout → gestiti da navbar.js
});