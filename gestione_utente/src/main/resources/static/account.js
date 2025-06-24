document.addEventListener('DOMContentLoaded', () => {
    // 1. Primero verifica si el token viene por URL (primer acceso desde login en 8080)
    //const urlParams = new URLSearchParams(window.location.search);
    //const urlToken = urlParams.get('token');

    //if (urlToken) {
        // Guarda el token en localStorage DEL PUERTO 8081
        //localStorage.setItem('jwtToken', urlToken);
        // Limpia la URL para que no quede visible
        //window.history.replaceState({}, document.title, window.location.pathname);
    //}

    // 2. Ahora verifica el token en localStorage
    const token = localStorage.getItem('jwtToken');
    console.log('Token obtenido:', token); // Debug

    if (!token) {
        // Redirige de vuelta al login EN 8080
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    const profileFieldsContainer = document.getElementById('profileFields');
    const saveButton = document.getElementById('saveChanges');
    let originalProfile = {};
    let modifiedFields = {};

    // Mapeo de campos a labels
    const fieldLabels = {
        nome: 'Nome',
        cognome: 'Cognome',
        dataNascita: 'Data di Nascita',
        indirizzo: 'Indirizzo',
        cap: 'CAP',
        citta: 'Città',
        provincia: 'Provincia',
        telefono: 'Telefono',
        username: 'Username'
    };

    // Función para verificar token con el backend
    const verifyToken = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/user/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error verificando token:', error);
            return false;
        }
    };

    // Cargar perfil del usuario
    const loadProfile = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Errore nel caricamento del profilo');
            }

            originalProfile = await response.json();
            renderProfileFields(originalProfile);
        } catch (error) {
            alert('Errore: ' + error.message);
            localStorage.removeItem('jwtToken');
            window.location.href = 'http://localhost:8080/login.html';
        }
    };

    // Renderizar campos del perfil
    const renderProfileFields = (profile) => {
        profileFieldsContainer.innerHTML = '';

        Object.keys(fieldLabels).forEach(field => {
            if (profile[field] !== undefined) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'profile-field';

                const label = document.createElement('label');
                label.textContent = fieldLabels[field];
                label.htmlFor = field;

                const input = document.createElement('input');
                input.id = field;
                input.value = profile[field] || '';
                input.disabled = true;

                const editButton = document.createElement('button');
                editButton.className = 'edit-btn';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.onclick = () => enableFieldEditing(field, input);

                fieldDiv.appendChild(label);
                fieldDiv.appendChild(input);
                fieldDiv.appendChild(editButton);

                profileFieldsContainer.appendChild(fieldDiv);
            }
        });
    };

    // Habilitar edición de campo
    const enableFieldEditing = (fieldName, inputElement) => {
        inputElement.disabled = false;
        inputElement.focus();

        const originalValue = originalProfile[fieldName];

        inputElement.addEventListener('blur', () => {
            if (inputElement.value !== originalValue) {
                modifiedFields[fieldName] = inputElement.value;
                saveButton.disabled = false;
            } else {
                delete modifiedFields[fieldName];
                saveButton.disabled = Object.keys(modifiedFields).length === 0;
            }
        });
    };

    // Guardar cambios
    saveButton.addEventListener('click', async () => {
        if (Object.keys(modifiedFields).length === 0) return;

        try {
            const response = await fetch('http://localhost:8081/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(modifiedFields)
            });

            if (!response.ok) {
                throw new Error('Errore nel salvataggio delle modifiche');
            }

            const updatedProfile = await response.json();
            originalProfile = {...originalProfile, ...updatedProfile};
            modifiedFields = {};
            saveButton.disabled = true;

            document.querySelectorAll('#profileFields input').forEach(input => {
                input.disabled = true;
            });

            alert('Modifiche salvate con successo!');
        } catch (error) {
            alert('Errore: ' + error.message);
        }
    });

    // Flujo principal
    const init = async () => {
        const isTokenValid = await verifyToken();
        if (!isTokenValid) {
            localStorage.removeItem('jwtToken');
            window.location.href = 'http://localhost:8080/login.html';
            return;
        }
        await loadProfile();
    };

    init();
});