import { defaultDateFormat, isDateInPast } from '../../../../universal/helpers';
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
            ? `U heeft recht op een ${regeling.titel}. U moet hiervoor eerst een cursus volgen.`
            : `U heeft geen recht op een ${regeling.titel}`
        }.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
  },
  {
    status: 'Cursus voldaan',
    isVisible: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.resultaat === 'toegewezen',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => isVerzilvering(aanvraag),
    isActive: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) &&
      aanvraag.isActueel === true &&
      !isEindeGeldigheidVerstreken(aanvraag),
    description: (aanvraag) =>
      `
        <p>
         U heeft voldaan aan de cursus voorwaarde voor het recht op ${aanvraag.titel}.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
  },
  {
    status: 'Cursus niet voldaan',
    isVisible: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.resultaat !== 'toegewezen',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => isVerzilvering(aanvraag),
    isActive: (stepIndex, aanvraag) =>
      (isVerzilvering(aanvraag) && aanvraag.isActueel !== true) ||
      aanvraag.resultaat === 'afgewezen',
    description: (aanvraag) =>
      `
        <p>
         U heeft voldaan aan de cursus voorwaarde voor het recht op ${aanvraag.titel}.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
  },
];
