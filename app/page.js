const publishedBooks = [
  {
    title: 'Empathy Revolution',
    subtitle: 'Why The World Needs Compassion More Than Ever',
    image: 'Book_Images/Empathy.png',
    description:
      'A book exploring empathy as a lived practice and a practical response to the fractures of modern life.',
    price: '₹299',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'rose',
  },
  {
    title: 'Accountability',
    subtitle: 'The Heart of Leadership and Justice',
    image: 'Book_Images/Accountability.png',
    description:
      'A reflection on personal responsibility, leadership, and the courage to do what is right.',
    price: '₹349',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'amber',
  },
  {
    title: 'Anger',
    subtitle: 'Understanding the fire within',
    image: 'Book_Images/Anger.png',
    description:
      'A close look at anger as signal, pressure, and possibility for honest self-understanding.',
    price: '₹279',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'green',
  },
  {
    title: 'Hatred',
    subtitle: 'The Cancer that Destroys Mankind',
    image: 'Book_Images/Hatred.png',
    description:
      'An examination of how hatred forms, spreads, and corrodes the human spirit and society.',
    price: '₹329',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'indigo',
  },
  {
    title: 'Redefining Neutrality',
    subtitle: 'The space between sides',
    image: 'Book_Images/Neutrality.png',
    description:
      'A reconsideration of neutrality as an active choice that may either uphold justice or enable harm.',
    price: '₹289',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'violet',
  },
];

const upcomingBooks = [
 {
    title: 'From Reaction to Response: Mastering the Pause',
    status: 'Launching soon',
    description: 'A practical guide discovering the power of pausing before reacting and learn how a moment of awareness can transform your responses, relationships and life.'
  },
  {
    title: 'The Mirror Within',
    status: 'Coming next',
    description: 'An inward journey of self-reflection that encourages us to look within, understand ourselves honestly and consciously shape the life we want.'
  },
  {
    title: 'The Invisible Thread',
    status: 'Coming next',
    description: 'Exploring how empathy, trust, communication and understanding can influence others positively without controlling or manipulating them.'
  },
  {
    title: 'Micro shifts Macro Impact: Awakening of A Common Man',
    status: 'Coming next',
    description: 'Compelling reflections on how small changes in everyday thinking and action can awaken individual responsibility and create meaningful change in society.'
  },
  {
    title: 'Privacy and Human Dignity controlled by Government Corporations',
    status: 'Coming next',
    description: 'A critical exploration of how technology and corporate power are reshaping privacy, personal freedom and the fundamental dignity of the individual.'
  }
];

const mediumArticles = [
  {
    title: 'Why authentic living feels harder than it should',
    url: 'https://medium.com/purelybeinghuman',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'The invisible pressure of being “always enough”',
    url: 'https://medium.com/purelybeinghuman',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'How quiet habits shape a deeper human life',
    url: 'https://medium.com/purelybeinghuman',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'What healing really looks like in everyday routines',
    url: 'https://medium.com/purelybeinghuman',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
];

const storeLinks = {
  Amazon: 'https://www.amazon.in/',
  Flipkart: 'https://www.flipkart.com/',
  NotionPress: 'https://www.notionpress.com/',
};

export default function HomePage() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <img className="brand-mark brand-logo" src="Book_Images/PurelyBeingHuman%20Profile.jpg" alt="PurelyBeingHuman profile" />
          <div>
            <p className="brand-name">PurelyBeingHuman</p>
            <span className="brand-tag">Practical wisdom for living a more conscious and meaningful life</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#books">Books</a>
          <a href="#upcoming">Upcoming</a>
          <a href="#articles">Medium</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A human-first publishing brand</p>
            <h1>Books that help people live more honestly, deeply, and fully.</h1>
            <p className="lede">
              PurelyBeingHuman brings together reflective writing, meaningful growth, and practical wisdom for readers looking to live with more self-awareness and purpose.
            </p>
            <div className="cta-row">
              <a className="primary-button" href="#books">Explore the collection</a>
              <a className="secondary-button" href="#articles">View articles</a>
            </div>
            <ul className="stats-row" aria-label="Brand statistics">
              <li>
                <strong>5</strong>
                <span>Published books</span>
              </li>
              <li>
                <strong>5</strong>
                <span>Upcoming titles</span>
              </li>
              <li>
                <strong>3</strong>
                <span>Store partners</span>
              </li>
            </ul>
          </div>

          <div className="hero-panel" aria-label="Featured brand highlights">
            <div className="panel-card featured-book">
              <span className="panel-pill">Featured</span>
              <h2>The Courage to Be Real</h2>
              <p>
                A reader favourite centred on healing, authenticity, and becoming more aligned with your truest self.
              </p>
            </div>
            <div className="mini-grid">
              <div className="panel-card">
                <span>Available on</span>
                <strong>Amazon • Flipkart • NotionPress</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="books" className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Published works</p>
            <h2>Five books already in the world</h2>
          </div>

          <div className="book-grid">
            {publishedBooks.map((book) => (
              <article key={book.title} className={`book-card accent-${book.accent}`}>
                <div className="book-cover">
                  <img className="book-cover-image" src={book.image} alt={book.title} loading="lazy" />
                </div>
                <div className="book-content">
                  <p className="book-price">{book.price}</p>
                  <h3>{book.title}</h3>
                  <p className="book-subtitle">{book.subtitle}</p>
                  <p>{book.description}</p>
                  <div className="store-tags">
                    {book.availability.map((store) => (
                      <a key={store} href={storeLinks[store]} target="_blank" rel="noreferrer">
                        {store}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="upcoming" className="section-block alt-block">
          <div className="section-heading">
            <p className="eyebrow">Next in line</p>
            <h2>Upcoming titles from PurelyBeingHuman</h2>
          </div>

          <div className="upcoming-grid">
            {upcomingBooks.map((book) => (
              <article key={book.title} className="upcoming-card">
                <span className="badge">{book.status}</span>
                <h3>{book.title}</h3>
                <p>{book.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="articles" className="section-block alt-block">
          <div className="section-heading">
            <p className="eyebrow">Latest from Medium</p>
            <h2>Fresh perspectives from the PurelyBeingHuman publication</h2>
          </div>

          <div className="article-grid">
            {mediumArticles.map((article) => (
              <a key={article.title} className="article-card" href={article.url} target="_blank" rel="noreferrer">
                {article.image ? <img className="article-thumb" src={article.image} alt={article.title} loading="lazy" /> : null}
                <div className="article-body">
                  <span className="article-meta">{article.readTime}</span>
                  <h3>{article.title}</h3>
                  <span className="article-link">Read on Medium →</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <p className="brand-name">PurelyBeingHuman</p>
          <p>Writing for a more conscious, compassionate, and authentic life.</p>
        </div>
        <div className="footer-links">
          <a href="#books">Books</a>
          <a href="#articles">Articles</a>
        </div>
      </footer>
    </div>
  );
}
