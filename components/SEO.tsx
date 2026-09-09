import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export default function SEO({
  title,
  description,
  image = 'https://purelybeinghuman.com/og-image.jpg',
  url = 'https://purelybeinghuman.com',
  type = 'website',
  author = 'PurelyBeingHuman',
  publishedDate,
  modifiedDate,
}: SEOProps) {
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content={author} />
      <meta name="theme-color" content="#2563eb" />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PurelyBeingHuman" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Article Meta Tags */}
      {publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Search Console Verification */}
      <meta
        name="google-site-verification"
        content="your_google_verification_code"
      />
    </Head>
  );
}
