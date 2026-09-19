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
  const query = `query PublicationContentDataQuery($ref: PublicationRef!, $first: Int!, $after: String!, $orderBy: PublicationPostsOrderBy, $filter: PublicationPostsFilter) {
  publication: publicationByRef(ref: $ref) {
    publicationPostsConnection(first: $first, after: $after, orderBy: $orderBy, filter: $filter) {
      edges {
        listedAt
        node {
          title
          mediumUrl
          firstPublishedAt
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`;

  return await page.evaluate(async (graphqlQuery) => {
    let afterCursor = '';
    let hasNextPage = true;
    const allRows = [];

    while (hasNextPage) {
      const payload = [
        {
          operationName: 'PublicationContentDataQuery',
          variables: {
            ref: {
              slug: 'purely-being-human',
              domain: null,
            },
            first: 25,
            after: afterCursor,
            orderBy: {
              publishedAt: 'DESC',
            },
            filter: {
              published: true,
            },
          },
          query: graphqlQuery,
        },
      ];

      const response = await fetch('https://medium.com/_/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const connection = json?.[0]?.data?.publication?.publicationPostsConnection;
      if (!connection || !Array.isArray(connection.edges)) {
        throw new Error('Unexpected GraphQL response from publicationPostsConnection');
      }

      for (const edge of connection.edges) {
        const node = edge?.node || {};
        allRows.push({
          title: node.title || '',
          url: node.mediumUrl || '',
          publishedAt: node.firstPublishedAt || edge?.listedAt || node.createdAt || '',
        });
      }

      hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
      afterCursor = connection.pageInfo?.endCursor || '';
      if (hasNextPage && !afterCursor) {
        throw new Error('Missing GraphQL endCursor while hasNextPage is true');
      }
    }

    return allRows;
  }, query);
}

async function fetchArticleMeta(page, url) {
  return await page.evaluate(async (articleUrl) => {
    const response = await fetch(articleUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return { summary: '', image: '' };
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
      summary: readMeta('og:description') || '',
      image: readMeta('og:image') || '',
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

    const rows = await fetchAllPosts(page);
    const uniqueRows = Array.from(
      new Map(
        rows
          .map((row) => ({
            title: normalizeText(row.title || ''),
            url: normalizeMediumUrl(row.url || ''),
            publishedAt: parseDate(row.publishedAt || ''),
          }))
          .filter((row) => row.url && row.publishedAt)
          .map((row) => [row.url, row])
      ).values()
    );

    const articles = [];
    for (const row of uniqueRows) {
      let meta = { summary: '', image: '' };
      try {
        meta = await fetchArticleMeta(page, row.url);
      } catch {
        meta = { summary: '', image: '' };
      }

      articles.push({
        title: row.title || 'Medium article',
        url: row.url,
        publishedAt: row.publishedAt,
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
