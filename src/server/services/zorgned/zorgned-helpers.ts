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
    const value = rText(aanvraag, today, allAanvragen);
    return typeof value === 'string' ? htmlTextContent(value) : value;
  }

  return rText;
}
