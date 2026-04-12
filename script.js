document.addEventListener('DOMContentLoaded', () => {
  const storefront = {
    stripe: {
      publishableKey: '',
      buyButtonIds: {
        'yul-younger': '',
        'bello-gallico': '',
        'spanish-tragedy': ''
      }
    },
    books: {
      'yul-younger': {
        title: 'Yul the Younger',
        amazonUrl: 'https://www.amazon.com/s?k=9798869169266'
      },
      'bello-gallico': {
        title: "Yul's De Bello Gallico",
        amazonUrl: 'https://www.amazon.com/s?k=Yul%27s+De+Bello+Gallico+Jules+Wright'
      },
      'spanish-tragedy': {
        title: "Yul's Spanish Tragedy",
        amazonUrl: 'https://www.amazon.com/s?k=9798348168582'
      }
    }
  };

  const getBookById = (bookId) => {
    if (!bookId) return null;
    return storefront.books[bookId] ?? null;
  };

  const ensureStripeBuyButtonScript = (() => {
    let loadPromise = null;

    return () => {
      if (window.customElements?.get?.('stripe-buy-button')) return Promise.resolve();
      if (loadPromise) return loadPromise;

      loadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-stripe-buy-button]');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Failed to load Stripe Buy Button')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/buy-button.js';
        script.async = true;
        script.dataset.stripeBuyButton = 'true';
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error('Failed to load Stripe Buy Button')), { once: true });
        document.head.appendChild(script);
      });

      return loadPromise;
    };
  })();

  const ensureCheckoutModal = (() => {
    let modalState = null;

    const closeModal = () => {
      if (!modalState) return;

      modalState.backdrop.hidden = true;
      modalState.body.replaceChildren();
      if (modalState.previousFocus && typeof modalState.previousFocus.focus === 'function') {
        modalState.previousFocus.focus();
      }
      modalState.previousFocus = null;
      document.body.style.overflow = '';
    };

    const openModal = (bookId) => {
      const book = getBookById(bookId);
      if (!book) return;

      modalState.previousFocus = document.activeElement;
      modalState.backdrop.hidden = false;
      document.body.style.overflow = 'hidden';

      modalState.title.textContent = `Buy Now: ${book.title}`;

      const buyButtonId = storefront.stripe.buyButtonIds[bookId] ?? '';
      const publishableKey = storefront.stripe.publishableKey ?? '';

      if (!buyButtonId || !publishableKey) {
        const message = document.createElement('p');
        message.className = 'checkout-message';
        message.textContent = 'Checkout is not available yet.';

        const amazonLink = document.createElement('a');
        amazonLink.className = 'button button-dark';
        amazonLink.href = book.amazonUrl;
        amazonLink.target = '_blank';
        amazonLink.rel = 'noopener noreferrer';
        amazonLink.textContent = 'Buy on Amazon';

        const actions = document.createElement('div');
        actions.className = 'checkout-actions';
        actions.appendChild(amazonLink);

        modalState.body.append(message, actions);
        modalState.dialog.focus();
        return;
      }

      ensureStripeBuyButtonScript()
        .then(() => {
          const stripeButton = document.createElement('stripe-buy-button');
          stripeButton.setAttribute('buy-button-id', buyButtonId);
          stripeButton.setAttribute('publishable-key', publishableKey);
          modalState.body.replaceChildren(stripeButton);
          modalState.dialog.focus();
        })
        .catch(() => {
          const message = document.createElement('p');
          message.className = 'checkout-message';
          message.textContent = 'Checkout is temporarily unavailable.';
          modalState.body.replaceChildren(message);
          modalState.dialog.focus();
        });
    };

    return () => {
      if (modalState) return { openModal, closeModal, ...modalState };

      const backdrop = document.createElement('div');
      backdrop.className = 'checkout-backdrop';
      backdrop.hidden = true;

      const dialog = document.createElement('div');
      dialog.className = 'checkout-modal';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'checkout-title');
      dialog.tabIndex = -1;

      const header = document.createElement('div');
      header.className = 'checkout-header';

      const title = document.createElement('h2');
      title.className = 'checkout-title';
      title.id = 'checkout-title';
      title.textContent = 'Buy Now';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'checkout-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Close checkout');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', closeModal);

      header.append(title, closeBtn);

      const body = document.createElement('div');
      body.className = 'checkout-body';

      dialog.append(header, body);
      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeModal();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!modalState?.backdrop || modalState.backdrop.hidden) return;
        closeModal();
      });

      modalState = { backdrop, dialog, title, body, previousFocus: null };
      return { openModal, closeModal, ...modalState };
    };
  })();

  // Video Trailer Tabs
  const trailerTabs = document.querySelectorAll('.trailer-tab');
  const videoCards = document.querySelectorAll('.video-card');

  trailerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      trailerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      videoCards.forEach(card => {
        card.classList.toggle('active', card.id === targetId);
      });
    });
  });

  // Book Carousel Logic
  const bookPanels = document.querySelectorAll('.book-panel');
  const buyNowBtn = document.getElementById('buy-now');
  const buyAmazonBtn = document.getElementById('buy-amazon');

  const checkout = ensureCheckoutModal();

  const getActiveCarouselBookId = () => {
    const activePanel = document.querySelector('.book-panel.active');
    return activePanel?.getAttribute('data-book') ?? null;
  };

  const updateCarouselButtons = (bookId) => {
    const book = getBookById(bookId);
    if (!book) return;

    if (buyNowBtn) {
      buyNowBtn.href = '#';
      buyNowBtn.setAttribute('data-buy-now', '');
      buyNowBtn.setAttribute('data-book-id', bookId);
      buyNowBtn.textContent = 'Buy Now';
    }

    if (buyAmazonBtn) {
      buyAmazonBtn.href = book.amazonUrl;
      buyAmazonBtn.target = '_blank';
      buyAmazonBtn.rel = 'noopener noreferrer';
      buyAmazonBtn.textContent = 'Buy on Amazon';
    }
  };

  bookPanels.forEach(panel => {
    panel.addEventListener('click', () => {
      const bookId = panel.getAttribute('data-book');

      // Update active panel
      bookPanels.forEach(p => p.classList.remove('active'));
      panel.classList.add('active');

      updateCarouselButtons(bookId);
    });
  });

  if (buyNowBtn || buyAmazonBtn) {
    updateCarouselButtons(getActiveCarouselBookId() ?? 'yul-younger');
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-buy-now], #buy-now');
    if (!trigger) return;

    event.preventDefault();

    const bookId = trigger.getAttribute('data-book-id') ?? getActiveCarouselBookId();
    checkout.openModal(bookId);
  });
});
