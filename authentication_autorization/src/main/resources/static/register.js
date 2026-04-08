// Toggle password visibility
const passwordInput = document.getElementById('password');
const toggleBtn     = document.getElementById('togglePass');
const eyePupil      = document.getElementById('eyePupil');
const eyeIcon       = document.getElementById('eyeIcon');

toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyePupil.style.display = isHidden ? 'none' : '';

    const existingSlash = document.getElementById('eyeSlash');
    if (isHidden) {
        if (!existingSlash) {
            const slash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            slash.id = 'eyeSlash';
            slash.setAttribute('x1','4'); slash.setAttribute('y1','4');
            slash.setAttribute('x2','20'); slash.setAttribute('y2','20');
            slash.setAttribute('stroke','currentColor');
            slash.setAttribute('stroke-width','2');
            slash.setAttribute('stroke-linecap','round');
            eyeIcon.appendChild(slash);
        }
    } else {
        existingSlash?.remove();
    }
});

// Form submit
document.addEventListener('DOMContentLoaded', () => {
    const form      = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorBox  = document.getElementById('formError');

    function showError(msg) {
        errorBox.textContent   = msg;
        errorBox.style.display = 'block';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function hideError() { errorBox.style.display = 'none'; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const username    = document.getElementById('username').value.trim();
        const email       = document.getElementById('email').value.trim();
        const password    = passwordInput.value;
        const nome        = document.getElementById('nome').value.trim();
        const cognome     = document.getElementById('cognome').value.trim();
        const dataNascita = document.getElementById('dataNascita').value;
        const indirizzo   = document.getElementById('indirizzo').value.trim();
        const cap         = document.getElementById('cap').value.trim();
        const citta       = document.getElementById('citta').value.trim();
        const provincia   = document.getElementById('provincia').value.trim().toUpperCase();
        const telefono    = document.getElementById('telefono').value.trim();

        // Basic validation
        if (!username || !email || !password) {
            showError('Username, email e password sono obbligatori.');
            return;
        }
        if (password.length < 8) {
            showError('La password deve essere di almeno 8 caratteri.');
            return;
        }
        if (cap && !/^\d{5}$/.test(cap)) {
            showError('Il CAP deve essere composto da 5 cifre.');
            return;
        }

        submitBtn.disabled    = true;
        submitBtn.textContent = 'Registrazione in corso…';

        try {
            const res = await fetch('/api/auth/register', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username, email, password,
                    nome, cognome, dataNascita,
                    indirizzo, cap, citta, provincia, telefono
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Errore durante la registrazione');
            }

            // Registrazione OK → redirect al login
            window.location.href = 'http://localhost:8080/login.html?registered=1';

        } catch (err) {
            showError('Registrazione fallita: ' + err.message);
        } finally {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Crea account';
        }
    });

    // Mostra messaggio se arriva da registrazione appena completata
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === '1') {
        // Siamo sulla login, già reindirizzati
    }
});