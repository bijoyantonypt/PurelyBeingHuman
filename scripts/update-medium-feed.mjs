import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const publicationUrl = 'https://medium.com/purely-being-human';
const archiveUrl = 'https://medium.com/purely-being-human/all';
const outputPath = path.join(process.cwd(), 'medium-feed.json');
const earliestAllowedDate = new Date('2026-04-23T00:00:00.000Z');

function normalizeText(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaTag(htmlText, name) {
  const patterns = [
    new RegExp(`<meta[^>]+property="${name}"[^>]+content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${name}"`, 'i'),
    new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]+)"`, 'i'),
    new RegExp(`<meta[^>]+content="([^"]+)"[^>]+name="${name}"`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = htmlText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

function parsePublishedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeMediumUrl(url) {
  if (!url) return '';
  const clean = String(url).split('?')[0].split('#')[0].replace(/\/$/, '');
  if (clean.startsWith('http')) return clean;
  return `https://medium.com${clean}`;
}

async function extractArchiveLinksWithPlaywright() {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });

    await page.goto(archiveUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('a[href*="/purely-being-human/"]', { timeout: 120000 });

    // Scroll to load the publication feed completely before scraping links.
    for (let i = 0; i < 20; i += 1) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(700);
    }

    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/purely-being-human/"]'));
      const urls = [];
      const seen = new Set();

      for (const anchor of anchors) {
        const href = anchor.getAttribute('href') || '';
        if (!href || href.includes('/@') || href.includes('/followers')) {
          continue;
        }

        const url = href.startsWith('http') ? href : `https://medium.com${href}`;
        const clean = url.split('?')[0].split('#')[0].replace(/\/$/, '');
        if (!clean.includes('/purely-being-human/')) {
          continue;
        }
        if (!seen.has(clean)) {
          seen.add(clean);
          urls.push(clean);
        }
      }

      return urls;
    });

    return links;
  } finally {
    await browser.close();
  }
}

async function fetchArticleMetadata(articleUrl) {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return {
        title: articleUrl.split('/').filter(Boolean).at(-1) || 'Medium article',
        url: articleUrl,
        publishedAt: null,
        summary: '',
        image: '',
      };
    }

    const htmlText = await response.text();
    const title = normalizeText(
      extractMetaTag(htmlText, 'og:title') ||
        htmlText.match(/<title>(.*?)<\/title>/is)?.[1] ||
        ''
    );
    const image = extractMetaTag(htmlText, 'og:image') || '';
    const publishedAt = parsePublishedDate(
      extractMetaTag(htmlText, 'article:published_time') ||
        htmlText.match(/<time[^>]+datetime="([^"]+)"/is)?.[1] ||
        ''
    );

    return {
      title: title || 'Medium article',
      url: articleUrl,
      publishedAt,
      summary: normalizeText(extractMetaTag(htmlText, 'og:description') || ''),
      image,
    };
  } catch {
    return {
      title: articleUrl.split('/').filter(Boolean).at(-1) || 'Medium article',
      url: articleUrl,
      publishedAt: null,
      summary: '',
      image: '',
    };
  }
}

async function buildArticles() {
  const archiveUrls = await extractArchiveLinksWithPlaywright();

  const articles = [];

  for (const articleUrl of archiveUrls) {
    const metadata = await fetchArticleMetadata(articleUrl);
    if (!metadata.title || !metadata.url) {
      continue;
    }

    const sourcePublishedAt = metadata.publishedAt || null;
    const publishedAt = sourcePublishedAt ? new Date(sourcePublishedAt) : null;
    if (publishedAt && publishedAt < earliestAllowedDate) {
      continue;
    }

    articles.push({
      title: metadata.title || 'Medium article',
      url: metadata.url,
      publishedAt: sourcePublishedAt,
      summary: metadata.summary || '',
      image: metadata.image || '',
    });
  }

  const uniqueArticles = Array.from(
    new Map(articles.map((article) => [article.url, article])).values()
  ).sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });

  return uniqueArticles;
}

try {
  const articles = await buildArticles();

  const payload = {
    publicationUrl,
    fetchedAt: new Date().toISOString(),
    articles,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Saved ${articles.length} articles to ${outputPath}`);
} catch (error) {
  console.error('Unable to fetch Medium publication data:', error.message);
  process.exit(1);
}
