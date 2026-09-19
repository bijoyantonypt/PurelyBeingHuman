import fs from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';

const publicationUrl = 'https://medium.com/purely-being-human';
const feedUrl = 'https://medium.com/feed/purely-being-human';
const outputFile = 'medium-feed.json';
const earliestAllowedDate = new Date('2026-04-23T00:00:00.000Z');

function normalizeText(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed < earliestAllowedDate) return null;
  return parsed.toISOString();
}

function extractImageFromItem(item) {
  const mediaContent = item?.['media:content'];
  if (mediaContent?.['@_url']) {
    return mediaContent['@_url'];
  }

  const mediaThumbnail = item?.['media:thumbnail'];
  if (mediaThumbnail?.['@_url']) {
    return mediaThumbnail['@_url'];
  }

  const html = String(item?.['content:encoded'] || item?.description || '');
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || '';
}

try {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml',
      'User-Agent': 'PurelyBeingHuman feed updater',
    },
  });

  if (!response.ok) {
    throw new Error(`Medium RSS request failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  const articles = items
    .map((item) => {
      const publishedAt = parseDate(item?.pubDate || '');
      if (!publishedAt) return null;

      return {
        title: normalizeText(item?.title || ''),
        url: String(item?.link || '').trim(),
        publishedAt,
        summary: normalizeText(item?.description || ''),
        image: extractImageFromItem(item),
      };
    })
    .filter((article) => article && article.url)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
