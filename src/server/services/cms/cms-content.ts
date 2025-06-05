import sanitizeHtml, { IOptions } from 'sanitize-html';

import { ApiResponse_DEPRECATED } from '../../../universal/helpers/api';
import { ONE_HOUR_MS, ONE_MINUTE_MS } from '../../config/app';
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

const CACHE_TIME_MS = 24 * ONE_MINUTE_MS; // 24 hours

export async function fetchMijnAmsterdamUitlegPage(
  profileType: ProfileType = 'private'
): Promise<ApiResponse_DEPRECATED<CMSPageContent | null>> {
  const requestConfig = getApiConfig('CMS_CONTENT_GENERAL_INFO', {
    cacheTimeout: CACHE_TIME_MS,
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

// eslint-disable-next-line no-magic-numbers
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

export async function fetchCmsFooter() {
  return requestData<CMSFooter>(
    getApiConfig('CMS_CONTENT_FOOTER', {
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
