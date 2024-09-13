import { TextPartContents, ZorgnedAanvraagTransformed } from './zorgned-types';

export function parseLabelContent<T extends ZorgnedAanvraagTransformed>(
  text: TextPartContents<T>,
  aanvraag: T,
  today: Date,
  allAanvragen: T[]
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(aanvraag, today, allAanvragen);
  }

  return rText;
}
