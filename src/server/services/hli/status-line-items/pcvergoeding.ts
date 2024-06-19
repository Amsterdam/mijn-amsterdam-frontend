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
            ? `U heeft recht op een ${regeling.titel} per ${defaultDateFormat(regeling.datumIngangGeldigheid)}`
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
    status: 'Voorwaarde vooldaan',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => isVerzilvering(aanvraag),
    isActive: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) &&
      aanvraag.isActueel === true &&
      !isEindeGeldigheidVerstreken(aanvraag),
    description: (aanvraag) =>
      `
        <p>
          Uw heeft voldaan aan de voorwaarde voor het recht op ${aanvraag.titel} per ${defaultDateFormat(
            aanvraag.datumIngangGeldigheid
          )}.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
  },
  {
    status: 'Einde recht',
    datePublished: (aanvraag) =>
      (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
    isChecked: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && isEindeGeldigheidVerstreken(aanvraag),
    isActive: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.isActueel === false,
    description: (aanvraag) =>
      `
        <p>
          ${
            aanvraag.isActueel
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${aanvraag.titel} is beëindigd ${
                  aanvraag.datumEindeGeldigheid
                    ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                    : ''
                }`
          }
        </p>
      `,
  },
];
