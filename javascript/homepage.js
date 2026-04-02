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
            const payload = JSON.parse(jsonPayload);
            return payload.sub || payload.username || 'Utente';
        } catch (e) {
            console.error('Errore nel parsing del token:', e);
            return 'Utente';
        }
    }

    async function deleteTokenAcrossPorts(ports) {
        const iframePromises = ports.map(port => {
            return new Promise((resolve) => {
                const iframe = document.createElement('iframe');
                iframe.src = `http://localhost:${port}/del-token.html`;
                iframe.style.display = 'none';

                const messageListener = (event) => {
                    if (event.source === iframe.contentWindow && event.data === 'token_deleted') {
                        window.removeEventListener('message', messageListener);
                        iframe.remove();
                        resolve();
                    }
                };

                window.addEventListener('message', messageListener);
                document.body.appendChild(iframe);
            });
        });

        await Promise.all(iframePromises);
        window.location.href = '../authentication_autorization/src/main/resources/static/login.html';
    }

    const username = parseJwt(token);

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
            <span class="username-display" id="usernameDisplay">👤 ${username}</span>
            <button id="logoutBtn" class="btn">Logout</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', async () => {
            localStorage.removeItem('jwtToken');
            await deleteTokenAcrossPorts([8081]);
            alert(
                `Logout effettuato con successo!\nSe hai bisogno di accedere nuovamente, clicca su "Login" sulla barra di navigazione.`);
            window.location.reload();
        });
    } else {
        // Utente non loggato
        guestContent.classList.remove('hidden');
        userContent.classList.add('hidden');
    }
});
