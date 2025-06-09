document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "http://localhost:8080/login.html";
        return;
    }

    const headers = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
    };

    // Carica i dati utente
    fetch("http://localhost:8081/api/user/profile", { headers })
        .then(res => {
            if (!res.ok) throw new Error("Errore nel caricamento del profilo");
            return res.json();
        })
        .then(user => {
            document.getElementById("nome").value = user.nome || "";
            document.getElementById("cognome").value = user.cognome || "";
            document.getElementById("dataNascita").value = user.dataNascita || "";
            document.getElementById("indirizzo").value = user.indirizzo || "";
            document.getElementById("cap").value = user.cap || "";
            document.getElementById("citta").value = user.citta || "";
            document.getElementById("provincia").value = user.provincia || "";
            document.getElementById("email").value = user.email || "";
            document.getElementById("telefono").value = user.telefono || "";
            document.getElementById("username").value = user.username || "";
        })
        .catch(err => {
            alert("Errore: " + err.message);
            localStorage.removeItem("jwtToken");
            window.location.href = "http://localhost:8080/login.html";
        });

    // Salvataggio modifiche
    document.getElementById("saveBtn").addEventListener("click", () => {
        const updatedUser = {
            nome: document.getElementById("nome").value,
            cognome: document.getElementById("cognome").value,
            dataNascita: document.getElementById("dataNascita").value,
            indirizzo: document.getElementById("indirizzo").value,
            cap: document.getElementById("cap").value,
            citta: document.getElementById("citta").value,
            provincia: document.getElementById("provincia").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value,
            password: document.getElementById("password").value || undefined
        };

        fetch("/api/user/update", {
            method: "PUT",
            headers,
            body: JSON.stringify(updatedUser)
        })
            .then(res => {
                if (!res.ok) throw new Error("Errore durante il salvataggio");
                alert("Profilo aggiornato con successo");
                document.getElementById("password").value = ""; // pulisci campo password
            })
            .catch(err => alert("Errore: " + err.message));
    });
});

// Attiva l’input per la modifica
function enableEdit(id) {
    const input = document.getElementById(id);
    input.disabled = false;
    input.focus();
}




