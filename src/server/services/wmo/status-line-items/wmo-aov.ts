import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';
import { AANVRAAG, IN_BEHANDELING, MEER_INFORMATIE } from './wmo-generic';

export const AOV: ZorgnedStatusLineItemTransformerConfig[] = [
  AANVRAAG,
  IN_BEHANDELING,
  MEER_INFORMATIE,
  {
    status: 'Besluit',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => !!aanvraag.datumBesluit,
    isActive: (stepIndex, aanvraag) =>
      !!aanvraag.datumBesluit && aanvraag.isActueel === true,
    description: (aanvraag) =>
      `
            <p>
              U heeft recht op een ${aanvraag.titel} per ${
                aanvraag.datumIngangGeldigheid
                  ? defaultDateFormat(aanvraag.datumIngangGeldigheid)
                  : ''
              }. De vervoerspas ontvangt u per
              post.
            </p>
            <p>
             In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
            </p>
          `,
  },
  {
    status: 'Einde recht',
    datePublished: (aanvraag) =>
      (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, aanvraag) => aanvraag.isActueel === false,
    description: (aanvraag) =>
      `<p>
            ${
              aanvraag.isActueel
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${aanvraag.titel} is beëindigd ${
                    aanvraag.datumEindeGeldigheid
                      ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                      : ''
                  }`
            }
          </p>`,
  },
];
