import sanitizeHtml from 'sanitize-html';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { LinkProps } from '../../universal/types/App.types';
import { apiSuccesResult } from '../../universal/helpers/api';
import { hash } from '../../universal/helpers/utils';

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

type CMSFooterContent = FooterBlock[];

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

        const footer = [];
        let currentBlock: FooterBlock | null = null;

        for (const [index, item] of items.entries()) {
          if (index === 0) {
            // We don't need the first item in this list.
            continue;
          }

          if (item.omschrijving) {
            if (currentBlock) {
              footer.push(currentBlock);
            }
            currentBlock = {
              id: hash(item.omschrijving.titel),
              title: item.omschrijving.titel,
              description: item.omschrijving.tekst
                ? sanitizeCmsContent(item.omschrijving.tekst)
                : null,
              links: [],
            };

            if (item.verwijzing && item.verwijzing[0]) {
              const links = [
                ...(item.verwijzing[0]?.intern || []),
                ...(item.verwijzing[0]?.extern || []),
              ]
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
          }
        }

        if (currentBlock) {
          footer.push(currentBlock);
        }

        return footer;
      },
    }),
    sessionID,
    samlToken
  );

  const [generalInfo, footer] = await Promise.all([
    generalInfoPageRequest,
    footerInfoPageRequest,
  ]);

  let generalInfoContent = generalInfo.content;
  let footerContent = footer.content;

  if (generalInfo.status !== 'OK') {
    // From cache?
    generalInfoContent = { title: '', content: '' };
  }

  if (footer.status !== 'OK') {
    // From cache?
    footerContent = [];
  }

  return {
    CMS_CONTENT: apiSuccesResult({
      generalInfo: generalInfoContent,
      footer: footerContent,
    }),
  };
}
