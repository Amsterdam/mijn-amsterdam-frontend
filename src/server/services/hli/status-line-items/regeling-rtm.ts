import { BESLUIT, EINDE_RECHT, getBetrokkenDescription } from './generic';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
  type ZorgnedPerson,
} from '../../zorgned/zorgned-types';
import type { ZorgnedHLIRegeling } from '../hli-regelingen-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';
const avRtmRegelingen = [AV_RTM_DEEL1, AV_RTM_DEEL2];

function isRTMDeel2(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

function isRTMDeel1(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

function isRTMRegeling(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    avRtmRegelingen.includes(aanvraag.productIdentificatie)
  );
}

export function filterCombineRtmData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedHLIRegeling[] {
  const aanvragenDeel1Combined: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
    [];

  const aanvragenUpdated: ZorgnedHLIRegeling[] = aanvragen.map(
    (aanvraag, index, allAanvragen) => {
      // Filter out R
      if (isRTMDeel2(aanvraag)) {
        // Given the aanvragen are sorted by datumIngangGeldigheid/DESC we look for the first
        // deel1 aanvraag that is not already in the $aanvragenDeel1Combined list.
        // This is ___MOST_LIKELY___ the deel1 aanvraag that is related to the current deel2 aanvraag.
        const regelingDeel1 = allAanvragen
          .slice(index, allAanvragen.length - 1)
          .find(
            (aanvraag) =>
              isRTMDeel1(aanvraag) &&
              aanvraag.resultaat === 'toegewezen' &&
              !aanvragenDeel1Combined.includes(aanvraag)
          );

        if (regelingDeel1) {
          aanvragenDeel1Combined.push(regelingDeel1);
          return {
            ...aanvraag,
            datumInBehandeling: regelingDeel1?.datumBesluit,
            datumAanvraag:
              regelingDeel1?.datumAanvraag ?? aanvraag.datumAanvraag,
          };
        }
      }
      return aanvraag;
    }
  );

  const aanvragenWithoutRedundantDeel1 = aanvragenUpdated.filter(
    (aanvraag) => !aanvragenDeel1Combined.includes(aanvraag)
  );

  return aanvragenWithoutRedundantDeel1;
}

type RTMRelatieType =
  | 'aanvrager'
  | 'aanvragerPartner'
  | 'aanvragerKinderen'
  | 'aanvragerPartnerKinderen';

function determineRelatieType(persons: ZorgnedPerson[]): RTMRelatieType {
  const hasPartner = persons.some((person) => person.isPartner);
  const hasChildren = !!persons.length && !hasPartner;

  if (hasPartner && hasChildren) {
    return 'aanvragerPartnerKinderen';
  } else if (hasPartner) {
    return 'aanvragerPartner';
  } else if (hasChildren) {
    return 'aanvragerKinderen';
  }

  return 'aanvrager';
}

function getOntvangersText(
  variant: 'ontvangers1' | 'ontvangers2' | 'ontvangers3',
  relatieType:
    | 'aanvrager'
    | 'aanvragerPartner'
    | 'aanvragerKinderen'
    | 'aanvragerPartnerKinderen'
): string {
  const texts = {
    ontvangers1: {
      aanvrager: 'u',
      aanvragerPartner: 'u en uw partner',
      aanvragerKinderen: 'u en uw kind',
      aanvragerPartnerKinderen: 'u en uw gezinsleden',
    },
    ontvangers2: {
      aanvrager: '', // not shown
      aanvragerPartner: 'partner',
      aanvragerKinderen: 'kind',
      aanvragerPartnerKinderen: 'gezinsleden',
    },
    ontvangers3: {
      aanvrager: '', // not shown
      aanvragerPartner: 'Heeft uw partner',
      aanvragerKinderen: 'Heeft uw kind',
      aanvragerPartnerKinderen: 'Heeft (een van) uw gezinsleden',
    },
  };

  return texts[variant][relatieType] || '';
}

function getRtmDescriptionDeel1Toegewezen(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const relatieType = determineRelatieType(aanvraag.betrokkenPersonen);
  const ontvangers1 = getOntvangersText('ontvangers1', relatieType);

  let description = `<p>Voordat ${ontvangers1} de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;

  const hasBetrokkenen = !!aanvraag.betrokkenPersonen.length;

  if (hasBetrokkenen) {
    const ontvangers2 = getOntvangersText('ontvangers2', relatieType);
    const ontvangers3 = getOntvangersText('ontvangers3', relatieType);

    description += `
    <p>De uitslag van de aanvraag voor ${ontvangers2} is te vinden met de DigiD login gegevens van uw ${ontvangers2}.</p>
    <p>${ontvangers3} nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
    `;
  }

  return description;
}

export const RTM: ZorgnedStatusLineItemTransformerConfig<ZorgnedHLIRegeling>[] =
  [
    // Besluit - afgewezen - voor RTM Deel 1. Betrokkenen krijgen deze stap nooit te zien.
    {
      ...BESLUIT,
      isActive(aanvraag) {
        return aanvraag.resultaat === 'afgewezen';
      },
      isVisible(aanvraag) {
        return isRTMDeel1(aanvraag) && aanvraag.resultaat === 'afgewezen';
      },
    },
    // Deel 1 is (deels) toegewezen. Alleen voor de aanvrager.
    {
      status: 'Aanvraag',
      isChecked: true,
      description: '',
      isVisible(aanvraag) {
        return (
          aanvraag.resultaat === 'toegewezen' &&
          (isRTMDeel1(aanvraag) ||
            (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag)) // dateInBehandeling is een property die wordt togevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
        );
      },
      isActive: false,
      datePublished(regeling) {
        return (
          /** if Deel2 */ regeling.datumInBehandeling ||
          /** if Deel1 */ regeling.datumBesluit
        );
      },
    },
    // In behandeling (in afwatching van uitslag GGD), alleen voor de aanvrager/ontvanger zónder betrokkenen.
    {
      status: 'In behandeling',
      isChecked: true,
      description: getRtmDescriptionDeel1Toegewezen,
      isVisible(aanvraag) {
        return (
          aanvraag.resultaat === 'toegewezen' &&
          (isRTMDeel1(aanvraag) ||
            (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag)) // dateInBehandeling is een property die wordt togevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
        );
      },
      isActive(aanvraag) {
        return isRTMDeel1(aanvraag);
      },
      datePublished(regeling) {
        return (
          /** if Deel2 */ regeling.datumInBehandeling ||
          /** if Deel1 */ regeling.datumBesluit
        );
      },
    },
    // Besluit - afgewezen/toegewezen - voor RTM Deel 2. Voor zowel de aanvrager als de betrokkenen.
    // Betrokkkenen krijgen alléén deze stap (RTM Deel 2) te zien.
    {
      ...BESLUIT,
      isVisible: isRTMDeel2,
    },
    {
      ...EINDE_RECHT,
      isVisible(regeling) {
        return (
          isRTMDeel2(regeling) &&
          regeling.resultaat === 'toegewezen' &&
          regeling.isActueel === false
        );
      },
    },
  ];

export const forTesting = {
  getBetrokkenDescription,
  isRTMDeel2,
};
