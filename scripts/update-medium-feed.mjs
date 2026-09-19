import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const publicationUrl = 'https://medium.com/purely-being-human';
const archiveUrl = 'https://medium.com/purely-being-human/all';
const rssUrl = 'https://medium.com/feed/purely-being-human';
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

function extractTagContent(item, tagName) {
  const patterns = [
    new RegExp(`<${tagName}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tagName}>`, 'is'),
    new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`, 'is'),
  ];

  for (const pattern of patterns) {
    const match = item.match(pattern);
    if (match && match[1]) {
      return normalizeText(match[1]);
    }
  }

  return '';
}

function extractImageFromXmlItem(item) {
  const patterns = [
    /<media:content[^>]*url="([^"]+)"/is,
    /<media:thumbnail[^>]*url="([^"]+)"/is,
    /<img[^>]+src="([^"]+)"/is,
    /https?:\/\/[^\s"'<>]+(?:\.(?:jpg|jpeg|png|webp|gif|avif))(?:\?[^\s"'<>]+)?/is,
  ];

  const contentEncoded = item.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/is)?.[1] || '';
  const sources = [contentEncoded, item].filter(Boolean);

  for (const source of sources) {
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (!match) continue;
      const value = match[1] || match[0] || '';
      if (String(value).startsWith('http')) return String(value);
    }
  }

  return '';
}

function dedupeAndSort(articles) {
  return Array.from(new Map(articles.map((article) => [article.url, article])).values())
    .filter((article) => article.url && article.publishedAt)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

async function readExistingFeed() {
  try {
    const raw = await fs.readFile(outputFile, 'utf8');
    const parsed = JSON.parse(raw);
    const articles = Array.isArray(parsed.articles) ? parsed.articles : [];

    return dedupeAndSort(
      articles
        .map((article) => {
          const publishedAt = parseDate(article.publishedAt || '');
          if (!publishedAt) return null;

          return {
            title: normalizeText(article.title || 'Medium article'),
            url: normalizeMediumUrl(article.url || ''),
            publishedAt,
            summary: normalizeText(article.summary || ''),
            image: article.image || '',
          };
        })
        .filter(Boolean)
    );
  } catch {
    return [];
  }
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

async function fetchRssArticles() {
  const response = await fetch(rssUrl, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const itemMatches = [...xml.matchAll(/<item>(.*?)<\/item>/gs)];

  const articles = itemMatches
    .map((match) => {
      const item = match[1];
      const publishedAt = parseDate(extractTagContent(item, 'pubDate'));
      if (!publishedAt) return null;

      return {
        title: normalizeText(extractTagContent(item, 'title') || 'Medium article'),
        url: normalizeMediumUrl(extractTagContent(item, 'link')),
        publishedAt,
        summary: normalizeText(extractTagContent(item, 'description') || ''),
        image: extractImageFromXmlItem(item),
      };
    })
    .filter(Boolean);

  return dedupeAndSort(articles);
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
  const existingArticles = await readExistingFeed();
  let archiveArticles = [];
  let rssArticles = [];

  try {
    archiveArticles = await buildArticles();
    console.log(`Archive source returned ${archiveArticles.length} articles.`);
  } catch (error) {
    console.warn(`Archive source failed: ${error.message}`);
  }

  try {
    rssArticles = await fetchRssArticles();
    console.log(`RSS source returned ${rssArticles.length} articles.`);
  } catch (error) {
    console.warn(`RSS source failed: ${error.message}`);
  }

  let articles = [];
  if (archiveArticles.length > 0) {
    articles = dedupeAndSort([...existingArticles, ...rssArticles, ...archiveArticles]);
  } else if (rssArticles.length > 0) {
    articles = dedupeAndSort([...existingArticles, ...rssArticles]);
  } else {
    articles = existingArticles;
  }

  if (articles.length === 0) {
    throw new Error('No article data available from archive, RSS, or existing feed');
  }

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
