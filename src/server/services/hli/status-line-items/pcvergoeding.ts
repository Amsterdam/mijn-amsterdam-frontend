import { isDateInPast } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';

function isVerzilvering(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    ['AV-PCVZIL', 'AV-UPCZIL'].includes(aanvraag.productIdentificatie)
  );
}

export function isEindeGeldigheidVerstreken(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return (
    !!aanvraag.datumEindeGeldigheid &&
    isDateInPast(aanvraag.datumEindeGeldigheid)
  );
}

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) =>
      !isVerzilvering(aanvraag) && aanvraag.isActueel === true,
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U heeft recht op een ${regeling.titel}. U moet hiervoor eerst een cursus volgen`
            : `U heeft geen recht op een ${regeling.titel}`
        }.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  {
    status: 'Cursus',
    isVisible: (stepIndex, aanvraag) =>
      !isVerzilvering(aanvraag) || !aanvraag.resultaat,
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => true,
    description: (aanvraag) =>
      `
        <p>
         Wij wachten op de uitslag van uw te volgen cursus.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  {
    status: 'Cursus voldaan',
    isVisible: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.resultaat === 'toegewezen',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => true,
    description: (aanvraag) =>
      `
        <p>
         U heeft voldaan aan de cursus voorwaarde voor het recht op ${aanvraag.titel}.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  {
    status: 'Cursus niet voldaan',
    isVisible: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.resultaat === 'afgewezen',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => true,
    description: (aanvraag) =>
      `
        <p>
         U heeft geen recht op ${aanvraag.titel}
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
];
