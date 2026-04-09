document.addEventListener('DOMContentLoaded', () => {
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

  const bookData = {
    'yul-younger': {
      buyNow: '#buy-yul-younger',
      buyAmazon: 'https://amazon.com/yul-younger'
    },
    'bello-gallico': {
      buyNow: '#buy-bello-gallico',
      buyAmazon: 'https://amazon.com/bello-gallico'
    },
    'spanish-tragedy': {
      buyNow: '#buy-spanish-tragedy',
      buyAmazon: 'https://amazon.com/spanish-tragedy'
    }
  };

  bookPanels.forEach(panel => {
    panel.addEventListener('click', () => {
      const bookId = panel.getAttribute('data-book');

      // Update active panel
      bookPanels.forEach(p => p.classList.remove('active'));
      panel.classList.add('active');

      // Update button links
      if (bookData[bookId]) {
        buyNowBtn.href = bookData[bookId].buyNow;
        buyAmazonBtn.href = bookData[bookId].buyAmazon;
      }
    });
  });
});
