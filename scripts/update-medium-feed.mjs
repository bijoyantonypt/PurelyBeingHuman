import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const publicationUrl = 'https://medium.com/purely-being-human';
const archiveUrl = 'https://medium.com/purely-being-human/all';
const outputPath = path.join(process.cwd(), 'medium-feed.json');
const earliestAllowedDate = new Date('2026-04-23T00:00:00.000Z');
const publicationSlug = 'purely-being-human';

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

async function extractArchiveLinksWithPlaywright(slug) {
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

  let afterCursor = '';
  let hasNextPage = true;
  const posts = [];

  while (hasNextPage) {
    const payload = [
      {
        operationName: 'PublicationContentDataQuery',
        variables: {
          ref: {
            slug,
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
        query,
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
      throw new Error(`GraphQL request failed with ${response.status}`);
    }

    const json = await response.json();
    const connection = json?.[0]?.data?.publication?.publicationPostsConnection;

    if (!connection || !Array.isArray(connection.edges)) {
      throw new Error('Missing publicationPostsConnection in GraphQL response');
    }

    for (const edge of connection.edges) {
      const node = edge?.node || {};
      posts.push({
        title: node.title || '',
        url: node.mediumUrl || '',
        publishedAt: node.firstPublishedAt || edge?.listedAt || node.createdAt || null,
      });
    }

    hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
    afterCursor = connection.pageInfo?.endCursor || '';
    if (hasNextPage && !afterCursor) {
      throw new Error('Missing endCursor while hasNextPage is true');
    }
  }

  return posts;
}

async function fetchArticleMetadata(page, articleUrl) {
  try {
    const metadata = await page.evaluate(async (url) => {
      const response = await fetch(url, {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        return {
          title: '',
          summary: '',
          image: '',
          publishedAt: null,
        };
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

      const title = readMeta('og:title') || htmlText.match(/<title>(.*?)<\/title>/is)?.[1] || '';
      const summary = readMeta('og:description') || '';
      const image = readMeta('og:image') || '';
      const publishedAt = readMeta('article:published_time') || htmlText.match(/<time[^>]+datetime="([^"]+)"/is)?.[1] || '';

      return {
        title,
        summary,
        image,
        publishedAt,
      };
    }, articleUrl);

    return {
      title: normalizeText(metadata.title || '') || 'Medium article',
      url: articleUrl,
      publishedAt: parsePublishedDate(metadata.publishedAt || ''),
      summary: normalizeText(metadata.summary || ''),
      image: metadata.image || '',
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
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    });

    await page.goto(archiveUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(3000);

    const postRows = await page.evaluate(extractArchiveLinksWithPlaywright, publicationSlug);
    const uniqueRows = Array.from(
      new Map(
        postRows
          .map((post) => ({
            title: normalizeText(post.title || ''),
            url: normalizeMediumUrl(post.url || ''),
            publishedAt: parsePublishedDate(post.publishedAt || ''),
          }))
          .filter((post) => post.url && post.url.includes('/purely-being-human/'))
          .map((post) => [post.url, post])
      ).values()
    );

    const articles = [];

    for (const post of uniqueRows) {
      const metadata = await fetchArticleMetadata(page, post.url);
      const sourcePublishedAt = metadata.publishedAt || post.publishedAt || null;
      const publishedAt = sourcePublishedAt ? new Date(sourcePublishedAt) : null;
      if (!publishedAt || publishedAt < earliestAllowedDate) {
        continue;
      }

      articles.push({
        title: metadata.title || post.title || 'Medium article',
        url: post.url,
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

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Saved ${articles.length} articles to ${outputPath}`);
} catch (error) {
  console.error('Unable to fetch Medium publication data:', error.message);
  process.exit(1);
}
