# PurelyBeingHuman - Author Website

A modern, SEO-optimized author website built with **Next.js 14**, **React**, and **Tailwind CSS**. Static site with full accessibility and performance optimization.

## 🚀 Features

### Website Pages
- **Home (/)** - Hero section, tagline, primary CTA, testimonial carousel
- **About (/about)** - Author bio, professional photo, video embed, Medium link
- **Books (/books)** - Grid showcasing 5 published books with cover images
- **Book Details (/books/<slug>)** - Individual SEO landing pages for each book
  - Dynamic meta tags, Open Graph, Book schema JSON-LD
  - Book details: ISBN, price, rating, quotes, excerpts
  - Email-gated PDF downloads
  - Buy buttons (Amazon, Flipkart, NotionPress with UTM tracking)
- **Resources (/resources)** - Free downloadable PDFs gated by email
- **Blog (/blog)** - MDX-powered blog with social share buttons
- **Offers (/offers)** - Current discounts with Offer schema markup
- **Contact (/contact)** - Netlify Forms with name/email/message, reCAPTCHA
- **404** - Friendly error page with navigation

### Technical Features
✨ **SEO & Performance**
- Server-side rendering with static export
- Comprehensive meta tags (Open Graph, Twitter Card, Canonical URLs)
- JSON-LD schema markup (Book, Offer, Article)
- Google Analytics 4 & Search Console integration
- Image optimization with next/image (WebP with fallbacks)
- Mobile-first responsive design
- Core Web Vitals optimized: LCP < 2.5s, CLS < 0.1, FID < 100ms

🔐 **User Experience**
- Global newsletter signup (Mailchimp free tier)
- Email-gated resources
- Social media integration (Twitter, LinkedIn, Instagram, Medium)
- Accessible navigation (skip-to-content, ARIA labels, WCAG AA)
- Smooth animations and transitions
- Dark mode ready

🛠️ **Developer Experience**
- TypeScript support
- MDX for blog posts
- Environment-based configuration
- SEO component for dynamic meta tags
- Reusable component library
- Netlify deployment ready

## 📁 Project Structure

```
PurelyBeingHuman/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── about/
│   │   └── page.tsx            # About page
│   ├── books/
│   │   ├── page.tsx            # Books grid
│   │   └── [slug]/
│   │       └── page.tsx        # Individual book page
│   ├── blog/
│   │   ├── page.tsx            # Blog index
│   │   └── [slug]/
│   │       └── page.tsx        # Blog post
│   ├── resources/
│   │   └── page.tsx            # Free resources
│   ├── offers/
│   │   └── page.tsx            # Special offers
│   ├── contact/
│   │   └── page.tsx            # Contact form
│   └── api/
│       ├── subscribe/          # Mailchimp subscription
│       ├── contact/            # Contact form handler
│       └── download-pdf/       # PDF download (email gated)
├── components/
│   ├── Header.tsx              # Navigation
│   ├── Footer.tsx              # Footer with social links
│   ├── SEO.tsx                 # SEO meta tags
│   ├── NewsletterForm.tsx      # Newsletter signup
│   └── [other components]
├── public/
│   ├── images/                 # Optimized images
│   ├── pdfs/                   # Downloadable resources
│   └── favicon.ico
├── posts/                      # MDX blog posts
│   └── *.mdx
├── lib/
│   ├── books.ts                # Book data & utilities
│   └── seo.ts                  # SEO utilities
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── tsconfig.json               # TypeScript config
├── package.json
├── .env.local.example          # Environment variables template
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Mailchimp account (free tier)
- Google Analytics account
- reCAPTCHA keys (Google)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bijoyantonypt/PurelyBeingHuman.git
   cd PurelyBeingHuman
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_MAILCHIMP_U=your_mailchimp_user_id
   NEXT_PUBLIC_MAILCHIMP_ID=your_mailchimp_form_id
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build and export static site
npm run build && npm run export

# Output will be in the `out/` folder
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect repository to Netlify**
   - Push to GitHub
   - Create new site from Git

2. **Set build settings**
   - Build command: `npm run build && npm run export`
   - Publish directory: `out`

3. **Configure environment variables**
   - In Netlify dashboard → Site settings → Build & deploy → Environment
   - Add all variables from `.env.local`

4. **Enable HTTPS**
   - Netlify provides automatic HTTPS for all sites

### Other Platforms
- **Vercel**: `npm run build` (automatic)
- **GitHub Pages**: Configure to serve from `out/` folder
- **Static hosting**: Deploy the `out/` folder directly

## 🔧 Configuration

### Mailchimp Integration
1. Sign up for [Mailchimp free account](https://mailchimp.com)
2. Create an audience and get User ID and Form ID
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_MAILCHIMP_U=user_id
   NEXT_PUBLIC_MAILCHIMP_ID=form_id
   ```

### Google Analytics
1. Create GA4 property at [Google Analytics](https://analytics.google.com)
2. Copy Measurement ID
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### reCAPTCHA
1. Register at [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Get Site Key and Secret Key
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=key
   RECAPTCHA_SECRET_KEY=secret
   ```

## 📝 Adding Content

### Books
Edit `lib/books.ts` to add/modify book data:
```typescript
export const books = [
  {
    id: 1,
    slug: 'book-title',
    title: 'Book Title',
    author: 'Author Name',
    isbn: '978-0-123456-78-9',
    price: 299,
    rating: 4.5,
    cover: '/images/book-cover.jpg',
    description: '...',
    quote: 'Inspiring quote...',
  },
  // ... more books
];
```

### Blog Posts
Create `.mdx` files in `posts/` directory:
```mdx
---
title: "Post Title"
date: "2024-01-01"
author: "Author Name"
description: "Short description"
---

# Your content here

Your markdown and JSX content...
```

## ♿ Accessibility

- ✓ Semantic HTML5 elements
- ✓ ARIA labels for interactive elements
- ✓ Skip-to-content link on every page
- ✓ Keyboard navigation support
- ✓ Color contrast compliance (WCAG AA)
- ✓ Alt text for all images
- ✓ Focus visible outlines

## 📊 Performance

Optimized for Core Web Vitals:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

Optimization techniques:
- Image optimization (next/image, WebP)
- Code splitting and lazy loading
- Static site generation
- CDN caching (Netlify)
- Minification and compression

## 🧪 Testing

```bash
# Run linting
npm run lint

# Test build
npm run build

# Test export
npm run export
```

## 📄 License

Free to use and modify for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Email: contact@purelybeinghuman.com
- Visit: [purelybeinghuman.com](https://purelybeinghuman.com)

## 🙏 Acknowledgments

Built with:
- [Next.js 14](https://nextjs.org)
- [React 18](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Netlify](https://netlify.com)
- [Mailchimp](https://mailchimp.com)

---

**Let's build an authentic digital presence together!** 🚀
