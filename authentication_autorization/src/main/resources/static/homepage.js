document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const navButtons = document.querySelector('.nav-buttons');
    const guestContent = document.getElementById('guest-content');
    const userContent = document.getElementById('user-content');

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

    // Controlla se l'utente è loggato (token valido e non scaduto)
    let user = null;

    if (token) {
        user = parseJwt(token);

        // Se token malformato o scaduto -> rimuovi token e resetta user
        const now = Math.floor(Date.now() / 1000); // tempo corrente in secondi
        if (!user || (user.exp && user.exp < now)) {
            localStorage.removeItem('jwtToken');
            user = null;
        }
    }

    // Gestione contenuto in base a login
    if (user) {
        // Utente loggato
        guestContent.classList.add('hidden');
        userContent.classList.remove('hidden');

        // Cambia pulsanti navbar
        navButtons.innerHTML = `
            <button id="logoutBtn" class="btn">Logout</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('jwtToken');

            // Pulisci il localStorage per altre origini
            const origins = [
                'http://localhost:8081'
            ];

            origins.forEach(origin => {
                const iframe = document.createElement('iframe');
                iframe.src = `${origin}/about:blank`;  // Non serve un file fisico
                iframe.style.display = 'none';

                iframe.onload = function () {
                    try {
                        const iframeWindow = iframe.contentWindow;
                        iframeWindow.localStorage.removeItem('jwtToken');
                    } catch (e) {
                        console.log(`Could not clear storage for ${origin}`, e);
                    }
                    document.body.removeChild(iframe);
                };

                document.body.appendChild(iframe);
            });

            window.location.reload();
        });
    } else {
        // Utente non loggato
        guestContent.classList.remove('hidden');
        userContent.classList.add('hidden');
    }
});
