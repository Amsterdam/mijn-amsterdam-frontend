import { TextPartContents } from './zorgned-types';
import { htmlTextContent } from '../../helpers/text';

export function parseLabelContent<T>(
  text: TextPartContents<T>,
  aanvraag: T,
  today: Date,
  allAanvragen: T[]
): string {
  const rText = text || '';

  if (typeof rText === 'function') {
    return htmlTextContent(rText(aanvraag, today, allAanvragen));
  }

  return rText;
}
