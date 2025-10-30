import { isAfter, isBefore, isSameDay, parseISO, subDays } from 'date-fns';

import { getBetrokkenKinderenDescription } from './generic';
import { featureToggle } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { lowercaseFirstLetter } from '../../../../universal/helpers/text';
import { sortAlpha } from '../../../../universal/helpers/utils';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

export const PC_REGELING_V3_START_DATE = new Date('2026-01-01');

const isPcRegelingV3Active = () =>
  featureToggle.hli2026PCVergoedingV3Enabled &&
  isAfter(new Date(), subDays(PC_REGELING_V3_START_DATE, 1));

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_UPCTG = 'AV-UPCTG';

export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';
export const AV_PCVTG = 'AV-PCVTG';

const avCodes = {
  PC: {
    [AV_PCVZIL]: true,
    [AV_PCVTG]: featureToggle.hli2025PCTegoedCodesEnabled,
  },
  UPC: {
    [AV_UPCZIL]: true,
    [AV_UPCTG]: featureToggle.hli2025PCTegoedCodesEnabled,
  },
};

const verzilveringsCodesPC = toVerzilveringCodes(avCodes.PC);
const verzilveringsCodesUPC = toVerzilveringCodes(avCodes.UPC);

function isAangevraagdVoorRegelingV3ActiefWerd(dateString: string) {
  return isPcRegelingV3Active()
    ? isBefore(dateString, PC_REGELING_V3_START_DATE)
    : true;
}

export const verzilveringCodes = [
  ...verzilveringsCodesUPC,
  ...verzilveringsCodesPC,
];

function toVerzilveringCodes(codes: Record<string, boolean>): string[] {
  return Object.entries(codes)
    .filter(([_code, enabled]) => enabled)
    .map(([code]) => code);
}

function isVerzilvering(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    verzilveringCodes.includes(aanvraag.productIdentificatie)
  );
}

function isPcVergoeding(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVC, AV_UPCC].includes(aanvraag.productIdentificatie)
  );
}

function isRegelingVanVerzilvering(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  compareAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  if (!aanvraagProductId) {
    return false;
  }

  let avCode;

  if (verzilveringsCodesPC.includes(aanvraagProductId)) {
    avCode = AV_PCVC;
  } else if (verzilveringsCodesUPC.includes(aanvraagProductId)) {
    avCode = AV_UPCC;
  }

  return (
    compareAanvraag.productIdentificatie === avCode &&
    // We match on all betrokkenen to avoid issues with multiple aanvragen for different children.
    compareAanvraag.betrokkenen.every((id) =>
      aanvraag.betrokkenen.includes(id)
    ) &&
    compareAanvraag.resultaat !== 'afgewezen'
  );
}

function getUpcPcvDecisionDate(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  _today: Date,
  allAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  if (isVerzilvering(aanvraag)) {
    const baseRegeling = allAanvragen.find((compareAanvraag) =>
      isRegelingVanVerzilvering(aanvraag, compareAanvraag)
    );
    return baseRegeling?.datumBesluit ?? aanvraag.datumBesluit;
  }
  return aanvraag.datumBesluit;
}

function filterOutRedundantPcVergoedingsAanvraagRegelingAanvragenWhenWorkShopNietGevolgd(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const pcVergoedingAanvragenByBeschikkingNummer = aanvragen.reduce(
    (acc, aanvraag) => {
      if (isVerzilvering(aanvraag) || isPcVergoeding(aanvraag)) {
        const beschikkingNummer =
          aanvraag.beschikkingNummer || 'undefined_beschikkingNummer';
        acc[beschikkingNummer] = acc[beschikkingNummer] || [];
        acc[beschikkingNummer].push(aanvraag);
      }
      return acc;
    },
    {} as Record<string, ZorgnedAanvraagWithRelatedPersonsTransformed[]>
  );

  const PCVergoedingAanvragenFiltered = Object.values(
    pcVergoedingAanvragenByBeschikkingNummer
  ).flatMap((group) => {
    if (group.length <= 1) {
      return group[0];
    }
    const groupSorted = group.toSorted(sortAlpha('id', 'asc'));
    // If there are multiple aanvragen with the same beschikkingNummer, we need to filter them.
    // We keep the aanvraag where the workshop is not followed, and filter out the denied ones for the same productIdentificatie.
    const workshopAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed | null =
      groupSorted.find((aanvraag) => isWorkshopNietGevolgd(aanvraag)) ?? null;

    const filteredGroup = groupSorted.filter((aanvraag) => {
      if (aanvraag === workshopAanvraag) {
        return true;
      } else if (
        // Filters out the aanvraag derived from a redundant beschiktProduct in the same beschikking.
        // In this case the workshop is not followed, the business sets datumIngangGeldigheid and datumEindeGeldigheid to the same date.
        // But also adds a denied beschiktproduct for the same productIdentificatie.
        workshopAanvraag &&
        aanvraag.resultaat === 'afgewezen' &&
        aanvraag.productIdentificatie === workshopAanvraag.productIdentificatie
      ) {
        return false;
      }
      return true;
    });
    return filteredGroup;
  });

  return aanvragen.filter((aanvraag) => {
    if (isVerzilvering(aanvraag) || isPcVergoeding(aanvraag)) {
      return PCVergoedingAanvragenFiltered.includes(aanvraag);
    }
    return true;
  });
}

export function filterCombineUpcPcvData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const baseRegelingIdWithVerzilvering: string[] = [];
  const aanvragen_ =
    filterOutRedundantPcVergoedingsAanvraagRegelingAanvragenWhenWorkShopNietGevolgd(
      aanvragen
    );
  const aanvragenWithDocumentsCombined = aanvragen_.map((aanvraag) => {
    // Exclude baseRegelingen that have verzilvering
    if (baseRegelingIdWithVerzilvering.includes(aanvraag.id)) {
      return null;
    }

    // Add documenten to Verzilvering, e.g, (AV_PC{ZIL|TG})
    if (
      isVerzilvering(aanvraag) &&
      isAangevraagdVoorRegelingV3ActiefWerd(aanvraag.datumAanvraag)
    ) {
      // Find first corresponding baseRegeling
      const baseRegeling = aanvragen.find((compareAanvraag) =>
        isRegelingVanVerzilvering(aanvraag, compareAanvraag)
      );
      // If no baseRegeling is found or already used, this must be an orphaned verzilvering.
      // This can be the case when a user gets a (UPC|PCV)ZIL and a (UPC|PCV)TG for the same base regeling.
      // This happened at the end of 2024 when the PCV StadspasTegoed codes were introduced.
      if (
        !baseRegeling ||
        baseRegelingIdWithVerzilvering.includes(baseRegeling.id)
      ) {
        return null;
      }

      baseRegelingIdWithVerzilvering.push(baseRegeling.id);

      const addedDocs = baseRegeling?.documenten ?? [];

      return {
        ...aanvraag,
        titel: baseRegeling.titel,
        // Use Basis regeling to determine actualiteit en einde geldigheid.
        // If verzilvering is denied we treat regeling as "niet actueel"
        isActueel:
          aanvraag.resultaat === 'toegewezen'
            ? (baseRegeling?.isActueel ?? aanvraag.isActueel)
            : false,
        datumEindeGeldigheid: baseRegeling?.datumEindeGeldigheid ?? null,
        documenten: [...aanvraag.documenten, ...addedDocs],
      };
    }

    return aanvraag;
  });

  return aanvragenWithDocumentsCombined.filter(
    (aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed | null) =>
      aanvraag !== null
  );
}

/** Checks of een Workshop niet gevolgd is.
 * In Zorgned worden datumIngangGeldigheid en datumEindeGeledigheid gebruikt om aan te geven dat de workshop niet gevolgd is.
 * Als de workshop niet gevolgd is, zijn de datumIngangGeldigheid en datumEindeGeledigheid gelijk aan elkaar.
 */
export function isWorkshopNietGevolgd(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    isPcVergoeding(regeling) &&
    !isVerzilvering(regeling) &&
    !!(
      regeling.datumEindeGeldigheid &&
      regeling.datumIngangGeldigheid &&
      isSameDay(
        parseISO(regeling.datumEindeGeldigheid),
        parseISO(regeling.datumIngangGeldigheid)
      )
    ) &&
    regeling.resultaat == 'toegewezen'
  );
}

function descriptionDefinitief(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const betrokkenKinderen = getBetrokkenKinderenDescription(regeling);
  const titelLower = lowercaseFirstLetter(regeling.titel);
  return `<p>Uw kind ${betrokkenKinderen} krijgt een ${titelLower}. Lees in de brief hoe u de ${titelLower} bestelt.</p>
        ${regeling.datumEindeGeldigheid ? `<p>U kunt per ${defaultDateFormat(regeling.datumEindeGeldigheid)} opnieuw een ${titelLower} aanvragen.</p>` : ''}`;
}

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [
    {
      status: 'Besluit',
      datePublished: getUpcPcvDecisionDate,
      isChecked: () => true,
      isVisible: (regeling) => {
        // Alleen zichtbaar als regeling is aangevraagd nadat PC regeling v3 actief werd.
        return isPcRegelingV3Active()
          ? isAfter(
              regeling.datumAanvraag,
              subDays(PC_REGELING_V3_START_DATE, 1)
            )
          : false;
      },
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderenDescription(regeling);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' || isVerzilvering(regeling)
            ? descriptionDefinitief(regeling)
            : `U krijgt geen ${lowercaseFirstLetter(regeling.titel)} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
        }
        </p>
        ${regeling.resultaat === 'toegewezen' || isVerzilvering(regeling) ? '' : '<p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>'}
      `;
      },
    },
    {
      status: 'Besluit',
      datePublished: getUpcPcvDecisionDate,
      isChecked: () => true,
      isVisible: (regeling) =>
        isAangevraagdVoorRegelingV3ActiefWerd(regeling.datumAanvraag),
      isActive: (regeling) =>
        !isVerzilvering(regeling) && regeling.resultaat === 'afgewezen',
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderenDescription(regeling);
        const titelLower = lowercaseFirstLetter(regeling.titel);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' || isVerzilvering(regeling)
            ? `U krijgt een ${titelLower} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
            : `U krijgt geen ${titelLower} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
        }
        </p>
        ${regeling.resultaat === 'toegewezen' || isVerzilvering(regeling) ? '' : '<p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>'}
      `;
      },
    },
    {
      status: 'Workshop',
      isVisible: (regeling) =>
        isAangevraagdVoorRegelingV3ActiefWerd(regeling.datumAanvraag) &&
        !isVerzilvering(regeling) &&
        regeling.resultaat === 'toegewezen' &&
        !isWorkshopNietGevolgd(regeling),
      datePublished: '',
      isChecked: (regeling) => true,
      isActive: (regeling) => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderenDescription(regeling);
        return `
        <p>
         Voordat u de ${lowercaseFirstLetter(regeling.titel)} krijgt, moet uw kind ${betrokkenKinderen} een workshop volgen. Hiervoor moet u eerst een afspraak maken. In de brief staat hoe u dat doet.
        </p>
      `;
      },
    },
    {
      status: 'Workshop gevolgd',
      isVisible: (regeling) =>
        isAangevraagdVoorRegelingV3ActiefWerd(regeling.datumAanvraag) &&
        isVerzilvering(regeling) &&
        regeling.resultaat === 'toegewezen',
      datePublished: (regeling) => regeling.datumBesluit,
      isChecked: () => true,
      isActive: () => true,
      description: descriptionDefinitief,
    },
    {
      status: 'Workshop niet gevolgd',
      isVisible: (regeling) =>
        isAangevraagdVoorRegelingV3ActiefWerd(regeling.datumAanvraag) &&
        isWorkshopNietGevolgd(regeling),
      datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderenDescription(regeling);
        return `
        <p>
         Uw kind ${betrokkenKinderen} krijgt geen ${lowercaseFirstLetter(regeling.titel)}. De workshop is niet op tijd gevolgd. U kunt een nieuwe aanvraag doen.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.
        </p>
      `;
      },
    },
  ];

export const forTesting = {
  getBetrokkenKinderen: getBetrokkenKinderenDescription,
  getUpcPcvDecisionDate,
  isRegelingVanVerzilvering,
  isVerzilvering,
  isWorkshopNietGevolgd,
  filterCombineUpcPcvData,
  filterOutRedundantPcVergoedingsAanvraagRegelingAanvragenWhenWorkShopNietGevolgd,
};
