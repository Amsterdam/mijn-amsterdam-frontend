import { defaultDateFormat } from '../../../../universal/helpers/date';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const AOV: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: () => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (data) =>
      `
            <p>
              U heeft recht op een ${data.titel} per ${
                data.datumIngangGeldigheid
                  ? defaultDateFormat(data.datumIngangGeldigheid)
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
    datePublished: (data) =>
      (data.isActueel ? '' : data.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, data) => data.isActueel === false,
    description: (data) =>
      `<p>
            ${
              data.isActueel
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.titel} is beëindigd ${
                    data.datumEindeGeldigheid
                      ? `per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                      : ''
                  }`
            }
          </p>`,
  },
];
