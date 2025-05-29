document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyePupil = document.getElementById('eyePupil');
    const registerForm = document.getElementById('registerForm');

    // Toggle mostra/nascondi password
    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyePupil.style.display = 'none';
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
            passwordInput.type = 'password';
            eyePupil.style.display = '';
            const slash = document.getElementById('eyeSlash');
            if (slash) slash.remove();
        }
    });

    // Gestione submit form con fetch
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const user = {
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
            password: passwordInput.value
        };

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result || 'Errore durante la registrazione.');
            }

            alert('Registrazione completata con successo!');
            window.location.href = 'index.html';

        } catch (error) {
            alert('Registrazione fallita: ' + error.message);
        }
    });
});
