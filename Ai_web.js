document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.nav-toggle');
  const navUl = document.querySelector('header nav ul');
  if (!toggle || !navUl) return;

  toggle.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', String(!expanded));
    this.classList.toggle('open');
    navUl.classList.toggle('open');
  });

  // Close nav when clicking a link (useful on mobile)
  document.querySelectorAll('header nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      navUl.classList.remove('open');
    });
  });

  // Event deck navigation (prev/next, keyboard, wheel-to-scroll)
  const deck = document.querySelector('.event-cards');
  if (deck) {
    const cards = deck.querySelectorAll('.card');
    const btnNext = document.querySelector('.deck-next');
    const btnPrev = document.querySelector('.deck-prev');

    function getCenteredIndex() {
      const center = deck.scrollLeft + deck.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((c, i) => {
        const cCenter = c.offsetLeft + c.offsetWidth / 2;
        const diff = Math.abs(cCenter - center);
        if (diff < minDiff) { minDiff = diff; closestIdx = i; }
      });
      return closestIdx;
    }

    if (btnNext) btnNext.addEventListener('click', () => {
      const idx = getCenteredIndex();
      const next = cards[Math.min(cards.length - 1, idx + 1)];
      if (next) next.scrollIntoView({behavior: 'smooth', inline: 'center'});
    });
    if (btnPrev) btnPrev.addEventListener('click', () => {
      const idx = getCenteredIndex();
      const prev = cards[Math.max(0, idx - 1)];
      if (prev) prev.scrollIntoView({behavior: 'smooth', inline: 'center'});
    });

    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); if (btnNext) btnNext.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); if (btnPrev) btnPrev.click(); }
    });

    // make vertical wheel scroll horizontally
    deck.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        deck.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    }, { passive: false });

    // Flip behavior: click/tap to toggle, keyboard support, unflip on scroll
    const deckCards = deck.querySelectorAll('.card');
    const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none)').matches;

    deckCards.forEach(card => {
      // toggle on click only on non-touch (desktop) devices
      card.addEventListener('click', (e) => {
        if (e.target.closest('.register-btn')) return; // let button handle its own click
        if (isTouchDevice) return; // on touch, do not toggle when tapping the card itself
        card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', String(card.classList.contains('is-flipped')));
      });

      // add Know more handler for touch devices (and always available)
      const knowBtn = card.querySelector('.know-more');
      if (knowBtn) {
        knowBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          card.classList.toggle('is-flipped');
          card.setAttribute('aria-pressed', String(card.classList.contains('is-flipped')));
        });
      }

      // keyboard: Enter/Space to toggle directly, Escape to close
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-flipped');
          card.setAttribute('aria-pressed', String(card.classList.contains('is-flipped')));
        } else if (e.key === 'Escape') {
          card.classList.remove('is-flipped');
          card.setAttribute('aria-pressed', 'false');
        }
      });
    });

    // Unflip any flipped card when user scrolls the deck
    let scrollUnflipTimeout = null;
    deck.addEventListener('scroll', () => {
      if (scrollUnflipTimeout) clearTimeout(scrollUnflipTimeout);
      scrollUnflipTimeout = setTimeout(() => {
        document.querySelectorAll('.card.is-flipped').forEach(c => {
          c.classList.remove('is-flipped');
          c.setAttribute('aria-pressed', 'false');
        });
      }, 250);
    });
  }
});
