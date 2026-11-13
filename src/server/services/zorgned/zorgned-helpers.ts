import { sanitizeStringTemplate } from '../../helpers/text.ts';
import type {
  LeveringsVormTransformed,
  TextPartContents,
} from './zorgned-types.ts';

export function parseLabelContent<T>(
  text: TextPartContents<T>,
  aanvraag: T,
  today: Date,
  allAanvragen: T[]
): string {
  const rText = text || '';

  if (typeof rText === 'function') {
    const value = rText(aanvraag, today, allAanvragen);
    return typeof value === 'string' ? sanitizeStringTemplate(value) : value;
  }

  return rText;
}

export function getLeveriningsVormUitgeschreven(
  leveringsVorm: LeveringsVormTransformed
) {
  switch (leveringsVorm) {
    case 'ZIN':
      return 'Zorg in natura';
    case 'PGB':
      return 'Persoonsgebonden budget';
    default:
      return null;
  }
}
