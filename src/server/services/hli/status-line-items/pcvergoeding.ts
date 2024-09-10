import { isSameDay, parseISO } from 'date-fns';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';

// TODO: implement, kunnen er meerdere verzilveringen zijn voor één regeling
// die afgewezen worden. Adhv welke data kunnen we dan zien of een verzilvering wel/niet gebruikt moet worden.
function excludeRedundantVerzilveringen(
  aanvragen: ZorgnedAanvraagTransformed[]
) {
  const aanvragenFiltered = aanvragen;

  return aanvragenFiltered;
}

function isPcVergoeding(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVC, AV_UPCC].includes(aanvraag.productIdentificatie)
  );
}

function isVerzilvering(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVZIL, AV_UPCZIL].includes(aanvraag.productIdentificatie)
  );
}

function isVerzilveringVanRegeling(
  aanvraag: ZorgnedAanvraagTransformed,
  compareAanvraag: ZorgnedAanvraagTransformed
) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  let avCode;

  if (aanvraagProductId === AV_PCVC) {
    avCode = AV_PCVZIL;
  }

  if (aanvraagProductId === AV_UPCC) {
    avCode = AV_UPCZIL;
  }

  return (
    compareAanvraag.productIdentificatie === avCode &&
    compareAanvraag.betrokkenen.some((id) => aanvraag.betrokkenen.includes(id))
  );
}

function isRegelingVanVerzilvering(
  aanvraag: ZorgnedAanvraagTransformed,
  compareAanvraag: ZorgnedAanvraagTransformed
) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  let avCode;

  if (aanvraagProductId === AV_PCVZIL) {
    avCode = AV_PCVC;
  }
  if (aanvraagProductId === AV_UPCZIL) {
    avCode = AV_UPCC;
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
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagTransformed[]
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
  aanvragen: ZorgnedAanvraagTransformed[]
) {
  // Add AV_PCVC / AV_UPCC documenten to AV_PCVZIL / AV_UPCZIL
  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag) => {
    if (isVerzilvering(aanvraag)) {
      const baseRegeling = aanvragen.find((compareAanvraag) =>
        isRegelingVanVerzilvering(aanvraag, compareAanvraag)
      );
      const addedDocs = baseRegeling?.documenten ?? [];

      return {
        ...aanvraag,
        // Use Basis regeling to determine actualiteit en einde geldigheid.
        // If verzilvering is denied we treat regeling as "niet actueel"
        isActueel:
          aanvraag.resultaat === 'toegewezen'
            ? baseRegeling?.isActueel ?? aanvraag.isActueel
            : false,
        datumEindeGeldigheid: baseRegeling?.datumEindeGeldigheid ?? null,
        documenten: [...aanvraag.documenten, ...addedDocs],
      };
    } else if (
      // Exclude the aanvraag if it's a PcVergoeding that also has a Verzilvering.
      // Data of this aanvraag will be added to the corresponding vergoeding
      isPcVergoeding(aanvraag) &&
      aanvragen.some((compareAanvraag) =>
        isVerzilveringVanRegeling(aanvraag, compareAanvraag)
      )
    ) {
      return null;
    }

    return aanvraag;
  });

  return aanvragenWithDocumentsCombined.filter(
    (aanvraag: ZorgnedAanvraagTransformed | null) => aanvraag !== null
  );
}

export function isWorkshopNietGevolgd(regeling: ZorgnedAanvraagTransformed) {
  return (
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

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: getUpcPcvDecisionDate,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) =>
      !isVerzilvering(regeling) && regeling.resultaat === 'afgewezen',
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen' || isVerzilvering(regeling)
            ? `Uw kind heeft recht op een ${regeling.titel}`
            : `Uw kind heeft geen recht op een ${regeling.titel}`
        }.
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' || isVerzilvering(regeling) ? '' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.'}
        </p>
      `,
  },
  {
    status: 'Workshop',
    isVisible: (stepIndex, regeling) =>
      !isVerzilvering(regeling) &&
      regeling.resultaat === 'toegewezen' &&
      !isWorkshopNietGevolgd(regeling),
    datePublished: '',
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) => true,
    description: (regeling) =>
      `
        <p>
         U moet eerst een afspraak maken voor de workshop. In de brief staat hoe u dat doet.
        </p>
      `,
  },
  {
    status: 'Workshop gevolgd',
    isVisible: (stepIndex, regeling) =>
      isVerzilvering(regeling) && regeling.resultaat === 'toegewezen',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: () => true,
    isActive: () => true,
    description: (regeling) =>
      `
        <p>
         Uw kind krijgt een ${regeling.titel}. Lees in de brief hoe u de laptop of tablet bestelt.
        </p>
        <p>De laptop of tablet is voor een periode van 5 jaar${regeling.datumEindeGeldigheid ? ` tot ${defaultDateFormat(regeling.datumEindeGeldigheid)}` : ''}.
      `,
  },
  {
    status: 'Workshop niet gevolgd',
    isVisible: (stepIndex, regeling) => isWorkshopNietGevolgd(regeling),
    datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
    isChecked: () => true,
    isActive: () => true,
    description: (regeling) =>
      `
        <p>
         Uw kind krijgt geen ${regeling.titel}. De workshop is niet op tijd gevolgd. U kunt een nieuwe aanvraag doen.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
];

export const forTesting = {
  isVerzilvering,
  isVerzilveringVanRegeling,
  isRegelingVanVerzilvering,
  getUpcPcvDecisionDate,
  isWorkshopNietGevolgd,
};
