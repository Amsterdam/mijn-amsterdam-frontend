import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

export function getBetrokkenKinderenDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
): string | null {
  const betrokkenen = regeling.betrokkenPersonen.filter((persoon) => {
    return !!persoon.name && !persoon.isAanvrager && !persoon.isPartner;
  });

  if (!betrokkenen.length) {
    return null;
  }

  const names = betrokkenen.map(
    (person) =>
      `${person.name}${person.dateOfBirthFormatted ? ` (geboren op ${person.dateOfBirthFormatted})` : ''}`
  );
  if (names.length <= 1) {
    return names.join('');
  }
  const lastName = names.pop();
  return `${names.join(', ')} en ${lastName}`;
}

export function getBesluitDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
): string {
  return `<p>
    ${
      regeling.resultaat === 'toegewezen'
        ? `U krijgt ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''}.`
        : `U krijgt geen ${regeling.titel}.`
    }
    </p>
    <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
  `;
}

export const BESLUIT: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed> =
  {
    status: 'Besluit',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: () => true,
    isActive: (regeling) =>
      regeling.isActueel === true || regeling.resultaat === 'afgewezen',
    description: (regeling) => getBesluitDescription(regeling),
  };

function getEindeRechtDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const isActueel = regeling.isActueel;
  const hasDatumEindeGeldigheid = !!regeling.datumEindeGeldigheid;

  switch (true) {
    case isActueel && hasDatumEindeGeldigheid:
      return `Uw recht op ${regeling.titel} stopt per ${regeling.datumEindeGeldigheid ? defaultDateFormat(regeling.datumEindeGeldigheid) : ''}. U kunt daarna opnieuw een ${regeling.titel} aanvragen.`;
    case isActueel && !hasDatumEindeGeldigheid:
      return `Als uw recht op ${regeling.titel} stopt, krijgt u hiervan tijdig bericht.`;
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
    isVisible: (regeling) => regeling.resultaat === 'toegewezen',
    datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
    isChecked: (regeling) => regeling.isActueel === false,
    isActive: (regeling) => regeling.isActueel === false,
    description: (regeling) =>
      `<p>
      ${getEindeRechtDescription(regeling)}
      </p>
    `,
  };

export function isAanvrager(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
): boolean {
  const isAanvrager = regeling.betrokkenPersonen.some(
    (betrokkene) =>
      betrokkene.isAanvrager && betrokkene.bsn === regeling.bsnAanvrager
  );
  return isAanvrager;
}

export const forTesting = {
  getEindeRechtDescription,
};
