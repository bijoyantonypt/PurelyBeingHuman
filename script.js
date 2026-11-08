document.addEventListener('DOMContentLoaded', async () => {
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    const setTheme = (theme) => {
      const isDark = theme === 'dark';
      const nextMode = isDark ? 'light' : 'dark';
      const label = `Switch to ${nextMode} mode`;

      document.documentElement.dataset.theme = theme;
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.title = label;

      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) {
        themeColor.setAttribute('content', isDark ? '#0b1528' : '#f4f1e8');
      }

      try {
        localStorage.setItem('purelybeinghuman-theme', theme);
      } catch {}
    };

    const initialTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    document.querySelectorAll('.section-block, .closing-panel').forEach((section) => {
      section.classList.add('reveal-on-scroll');
      revealObserver.observe(section);
    });
  }

  const fallbackData = window.siteData || {
    books: [],
    upcomingBooks: [],
    mediumArticles: []
  };

  let feedData = { articles: [] };

  try {
    const response = await fetch('medium-feed.json', { cache: 'no-store' });
    if (response.ok) {
      feedData = await response.json();
    }
  } catch (error) {
    console.warn('Could not load Medium feed JSON:', error);
  }

  const data = {
    ...fallbackData,
    mediumArticles: ((Array.isArray(feedData.articles) && feedData.articles.length > 0)
      ? feedData.articles
      : (fallbackData.mediumArticles || [])).map((article) => ({
      title: article.title,
      url: article.url,
      readTime: article.readTime || 'Fresh article',
      image: article.image || ''
    }))
  };

  const bookAnchor = (title) =>
    `book-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  const renderBooks = () => {
    const bookGrid = document.getElementById('bookGrid');
    if (!bookGrid || !data.books) return;

    bookGrid.innerHTML = data.books
      .map(
        (book) => `
          <article id="${bookAnchor(book.title)}" class="book-card accent-${book.accent}">
            <div class="book-cover">
              <img class="book-cover-image" src="${book.image || ''}" alt="${book.title}" loading="lazy" />
            </div>
            <div class="book-content">
              <p class="book-price">${book.price || 'Available now'}</p>
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
          <article id="${bookAnchor(book.title)}" class="upcoming-card${book.image ? ' upcoming-card-with-cover' : ''}">
            ${book.image ? `<img class="upcoming-cover" src="${book.image}" alt="${book.title}: ${book.subtitle || 'book cover'}" loading="lazy" />` : ''}
            <div class="upcoming-content">
              <span class="badge">${book.status}</span>
              <h3>${book.title}</h3>
              ${book.subtitle ? `<p class="upcoming-subtitle">${book.subtitle}</p>` : ''}
              <p>${book.description}</p>
              ${book.availability?.length ? `<div class="store-tags">${book.availability.map((store) => `<a href="${store.url}" target="_blank" rel="noreferrer">${store.name}</a>`).join('')}</div>` : ''}
            </div>
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
    if (!data.mediumArticles) return;

    if (articleGrid) {
      articleGrid.innerHTML = data.mediumArticles
        .map(
          (article) => `
            <a class="article-card" href="${article.url}" target="_blank" rel="noreferrer">
              ${article.image ? `<img class="article-thumb" src="${article.image}" alt="${article.title}" loading="lazy" />` : ''}
              <div class="article-body">
                <span class="article-meta">${article.readTime}</span>
                <h3>${article.title}</h3>
                <span class="article-link">Read on Medium →</span>
              </div>
            </a>
          `
        )
        .join('');
    }

    const archiveContainer = document.getElementById('archiveArticles');
    if (archiveContainer) {
      const articleCount = document.getElementById('articleCount');
      if (articleCount) {
        articleCount.textContent = `(${data.mediumArticles.length})`;
      }

      archiveContainer.innerHTML = data.mediumArticles
        .map(
          (article) => `
            <a class="article-card" href="${article.url}" target="_blank" rel="noreferrer">
              ${article.image ? `<img class="article-thumb" src="${article.image}" alt="${article.title}" loading="lazy" />` : ''}
              <div class="article-body">
                <span class="article-meta">${article.readTime}</span>
                <h3>${article.title}</h3>
                <span class="article-link">Read on Medium →</span>
              </div>
            </a>
          `
        )
        .join('');
    }
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
