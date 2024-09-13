import { TextPartContents, ZorgnedAanvraagTransformed } from './zorgned-types';

export function parseLabelContent(
  text: TextPartContents,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagTransformed[]
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(aanvraag, today, allAanvragen);
  }

  return rText;
}
