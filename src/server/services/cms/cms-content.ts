import sanitizeHtml, { IOptions } from 'sanitize-html';

import {
  ApiResponse_DEPRECATED,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { ONE_HOUR_MS } from '../../config/app';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

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
    exclusiveFilter: function (frame: { text: string }) {
      return !frame.text.trim();
    },
  }
) {
  const config = Object.assign(DEFAULT_CONFIG, options);
  return sanitizeHtml(content, config);
}

interface CMSPageContent {
  title: string;
  content: string;
}

type CMSPart = 'footer' | 'info-page';

function getCmsCacheKey(part: CMSPart): `cms-${CMSPart}-${string}` {
  return `cms-${part}-${Date.now()}`;
}

let infoPageCacheKey = getCmsCacheKey('info-page');

export async function fetchMijnAmsterdamUitlegPage(
  profileType: ProfileType = 'private',
  renewCache: boolean = false
): Promise<ApiResponse_DEPRECATED<CMSPageContent | null>> {
  if (renewCache) {
    infoPageCacheKey = getCmsCacheKey('info-page');
  }
  const requestConfig = getApiConfig('CMS_CONTENT_GENERAL_INFO', {
    cacheKey_UNSAFE: infoPageCacheKey,
    transformResponse: (responseData: {
      applicatie: {
        title: string;
        inhoud: { inleiding: string; tekst: string };
      };
    }) => {
      return {
        title: responseData.applicatie.title,
        content:
          sanitizeCmsContent(responseData.applicatie.inhoud.inleiding) +
          sanitizeCmsContent(responseData.applicatie.inhoud.tekst),
      };
    },
    formatUrl({ url }) {
      return profileType === 'commercial'
        ? `${url}/overzicht-producten-ondernemers/?AppIdt=app-data`
        : `${url}/ziet-amsterdam/?AppIdt=app-data`;
    },
  });

  return requestData<CMSPageContent>(requestConfig);
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

type CMSFooterLink = {
  label: string;
  url: string;
};

type CMSFooterLinkSource = {
  link: CMSFooterLink;
};

type CMSFooterSectionSource = {
  omschrijving?: { titel: string };
  verwijzing: [
    {
      extern?: CMSFooterLinkSource | CMSFooterLinkSource[];
      intern?: CMSFooterLinkSource | CMSFooterLinkSource[];
    },
  ];
};

type CMSFooterSource = {
  applicatie: {
    blok: {
      zijbalk: [
        {
          lijst: CMSFooterSectionSource[];
        },
      ];
    };
  };
};

export type CMSFooterSection = {
  title?: string;
  links: CMSFooterLink[];
};

export type CMSFooter = {
  sections: CMSFooterSection[];
  bottomLinks: CMSFooterLink[];
};

function getLinks(links: CMSFooterLinkSource | CMSFooterLinkSource[]) {
  return Array.isArray(links) ? links.map((link) => link.link) : [links.link];
}

const EXCLUDE_BOTTOM_LINKS = ['Cookies op deze site'];

let cmsFooterCacheKey = getCmsCacheKey('footer');

export async function fetchCmsFooter(
  renewCache: boolean = false
): Promise<ApiResponse<CMSFooter>> {
  if (renewCache) {
    cmsFooterCacheKey = getCmsCacheKey('footer');
  }
  return requestData<CMSFooter>(
    getApiConfig('CMS_CONTENT_FOOTER', {
      cacheKey_UNSAFE: cmsFooterCacheKey,
      transformResponse: (responseData: CMSFooterSource | null) => {
        if (!responseData?.applicatie) {
          return {
            sections: [],
            bottomLinks: [],
          };
        }
        const sections: CMSFooterSection[] =
          responseData.applicatie.blok.zijbalk[0].lijst.map((section) => {
            const title = section.omschrijving?.titel;
            const links = section.verwijzing.flatMap((ref) => {
              const externLinks = ref.extern ? getLinks(ref.extern) : [];
              const internLinks = ref.intern ? getLinks(ref.intern) : [];
              return [...externLinks, ...internLinks];
            });
            return {
              title,
              links: links.filter((link) => link.url && link.label),
            };
          });
        return {
          sections: sections.filter((section) => !!section.title),
          bottomLinks: (
            sections.find((section) => !section.title)?.links ?? []
          ).filter((link) => !EXCLUDE_BOTTOM_LINKS.includes(link.label)),
        };
      },
    })
  );
}
