const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// URL Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid http/https URL.
 * @param {string} str
 * @returns {boolean}
 */
const isValidUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extract the domain from a URL for display purposes.
 * @param {string} url
 * @returns {string}
 */
const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Open Graph / Meta Tag Extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the value of an HTML meta tag by property or name.
 * @param {string} html
 * @param {string} property - e.g. 'og:title'
 * @returns {string}
 */
const extractMeta = (html, property) => {
  // Match <meta property="..." content="..."> or <meta name="..." content="...">
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    'i'
  );
  const match = html.match(regex) || html.match(altRegex);
  return match ? match[1].trim() : '';
};

/**
 * Extract the page <title> tag content.
 * @param {string} html
 * @returns {string}
 */
const extractTitle = (html) => {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Preview Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch Open Graph metadata for a URL.
 * Returns null if fetching fails (network error, non-HTML page, etc.)
 *
 * @param {string} url
 * @returns {Promise<{url, title, description, image, domain} | null>}
 */
const fetchLinkPreview = async (url) => {
  if (!isValidUrl(url)) return null;

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'DevSwap-LinkPreview/1.0',
        Accept: 'text/html',
      },
      maxRedirects: 3,
      // Only fetch enough to grab the <head>
      responseType: 'text',
      maxContentLength: 200 * 1024, // 200 KB cap
    });

    const html = response.data;
    const domain = getDomain(url);

    const title =
      extractMeta(html, 'og:title') ||
      extractMeta(html, 'twitter:title') ||
      extractTitle(html) ||
      domain;

    const description =
      extractMeta(html, 'og:description') ||
      extractMeta(html, 'twitter:description') ||
      extractMeta(html, 'description') ||
      '';

    const image =
      extractMeta(html, 'og:image') ||
      extractMeta(html, 'twitter:image') ||
      '';

    return {
      url,
      title: title.substring(0, 200),
      description: description.substring(0, 400),
      image: image.substring(0, 500),
      domain,
    };
  } catch {
    // Silently fail — link preview is best-effort
    return {
      url,
      title: getDomain(url),
      description: '',
      image: '',
      domain: getDomain(url),
    };
  }
};

module.exports = { isValidUrl, fetchLinkPreview, getDomain };
