import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import { BESLUIT } from './generic';

function getDeclaratieBesluitDescription(regeling: ZorgnedAanvraagTransformed) {
  return `<p>
    ${
      regeling.resultaat === 'toegewezen'
        ? `U heeft recht op ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''}`
        : `U heeft geen recht op ${regeling.titel}`
    }.
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
