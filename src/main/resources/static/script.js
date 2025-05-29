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
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('form');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita il comportamento di default del form

        // Recupera tutti i dati dal form
        const userData = {
            nome: document.getElementById('nome').value.trim(),
            cognome: document.getElementById('cognome').value.trim(),
            dataNascita: document.getElementById('dataNascita').value,
            indirizzo: document.getElementById('indirizzo').value.trim(),
            cap: document.getElementById('cap').value.trim(),
            citta: document.getElementById('citta').value.trim(),
            provincia: document.getElementById('provincia').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Errore durante la registrazione.');
            }

            alert('Registrazione completata con successo!');
            window.location.href = 'index.html'; // Torna alla pagina di login

        } catch (error) {
            alert('Registrazione fallita: ' + error.message);
        }
    });
});
