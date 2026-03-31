const passwordInput = document.getElementById('password');      // Campo input password
const togglePasswordBtn = document.getElementById('togglePassword');  // Bottone per mostra/nascondi password
const eyeIcon = document.getElementById('eyeIcon');            // Icona occhio (SVG)
const eyePupil = document.getElementById('eyePupil');          // Pupilla dell'icona occhio

// Evento click sul bottone mostra/nascondi password
togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        // Se la password è nascosta, la mostra cambiando il type in "text"
        passwordInput.type = 'text';
        eyePupil.style.display = 'none'; // Nasconde la pupilla per indicare "occhio chiuso"

        // Aggiunge una linea diagonale sull'icona per indicare "password visibile"
        if (!document.getElementById('eyeSlash')) {
            const slash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            slash.setAttribute('id', 'eyeSlash');
            slash.setAttribute('x1', '4');
            slash.setAttribute('y1', '4');
            slash.setAttribute('x2', '20');
            slash.setAttribute('y2', '20');
            slash.setAttribute('stroke', 'currentColor');
            slash.setAttribute('stroke-width', '2');
            slash.setAttribute('stroke-linecap', 'round');
            eyeIcon.appendChild(slash);  // Inserisce la linea nell'SVG
        }
    } else {
        // Se la password è visibile, la nasconde cambiando il type in "password"
        passwordInput.type = 'password';
        eyePupil.style.display = ''; // Rende visibile la pupilla

        // Rimuove la linea diagonale dall'icona (occhio aperto)
        const slash = document.getElementById('eyeSlash');
        if (slash) slash.remove();
    }
});

// Aspetta che il DOM sia caricato completamente
document.addEventListener('DOMContentLoaded', () => {
    // Controllo del token
    const token = localStorage.getItem('jwtToken');
    if (token) {
        window.location.href = 'http://localhost:8080/homepage.html';
        return;
    }

    const loginForm = document.querySelector('form');  // Seleziona il form
    const submitBtn = loginForm.querySelector('input[type="submit"]'); // Bottone submit

    // Gestore evento submit del form login
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Previene invio form classico con ricarica pagina

        // Controlla la validità del form basandosi sui vincoli HTML (required, pattern, ecc)
        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();  // Mostra i messaggi di errore nativi
            return;                      // Ferma l'invio se form non valido
        }

        // Recupera i valori inseriti dall'utente
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;

        submitBtn.disabled = true;  // Disabilita il bottone per evitare più submit

        try {
            // Invia richiesta POST al backend con username e password in JSON
            const response = await fetch('/api/auth/login', {
                "method": 'POST',
                "headers": { 'Content-Type': 'application/json' },
                "body": JSON.stringify({ username, password })
            });

            // Se la risposta non è OK, prova a recuperare il messaggio di errore dal JSON o testo semplice
            if (!response.ok) {
                let errorMsg = 'Errore durante il login';
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = errorData.message;
                } catch {}
                alert('Login fallito: ' + errorMsg);
                submitBtn.disabled = false;
                return;  // Esco senza lanciare eccezioni
            }

            // Se la risposta è OK, ottieni i dati JSON
            const data = await response.json();

            // Controllo che il token sia presente nella risposta
            if ('token' in data) {
                const token = data.token;
                localStorage.setItem('jwtToken', token);
                await initializeTokenAcrossPorts(token, [8081, 8083, 8085, 8086, 8087]);  // Inizializza token su altri porti

                window.location.replace('http://localhost:8080/homepage.html');  // Redirect dopo login
            } else {
                alert('Login fallito: Token non ricevuto dal server.');
                submitBtn.disabled = false;
            }

        } catch (error) {
            alert('Login fallito: ' + error.message);  // Mostra errore all'utente
            passwordInput.value = '';  // Pulisce il campo password per sicurezza
        } finally {
            submitBtn.disabled = false;  // Riabilita il bottone submit sempre alla fine
        }
    });

    async function initializeTokenAcrossPorts(token, ports) {
        const iframePromises = ports.map(port => {
            return new Promise((resolve) => {
                const iframe = document.createElement('iframe');
                iframe.src = `http://localhost:${port}/init-token.html?token=${encodeURIComponent(token)}`;
                iframe.style.display = 'none';

                const messageListener = (event) => {
                    if (event.source === iframe.contentWindow && event.data === 'token_saved') {
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
    }
});