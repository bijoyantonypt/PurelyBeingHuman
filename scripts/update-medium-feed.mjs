import fs from 'fs';
import path from 'path';

const mediumPublicationUrl = 'https://medium.com/purely-being-human';
const rssUrl = 'https://medium.com/feed/purely-being-human';
const outputPath = path.join(process.cwd(), 'medium-feed.json');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseXmlArticles(xmlText) {
  const itemMatches = [...xmlText.matchAll(/<item>(.*?)<\/item>/gs)];

  return itemMatches
    .map((match) => {
      const item = match[1];
      const title = normalizeText((item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) || item.match(/<title>(.*?)<\/title>/s) || [null, ''])[1]);
      const link = normalizeText((item.match(/<link>(.*?)<\/link>/s) || [null, ''])[1]);
      const pubDate = normalizeText((item.match(/<pubDate>(.*?)<\/pubDate>/s) || [null, ''])[1]);
      const description = normalizeText((item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) || item.match(/<description>(.*?)<\/description>/s) || [null, ''])[1]);

      if (!title || !link) return null;

      return {
        title,
        url: link,
        publishedAt: pubDate || null,
        summary: description || '',
      };
    })
    .filter(Boolean)
    .slice(0, 6);
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
  const articles = parseXmlArticles(xmlText);

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
