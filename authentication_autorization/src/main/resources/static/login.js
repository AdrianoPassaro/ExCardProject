document.addEventListener('DOMContentLoaded', () => {

    // Se già loggato, redirect
    const token = localStorage.getItem('jwtToken');
    if (token) {
        window.location.replace('http://localhost:8080/homepage.html');
        return;
    }

    // ─── TOGGLE PASSWORD ───
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

    // ─── FORM SUBMIT ───
    const form      = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorBox  = document.getElementById('formError');

    function showError(msg) {
        errorBox.textContent    = msg;
        errorBox.style.display  = 'block';
    }
    function hideError() { errorBox.style.display = 'none'; }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Inserisci username e password.');
            return;
        }

        submitBtn.disabled    = true;
        submitBtn.textContent = 'Accesso in corso…';

        try {
            const res = await fetch('/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Credenziali non valide');
            }

            const data = await res.json();
            if (!data.token) throw new Error('Token non ricevuto dal server');

            localStorage.setItem('jwtToken', data.token);

            // Propaga il token sugli altri microservizi via iframe
            await initTokenAcrossPorts(data.token, [8081, 8083, 8084, 8085, 8086, 8087]);

            window.location.replace('http://localhost:8080/homepage.html');

        } catch (err) {
            showError('Login fallito: ' + err.message);
            passwordInput.value = '';
        } finally {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Accedi';
        }
    });

    // ─── TOKEN PROPAGATION ───
    async function initTokenAcrossPorts(token, ports) {
        const promises = ports.map(port => new Promise(resolve => {
            const iframe = document.createElement('iframe');
            iframe.src   = `http://localhost:${port}/init-token.html?token=${encodeURIComponent(token)}`;
            iframe.style.display = 'none';

            const handler = (e) => {
                if (e.source === iframe.contentWindow && e.data === 'token_saved') {
                    window.removeEventListener('message', handler);
                    iframe.remove();
                    resolve();
                }
            };
            window.addEventListener('message', handler);
            setTimeout(resolve, 2000); // safety timeout
            document.body.appendChild(iframe);
        }));
        await Promise.all(promises);
    }
});