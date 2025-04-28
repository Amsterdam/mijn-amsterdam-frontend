import fs from 'fs';
import path from 'path';

import { parse } from 'html-to-ast';
import { Attr } from 'html-to-ast/dist/types';
import sanitizeHtml, { IOptions } from 'sanitize-html';

import { IS_TAP } from '../../../universal/config/env';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
  apiErrorResult,
  getSettledResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { hash } from '../../../universal/helpers/utils';
import type { LinkProps } from '../../../universal/types/App.types';
import { isValidProfileType } from '../../auth/auth-helpers';
import FileCache from '../../helpers/file-cache';
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
    exclusiveFilter: function (frame: any) {
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

export interface AstNode {
  type?: string;
  text?: string;
  content?: string;
  voidElement?: boolean;
  name?: string;
  style?: string[];
  attrs?: Attr;
  children?: AstNode[];
  comment?: string;
}

export interface FooterBlock {
  id: string;
  title: string;
  description: AstNode[] | null;
  links: LinkProps[];
}

export interface CMSFooterContent {
  blocks: FooterBlock[];
  sub: LinkProps[];
}

interface FooterLink {
  link: { label: string; url: string };
}

function linkArray(input: FooterLink[] | FooterLink) {
  return Array.isArray(input) ? input : input ? [input] : [];
}

function transformFooterResponse(responseData: any) {
  const items = responseData?.applicatie?.blok?.zijbalk[0]?.lijst;

  if (!Array.isArray(items)) {
    return [];
  }

  const footer: CMSFooterContent = {
    blocks: [],
    sub: [],
  };

  let currentBlock: FooterBlock | null = null;

  for (const [index, item] of items.entries()) {
    if (index === 0) {
      // We don't need the first item in this list.
      continue;
    }

    if (item.omschrijving) {
      if (currentBlock) {
        footer.blocks.push(currentBlock);
      }
      currentBlock = {
        id: hash(item.omschrijving.titel),
        title: item.omschrijving.titel,
        description: item.omschrijving.tekst
          ? parse(sanitizeCmsContent(item.omschrijving.tekst).trim())
          : null,
        links: [],
      };

      if (item.verwijzing && item.verwijzing[0]) {
        const verwijzing = item.verwijzing[0];
        const intern = linkArray(verwijzing.intern);
        const extern = linkArray(verwijzing.extern);
        const links = [...extern, ...intern]
          .filter((item) => !!item.link)
          .map((item) => {
            const { link } = item;
            return {
              to: link.url,
              title: link.label,
            };
          });
        currentBlock.links = links;
      }
    } else if (item.verwijzing?.length) {
      const otherLinks = item.verwijzing.flatMap(
        (verwijzing: {
          intern: FooterLink[] | FooterLink;
          extern: FooterLink[] | FooterLink;
        }) => {
          const intern = linkArray(verwijzing.intern);
          const extern = linkArray(verwijzing.extern);
          const links = [...intern, ...extern];
          return links
            .filter(({ link }) => !!link && !link.url.match(/(cookies)/g))
            .map(({ link }) => {
              const title = link.label;
              return {
                to: link.url,
                title,
              };
            });
        }
      );
      footer.sub.push(...otherLinks);
    }
  }

  if (currentBlock) {
    footer.blocks.push(currentBlock);
  }

  return footer;
}

const CACHE_TIME_MINUTES = 24 * 60;
const fileCache = new FileCache({
  name: 'cms-content',
  cacheTimeMinutes: IS_TAP ? CACHE_TIME_MINUTES : -1,
});

async function getGeneralPage(
  requestID: RequestID,
  profileType: ProfileType = 'private',
  forceRenew: boolean = false
): Promise<ApiResponse_DEPRECATED<CMSPageContent | null>> {
  const apiData = fileCache.getKey<ApiSuccessResponse<CMSPageContent>>(
    'CMS_CONTENT_GENERAL_INFO_' + profileType
  );
  if (apiData && !forceRenew) {
    return Promise.resolve(apiData);
  }
  const requestConfig = getApiConfig('CMS_CONTENT_GENERAL_INFO', {
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

  return requestData<CMSPageContent>(requestConfig, requestID).then(
    (apiData) => {
      if (
        apiData.status === 'OK' &&
        apiData.content?.content &&
        apiData.content?.title
      ) {
        fileCache.setKey('CMS_CONTENT_GENERAL_INFO_' + profileType, apiData);
        fileCache.save();
        return apiData;
      }
      // Try to get stale cache instead.
      const staleApiData = fileCache.getKeyStale<
        ApiSuccessResponse<CMSPageContent>
      >('CMS_CONTENT_GENERAL_INFO_' + profileType);

      if (staleApiData) {
        return Promise.resolve(staleApiData);
      }

      return apiErrorResult('Unexpected page data from iProx CMS', null);
    }
  );
}

async function getFooter(
  requestID: RequestID,
  forceRenew: boolean = false
): Promise<ApiResponse_DEPRECATED<CMSFooterContent | null>> {
  const apiData =
    fileCache.getKey<ApiResponse_DEPRECATED<CMSFooterContent>>(
      'CMS_CONTENT_FOOTER'
    ) ?? null;

  if (apiData && !forceRenew) {
    return Promise.resolve(apiData);
  }

  const requestConfig = getApiConfig('CMS_CONTENT_FOOTER', {
    transformResponse: transformFooterResponse,
  });

  async function saveCacheAndSend(
    apiData: any
  ): Promise<ApiResponse_DEPRECATED<CMSFooterContent | null>> {
    if (apiData.content?.blocks.length) {
      fileCache.setKey('CMS_CONTENT_FOOTER', apiData);
      fileCache.save();
      return apiData;
    }
    // Try to get stale cache instead.
    const staleApiData =
      fileCache.getKeyStale<ApiResponse_DEPRECATED<CMSFooterContent>>(
        'CMS_CONTENT_FOOTER'
      );

    if (staleApiData) {
      return staleApiData;
    }

    return apiErrorResult('Could not fetch Footer data', null);
  }

  if (FeatureToggle.useCMSFooterStaticDataBackup) {
    return new Promise((resolve) => {
      fs.readFile(path.join(__dirname, './cms-footer.json'), (err, content) => {
        if (err) {
          resolve(
            apiErrorResult('could not read static footer data from file.', null)
          );
        }
        resolve(
          saveCacheAndSend(
            apiSuccessResult(
              transformFooterResponse(JSON.parse(content.toString()))
            )
          )
        );
      });
    });
  }

  return requestData<CMSFooterContent>(requestConfig, requestID).then(
    saveCacheAndSend
  );
}

async function fetchCmsBase(
  requestID: RequestID,
  query?: QueryParamsCMSFooter
) {
  const forceRenew = query?.forceRenew === 'true';
  const profileType =
    query?.profileType && isValidProfileType(query?.profileType)
      ? query.profileType
      : undefined;
  const generalInfoPageRequest = getGeneralPage(
    requestID,
    profileType,
    forceRenew
  );

  const footerInfoPageRequest = getFooter(requestID, forceRenew);

  const requests: Promise<
    ApiResponse_DEPRECATED<CMSPageContent | CMSFooterContent | null>
  >[] = [generalInfoPageRequest, footerInfoPageRequest];

  const [generalInfo, footer] = await Promise.allSettled(requests);

  const generalInfoContent = getSettledResult(generalInfo).content;
  const footerContent = getSettledResult(footer).content as CMSFooterContent;

  return {
    generalInfo: generalInfoContent as CMSPageContent | null,
    footer: footerContent as CMSFooterContent | null,
  };
}

export type QueryParamsCMSFooter = {
  forceRenew?: 'true';
  profileType?: ProfileType;
};

export async function fetchCmsFooter(
  requestID: RequestID,
  query?: QueryParamsCMSFooter
) {
  const response = await fetchCmsBase(requestID, query);
  return apiSuccessResult(response.footer);
}

export async function fetchCMSCONTENT(
  requestID: RequestID,
  query?: QueryParamsCMSFooter
) {
  const response = await fetchCmsBase(requestID, query);
  return apiSuccessResult(response);
}

const searchFileCache = new FileCache({
  name: 'search-config',
  cacheTimeMinutes: IS_TAP ? 24 * 60 : -1, // 24 hours
});

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

export async function fetchSearchConfig(
  requestID: RequestID,
  query?: Record<string, string>
) {
  const config =
    searchFileCache.getKey<ApiSuccessResponse<SearchConfigRemote>>('CONFIG');

  if (IS_TAP && config?.content && query?.cache !== 'renew') {
    return Promise.resolve(config);
  }

  let dataRequest;

  if (!IS_TAP) {
    dataRequest = new Promise((resolve, reject) => {
      fs.readFile(
        path.join(
          __dirname,
          '../../client/components/Search/search-config.json'
        ),
        (err, content) => {
          if (err) {
            reject(err);
          }
          resolve(apiSuccessResult(JSON.parse(content.toString())));
        }
      );
    });
  } else {
    dataRequest = requestData<SearchConfigRemote>(
      getApiConfig('SEARCH_CONFIG'),
      requestID
    );
  }

  return dataRequest
    .then((apiData) => {
      searchFileCache.setKey('CONFIG', apiData);
      searchFileCache.save();
      return apiData;
    })
    .catch((error) => {
      const staleApiData = searchFileCache.getKeyStale('CONFIG');

      if (staleApiData) {
        return Promise.resolve(staleApiData);
      }

      throw error;
    });
}
