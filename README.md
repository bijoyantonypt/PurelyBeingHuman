# PurelyBeingHuman

This project is now a static website designed to be hosted directly on GitHub Pages.

## What changed

- Converted the app from a Next.js project into a static HTML/CSS/JS landing page.
- Kept the original brand content and bookstore layout.
- Removed the requirement for a Node build step for deployment.
- Added static hosting instructions for GitHub Pages.

## Project structure

```text
PurelyBeingHuman/
├── index.html
├── styles.css
├── script.js
├── .nojekyll
├── package.json
├── README.md
├── app/                # legacy Next.js files, no longer used by the static site
├── components/         # legacy component files, no longer used by the static site
├── netlify.toml        # left for compatibility; not required for GitHub Pages
├── .gitignore
└── ...
```

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, open the repository settings.
3. Go to Pages.
4. Select the branch to publish (for example `main`).
5. Set the folder to `/root` and save.
6. GitHub will publish the site at:

```text
https://<your-username>.github.io/PurelyBeingHuman/
```

## Notes

- GitHub Pages serves the root folder directly, so the site works without a build output folder.
- The project includes a `.nojekyll` file to avoid Jekyll processing on GitHub Pages.
- If you want a custom domain later, add it through GitHub Pages settings and create a CNAME record in your DNS.

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
