import fs from 'fs';
import path from 'path';

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

function toAbsoluteUrl(value) {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return new URL(value, publicationUrl).toString();
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

function extractArchiveArticleUrls(htmlText) {
  const uniqueUrls = new Set();
  const patterns = [
    /https?:\/\/medium\.com\/purely-being-human\/[^"'?#\s]+/gi,
    /\/purely-being-human\/[^"'?#\s]+/gi,
  ];

  for (const pattern of patterns) {
    for (const match of htmlText.matchAll(pattern)) {
      const raw = match[0];
      const clean = raw.startsWith('http') ? raw : `https://medium.com${raw}`;
      const finalUrl = clean.split('?')[0].split('#')[0].replace(/\/$/, '');
      if (!finalUrl.includes('/purely-being-human/') || finalUrl === publicationUrl) {
        continue;
      }
      uniqueUrls.add(finalUrl);
    }
  }

  return [...uniqueUrls];
}

async function fetchArchivePage() {
  const response = await fetch(archiveUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Medium archive page: ${response.status} ${response.statusText}`);
  }

  return await response.text();
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
  const archiveHtml = await fetchArchivePage();
  const archiveUrls = extractArchiveArticleUrls(archiveHtml);

  const articles = [];

  for (const articleUrl of archiveUrls) {
    const metadata = await fetchArticleMetadata(articleUrl);
    if (!metadata.title || !metadata.url) {
      continue;
    }

    const publishedAt = metadata.publishedAt ? new Date(metadata.publishedAt) : null;
    if (publishedAt && publishedAt < earliestAllowedDate) {
      continue;
    }

    articles.push({
      title: metadata.title,
      url: metadata.url,
      publishedAt: metadata.publishedAt || null,
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
