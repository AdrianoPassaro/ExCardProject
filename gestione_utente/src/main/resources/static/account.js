document.addEventListener('DOMContentLoaded', () => {

    const API_USER    = 'http://localhost:8081/api/user';
    const API_PAYMENT = 'http://localhost:8085/api/payment';
    const API_CART    = 'http://localhost:8087/api/cart';

    // ─── AUTH ───
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'http://localhost:8080/login.html';
        return;
    }

    function extractUsername(t) {
        try {
            const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
            return payload.sub || payload.username || 'Utente';
        } catch { return 'Utente'; }
    }

    const username = extractUsername(token);
    document.getElementById('usernameDisplay').textContent = username;

    // ─── WALLET ───
    async function loadWallet() {
        try {
            const res = await fetch(`${API_PAYMENT}/balance`, { headers: { 'username': username } });
            if (!res.ok) return;
            const bal = parseFloat(await res.text()) || 0;
            document.getElementById('walletAmount').textContent = `€ ${bal.toFixed(2)}`;
        } catch { /* silent */ }
    }

    // ─── CART BADGE ───
    async function loadCartBadge() {
        try {
            const res = await fetch(API_CART, {
                headers: { 'Authorization': `Bearer ${token}`, 'username': username }
            });
            if (!res.ok) return;
            const cart  = await res.json();
            const count = (cart.items || []).length;
            const badge = document.getElementById('cartBadge');
            if (count > 0) { badge.textContent = count; badge.removeAttribute('style'); }
        } catch { /* silent */ }
    }

    // ─── DROPDOWN ───
    const trigger  = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userDropdown');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dropdown.classList.toggle('open');
        trigger.classList.toggle('open', open);
    });
    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        trigger.classList.remove('open');
    });
    dropdown.addEventListener('click', e => e.stopPropagation());

    // ─── LOGOUT ───
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        localStorage.removeItem('jwtToken');
        await deleteTokenAcrossPorts([8080, 8083, 8085, 8086, 8087]);
        window.location.href = 'http://localhost:8080/homepage.html';
    });

    async function deleteTokenAcrossPorts(ports) {
        const promises = ports.map(port => new Promise(resolve => {
            const iframe = document.createElement('iframe');
            iframe.src   = `http://localhost:${port}/del-token.html`;
            iframe.style.display = 'none';
            const handler = (e) => {
                if (e.source === iframe.contentWindow && e.data === 'token_deleted') {
                    window.removeEventListener('message', handler);
                    iframe.remove();
                    resolve();
                }
            };
            window.addEventListener('message', handler);
            setTimeout(resolve, 2000);
            document.body.appendChild(iframe);
        }));
        await Promise.all(promises);
    }

    // ─── LOAD PROFILE ───
    async function loadProfile() {
        try {
            const res = await fetch(`${API_USER}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Errore caricamento profilo');
            const p = await res.json();
            populate(p);
        } catch (err) {
            console.error(err);
        }
    }

    function populate(p) {
        const fields = ['nome','cognome','dataNascita','telefono','indirizzo','citta','cap','provincia', 'paese'];
        fields.forEach(f => {
            const el = document.getElementById(f);
            if (el) {
                el.value = p[f] || '';
                el.dataset.original = el.value;
            }
        });
        // Username (read-only display)
        const uDisplay = document.getElementById('username-display');
        if (uDisplay) uDisplay.value = username;
    }

    // ─── SECTION EDIT LOGIC ───
    // sections: { personal: ['nome','cognome','dataNascita','telefono'], address: ['indirizzo','citta','cap','provincia'] }
    const sections = {
        personal: { fields: ['nome','cognome','dataNascita','telefono'], editBtn: 'editPersonalBtn', actions: 'actionsPersonal', saveBtn: 'savePersonalBtn', cancelBtn: 'cancelPersonalBtn', error: 'errorPersonal' },
        address:  { fields: ['indirizzo','citta','cap','provincia', 'paese'],     editBtn: 'editAddressBtn',  actions: 'actionsAddress',  saveBtn: 'saveAddressBtn',  cancelBtn: 'cancelAddressBtn',  error: 'errorAddress'  }
    };

    Object.entries(sections).forEach(([key, cfg]) => {
        const editBtn   = document.getElementById(cfg.editBtn);
        const actionsEl = document.getElementById(cfg.actions);
        const saveBtn   = document.getElementById(cfg.saveBtn);
        const cancelBtn = document.getElementById(cfg.cancelBtn);
        const errorEl   = document.getElementById(cfg.error);

        // Enter edit mode
        editBtn.addEventListener('click', () => {
            cfg.fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) el.disabled = false;
            });
            actionsEl.style.display = 'flex';
            editBtn.textContent = 'Modificando…';
            editBtn.classList.add('editing');
            errorEl.style.display = 'none';
        });

        // Cancel
        cancelBtn.addEventListener('click', () => {
            cfg.fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) { el.value = el.dataset.original || ''; el.disabled = true; el.classList.remove('modified'); }
            });
            actionsEl.style.display = 'none';
            editBtn.textContent = 'Modifica';
            editBtn.classList.remove('editing');
            errorEl.style.display = 'none';
        });

        // Track modified
        cfg.fields.forEach(f => {
            document.getElementById(f)?.addEventListener('input', (e) => {
                e.target.classList.toggle('modified', e.target.value !== (e.target.dataset.original || ''));
            });
        });

        // Save
        saveBtn.addEventListener('click', async () => {
            errorEl.style.display = 'none';
            const updates = {};
            cfg.fields.forEach(f => {
                const el = document.getElementById(f);
                if (el && el.value !== (el.dataset.original || '')) updates[f] = el.value.trim();
            });

            if (Object.keys(updates).length === 0) {
                cancelBtn.click();
                return;
            }

            saveBtn.disabled    = true;
            saveBtn.textContent = 'Salvataggio…';

            try {
                const res = await fetch(`${API_USER}/profile`, {
                    method:  'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body:    JSON.stringify(updates)
                });
                if (!res.ok) throw new Error('Errore durante il salvataggio');

                // Update originals
                cfg.fields.forEach(f => {
                    const el = document.getElementById(f);
                    if (el) { el.dataset.original = el.value; el.disabled = true; el.classList.remove('modified'); }
                });
                actionsEl.style.display = 'none';
                editBtn.textContent     = 'Modifica';
                editBtn.classList.remove('editing');

            } catch (err) {
                errorEl.textContent   = 'Errore: ' + err.message;
                errorEl.style.display = 'block';
            } finally {
                saveBtn.disabled    = false;
                saveBtn.textContent = 'Salva modifiche';
            }
        });
    });

    // ─── INIT ───
    loadProfile();
    loadWallet();
    loadCartBadge();
});