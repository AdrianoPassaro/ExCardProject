const passwordInput = document.getElementById('password');             // Campo input della password
const togglePasswordBtn = document.getElementById('togglePassword');  // Bottone per mostra/nascondere la password
const eyeIcon = document.getElementById('eyeIcon');                    // Contenitore dell'icona occhio
const eyePupil = document.getElementById('eyePupil');                  // Parte dell'icona che simula la pupilla

// Gestore evento per il bottone mostra/nascondi password
togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        // Mostra password
        passwordInput.type = 'text';
        eyePupil.style.display = 'none'; // Nasconde la pupilla

        // Aggiunge una linea diagonale sull'icona per indicare "occhio chiuso"
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
            eyeIcon.appendChild(slash);
        }
    } else {
        // Nasconde la password
        passwordInput.type = 'password';
        eyePupil.style.display = ''; // Rende visibile la pupilla
        const slash = document.getElementById('eyeSlash');
        if (slash) slash.remove(); // Rimuove la linea se esiste
    }
});

// ----------------------
// Sezione: Invio dati di login al server
// ----------------------

// Aspetta che la pagina sia completamente caricata
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form'); // Seleziona il form della pagina login

    // Assegna un gestore evento al submit del form
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene l'invio classico del form (con ricarica pagina)

        // Recupera i valori immessi dall’utente
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;

        try {
            // Invio richiesta POST al server
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) // Invia i dati in formato JSON
            });

            // Se la risposta non è OK, gestisce l'errore
            if (!response.ok) {
                const errorMsg = await response.text(); // Prova a leggere il messaggio di errore
                throw new Error(errorMsg || 'Errore durante il login');
            }

            // Converte la risposta JSON
            const data = await response.json();

            // Se riceve un token, lo salva e reindirizza l’utente
            if ('token' in data) {
                localStorage.setItem('jwtToken', data.token);  // Salva il token nel localStorage
                window.location.href = 'welcome.html';         // Reindirizza alla pagina principale
            } else {
                throw new Error('Token non ricevuto dal server.');
            }

        } catch (error) {
            // Mostra un messaggio d'errore in caso di problemi
            alert('Login fallito: ' + error.message);
        }
    });
});