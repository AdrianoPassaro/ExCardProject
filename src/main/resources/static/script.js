const passwordInput = document.getElementById('password');  // Riferimento al campo input password
const togglePasswordBtn = document.getElementById('togglePassword');  // Bottone per mostrare/nascondere la password
const eyeIcon = document.getElementById('eyeIcon');  // Contenitore SVG dell'icona occhio
const eyePupil = document.getElementById('eyePupil');  // La pupilla dell'occhio (elemento cerchio SVG)

// Evento click sul bottone per mostrare o nascondere la password
togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        // Se la password è nascosta, la mostro (input type=text)
        passwordInput.type = 'text';
        // Nascondo la pupilla dell'occhio per simulare occhio chiuso
        eyePupil.style.display = 'none';

        // Controllo se esiste già la linea diagonale (occhio chiuso)
        if (!document.getElementById('eyeSlash')) {
            // Creo una linea diagonale SVG per indicare "occhio chiuso"
            const slash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            slash.setAttribute('id', 'eyeSlash');
            slash.setAttribute('x1', '4');
            slash.setAttribute('y1', '4');
            slash.setAttribute('x2', '20');
            slash.setAttribute('y2', '20');
            slash.setAttribute('stroke', 'currentColor');
            slash.setAttribute('stroke-width', '2');
            slash.setAttribute('stroke-linecap', 'round');
            // Aggiungo la linea all'icona occhio
            eyeIcon.appendChild(slash);
        }
    } else {
        // Se la password è visibile, la nascondo (input type=password)
        passwordInput.type = 'password';
        // Rendo visibile la pupilla dell'occhio
        eyePupil.style.display = '';
        // Rimuovo la linea diagonale "occhio chiuso" se presente
        const slash = document.getElementById('eyeSlash');
        if (slash) slash.remove();
    }
});

// Attendo che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    // Prendo il form di registrazione dalla pagina
    const registerForm = document.querySelector('form');

    // Se il form non esiste (ad esempio pagina errata), loggo un errore e interrompo
    if (!registerForm) {
        console.error('Form non trovato nella pagina.');
        return;
    }

    // Evento submit del form (invio dati registrazione)
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evito il comportamento predefinito di ricarica pagina

        // Controllo se tutti i campi rispettano la validazione HTML5
        if (!registerForm.checkValidity()) {
            registerForm.reportValidity(); // Mostro messaggi di errore nativi al cliente
            return; // Esco senza procedere all'invio
        }

        // Preparo i dati da inviare al server leggendo i valori dai campi del form
        const data = {
            nome: document.getElementById('nome').value.trim(),
            cognome: document.getElementById('cognome').value.trim(),
            dataNascita: document.getElementById('dataNascita').value.trim(),
            indirizzo: document.getElementById('indirizzo').value.trim(),
            cap: document.getElementById('cap').value.trim(),
            citta: document.getElementById('citta').value.trim(),
            provincia: document.getElementById('provincia').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: passwordInput.value  // Prendo la password senza trim perché potrebbe contenere spazi validi
        };

        try {
            // Invio richiesta POST per la registrazione
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Se la risposta non è OK, gestisco l’errore senza rilanciarlo
            if (!response.ok) {
                let errorText;
                try {
                    // Provo a leggere un messaggio di errore JSON dal server
                    const errorData = await response.json();
                    errorText = errorData.message || JSON.stringify(errorData);
                } catch {
                    // Se non riesco a leggere JSON, leggo testo semplice
                    errorText = await response.text();
                }
                // Mostro alert con errore e esco dalla funzione
                alert('Registrazione fallita: ' + (errorText || 'Errore durante la registrazione.'));
                return; // Esco senza continuare
            }

            // Se tutto OK, messaggio di successo e redirect
            alert('Registrazione completata con successo! Ora puoi accedere.');
            window.location.href = 'index.html';

        } catch (error) {
            // Gestione errori di rete o imprevisti
            alert('Registrazione fallita: ' + error.message);
        }
    });
});
