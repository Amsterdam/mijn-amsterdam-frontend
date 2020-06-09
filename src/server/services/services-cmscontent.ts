import sanitizeHtml from 'sanitize-html';
import { requestData } from '../helpers';
import { ApiUrls } from '../config';

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
  // 'h4',
  // 'h3',
];
const ATTR_ALLOWED = {
  a: ['href', 'name', 'target', 'rel'],
};
const DEFAULT_CONFIG = {
  allowedSchemes: ['https'],
  disallowedTagsMode: 'discard',
};

function sanitizeCmsContent(
  content: string,
  options = {
    allowedTags: TAGS_ALLOWED,
    allowedAttributes: ATTR_ALLOWED,
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
    {
      url: ApiUrls.CMS_CONTENT_GENERAL_INFO,
      transformResponse: responseData => {
        console.log(responseData);
        return {
          generalInfo: {
            title: responseData.applicatie.title,
            content: sanitizeCmsContent(responseData.applicatie.inhoud.tekst),
          },
        };
      },
      cacheTimeout: 1 * 60 * 60 * 1000, // 1 hour
    },
    sessionID,
    samlToken
  );

  return {
    CMS_CONTENT: generalInfoPageResponse,
  };
}
