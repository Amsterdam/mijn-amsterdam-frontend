import { defaultDateFormat } from '../../../../universal/helpers';
import { ZorgnedStatusLineItemTransformerConfig } from '../../zorgned/zorgned-config-and-types';

export const PGB: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: (stepIndex, data) => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (data) =>
      `
            <p>
              U hebt recht op ${data.titel} per ${defaultDateFormat(
                data.datumIngangGeldigheid
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
    datePublished: (data) => data.datumEindeGeldigheid || '',
    isChecked: (stepIndex, data) => data.isActueel === false,
    isActive: (stepIndex, data) => data.isActueel === false,
    description: (data) =>
      `
            <p>
              ${
                data.isActueel
                  ? `Op deze datum vervalt uw recht op ${data.titel}.`
                  : `Uw recht op ${data.titel} is beëindigd ${
                      data.datumEindeGeldigheid
                        ? `per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                        : ''
                    }`
              }
            </p>

            ${
              data.isActueel
                ? `<p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>`
                : ''
            }
          `,
  },
];
