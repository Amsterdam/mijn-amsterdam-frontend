import type { IOptions } from 'sanitize-html';
import sanitizeHtml from 'sanitize-html';

import { ONE_HOUR_MS } from '../../config/app.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

const TAGS_ALLOWED = [
  'a',
  'p',
  'br',
  'strong',
  'em',
  'i',
  'b',
  'u',
  'ul',
  'li',
  'ol',
  'dt',
  'dd',
  'h3',
  'h4',
  'h5',
];

const ATTR_ALLOWED = {
  a: ['href', 'name', 'target', 'rel'],
};

const DEFAULT_CONFIG: IOptions = {
  allowedSchemes: ['https', 'tel', 'mailto', 'http'],
  disallowedTagsMode: 'discard',
};

export function sanitizeCmsContent(
  content: string,
  options = {
    allowedTags: TAGS_ALLOWED,
    allowedAttributes: ATTR_ALLOWED,

    // Filter out empty tags
    exclusiveFilter(frame: { text: string }) {
      return !frame.text.trim();
    },
  }
) {
  const config = Object.assign(DEFAULT_CONFIG, options);
  return sanitizeHtml(content, config);
}

type StaticSearchEntry = {
  url: string;
  displayTitle: string;
  description: string;
  keywords: string[];
  profileTypes?: string[];
};

type ApiSearchConfig = {
  keywordsGeneratedFromProps?: string[];
  profileTypes?: string[];
  keywords?: string[];
};

type SearchConfigRemote = {
  staticSearchEntries: StaticSearchEntry[];
  apiSearchConfigs: Record<string, ApiSearchConfig>;
};

/**
// Example usage:
const config: SearchConfigRemote = {
  staticSearchEntries: [
    {
      url: '/',
      displayTitle: 'Home - Dashboard',
      description:
        'Dashboard pagina met overzicht van wat U heeft op Mijn Amsterdam.',
      keywords: [],
    },
    // Add other entries here...
  ],
  apiSearchConfigs: {
    WPI_AANVRAGEN: {
      keywordsGeneratedFromProps: ['title', 'decision', 'about'],
    },
    // Add other configs here...
  },
};
*/

const SEARCH_CONFIG_CACHE_TIMEOUT_MS = 7 * 24 * ONE_HOUR_MS; // 7 days

export async function fetchSearchConfig() {
  return requestData<SearchConfigRemote>(
    getApiConfig('SEARCH_CONFIG', {
      cacheTimeout: SEARCH_CONFIG_CACHE_TIMEOUT_MS,
    })
  );
}
