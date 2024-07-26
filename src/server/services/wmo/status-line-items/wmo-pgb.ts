import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';
import { AANVRAAG, IN_BEHANDELING, MEER_INFORMATIE } from './wmo-generic';

export const PGB: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => !!aanvraag.datumBesluit,
    isActive: (stepIndex, aanvraag, today) =>
      !!aanvraag.datumBesluit && aanvraag.isActueel === true,
    description: (aanvraag) =>
      `
            <p>
              U heeft recht op ${aanvraag.titel} per ${
                aanvraag.datumIngangGeldigheid
                  ? defaultDateFormat(aanvraag.datumIngangGeldigheid)
                  : ''
              }.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
  },
  {
    status: 'Einde recht',
    datePublished: (aanvraag) => aanvraag.datumEindeGeldigheid || '',
    isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    description: (aanvraag) =>
      `
            <p>
              ${
                aanvraag.isActueel
                  ? `Op deze datum vervalt uw recht op ${aanvraag.titel}.`
                  : `Uw recht op ${aanvraag.titel} is beëindigd ${
                      aanvraag.datumEindeGeldigheid
                        ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                        : ''
                    }`
              }
            </p>

            ${
              aanvraag.isActueel
                ? `<p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>`
                : ''
            }
          `,
  },
];
