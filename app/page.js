const publishedBooks = [
  {
    title: 'The Courage to Be Real',
    subtitle: 'Self-acceptance and human truth',
    description:
      'A compassionate guide to reclaiming identity, inner honesty, and the confidence to live without masks.',
    price: '₹299',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'rose',
  },
  {
    title: 'Living Beyond Labels',
    subtitle: 'Freedom over identity',
    description:
      'A reflection on how labels, expectations, and fear shape our choices—and how to move beyond them.',
    price: '₹349',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'amber',
  },
  {
    title: 'The Human Reset',
    subtitle: 'The art of healing and renewal',
    description:
      'A deeply personal framework for emotional clarity, recovery, and starting again with awareness.',
    price: '₹279',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'green',
  },
  {
    title: 'Quiet Strength',
    subtitle: 'Inner resilience in everyday life',
    description:
      'Practical and thoughtful stories exploring calm leadership, emotional endurance, and personal growth.',
    price: '₹329',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'indigo',
  },
  {
    title: 'Purpose in the Ordinary',
    subtitle: 'Meaning in daily living',
    description:
      'An invitation to discover significance in small routines, quiet decisions, and everyday human moments.',
    price: '₹289',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'violet',
  },
  {
    title: 'Beyond Survival',
    subtitle: 'Thriving with intention',
    description:
      'A practical exploration of meaningful living, emotional wellbeing, and conscious human flourishing.',
    price: '₹399',
    availability: ['Amazon', 'Flipkart', 'NotionPress'],
    accent: 'cyan',
  },
];

const upcomingBooks = [
  {
    title: 'The Belonging Blueprint',
    status: 'Launching soon',
    description: 'A reflective guide to building secure, meaningful connection in modern life.',
  },
  {
    title: 'Unlearning Fear',
    status: 'Pre-order open',
    description: 'A personal journey into fear, courage, and the freedom of beginning again.',
  },
  {
    title: 'Rooted in Wonder',
    status: 'Coming next',
    description: 'A contemplative look at curiosity, awe, and deepening presence in a noisy world.',
  },
  {
    title: 'The Beauty of Becoming',
    status: 'Announcing soon',
    description: 'A collection of essays on transformation, patience, and becoming more human.',
  },
];

const offers = [
  {
    code: 'PBH10',
    title: '10% Off',
    details: 'Applicable on all published titles across Amazon, Flipkart and NotionPress.',
  },
  {
    code: 'HUMANBUNDLE',
    title: 'Bundle Deal',
    details: 'Get 2 books together and save 15% with a combined purchase offer.',
  },
  {
    code: 'READANDRISE',
    title: 'Reader Special',
    details: 'Use this code for a limited-time discount and free shipping on selected stores.',
  },
  {
    code: 'NEWAUTHOR20',
    title: 'New Release Offer',
    details: 'Special launch discount for brand-new readers discovering PurelyBeingHuman.',
  },
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
          <div className="brand-mark">PBH</div>
          <div>
            <p className="brand-name">PurelyBeingHuman</p>
            <span className="brand-tag">Books • Ideas • Growth</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#books">Books</a>
          <a href="#upcoming">Upcoming</a>
          <a href="#offers">Offers</a>
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
              <a className="secondary-button" href="#offers">View offers</a>
            </div>
            <ul className="stats-row" aria-label="Brand statistics">
              <li>
                <strong>06</strong>
                <span>Published books</span>
              </li>
              <li>
                <strong>04</strong>
                <span>Upcoming titles</span>
              </li>
              <li>
                <strong>03</strong>
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
              <div className="panel-card">
                <span>Coupon codes</span>
                <strong>PBH10 • HUMANBUNDLE</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="books" className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Published works</p>
            <h2>Six books already in the world</h2>
          </div>

          <div className="book-grid">
            {publishedBooks.map((book) => (
              <article key={book.title} className={`book-card accent-${book.accent}`}>
                <div className="book-cover">
                  <span>{book.title.split(' ')[0]}</span>
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

        <section id="offers" className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Special offers</p>
            <h2>Coupon codes and reader-exclusive deals</h2>
          </div>

          <div className="offer-grid">
            {offers.map((offer) => (
              <article key={offer.code} className="offer-card">
                <div className="offer-code">{offer.code}</div>
                <h3>{offer.title}</h3>
                <p>{offer.details}</p>
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
          <a href="#offers">Offers</a>
          <a href="#articles">Articles</a>
        </div>
      </footer>
    </div>
  );
}
