document.addEventListener('DOMContentLoaded', () => {
    const protectedLinks = document.querySelectorAll('[data-protected]');
    const navButtons = document.querySelector('.nav-buttons');

    // Funzione per ottenere il payload del JWT (decodifica base64)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    // Controlla se l’utente è loggato (token valido e non scaduto)
    let token = localStorage.getItem('jwtToken');
    let user = null;

    if (token) {
        user = parseJwt(token);

        // Se token malformato o scaduto -> rimuovi token e resetta user
        const now = Math.floor(Date.now() / 1000); // tempo corrente in secondi
        if (!user || (user.exp && user.exp < now)) {
            localStorage.removeItem('jwtToken');
            token = null;
            user = null;
        }
    }

    // Gestione link protetti
    protectedLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (!token) {
                // Se non loggato, vai a login
                window.location.href = '/login.html';
            } else {
                // Se loggato, va al link protetto
                window.location.href = link.getAttribute('data-protected');
            }
        });
    });

    // Cambia bottoni in base a login/logout
    function renderNav() {
        if (user && user.username) {
            navButtons.innerHTML = `
                <span>Benvenuto, ${user.username}</span>
                <button id="logoutBtn" class="btn">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('jwtToken');
                window.location.reload();
            });
        } else {
            navButtons.innerHTML = `
                <a href="login.html" class="btn">Login</a>
                <a href="register.html" class="btn">Registrati</a>
            `;
        }
    }

    renderNav();
});
