import fs from 'fs';
import path from 'path';

const publicationUrl = 'https://medium.com/purely-being-human';
const rssUrl = 'https://medium.com/feed/purely-being-human';
const outputPath = path.join(process.cwd(), 'medium-feed.json');
const earliestAllowedDate = new Date('2026-04-23T00:00:00.000Z');

function normalizeText(value) {
  return decodeXmlEntities(String(value || ''))
    .replace(/&nbsp;/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRssTag(xmlText, tagName) {
  const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = xmlText.match(
    new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}\\s*>`, 'i')
  );
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (entity, codePoint) => String.fromCodePoint(Number(codePoint)))
    .replace(/&#x([0-9a-f]+);/gi, (entity, codePoint) => String.fromCodePoint(parseInt(codePoint, 16)));
}

function parsePublishedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function buildArticles() {
  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Medium RSS request failed with status ${response.status}`);
  }

  const rssText = await response.text();
  const rssItems = [...rssText.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  if (!rssText.includes('<rss') || rssItems.length === 0) {
    throw new Error('Medium RSS response did not contain any articles');
  }

  const articles = rssItems
    .map(([, item]) => {
      const content = extractRssTag(item, 'content:encoded') || extractRssTag(item, 'description');
      const imageTag = content.match(/<img\b[^>]*>/i)?.[0] || '';
      const image = imageTag.match(/\bsrc=["']([^"']+)["']/i)?.[1] || '';
      const firstParagraph = content.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';

      return {
        title: normalizeText(extractRssTag(item, 'title')),
        url: decodeXmlEntities(extractRssTag(item, 'link')),
        publishedAt: parsePublishedDate(decodeXmlEntities(extractRssTag(item, 'pubDate'))),
        summary: normalizeText(firstParagraph || content),
        image: decodeXmlEntities(image),
      };
    })
    .filter((article) => article.title && article.url)
    .filter((article) => {
      const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;
      return !publishedAt || publishedAt >= earliestAllowedDate;
    });

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
