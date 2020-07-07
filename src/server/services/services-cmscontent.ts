import sanitizeHtml from 'sanitize-html';
import { ApiResponse, apiSuccesResult } from '../../universal/helpers/api';
import { hash } from '../../universal/helpers/utils';
import { LinkProps } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

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
const DEFAULT_CONFIG = {
  allowedSchemes: ['https', 'tel', 'mailto', 'http'],
  disallowedTagsMode: 'discard',
};

export function sanitizeCmsContent(
  content: string,
  options = {
    allowedTags: TAGS_ALLOWED,
    allowedAttributes: ATTR_ALLOWED,

    // Filter out empty tags
    exclusiveFilter: function(frame: any) {
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

interface FooterBlock {
  id: string;
  title: string;
  description: string | null;
  links: LinkProps[];
}

export interface CMSFooterContent {
  blocks: FooterBlock[];
  sub: LinkProps[];
}

export async function loadServicesCMSContent(
  sessionID: SessionID,
  samlToken: string
) {
  const generalInfoPageRequest = requestData<CMSPageContent>(
    getApiConfig('CMS_CONTENT_GENERAL_INFO', {
      transformResponse: (responseData: any) => {
        return {
          title: responseData.applicatie.title,
          content:
            sanitizeCmsContent(responseData.applicatie.inhoud.inleiding) +
            sanitizeCmsContent(responseData.applicatie.inhoud.tekst),
        };
      },
    }),
    sessionID,
    samlToken
  );

  const footerInfoPageRequest = requestData<CMSFooterContent>(
    getApiConfig('CMS_CONTENT_FOOTER', {
      transformResponse: (responseData: any) => {
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
                ? sanitizeCmsContent(item.omschrijving.tekst).trim()
                : null,
              links: [],
            };

            if (item.verwijzing && item.verwijzing[0]) {
              const verwijzing = item.verwijzing[0];
              const intern = Array.isArray(verwijzing.intern)
                ? verwijzing.intern
                : typeof verwijzing.intern === 'object'
                ? [verwijzing.intern]
                : [];
              const extern = Array.isArray(verwijzing.extern)
                ? verwijzing.extern
                : typeof verwijzing.extern === 'object'
                ? [verwijzing.extern]
                : [];
              const links = [...extern, ...intern]
                .filter(item => !!item.link)
                .map(item => {
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
                intern: Array<{ link: { label: string; url: string } }>;
                extern: Array<{ link: { label: string; url: string } }>;
              }) => {
                const links = [
                  ...(verwijzing.intern || []),
                  ...(verwijzing.extern || []),
                ];
                const subLinks = [];
                subLinks.push(
                  ...links
                    .filter(
                      ({ link }) => !!link && !link.url.match(/(cookies)/g)
                    )
                    .map(({ link }) => {
                      let title = link.label;
                      if (link.url.match(/over/g)) {
                        title = 'Over Amsterdam.nl';
                      }
                      return {
                        to: link.url,
                        title,
                      };
                    })
                );

                return subLinks;
              }
            );
            footer.sub.push(...otherLinks);
          }
        }

        if (currentBlock) {
          footer.blocks.push(currentBlock);
        }

        return footer;
      },
    }),
    sessionID,
    samlToken
  );

  const requests: Promise<
    ApiResponse<CMSPageContent | CMSFooterContent | null>
  >[] = [generalInfoPageRequest, footerInfoPageRequest];

  const [generalInfo, footer] = await Promise.all(requests);

  let generalInfoContent = generalInfo.content;
  let footerContent = footer.content;

  const cmsContent = {
    generalInfo: generalInfoContent as CMSPageContent | null,
    footer: footerContent as CMSFooterContent | null,
  };

  return {
    CMS_CONTENT: apiSuccesResult(cmsContent),
  };
}
