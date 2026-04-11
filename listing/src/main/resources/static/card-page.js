// ─── CONFIG ───
const API_CATALOG = 'http://localhost:8082/cards';
const API_LISTING = 'http://localhost:8084/listings';
const API_CART    = 'http://localhost:8087/api/cart';
const API_PAYMENT = 'http://localhost:8085/api/payment';
const API_USER    = 'http://localhost:8081/api/user';

// ─── CONDITION ORDER (Mint best → Poor worst) ───
const CONDITION_ORDER = { 'Mint': 0, 'Near Mint': 1, 'Excellent': 2, 'Good': 3, 'Played': 4, 'Poor': 5 };

// ─── STATE ───
let allListings   = [];   // raw from API (always full list)
let sortMode      = 'price-asc';  // 'price-asc' | 'price-desc' | 'cond-asc' | 'cond-desc'
let filterCond    = '';
let filterRating  = 0;
const ratingsCache = {};  // sellerUsername → { averageRating, ratingCount }
let loggedUsername = null;
const token        = localStorage.getItem('jwtToken');

// ─── AUTH ───
function extractUsername(t) {
    try {
        const p = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        if (p.exp && p.exp < Math.floor(Date.now()/1000)) return null;
        return p.sub || p.username || null;
    } catch { return null; }
}

function getCardIdFromUrl() {
    return new URLSearchParams(window.location.search).get('cardId');
}

// ─── NAVBAR ───
function setupNavbar() {
    if (!token) return;
    loggedUsername = extractUsername(token);
    if (!loggedUsername) return;

    document.getElementById('navGuest').style.display = 'none';
    document.getElementById('navUser').style.display  = 'flex';
    document.getElementById('usernameDisplay').textContent = loggedUsername;
    document.getElementById('sellButton').style.display = 'inline-flex';

    loadWallet();
    loadCartBadge();
    setupDropdown();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/homepage.html';
    });
}

async function loadWallet() {
    try {
        const res = await fetch(`${API_PAYMENT}/balance`, { headers: { 'username': loggedUsername } });
        if (!res.ok) return;
        const bal = parseFloat(await res.text()) || 0;
        document.getElementById('walletAmount').textContent = `€ ${bal.toFixed(2)}`;
    } catch {}
}

async function loadCartBadge() {
    try {
        const res = await fetch(API_CART, {
            headers: { 'Authorization': `Bearer ${token}`, 'username': loggedUsername }
        });
        if (!res.ok) return;
        const cart = await res.json();
        const n    = (cart.items || []).length;
        const b    = document.getElementById('cartBadge');
        if (n > 0) { b.textContent = n; b.removeAttribute('style'); }
    } catch {}
}

function setupDropdown() {
    const trigger  = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userDropdown');
    trigger.addEventListener('click', e => {
        e.stopPropagation();
        const open = dropdown.classList.toggle('open');
        trigger.classList.toggle('open', open);
    });
    document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        trigger.classList.remove('open');
    });
    dropdown.addEventListener('click', e => e.stopPropagation());
}

// ─── LOAD CARD ───
async function loadCard(cardId) {
    const res = await fetch(`${API_CATALOG}/${cardId}`);
    if (!res.ok) throw new Error('Carta non trovata');
    return res.json();
}

// ─── LOAD LISTINGS ───
async function loadListings(cardId) {
    const res = await fetch(`${API_LISTING}/card/${cardId}`);
    if (!res.ok) throw new Error('Errore nel caricamento degli annunci');
    return res.json();
}

// ─── LOAD SELLER RATING ───
async function loadSellerRating(seller) {
    if (ratingsCache[seller]) return ratingsCache[seller];
    try {
        const headers = { 'Content-Type': 'application/json' };

        // Aggiungiamo il token solo se l'utente è effettivamente loggato
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_USER}/seller/${seller}`, {
            method: 'GET',
            headers: headers
        });

        // Se non siamo loggati e il server ci dà 401/403,
        // significa che il backend non è ancora stato sbloccato (punto 1 sopra)
        if (!res.ok) {
            console.warn(`Impossibile caricare rating per ${seller} (Status: ${res.status})`);
            return { averageRating: 0 };
        }

        const d = await res.json();
        ratingsCache[seller] = {
            averageRating: d.averageRating || 0
        };
        return ratingsCache[seller];
    } catch (err) {
        console.error("Errore fetch rating:", err);
        return { averageRating: 0 };
    }
}

// ─── RENDER CARD ───
function renderCard(card) {
    document.title = `${card.name || 'Carta'} — ExCard`;
    document.getElementById('cardName').textContent     = card.name    || '-';
    document.getElementById('cardSet').textContent      = card.setName || '-';
    document.getElementById('cardNumber').textContent   = card.number  || '-';
    document.getElementById('cardRarity').textContent   = card.rarity  || '-';
    document.getElementById('summarySet').textContent   = card.setName || '-';
    document.getElementById('summaryNumber').textContent = card.number || '-';
    document.getElementById('summaryRarity').textContent = card.rarity || '-';
    const img = document.getElementById('cardImage');
    img.src = card.imageUrl || ''; img.alt = card.name || 'Carta';
}

// ─── STATS (quantity-weighted average) ───
function updateStats(listings) {
    const n = listings.length;
    document.getElementById('summaryListings').textContent = n;
    document.getElementById('resultsBar').textContent      = `${n} annuncio${n !== 1 ? 'i' : ''} attivo${n !== 1 ? 'i' : ''}`;
    if (!n) {
        document.getElementById('summaryLowestPrice').textContent  = '-';
        document.getElementById('summaryAveragePrice').textContent = '-';
        return;
    }
    // price is already unit price (prezzo per singola carta)
    const lowest = Math.min(...listings.map(l => l.price));
    // Weighted average: sum(price * qty) / sum(qty) — reflects actual market volume
    const totalVal = listings.reduce((s, l) => s + l.price * Math.max(l.quantity, 1), 0);
    const totalQty = listings.reduce((s, l) => s + Math.max(l.quantity, 1), 0);
    document.getElementById('summaryLowestPrice').textContent  = `€ ${lowest.toFixed(2)}`;
    document.getElementById('summaryAveragePrice').textContent = `€ ${(totalVal / totalQty).toFixed(2)}`;
}

// ─── STARS HTML (read-only display) ───
function starsHtml(avg) {
    if (!avg || avg <= 0) {
        return `<span style="color: #999; font-style: italic; font-size: 0.85rem;">Nessuna recensione</span>`;
    }

    const fullStars = Math.round(avg);
    const emptyStars = 5 - fullStars;
    const stelle = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);

    return `
        <span class="seller-stars" style="color: #f39c12; font-size: 1.1rem;">
            ${stelle}
            <small style="color: #666; font-size: 0.8rem; margin-left: 4px;">(${avg.toFixed(1)})</small>
        </span>`;
}

// ─── CONDITION CLASS ───
function condClass(c) {
    const m = { 'Mint':'condition-mint','Near Mint':'condition-near-mint','Excellent':'condition-excellent','Good':'condition-good','Played':'condition-played','Poor':'condition-poor' };
    return m[c] || 'condition-default';
}

// ─── APPLY FILTERS + SORT → RENDER ───
function applyAndRender() {
    let copy = [...allListings];

    // 1. FILTRI
    if (filterCond) {
        // Filtra per condizione esatta (Mint, Near Mint, ecc.)
        copy = copy.filter(l => l.condition === filterCond);
    }

    if (filterRating > 0) {
        copy = copy.filter(l => {
            const data = ratingsCache[l.sellerUsername];
            // Mostra solo se il rating è >= a quello selezionato
            return data && data.averageRating >= filterRating;
        });
    }

    // 2. ORDINAMENTO
    copy.sort((a, b) => {
        if (sortMode === 'price-asc')  return a.price - b.price;
        if (sortMode === 'price-desc') return b.price - a.price;

        if (sortMode === 'cond-asc' || sortMode === 'cond-desc') {
            // Usa l'oggetto CONDITION_ORDER definito in alto nel file
            const valA = CONDITION_ORDER[a.condition] !== undefined ? CONDITION_ORDER[a.condition] : 99;
            const valB = CONDITION_ORDER[b.condition] !== undefined ? CONDITION_ORDER[b.condition] : 99;

            return sortMode === 'cond-asc' ? valA - valB : valB - valA;
        }
        return 0;
    });

    renderListings(copy);
}

// ─── RENDER LISTINGS ───
function renderListings(listings) {
    const container = document.getElementById('listingContainer');
    container.innerHTML = '';
    updateStats(listings);

    if (!listings.length) {
        container.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🃏</div>
                <div class="empty-title">Nessun annuncio disponibile</div>
                <div class="empty-subtitle">Al momento nessun utente sta vendendo questa carta con i filtri selezionati.</div>
            </div>`;
        return;
    }

    listings.forEach((listing, idx) => {
        const isOwn      = loggedUsername && listing.sellerUsername === loggedUsername;
        const ratingData = ratingsCache[listing.sellerUsername];
        const avgValue = (ratingData && ratingData.averageRating) ? ratingData.averageRating : 0;

        // NUOVA LOGICA PREZZI: il database salva il prezzo unitario
        const unitPrice  = listing.price;
        const totalPrice = unitPrice * listing.quantity; // Totale massimo disponibile

        const row = document.createElement('div');
        row.className = `listing-row${isOwn ? ' own-listing' : ''}`;
        row.style.animationDelay = `${Math.min(idx * 40, 240)}ms`;

        const cartTitle  = isOwn ? 'Non puoi acquistare le tue carte' : (!loggedUsername ? 'Accedi per acquistare' : 'Aggiungi al carrello');
        const cartDisabledAttr = (!loggedUsername || isOwn) ? 'disabled' : '';
        const tradeDisabledAttr = (!loggedUsername || isOwn) ? 'disabled' : '';

        row.innerHTML = `
            <div class="seller-cell">
                <a class="seller-link"
                   href="http://localhost:8081/seller-profile.html?username=${encodeURIComponent(listing.sellerUsername)}">
                    ${listing.sellerUsername}
                </a>
                ${isOwn ? '<span class="own-badge">(Tu)</span>' : ''}
                ${starsHtml(avgValue)}
            </div>
            <div>
                <span class="condition-badge ${condClass(listing.condition)}">${listing.condition}</span>
            </div>
            <div class="qty-cell">${listing.quantity}</div>
            <div class="price-cell">
                <span class="price-unit">€ ${unitPrice.toFixed(2)}</span>
                ${listing.quantity > 1 ? `<span class="price-total">Totale disp: € ${totalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="actions-cell">
                ${(!isOwn && loggedUsername) ?
            `<input type="number" class="buy-qty-input" id="qty-${listing.id}" min="1" max="${listing.quantity}" value="1">`
            : ''}
                
                <button class="icon-cart-button buy-button"
                    data-listing-id="${listing.id}"
                    data-card-id="${listing.cardId}"
                    data-seller="${listing.sellerUsername}"
                    data-condition="${listing.condition}"
                    data-price="${listing.price}"
                    data-max-quantity="${listing.quantity}"
                    title="${cartTitle}"
                    ${cartDisabledAttr}
                    aria-label="Aggiungi al carrello">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </button>
                <button class="trade-button"
                    data-listing-id="${listing.id}"
                    data-seller="${listing.sellerUsername}"
                    ${tradeDisabledAttr}>
                    Scambia
                </button>
            </div>
        `;

        container.appendChild(row);
    });

    setupBuyButtons();
    setupTradeButtons();
}

// ─── BUY BUTTONS ───
function setupBuyButtons() {
    document.querySelectorAll('.buy-button:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', async () => {
            const listingId = btn.dataset.listingId;
            const maxQty    = parseInt(btn.dataset.maxQuantity);

            // Leggi la quantità selezionata dall'utente
            const qtyInput  = document.getElementById(`qty-${listingId}`);
            const selectedQty = qtyInput ? parseInt(qtyInput.value) : 1;

            // Validazione base
            if (selectedQty > maxQty || selectedQty < 1) {
                alert('Quantità non valida');
                return;
            }

            btn.disabled = true;
            const cardId    = btn.dataset.cardId;
            const sellerId  = btn.dataset.seller;
            const condition = btn.dataset.condition;
            const price     = parseFloat(btn.dataset.price);

            try {
                // 1. Reserve parziale (aggiunto ?qty=...)
                const rr = await fetch(`${API_LISTING}/${listingId}/reserve?qty=${selectedQty}`, { method: 'PATCH' });
                if (!rr.ok) throw new Error('Impossibile riservare le carte');

                // 2. Add to cart (invia selectedQty invece di tutta la quantity)
                const cr = await fetch(`${API_CART}/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'username': loggedUsername
                    },
                    body: JSON.stringify({
                        listingId, cardId, sellerId, condition, price,
                        quantity: selectedQty // Qui mandiamo la quantità scelta!
                    })
                });

                if (!cr.ok) {
                    // Se fallisce, rilascia la quantità bloccata
                    await fetch(`${API_LISTING}/${listingId}/release?qty=${selectedQty}`, { method: 'PATCH' }).catch(() => {});
                    throw new Error('Errore aggiunta al carrello');
                }

                // 3. Ricarica gli annunci dal server per aggiornare le quantità a schermo!
                allListings = await loadListings(cardId);
                applyAndRender();
                loadCartBadge();

            } catch (err) {
                alert('Errore: ' + err.message);
                btn.disabled = false;
            }
        });
    });
}

// ─── TRADE BUTTONS ───
function setupTradeButtons() {
    document.querySelectorAll('.trade-button:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!token) { window.location.href = 'http://localhost:8080/login.html'; return; }
            const listingId = btn.dataset.listingId;
            const seller    = btn.dataset.seller;
            window.location.href = `http://localhost:8088/trade.html?listingId=${encodeURIComponent(listingId)}&seller=${encodeURIComponent(seller)}`;
        });
    });
}

// ─── SORT BUTTONS ───
function setupSortAndFilter(cardId) {
    const pBtn = document.getElementById('sortPriceButton');
    const cBtn = document.getElementById('sortCondButton');

    // Ordinamento per Prezzo
    pBtn.addEventListener('click', () => {
        if (sortMode === 'price-asc') {
            sortMode = 'price-desc';
            pBtn.textContent = 'Prezzo ↓';
        } else {
            sortMode = 'price-asc';
            pBtn.textContent = 'Prezzo ↑';
        }
        pBtn.classList.add('sort-active');
        cBtn.classList.remove('sort-active');
        cBtn.textContent = 'Condizione'; // Reset testo dell'altro bottone
        applyAndRender();
    });

    // Ordinamento per Condizione
    cBtn.addEventListener('click', () => {
        if (sortMode === 'cond-asc') {
            sortMode = 'cond-desc';
            cBtn.textContent = 'Condizione ↓';
        } else {
            sortMode = 'cond-asc';
            cBtn.textContent = 'Condizione ↑';
        }
        cBtn.classList.add('sort-active');
        pBtn.classList.remove('sort-active');
        pBtn.textContent = 'Prezzo'; // Reset testo dell'altro bottone
        applyAndRender();
    });

    // Filtro Dropdown Condizione
    document.getElementById('filterCondition').addEventListener('change', e => {
        filterCond = e.target.value;
        applyAndRender();
    });

    // Filtro Dropdown Rating
    document.getElementById('filterRating').addEventListener('change', e => {
        filterRating = parseInt(e.target.value) || 0;
        applyAndRender();
    });

    // Tasto Reset
    document.getElementById('resetFilters').addEventListener('click', () => {
        filterCond = '';
        filterRating = 0;
        sortMode = 'price-asc';

        document.getElementById('filterCondition').value = '';
        document.getElementById('filterRating').value = '0';

        pBtn.textContent = 'Prezzo ↑';
        pBtn.classList.add('sort-active');
        cBtn.textContent = 'Condizione';
        cBtn.classList.remove('sort-active');

        applyAndRender();
    });
}

// ─── SELL BUTTON + FORM ───
function setupSellButton() {
    const sellBtn = document.getElementById('sellButton');
    const section = document.getElementById('sellFormSection');
    sellBtn.addEventListener('click', () => {
        section.classList.toggle('hidden');
        sellBtn.textContent = section.classList.contains('hidden') ? 'Vendi questa carta' : '✕ Annulla';
    });
}

function setupSellForm(cardId) {
    document.getElementById('sellForm').addEventListener('submit', async e => {
        e.preventDefault();
        if (!token) { window.location.href = 'http://localhost:8080/login.html'; return; }
        const msg = document.getElementById('sellMessage');
        const sub = e.target.querySelector('button[type="submit"]');
        sub.disabled = true;
        try {
            const res = await fetch(API_LISTING, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    cardId,
                    condition: document.getElementById('condition').value,
                    quantity:  Number(document.getElementById('quantity').value),
                    price:     Number(document.getElementById('price').value)
                })
            });
            if (!res.ok) throw new Error(await res.text() || 'Errore creazione annuncio');
            msg.textContent = '✓ Annuncio creato con successo!';
            msg.className   = 'sell-message success';
            e.target.reset();
            // Reload listings
            allListings = await loadListings(cardId);
            const sellers = [...new Set(allListings.map(l => l.sellerUsername))];
            await Promise.all(sellers.map(loadSellerRating));
            applyAndRender();
        } catch (err) {
            msg.textContent = '✕ Errore: ' + err.message;
            msg.className   = 'sell-message error';
        } finally { sub.disabled = false; }
    });
}

// ─── INIT ───
async function initPage() {
    const cardId = getCardIdFromUrl();
    if (!cardId) { alert('cardId mancante nell\'URL'); return; }

    setupNavbar();

    try {
        const [card, listings] = await Promise.all([loadCard(cardId), loadListings(cardId)]);
        allListings = listings;

        // Load all seller ratings in parallel
        const sellers = [...new Set(allListings.map(l => l.sellerUsername))];
        await Promise.all(sellers.map(loadSellerRating));

        renderCard(card);
        applyAndRender();           // initial render (price asc)
        setupSortAndFilter(cardId);
        setupSellButton();
        setupSellForm(cardId);

    } catch (err) {
        console.error(err);
        document.getElementById('cardName').textContent = 'Errore nel caricamento';
    }
}

initPage();