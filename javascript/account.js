document.addEventListener('DOMContentLoaded', () => {
    // Controllo del token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    // Elementi del DOM
    const profileForm = document.getElementById('profileForm');
    const saveButton = document.querySelector('.save-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');
    let modifiedFields = {};

    // Estrae l'username dal token JWT
    function extractUsernameFromToken(token) {
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

    // Mostra l'username nell'header
    function displayUsername() {
        const username = extractUsernameFromToken(token);
        usernameDisplay.textContent = `👤 ${username}`;
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
        window.location.href = 'http://localhost:8080/homepage.html';
    }

    // Carica i dati del profilo
    async function loadProfile() {
        try {
            const res = await fetch('http://localhost:8081/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Errore nel caricamento del profilo');

            const profile = await res.json();
            populateFields(profile);
        } catch (e) {
            alert('Errore: ' + e.message);
            localStorage.removeItem('jwtToken');
            window.location.href = 'http://localhost:8080/login.html';
        }
    }

    // Popola i campi del form con i dati del profilo
    function populateFields(profile) {
        Object.keys(profile).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.value = profile[field] || '';
                input.setAttribute('data-original-value', input.value);
            }
        });
    }

    // Configura i pulsanti di modifica
    function setupEditButtons() {
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const field = btn.getAttribute('data-field');
                const input = document.getElementById(field);

                if (input) {
                    input.disabled = false;
                    input.focus();

                    // Gestisce la modifica quando si esce dal campo
                    const handleBlur = () => {
                        checkFieldModified(input, field);
                        input.removeEventListener('blur', handleBlur);
                    };

                    input.addEventListener('blur', handleBlur);
                }
            });
        });
    }

    // Verifica se un campo è stato modificato
    function checkFieldModified(input, fieldName) {
        const originalValue = input.getAttribute('data-original-value');
        const currentValue = input.value.trim();

        // Validazione specifica per campo
        if (!validateField(input, fieldName)) {
            return;
        }

        if (currentValue !== originalValue) {
            modifiedFields[fieldName] = currentValue;
            input.classList.add('modified');
        } else {
            delete modifiedFields[fieldName];
            input.classList.remove('modified');
        }

        saveButton.disabled = Object.keys(modifiedFields).length === 0;
    }

    // Validazione specifica per ogni campo
    function validateField(input, fieldName) {
        let isValid = true;

        switch (fieldName) {
            case 'dataNascita':
                if (!input.value) {
                    alert("Inserisci una data di nascita valida");
                    isValid = false;
                }
                break;
            case 'telefono':
                if (!/^(\+?\d{1,3}[- ]?)?\d{8,12}$/.test(input.value)) {
                    alert("Inserisci un numero di telefono valido (8-12 cifre)");
                    isValid = false;
                }
                break;
            case 'cap':
                if (!/^\d{5}$/.test(input.value)) {
                    alert("Inserisci un CAP valido (5 cifre)");
                    isValid = false;
                }
                break;
            case 'provincia':
                if (!/^[A-Z]{2}$/.test(input.value)) {
                    alert("Inserisci una provincia valida (2 lettere maiuscole, es. RM)");
                    isValid = false;
                }
                break;
            default:
                if (input.required && !input.value.trim()) {
                    alert("Questo campo è obbligatorio");
                    isValid = false;
                }
        }

        if (!isValid) {
            input.value = input.getAttribute('data-original-value');
            input.disabled = true;
            return false;
        }

        return true;
    }

    // Salva le modifiche
    async function saveChanges(e) {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:8081/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(modifiedFields)
            });

            if (!res.ok) throw new Error('Errore nel salvataggio');

            alert('Modifiche salvate con successo!');

            // Aggiorna i valori originali
            Object.keys(modifiedFields).forEach(field => {
                const input = document.getElementById(field);
                input.setAttribute('data-original-value', input.value);
                input.classList.remove('modified');
                input.disabled = true;
            });

            modifiedFields = {};
            saveButton.disabled = true;

        } catch (e) {
            alert('Errore: ' + e.message);
        }
    }

    // Logout
    function setupLogout() {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            localStorage.removeItem('jwtToken');
            await deleteTokenAcrossPorts([8080]);
        });
    }

    // Inizializzazione
    saveButton.disabled = true;
    profileForm.addEventListener('submit', saveChanges);
    setupEditButtons();
    setupLogout();
    displayUsername();
    loadProfile();
});
