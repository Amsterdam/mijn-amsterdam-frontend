import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

function getNamenBetrokkenen(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return `(${regeling.betrokkenPersonen.map((person) => person.name).join(', ')})`;
}

export const BESLUIT: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed> =
  {
    status: 'Besluit',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) =>
      regeling.isActueel === true || regeling.resultaat === 'afgewezen',
    description: (regeling) => {
      return `<p>
        ${
          regeling.resultaat === 'toegewezen'
            ? `U krijgt ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor ${getNamenBetrokkenen(regeling)}`
            : `U krijgt geen ${regeling.titel} voor ${getNamenBetrokkenen(regeling)}`
        }.
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' ? 'In de brief vindt u meer informatie hierover.' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
        </p>
      `;
    },
  };

function getEindeRechtDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const isActueel = regeling.isActueel;
  const hasDatumEindeGeldigheid = !!regeling.datumEindeGeldigheid;

  switch (true) {
    case isActueel && hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} stopt per ${regeling.datumEindeGeldigheid ? defaultDateFormat(regeling.datumEindeGeldigheid) : ''}.`;
    case isActueel && !hasDatumEindeGeldigheid:
      return `Als uw recht op ${regeling.titel} stopt, krijgt u hiervan bericht.`;
    case !isActueel && !hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} is beëindigd.`;
    case !isActueel && hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} is beëindigd ${
        regeling.datumEindeGeldigheid
          ? `per ${defaultDateFormat(regeling.datumEindeGeldigheid)}`
          : ''
      }.`;
  }
}

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed> =
  {
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

export const forTesting = {
  getEindeRechtDescription,
};
