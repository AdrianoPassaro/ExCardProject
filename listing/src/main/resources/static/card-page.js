// ─── CONFIG ───
const API_CATALOG = 'http://localhost:8082/cards';
const API_LISTING = 'http://localhost:8084/listings';
const API_CART    = 'http://localhost:8087/api/cart';
const API_PAYMENT = 'http://localhost:8085/api/payment';
const API_USER    = 'http://localhost:8081/api/user';

// ─── STATE ───
let currentListings = [];
let sortAscending   = true;
let loggedUsername  = null;
const token         = localStorage.getItem('jwtToken');

// Ratings cache: sellerUsername → { averageRating, ratingCount }
const ratingsCache  = {};

// ─── AUTH ───
function extractUsername(t) {
    try {
        const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload.sub || payload.username || null;
    } catch { return null; }
}

function getCardIdFromUrl() {
    return new URLSearchParams(window.location.search).get('cardId');
}

// ─── NAVBAR SETUP ───
function setupNavbar() {
    if (!token) return;
    loggedUsername = extractUsername(token);
    if (!loggedUsername) return;

    document.getElementById('navGuest').style.display = 'none';
    document.getElementById('navUser').style.display  = 'flex';
    document.getElementById('usernameDisplay').textContent = loggedUsername;
    document.getElementById('sellButton').style.display = 'inline-flex';

    loadWalletBadge();
    loadCartBadge();
    setupDropdown();

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        localStorage.removeItem('jwtToken');
        window.location.href = 'http://localhost:8080/homepage.html';
    });
}

async function loadWalletBadge() {
    try {
        const res = await fetch(`${API_PAYMENT}/balance`, { headers: { 'username': loggedUsername } });
        if (!res.ok) return;
        const bal = parseFloat(await res.text()) || 0;
        document.getElementById('walletAmount').textContent = `€ ${bal.toFixed(2)}`;
    } catch { /* silent */ }
}

async function loadCartBadge() {
    try {
        const res = await fetch(API_CART, {
            headers: { 'Authorization': `Bearer ${token}`, 'username': loggedUsername }
        });
        if (!res.ok) return;
        const cart  = await res.json();
        const count = (cart.items || []).length;
        const badge = document.getElementById('cartBadge');
        if (count > 0) { badge.textContent = count; badge.removeAttribute('style'); }
    } catch { /* silent */ }
}

function setupDropdown() {
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
}

// ─── LOAD DATA ───
async function loadCard(cardId) {
    const res = await fetch(`${API_CATALOG}/${cardId}`);
    if (!res.ok) throw new Error('Carta non trovata');
    return res.json();
}

async function loadListings(cardId) {
    const res = await fetch(`${API_LISTING}/card/${cardId}`);
    if (!res.ok) throw new Error('Errore nel caricamento degli annunci');
    return res.json();
}

async function loadSellerRating(sellerUsername) {
    if (ratingsCache[sellerUsername]) return ratingsCache[sellerUsername];
    try {
        const res = await fetch(`${API_USER}/public/${sellerUsername}`);
        if (!res.ok) return null;
        const data = await res.json();
        const r = { averageRating: data.averageRating || 0, ratingCount: data.ratingCount || 0 };
        ratingsCache[sellerUsername] = r;
        return r;
    } catch { return null; }
}

// ─── RENDER CARD ───
function renderCard(card) {
    document.getElementById('cardName').textContent     = card.name     || '—';
    document.getElementById('cardSet').textContent      = card.setName  || '—';
    document.getElementById('cardNumber').textContent   = card.number   || '—';
    document.getElementById('cardRarity').textContent   = card.rarity   || '—';
    document.getElementById('summarySet').textContent   = card.setName  || '—';
    document.getElementById('summaryNumber').textContent = card.number  || '—';
    document.getElementById('summaryRarity').textContent = card.rarity  || '—';
    document.title = `${card.name || 'Carta'} — ExCard`;

    const img = document.getElementById('cardImage');
    img.src = card.imageUrl || '';
    img.alt = card.name     || 'Carta';
}

// ─── PRICE STATS (quantity-weighted average) ───
function updateListingStats(listings) {
    const count = listings.length;
    document.getElementById('summaryListings').textContent = count;
    document.getElementById('resultsBar').textContent = `${count} annuncion${count !== 1 ? 'i' : 'o'} attiv${count !== 1 ? 'i' : 'o'}`;

    if (!count) {
        document.getElementById('summaryLowestPrice').textContent  = '—';
        document.getElementById('summaryAveragePrice').textContent = '—';
        return;
    }

    // Prezzo per singola carta (price / quantity)
    const unitPrices = listings.map(l => l.price / Math.max(l.quantity, 1));
    const lowest     = Math.min(...unitPrices);

    // Media pesata per quantità: somma(price) / somma(quantity)
    const totalValue = listings.reduce((s, l) => s + l.price, 0);
    const totalQty   = listings.reduce((s, l) => s + Math.max(l.quantity, 1), 0);
    const weightedAvg = totalValue / totalQty;

    document.getElementById('summaryLowestPrice').textContent  = `€ ${lowest.toFixed(2)}`;
    document.getElementById('summaryAveragePrice').textContent = `€ ${weightedAvg.toFixed(2)}`;
}

// ─── STARS HTML ───
function starsHtml(avg, count) {
    if (count === 0) return `<span class="no-rating">Nessuna recensione</span>`;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= Math.round(avg) ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    return `<span class="stars">${stars}</span><span class="rating-count">(${count})</span>`;
}

// ─── CONDITION CLASS ───
function condClass(condition) {
    const map = {
        'Mint': 'condition-mint', 'Near Mint': 'condition-near-mint',
        'Excellent': 'condition-excellent', 'Good': 'condition-good',
        'Played': 'condition-played', 'Poor': 'condition-poor'
    };
    return map[condition] || 'condition-default';
}

// ─── RENDER LISTINGS ───
async function renderListings(listings) {
    const container = document.getElementById('listingContainer');
    container.innerHTML = '';
    updateListingStats(listings);

    if (!listings || listings.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">🃏</div>
                <div class="empty-title">Nessun annuncio disponibile</div>
                <div class="empty-subtitle">Al momento nessun utente sta vendendo questa carta.</div>
            </div>`;
        return;
    }

    // Load ratings for all unique sellers in parallel
    const sellers = [...new Set(listings.map(l => l.sellerUsername))];
    await Promise.all(sellers.map(s => loadSellerRating(s)));

    listings.forEach((listing, index) => {
        const isOwnListing = loggedUsername && listing.sellerUsername === loggedUsername;
        const rating       = ratingsCache[listing.sellerUsername] || { averageRating: 0, ratingCount: 0 };
        const unitPrice    = listing.price / Math.max(listing.quantity, 1);

        const row = document.createElement('div');
        row.className = `listing-row${isOwnListing ? ' own-listing' : ''}`;
        row.style.animationDelay = `${Math.min(index * 40, 240)}ms`;

        const cartBtnDisabled = !loggedUsername || isOwnListing;
        const cartBtnTitle    = isOwnListing
            ? 'Non puoi aggiungere al carrello una tua carta in vendita'
            : !loggedUsername
                ? 'Accedi per acquistare'
                : 'Aggiungi al carrello';

        row.innerHTML = `
            <div class="seller-cell">
                <a class="seller-link"
                   href="http://localhost:8081/seller-profile.html?username=${encodeURIComponent(listing.sellerUsername)}">
                    ${listing.sellerUsername}${isOwnListing ? ' <span style="color:var(--muted);font-size:0.7rem">(tu)</span>' : ''}
                </a>
                <div class="seller-rating">${starsHtml(rating.averageRating, rating.ratingCount)}</div>
            </div>
            <div>
                <span class="condition-badge ${condClass(listing.condition)}">${listing.condition}</span>
            </div>
            <div class="qty-cell">${listing.quantity}</div>
            <div class="price-cell">€ ${unitPrice.toFixed(2)}</div>
            <div class="actions-cell">
                <button class="icon-cart-button buy-button"
                    data-listing-id="${listing.id}"
                    data-card-id="${listing.cardId}"
                    data-seller="${listing.sellerUsername}"
                    data-condition="${listing.condition}"
                    data-price="${listing.price}"
                    data-quantity="${listing.quantity}"
                    title="${cartBtnTitle}"
                    ${cartBtnDisabled ? 'disabled' : ''}
                    aria-label="Aggiungi al carrello">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(row);
    });

    setupBuyButtons();
}

// ─── BUY BUTTONS ───
function setupBuyButtons() {
    document.querySelectorAll('.buy-button:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!token) {
                window.location.href = 'http://localhost:8080/login.html';
                return;
            }

            btn.disabled = true;
            const listingId = btn.dataset.listingId;
            const cardId    = btn.dataset.cardId;
            const sellerId  = btn.dataset.seller;
            const condition = btn.dataset.condition;
            const price     = parseFloat(btn.dataset.price);
            const quantity  = parseInt(btn.dataset.quantity);

            try {
                // 1. Reserve listing
                const reserveRes = await fetch(`${API_LISTING}/${listingId}/reserve`, { method: 'PATCH' });
                if (!reserveRes.ok) throw new Error('Impossibile riservare il listing');

                // 2. Add to cart
                const cartRes = await fetch(`${API_CART}/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'username': loggedUsername
                    },
                    body: JSON.stringify({ listingId, cardId, sellerId, condition, price, quantity })
                });

                if (!cartRes.ok) {
                    // rollback reserve
                    await fetch(`${API_LISTING}/${listingId}/release`, { method: 'PATCH' }).catch(() => {});
                    throw new Error('Errore aggiunta al carrello');
                }

                // 3. Update UI
                btn.classList.add('added');
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>`;
                btn.title = 'Aggiunto al carrello';

                // Hide listing row (reserved — can no longer be bought by others)
                btn.closest('.listing-row').style.opacity = '0.4';
                btn.closest('.listing-row').style.pointerEvents = 'none';

                // Update cart badge
                await loadCartBadge();

            } catch (err) {
                console.error(err);
                alert('Errore: ' + err.message);
                btn.disabled = false;
            }
        });
    });
}

// ─── SELL BUTTON + FORM ───
function setupSellButton() {
    const sellBtn     = document.getElementById('sellButton');
    const sellSection = document.getElementById('sellFormSection');
    const cancelBtn   = document.getElementById('cancelSellBtn');

    sellBtn.addEventListener('click', () => {
        const isHidden = sellSection.style.display === 'none';
        sellSection.style.display = isHidden ? 'block' : 'none';
        sellBtn.textContent = isHidden ? '✕ Annulla' : '+ Vendi questa carta';
    });

    cancelBtn.addEventListener('click', () => {
        sellSection.style.display = 'none';
        sellBtn.textContent = '+ Vendi questa carta';
    });
}

function setupSellForm(cardId) {
    document.getElementById('sellForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!token) { window.location.href = 'http://localhost:8080/login.html'; return; }

        const msgEl    = document.getElementById('sellMessage');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

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

            msgEl.textContent = '✓ Annuncio creato con successo!';
            msgEl.className   = 'sell-message success';
            e.target.reset();

            currentListings = await loadListings(cardId);
            currentListings.sort((a, b) => a.price - b.price);
            renderListings(currentListings);

        } catch (err) {
            msgEl.textContent = '✕ Errore: ' + err.message;
            msgEl.className   = 'sell-message error';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// ─── SORT ───
function setupSortButton() {
    document.getElementById('sortPriceButton').addEventListener('click', () => {
        currentListings.sort((a, b) => {
            const pa = a.price / Math.max(a.quantity, 1);
            const pb = b.price / Math.max(b.quantity, 1);
            return sortAscending ? pa - pb : pb - pa;
        });
        renderListings(currentListings);
        const btn = document.getElementById('sortPriceButton');
        btn.textContent = sortAscending ? 'Ordina per prezzo ↓' : 'Ordina per prezzo ↑';
        sortAscending = !sortAscending;
    });
}

// ─── INIT ───
async function initPage() {
    const cardId = getCardIdFromUrl();
    if (!cardId) { alert('cardId mancante nell\'URL'); return; }

    setupNavbar();

    try {
        const [card, listings] = await Promise.all([loadCard(cardId), loadListings(cardId)]);
        currentListings = listings.sort((a, b) =>
            (a.price / Math.max(a.quantity,1)) - (b.price / Math.max(b.quantity,1))
        );
        renderCard(card);
        await renderListings(currentListings);
        setupSortButton();
        setupSellButton();
        setupSellForm(cardId);
    } catch (err) {
        console.error(err);
        document.getElementById('cardName').textContent = 'Errore nel caricamento';
    }
}

initPage();