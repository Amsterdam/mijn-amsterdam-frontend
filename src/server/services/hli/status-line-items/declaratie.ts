import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import { BESLUIT } from './generic';

function getDeclaratieBesluitDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
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

export const DECLARATIE: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [
    {
      ...BESLUIT,
      description: (regeling) => getDeclaratieBesluitDescription(regeling),
    },
  ];
