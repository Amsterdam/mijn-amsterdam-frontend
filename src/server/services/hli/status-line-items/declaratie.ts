import { BESLUIT } from './generic';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

function getDeclaratieBesluitDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return `
    <p>
      Uw declaratie is ${regeling.resultaat}.
    </p>
    <p>
      In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.
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
