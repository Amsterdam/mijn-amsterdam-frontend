import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import { BESLUIT } from './generic';

function getDeclaratieBesluitDescription(regeling: ZorgnedAanvraagTransformed) {
  return `
    <p>
      Uw declaratie is ${regeling.resultaat}.
    </p>
    <p>
      In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
      indienen.
    </p>
  `;
}

export const DECLARATIE: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    ...BESLUIT,
    description: (regeling) => getDeclaratieBesluitDescription(regeling),
  },
];
