import { TextPartContents } from './zorgned-types';

export function parseLabelContent<T>(
  text: TextPartContents<T>,
  aanvraag: T,
  today: Date,
  allAanvragen: T[]
): string {
  const rText = text || '';

  if (typeof rText === 'function') {
    return rText(aanvraag, today, allAanvragen);
  }

  return rText;
}
