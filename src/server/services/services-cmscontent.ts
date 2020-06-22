import sanitizeHtml from 'sanitize-html';
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
  allowedSchemes: ['https'],
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

interface CMSContent {
  generalInfo: CMSPageContent | null;
}

export async function loadServicesCMSContent(
  sessionID: SessionID,
  samlToken: string
) {
  const generalInfoPageResponse = await requestData<CMSContent>(
    getApiConfig('CMS_CONTENT_GENERAL_INFO', {
      transformResponse: (responseData: any) => {
        return {
          generalInfo: {
            title: responseData.applicatie.title,
            content:
              sanitizeCmsContent(responseData.applicatie.inhoud.inleiding) +
              sanitizeCmsContent(responseData.applicatie.inhoud.tekst),
          },
        };
      },
    }),
    sessionID,
    samlToken
  );

  return {
    CMS_CONTENT: generalInfoPageResponse,
  };
}
