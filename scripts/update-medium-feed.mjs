import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const publicationUrl = 'https://medium.com/purely-being-human';
const archiveUrl = 'https://medium.com/purely-being-human/all';
const outputFile = 'medium-feed.json';
const earliestAllowedDate = new Date('2026-04-23T00:00:00.000Z');

function normalizeText(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMediumUrl(value) {
  if (!value) return '';
  const clean = String(value).split('?')[0].split('#')[0].replace(/\/$/, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return `https://medium.com${clean}`;
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed < earliestAllowedDate) return null;
  return parsed.toISOString();
}

async function fetchAllPosts(page) {
  const collectLinks = async () => {
    return await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/purely-being-human/"]'));
      const blockedPathPieces = ['/all', '/latest', '/archive', '/followers', '/@', '/about', '/tags'];
      const seen = new Set();
      const links = [];

      for (const anchor of anchors) {
        const href = anchor.getAttribute('href') || '';
        if (!href) continue;

        const absolute = href.startsWith('http') ? href : `https://medium.com${href}`;
        const clean = absolute.split('?')[0].split('#')[0].replace(/\/$/, '');

        if (!clean.includes('/purely-being-human/')) continue;
        if (blockedPathPieces.some((piece) => clean.includes(piece))) continue;

        if (!seen.has(clean)) {
          seen.add(clean);
          links.push(clean);
        }
      }

      return links;
    });
  };

  let previousCount = 0;
  let stableRounds = 0;

  for (let i = 0; i < 35 && stableRounds < 4; i += 1) {
    const current = await collectLinks();
    if (current.length === previousCount) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
      previousCount = current.length;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
  }

  const finalLinks = await collectLinks();
  if (finalLinks.length === 0) {
    throw new Error('No publication article links found on Medium archive page');
  }

  return finalLinks;
}

async function fetchArticleMeta(page, url) {
  return await page.evaluate(async (articleUrl) => {
    const response = await fetch(articleUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return { title: '', summary: '', image: '', publishedAt: '' };
    }

    const htmlText = await response.text();
    const readMeta = (name) => {
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
    };

    return {
      title: readMeta('og:title') || htmlText.match(/<title>(.*?)<\/title>/is)?.[1] || '',
      summary: readMeta('og:description') || '',
      image: readMeta('og:image') || '',
      publishedAt:
        readMeta('article:published_time') ||
        htmlText.match(/<time[^>]+datetime="([^"]+)"/is)?.[1] ||
        '',
    };
  }, url);
}

async function buildArticles() {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });

    await page.goto(archiveUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(2500);

    const articleUrls = await fetchAllPosts(page);
    const uniqueRows = Array.from(
      new Map(
        articleUrls
          .map((url) => normalizeMediumUrl(url || ''))
          .filter(Boolean)
          .map((url) => [url, { url }])
      ).values()
    );

    const articles = [];
    for (const row of uniqueRows) {
      let meta = { summary: '', image: '' };
      try {
        meta = await fetchArticleMeta(page, row.url);
      } catch {
        meta = { title: '', summary: '', image: '', publishedAt: '' };
      }

      const publishedAt = parseDate(meta.publishedAt || '');
      if (!publishedAt) {
        continue;
      }

      articles.push({
        title: normalizeText(meta.title || row.url.split('/').at(-1) || 'Medium article'),
        url: row.url,
        publishedAt,
        summary: normalizeText(meta.summary || ''),
        image: meta.image || '',
      });
    }

    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } finally {
    await browser.close();
  }
}

try {
  const articles = await buildArticles();
  const payload = {
    publicationUrl,
    fetchedAt: new Date().toISOString(),
    articles,
  };

  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Saved ${articles.length} articles to ${outputFile}`);
} catch (error) {
  console.error('Unable to fetch Medium publication data:', error.message);
  process.exit(1);
}
