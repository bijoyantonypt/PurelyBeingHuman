document.addEventListener('DOMContentLoaded', () => {
  const data = window.siteData || {
    books: [],
    upcomingBooks: [],
    offers: [],
    mediumArticles: []
  };

  const renderBooks = () => {
    const bookGrid = document.getElementById('bookGrid');
    if (!bookGrid || !data.books) return;

    bookGrid.innerHTML = data.books
      .map(
        (book) => `
          <article class="book-card accent-${book.accent}">
            <div class="book-cover"><span>${book.title.split(' ')[0]}</span></div>
            <div class="book-content">
              <p class="book-price">${book.price}</p>
              <h3>${book.title}</h3>
              <p class="book-subtitle">${book.subtitle}</p>
              <p>${book.description}</p>
              <div class="store-tags">
                ${book.availability
                  .map(
                    (store) =>
                      `<a href="${store.url}" target="_blank" rel="noreferrer">${store.name}</a>`
                  )
                  .join('')}
              </div>
            </div>
          </article>
        `
      )
      .join('');
  };

  const renderUpcomingBooks = () => {
    const upcomingGrid = document.getElementById('upcomingGrid');
    if (!upcomingGrid || !data.upcomingBooks) return;

    upcomingGrid.innerHTML = data.upcomingBooks
      .map(
        (book) => `
          <article class="upcoming-card">
            <span class="badge">${book.status}</span>
            <h3>${book.title}</h3>
            <p>${book.description}</p>
          </article>
        `
      )
      .join('');
  };

  const renderOffers = () => {
    const offerGrid = document.getElementById('offerGrid');
    if (!offerGrid || !data.offers) return;

    offerGrid.innerHTML = data.offers
      .map(
        (offer) => `
          <article class="offer-card">
            <div class="offer-code">${offer.code}</div>
            <h3>${offer.title}</h3>
            <p>${offer.details}</p>
          </article>
        `
      )
      .join('');
  };

  const renderArticles = () => {
    const articleGrid = document.getElementById('articleGrid');
    if (!articleGrid || !data.mediumArticles) return;

    articleGrid.innerHTML = data.mediumArticles
      .map(
        (article) => `
          <a class="article-card" href="${article.url}" target="_blank" rel="noreferrer">
            <span class="article-meta">${article.readTime}</span>
            <h3>${article.title}</h3>
            <span class="article-link">Read on Medium →</span>
          </a>
        `
      )
      .join('');
  };

  const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  renderBooks();
  renderUpcomingBooks();
  renderOffers();
  renderArticles();
});
