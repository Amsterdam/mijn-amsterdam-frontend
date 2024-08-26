import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';

export const BESLUIT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Besluit',
  datePublished: (regeling) => regeling.datumBesluit,
  isChecked: (stepIndex, regeling) => true,
  isActive: (stepIndex, regeling) =>
    regeling.isActueel === true || regeling.resultaat === 'afgewezen',
  description: (regeling) =>
    `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U heeft recht op ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''}`
            : `U heeft geen recht op ${regeling.titel}`
        }.
        </p>
        <p>
          In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
          indienen.
        </p>
      `,
};

function getEindeRechtDescription(regeling: ZorgnedAanvraagTransformed) {
  const isActueel = regeling.isActueel;
  const hasDatumEindeGeldigheid = !!regeling.datumEindeGeldigheid;

  switch (true) {
    case isActueel && hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} stopt per ${regeling.datumEindeGeldigheid ? defaultDateFormat(regeling.datumEindeGeldigheid) : ''}.`;
    case isActueel && !hasDatumEindeGeldigheid:
      return `Als uw recht op ${regeling.titel} stopt, krijgt u hiervan bericht.`;
    case !isActueel && !hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} is beëindigd`;
    case !isActueel && hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} is beëindigd ${
        regeling.datumEindeGeldigheid
          ? `per ${defaultDateFormat(regeling.datumEindeGeldigheid)}`
          : ''
      }`;
  }
}

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Einde recht',
  isVisible: (i, regeling) => regeling.resultaat === 'toegewezen',
  datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
  isChecked: (stepIndex, regeling) => regeling.isActueel === false,
  isActive: (stepIndex, regeling) => regeling.isActueel === false,
  description: (regeling) =>
    `<p>
      ${getEindeRechtDescription(regeling)}
    </p>
    `,
};
