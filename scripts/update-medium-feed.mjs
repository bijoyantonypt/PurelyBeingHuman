import fs from 'fs';
import path from 'path';

const mediumPublicationUrl = 'https://medium.com/purely-being-human';
const rssUrl = 'https://medium.com/feed/purely-being-human';
const outputPath = path.join(process.cwd(), 'medium-feed.json');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function extractTagContent(item, tagName) {
  const patterns = [
    new RegExp(`<${tagName}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tagName}>`, 's'),
    new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`, 's'),
  ];

  for (const pattern of patterns) {
    const match = item.match(pattern);
    if (match && match[1]) {
      return normalizeText(match[1]);
    }
  }

  return '';
}

function extractImageUrl(item) {
  const contentEncoded = item.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/is)?.[1] || '';
  const sources = [contentEncoded, item].filter(Boolean);

  const patterns = [
    /<media:content[^>]*url="([^"]+)"/is,
    /<media:thumbnail[^>]*url="([^"]+)"/is,
    /<image>(.*?)<\/image>/is,
    /<img[^>]+src="([^"]+)"/is,
    /https?:\/\/[^\s"'<>]+(?:\.(?:jpg|jpeg|png|webp|gif|avif))(?:\?[^\s"'<>]+)?/is,
  ];

  for (const source of sources) {
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match) {
        const value = match[1] || match[0];
        if (typeof value === 'string' && value.startsWith('http')) {
          return value;
        }
        const cleaned = String(value || '').replace(/.*?https?:\/\//i, 'https://');
        if (cleaned.startsWith('http')) {
          return cleaned;
        }
      }
    }
  }

  return '';
}

function parseXmlArticles(xmlText) {
  const itemMatches = [...xmlText.matchAll(/<item>(.*?)<\/item>/gs)];

  return itemMatches
    .map((match) => {
      const item = match[1];
      const title = extractTagContent(item, 'title');
      const link = extractTagContent(item, 'link');
      const pubDate = extractTagContent(item, 'pubDate');
      const description = extractTagContent(item, 'description');
      const image = extractImageUrl(item);

      if (!title || !link) return null;

      return {
        title,
        url: link,
        publishedAt: pubDate || null,
        summary: description || '',
        image: image || '',
      };
    })
    .filter(Boolean);
}

function extractMetaImage(htmlText) {
  const patterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/is,
    /<meta[^>]*content="([^"]+)"[^>]*property="og:image"/is,
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/is,
    /<meta[^>]*content="([^"]+)"[^>]*name="twitter:image"/is,
    /<img[^>]+src="([^"]+)"/is,
  ];

  for (const pattern of patterns) {
    const match = htmlText.match(pattern);
    if (match && match[1] && String(match[1]).startsWith('http')) {
      return String(match[1]);
    }
  }

  return '';
}

async function enrichArticlesWithMissingImages(articles) {
  const enriched = [];

  for (const article of articles) {
    if (article.image) {
      enriched.push(article);
      continue;
    }

    try {
      const response = await fetch(article.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        enriched.push(article);
        continue;
      }

      const htmlText = await response.text();
      const image = extractMetaImage(htmlText);
      enriched.push({
        ...article,
        image: image || article.image || '',
      });
    } catch {
      enriched.push(article);
    }
  }

  return enriched;
}

async function fetchXml() {
  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Medium RSS: ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

try {
  const xmlText = await fetchXml();
  const parsedArticles = parseXmlArticles(xmlText);
  const articles = await enrichArticlesWithMissingImages(parsedArticles);

  const payload = {
    publicationUrl: mediumPublicationUrl,
    fetchedAt: new Date().toISOString(),
    articles,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Saved ${articles.length} articles to ${outputPath}`);
} catch (error) {
  console.error('Unable to fetch Medium publication data:', error.message);
  process.exit(1);
}
