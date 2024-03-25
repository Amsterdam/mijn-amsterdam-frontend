import { defaultDateFormat } from '../../../../universal/helpers';
import { WMOStatusLineItemFormatterConfig } from '../wmo-config-and-types';

export const vergoeding: WMOStatusLineItemFormatterConfig[] = [
  {
    status: 'Besluit',
    datePublished: (data) => data.datumBesluit,
    isChecked: (stepIndex, data) => true,
    isActive: (stepIndex, data) => data.isActueel === true,
    description: (data) =>
      `
            <p>
              U hebt recht op een ${data.titel} per ${defaultDateFormat(
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
    datePublished: (data) =>
      (data.isActueel ? '' : data.datumEindeGeldigheid) || '',
    isChecked: () => false,
    isActive: (stepIndex, data) => data.isActueel === false,
    description: (data) =>
      `
            <p>
              ${
                data.isActueel
                  ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                  : `Uw recht op ${data.titel} is beëindigd ${
                      data.datumEindeGeldigheid
                        ? `per ${defaultDateFormat(data.datumEindeGeldigheid)}`
                        : ''
                    }`
              }
            </p>
            ${
              data.isActueel && data.leveringsVorm === 'PGB'
                ? `<p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>`
                : ''
            }
          `,
  },
];
