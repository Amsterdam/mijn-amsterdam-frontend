import { isSameDay, parseISO } from 'date-fns';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';

function getBetrokkenKinderen(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return regeling.betrokkenPersonen
    .map((person) => `(${person.name} - ${person.dateOfBirthFormatted})`)
    .join(', ');
}

function isVerzilvering(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVZIL, AV_UPCZIL].includes(aanvraag.productIdentificatie)
  );
}

function isVerzilveringVanRegeling(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  compareAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
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
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  compareAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
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

    // Add AV_PCVC / AV_UPCC documenten to AV_PCVZIL / AV_UPCZIL
    if (isVerzilvering(aanvraag)) {
      // Find first corresponding baseRegeling
      const baseRegeling = aanvragen.find((compareAanvraag) =>
        isRegelingVanVerzilvering(aanvraag, compareAanvraag)
      );
      if (baseRegeling) {
        baseRegelingIdWithVerzilvering.push(baseRegeling.id);
      }
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
    }

    return aanvraag;
  });

  return aanvragenWithDocumentsCombined.filter(
    (aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed | null) =>
      aanvraag !== null
  );
}

export function isWorkshopNietGevolgd(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
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

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [
    {
      status: 'Besluit',
      datePublished: getUpcPcvDecisionDate,
      isChecked: (stepIndex, regeling) => true,
      isActive: (stepIndex, regeling) =>
        !isVerzilvering(regeling) && regeling.resultaat === 'afgewezen',
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' || isVerzilvering(regeling)
            ? `U krijgt een ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor uw kind ${betrokkenKinderen}`
            : `U krijgt geen ${regeling.titel} voor uw kind ${betrokkenKinderen}`
        }.
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' || isVerzilvering(regeling) ? '' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
        </p>
      `;
      },
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
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `
        <p>
         Voordat u de laptop krijgt, moet uw kind ${betrokkenKinderen} een workshop volgen. Hiervoor moet u eerst een afspraak maken. In de brief staat hoe u dat doet.
        </p>
      `;
      },
    },
    {
      status: 'Workshop gevolgd',
      isVisible: (stepIndex, regeling) =>
        isVerzilvering(regeling) && regeling.resultaat === 'toegewezen',
      datePublished: (regeling) => regeling.datumBesluit,
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `
        <p>
         Uw kind ${betrokkenKinderen} krijgt een ${regeling.titel}. Lees in de brief hoe u de laptop of tablet bestelt.
        </p>
        ${regeling.datumEindeGeldigheid ? `<p>Deze regeling is geldig tot ${defaultDateFormat(regeling.datumEindeGeldigheid)}` : ''}.</p>
      `;
      },
    },
    {
      status: 'Workshop niet gevolgd',
      isVisible: (stepIndex, regeling) => isWorkshopNietGevolgd(regeling),
      datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
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
  isVerzilvering,
  isVerzilveringVanRegeling,
  isRegelingVanVerzilvering,
  getUpcPcvDecisionDate,
  isWorkshopNietGevolgd,
};
