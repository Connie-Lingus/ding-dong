document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    if (name && email) {
        document.getElementById('form-message').textContent = 'Thank you for your submission! We’ll be in touch soon.';
        this.submit(); // Allow Formspree submission
        this.reset();
    } else {
        document.getElementById('form-message').textContent = 'Please fill out all required fields.';
        document.getElementById('form-message').style.color = '#ff0000';
    }
});
/* ============================================================
   GOOGLE REVIEWS — append this block to your script.js
   ============================================================ */

(function () {
    // ── CONFIG ──────────────────────────────────────────────
    // After you deploy the Netlify function, paste its URL here.
    // It will look like: https://your-site.netlify.app/.netlify/functions/reviews
    const PROXY_URL = 'https://preeminent-fudge-f8454a.netlify.app/.netlify/functions/reviews';
    // ────────────────────────────────────────────────────────

    const grid = document.getElementById('reviews-grid');
    const summary = document.getElementById('reviews-summary');
    if (!grid) return; // Reviews section not on this page

    fetchReviews();

    async function fetchReviews() {
        try {
            const res = await fetch(PROXY_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            renderSummary(data);
            renderCards(data.reviews || []);
        } catch (err) {
            grid.innerHTML = `
                <div class="reviews-error">
                    <p>Reviews are temporarily unavailable. Please check back soon.</p>
                </div>`;
            console.error('Reviews fetch error:', err);
        }
    }

    function renderSummary(data) {
        if (!data.rating) return;
        const fullStars = Math.round(data.rating);
        summary.innerHTML = `
            <div class="summary-score">${data.rating.toFixed(1)}</div>
            <div class="summary-right">
                <div class="stars-row">${renderStars(fullStars)}</div>
                <div class="summary-count">${data.user_ratings_total || ''} reviews</div>
                <div class="google-badge">
                    ${googleLogoSVG()}
                    <span>Google Reviews</span>
                </div>
            </div>`;
    }

    function renderCards(reviews) {
        if (!reviews.length) {
            grid.innerHTML = '<div class="reviews-error"><p>No reviews yet — be the first!</p></div>';
            return;
        }

        // Show only 5-star reviews first, then the rest, max 6 cards
        const sorted = [...reviews]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);

        grid.innerHTML = sorted.map(r => reviewCard(r)).join('');

        // Wire up "Read more" toggles
        grid.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textEl = btn.previousElementSibling;
                if (textEl.classList.contains('truncated')) {
                    textEl.classList.remove('truncated');
                    btn.textContent = 'Show less';
                } else {
                    textEl.classList.add('truncated');
                    btn.textContent = 'Read more';
                }
            });
        });
    }

    function reviewCard(r) {
        const initials = r.author_name
            ? r.author_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            : '?';

        const avatarContent = r.profile_photo_url
            ? `<img src="${escapeHtml(r.profile_photo_url)}" alt="${escapeHtml(r.author_name)}" loading="lazy">`
            : initials;

        const needsTruncation = r.text && r.text.length > 200;

        return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-avatar">${avatarContent}</div>
                <div class="reviewer-info">
                    <div class="reviewer-name">${escapeHtml(r.author_name || 'Anonymous')}</div>
                    <div class="review-date">${r.relative_time_description || ''}</div>
                </div>
            </div>
            <div class="review-stars">${renderStars(r.rating)}</div>
            ${r.text ? `
                <p class="review-text ${needsTruncation ? 'truncated' : ''}">${escapeHtml(r.text)}</p>
                ${needsTruncation ? `<button class="read-more-btn">Read more</button>` : ''}
            ` : ''}
        </div>`;
    }

    function renderStars(rating) {
        return Array.from({ length: 5 }, (_, i) =>
            `<span class="star">${i < rating ? '★' : '☆'}</span>`
        ).join('');
    }

    function googleLogoSVG() {
        return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 13.6 17.7 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
            <path fill="#FBBC05" d="M10.7 28.6A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7-5.4A23.8 23.8 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.7-6z"/>
            <path fill="#34A853" d="M24 46.5c5.5 0 10.1-1.8 13.4-4.9l-7.4-5.7c-1.8 1.2-4.1 1.9-6 1.9-6.3 0-11.6-4.2-13.5-9.9l-7.7 6C6.7 41.5 14.8 46.5 24 46.5z"/>
        </svg>`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
})();
// ── DING DONG SUBMIT SOUND ──
(function () {
    const sound = new Audio('images/ding-dong_sound.mp3');
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            sound.currentTime = 0;
            sound.play().catch(function () {});
            setTimeout(function () {
                form.submit();
            }, 2800);
        });
    }
})();
