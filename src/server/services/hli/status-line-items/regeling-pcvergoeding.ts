import { isAfter, isSameDay, parseISO } from 'date-fns';

import { getBetrokkenDescription } from './generic';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_UPCTG = 'AV-UPCTG';

export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';
export const AV_PCVTG = 'AV-PCVTG';

function isVerzilvering(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVZIL, AV_UPCZIL, AV_PCVTG, AV_UPCTG].includes(
      aanvraag.productIdentificatie
    )
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

const verzilveringToRegelingCodeMap: {
  actual: Record<string, string>;
  historic: Record<string, string>;
} = {
  actual: {
    [AV_PCVTG]: AV_PCVC,
    [AV_UPCTG]: AV_UPCC,
  },
  historic: {
    [AV_PCVZIL]: AV_PCVC,
    [AV_UPCZIL]: AV_UPCC,
  },
};

function isRegelingVanVerzilvering(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  compareAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  if (!aanvraagProductId) {
    return false;
  }

  let avCode;

  if (isAfter(new Date(aanvraag.datumAanvraag), new Date('2024-12-31'))) {
    avCode = verzilveringToRegelingCodeMap.actual[aanvraagProductId];
  } else {
    avCode = verzilveringToRegelingCodeMap.historic[aanvraagProductId];
  }

  return (
    compareAanvraag.productIdentificatie === avCode &&
    compareAanvraag.betrokkenen.some((id) =>
      aanvraag.betrokkenen.includes(id)
    ) &&
    compareAanvraag.resultaat !== 'afgewezen'
  );
}

function getUpcPcvDecisionDate(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  today: Date,
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

export function filterCombineUpcPcvData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const baseRegelingIdWithVerzilvering: string[] = [];

  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag, index) => {
    // Exclude baseRegelingen that have verzilvering
    if (baseRegelingIdWithVerzilvering.includes(aanvraag.id)) {
      return null;
    }

    // Add documenten to Verzilvering, e.g, (AV_PC{ZIL|TG})
    if (isVerzilvering(aanvraag)) {
      // Find first corresponding baseRegeling
      const baseRegeling = aanvragen.find((compareAanvraag) =>
        isRegelingVanVerzilvering(aanvraag, compareAanvraag)
      );

      // If no baseRegeling is found, this must be an orphaned verzilvering.
      if (!baseRegeling) {
        return null;
      }

      baseRegelingIdWithVerzilvering.push(baseRegeling.id);

      const addedDocs = baseRegeling?.documenten ?? [];

      return {
        ...aanvraag,
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
 *
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

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [
    {
      status: 'Besluit',
      datePublished: getUpcPcvDecisionDate,
      isChecked: (regeling) => true,
      isActive: (regeling) =>
        !isVerzilvering(regeling) && regeling.resultaat === 'afgewezen',
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenDescription(regeling);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' || isVerzilvering(regeling)
            ? `U krijgt een ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
            : `U krijgt geen ${regeling.titel} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
        }
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' || isVerzilvering(regeling) ? '' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
        </p>
      `;
      },
    },
    {
      status: 'Workshop',
      isVisible: (regeling) =>
        !isVerzilvering(regeling) &&
        regeling.resultaat === 'toegewezen' &&
        !isWorkshopNietGevolgd(regeling),
      datePublished: '',
      isChecked: (regeling) => true,
      isActive: (regeling) => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenDescription(regeling);
        return `
        <p>
         Voordat u de laptop krijgt, moet uw kind ${betrokkenKinderen} een workshop volgen. Hiervoor moet u eerst een afspraak maken. In de brief staat hoe u dat doet.
        </p>
      `;
      },
    },
    {
      status: 'Workshop gevolgd',
      isVisible: (regeling) =>
        isVerzilvering(regeling) && regeling.resultaat === 'toegewezen',
      datePublished: (regeling) => regeling.datumBesluit,
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenDescription(regeling);
        return `<p>Uw kind ${betrokkenKinderen} krijgt een ${regeling.titel}. Lees in de brief hoe u de laptop of tablet bestelt.</p>
        ${regeling.datumEindeGeldigheid ? `<p>U kunt per ${defaultDateFormat(regeling.datumEindeGeldigheid)} opnieuw een ${regeling.titel} aanvragen.</p>` : ''}`;
      },
    },
    {
      status: 'Workshop niet gevolgd',
      isVisible: (regeling) => isWorkshopNietGevolgd(regeling),
      datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenDescription(regeling);
        return `
        <p>
         Uw kind ${betrokkenKinderen} krijgt geen ${regeling.titel}. De workshop is niet op tijd gevolgd. U kunt een nieuwe aanvraag doen.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.
        </p>
      `;
      },
    },
  ];

export const forTesting = {
  getBetrokkenKinderen: getBetrokkenDescription,
  getUpcPcvDecisionDate,
  isRegelingVanVerzilvering,
  isVerzilvering,
  isWorkshopNietGevolgd,
  filterCombineUpcPcvData,
};
