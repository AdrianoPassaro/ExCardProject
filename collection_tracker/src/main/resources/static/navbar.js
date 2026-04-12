/**
 * navbar.js — Navbar universale ExCard
 *
 * Aggiungilo come ULTIMO script prima di </body> in ogni pagina:
 *   <script src="/navbar.js"></script>
 *
 * Elementi HTML attesi (ignora silenziosamente quelli mancanti):
 *   #navGuest / #navUser     — blocchi guest/loggato (homepage, card-page)
 *   #usernameDisplay         — testo "👤 nome"
 *   #walletAmount            — saldo nella wallet-pill
 *   #cartBadge               — contatore carrello
 *   #userMenuTrigger + #userDropdown  — menu a tendina
 *   #logoutBtn               — logout cross-porta
 *   .search-form input[name="q"]  — barra di ricerca con autocomplete
 */
(function () {
    const API_PAYMENT = 'http://localhost:8085/api/payment';
    const API_CART    = 'http://localhost:8087/api/cart';
    const API_CATALOG = 'http://localhost:8082/cards';
    const ALL_PORTS   = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088];

    const $  = id  => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);

    function parseToken(t) {
        try {
            const p = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
            if (p.exp && p.exp < Math.floor(Date.now()/1000)) return null;
            return p.sub || p.username || null;
        } catch { return null; }
    }

    const token    = localStorage.getItem('jwtToken');
    const username = token ? parseToken(token) : null;

    // ── visibilità guest / utente (pagine con doppio stato) ──
    if ($('navGuest') && $('navUser')) {
        $('navGuest').style.display = username ? 'none' : 'flex';
        $('navUser').style.display  = username ? 'flex'  : 'none';
        if (!username) localStorage.removeItem('jwtToken');
    }

    if (username) {
        $$('#usernameDisplay').forEach(el => { el.textContent = `👤 ${username}`; });
    }

    // ── wallet ──
    async function loadWallet() {
        const el = $('walletAmount');
        if (!el || !username) return;
        try {
            const r = await fetch(`${API_PAYMENT}/balance`, { headers: { username } });
            if (r.ok) el.textContent = `€ ${(parseFloat(await r.text())||0).toFixed(2)}`;
        } catch {}
    }

    // ── cart badge ──
    async function loadCartBadge() {
        const badge = $('cartBadge');
        if (!badge || !token) return;
        try {
            const r = await fetch(API_CART, {
                headers: { Authorization: `Bearer ${token}`, username }
            });
            if (!r.ok) return;
            const n = ((await r.json()).items || []).length;
            badge.textContent   = n;
            badge.style.display = n > 0 ? 'flex' : 'none';
        } catch {}
    }

    // ── dropdown ──
    function setupDropdown() {
        const trigger = $('userMenuTrigger');
        const menu    = $('userDropdown');
        if (!trigger || !menu) return;
        trigger.addEventListener('click', e => {
            e.stopPropagation();
            const open = menu.classList.toggle('open');
            trigger.classList.toggle('open', open);
        });
        document.addEventListener('click', () => {
            menu.classList.remove('open');
            trigger.classList.remove('open');
        });
        menu.addEventListener('click', e => e.stopPropagation());
    }

    // ── logout cross-porta ──
    async function propagate(page, msg) {
        const cur = parseInt(window.location.port) || 80;
        await Promise.all(
            ALL_PORTS.filter(p => p !== cur).map(port =>
                new Promise(res => {
                    const ifr = document.createElement('iframe');
                    ifr.style.display = 'none';
                    ifr.src = `http://localhost:${port}/${page}`;
                    const h = e => {
                        if (e.source === ifr.contentWindow && e.data === msg) {
                            window.removeEventListener('message', h);
                            ifr.remove(); res();
                        }
                    };
                    window.addEventListener('message', h);
                    setTimeout(res, 2000);
                    document.body.appendChild(ifr);
                })
            )
        );
    }

    function setupLogout() {
        const btn = $('logoutBtn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            localStorage.removeItem('jwtToken');
            await propagate('del-token.html', 'token_deleted');
            window.location.href = 'http://localhost:8080/homepage.html';
        });
    }

    // ── search autocomplete ──
    let catalogCache = null;
    async function fetchCatalog() {
        if (catalogCache) return catalogCache;
        try {
            const r = await fetch(API_CATALOG);
            catalogCache = r.ok ? await r.json() : [];
        } catch { catalogCache = []; }
        return catalogCache;
    }

    function setupSearch() {
        const form = document.querySelector('.search-form');
        if (!form) return;
        const input = form.querySelector('input[name="q"]');
        if (!input) return;

        form.style.position = 'relative';

        let box = $('searchSuggestions');
        if (!box) {
            box = document.createElement('div');
            box.id        = 'searchSuggestions';
            box.className = 'search-suggestions';
            form.appendChild(box);
        }

        let timer = null;

        input.addEventListener('input', () => {
            clearTimeout(timer);
            const q = input.value.trim();
            if (q.length < 2) { hide(); return; }
            timer = setTimeout(() => show(q), 180);
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') { hide(); }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const first = box.querySelector('.sug-item');
                if (first) first.focus();
            }
        });

        box.addEventListener('keydown', e => {
            const items = [...box.querySelectorAll('.sug-item')];
            const i = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown' && i < items.length - 1) { e.preventDefault(); items[i+1].focus(); }
            if (e.key === 'ArrowUp')  { e.preventDefault(); i > 0 ? items[i-1].focus() : input.focus(); }
            if (e.key === 'Escape')   { hide(); input.focus(); }
        });

        document.addEventListener('click', e => { if (!form.contains(e.target)) hide(); });
        form.addEventListener('submit', hide);

        async function show(q) {
            const cards = await fetchCatalog();
            const words = q.toLowerCase().split(/\s+/).filter(Boolean);
            const hits  = cards
                .filter(c => words.every(w =>
                    `${c.name||''} ${c.setName||''} ${c.rarity||''}`.toLowerCase().includes(w)
                ))
                .slice(0, 5);

            if (!hits.length) { hide(); return; }

            box.innerHTML = '';
            hits.forEach(card => {
                const a       = document.createElement('a');
                a.className   = 'sug-item';
                a.tabIndex    = 0;
                a.href        = `http://localhost:8084/card-page.html?cardId=${encodeURIComponent(card.id)}`;
                a.innerHTML   = `
                    <img class="sug-img" src="${card.imageUrl||''}" alt=""
                         onerror="this.style.display='none'">
                    <div class="sug-info">
                        <span class="sug-name">${card.name}</span>
                        <span class="sug-meta">${card.setName||''} · ${card.rarity||''}</span>
                    </div>`;
                a.addEventListener('click', hide);
                box.appendChild(a);
            });
            box.style.display = 'block';
        }

        function hide() { if (box) box.style.display = 'none'; }
    }

    // ── init ──
    function init() {
        if (username) { loadWallet(); loadCartBadge(); }
        setupDropdown();
        setupLogout();
        setupSearch();
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();

    // esposto per aggiornare il badge dopo aver aggiunto al carrello
    window.NavbarRefreshCart = loadCartBadge;
})();