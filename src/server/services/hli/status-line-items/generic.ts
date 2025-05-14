import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

function getNamenBetrokkenen(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const names = regeling.betrokkenPersonen
    .map((person) => person.name)
    .filter(Boolean);

  if (names.length <= 1) {
    return names.join('');
  }

  const lastName = names.pop();
  return `${names.join(', ')} en ${lastName}`;
}

export function getBetrokkenDescription(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
): string | null {
  const betrokkenen = regeling.betrokkenPersonen.filter(
    (person) => !!person.name
  );

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
  const hasNamenBetrokkenen = regeling.betrokkenPersonen.some(
    (person) => !!person.name
  );
  return `<p>
    ${
      regeling.resultaat === 'toegewezen'
        ? `U krijgt ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''}${hasNamenBetrokkenen ? ` voor ${getNamenBetrokkenen(regeling)}` : ''}.`
        : `U krijgt geen ${regeling.titel}${hasNamenBetrokkenen ? ` voor ${getNamenBetrokkenen(regeling)}` : ''}.`
    }
    </p>
    <p>
      ${regeling.resultaat === 'toegewezen' ? 'In de brief vindt u meer informatie hierover.' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
    </p>
  `;
}

export const BESLUIT: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed> =
  {
    status: 'Besluit',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: () => true,
    isActive: (regeling) =>
      regeling.isActueel === true || regeling.resultaat === 'afgewezen',
    description: getBesluitDescription,
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

export const forTesting = {
  getEindeRechtDescription,
};
