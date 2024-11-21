import { isSameDay, parseISO } from 'date-fns';

import { getBetrokkenKinderen } from './generic';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';

// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

function isAfspraakDeelVanDeRegeling(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

function isVoorwaardenVoorEenAfspraakDeelVanDeRegeling(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

function isAfspraakDeelVanDeRegelingVanRegeling(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  compareAanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  let avCode;

  if (aanvraagProductId === AV_RTM_DEEL1) {
    avCode = AV_RTM_DEEL2;
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

  if (aanvraagProductId === AV_RTM_DEEL2) {
    avCode = AV_RTM_DEEL1;
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
  if (isAfspraakDeelVanDeRegeling(aanvraag)) {
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

  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag) => {
    // Exclude baseRegelingen that have verzilvering
    if (baseRegelingIdWithVerzilvering.includes(aanvraag.id)) {
      return null;
    }

    // Add AV_RTM_DEEL1 documenten to AV_RTM_DEEL2
    if (isAfspraakDeelVanDeRegeling(aanvraag)) {
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

export function isNietOpUitnodigingIngegaan(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    isVoorwaardenVoorEenAfspraakDeelVanDeRegeling(regeling) &&
    !isAfspraakDeelVanDeRegeling(regeling) &&
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

export const RTM: ZorgnedStatusLineItemTransformerConfig<ZorgnedAanvraagWithRelatedPersonsTransformed>[] =
  [
    {
      status: 'Besluit',
      datePublished: getUpcPcvDecisionDate,
      isChecked: (stepIndex, regeling) => true,
      isActive: (stepIndex, regeling) =>
        !isAfspraakDeelVanDeRegeling(regeling) &&
        regeling.resultaat === 'afgewezen',
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' ||
          isAfspraakDeelVanDeRegeling(regeling)
            ? `U krijgt een ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
            : `U krijgt geen ${regeling.titel} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
        }
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' || isAfspraakDeelVanDeRegeling(regeling) ? '' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
        </p>
      `;
      },
    },
    {
      status: 'Uitnodiging afspraak GGD',
      isVisible: (stepIndex, regeling) =>
        !isAfspraakDeelVanDeRegeling(regeling) &&
        regeling.resultaat === 'toegewezen' &&
        !isNietOpUitnodigingIngegaan(regeling),
      datePublished: '',
      isChecked: (stepIndex, regeling) => true,
      isActive: (stepIndex, regeling) => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `
        <p>
         Voordat uw kind ${betrokkenKinderen} de ${regeling.titel} krijgt, moet u een afspraak maken bij de GGD. In de brief staat hoe u dat doet.
        </p>
      `;
      },
    },
    {
      status: 'Afspraak GGD afgerond',
      isVisible: (stepIndex, regeling) =>
        isAfspraakDeelVanDeRegeling(regeling) &&
        regeling.resultaat === 'toegewezen',
      datePublished: (regeling) => regeling.datumBesluit,
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `<p>Uw kind ${betrokkenKinderen} krijgt een ${regeling.titel}. Lees in de brief hoe u dat doet.</p>
        ${regeling.datumEindeGeldigheid ? `<p>U kunt per ${defaultDateFormat(regeling.datumEindeGeldigheid)} opnieuw een ${regeling.titel} aanvragen.</p>` : ''}`;
      },
    },
    {
      status: 'Afspraak GGD niet gemaakt',
      isVisible: (stepIndex, regeling) => isNietOpUitnodigingIngegaan(regeling),
      datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `
        <p>
         Uw kind ${betrokkenKinderen} krijgt geen ${regeling.titel}. U heeft niet op tijd een afspraak bij de GGD gemaakt. U kunt een nieuwe aanvraag doen.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.
        </p>
      `;
      },
    },
  ];

export const forTesting = {
  getBetrokkenKinderen,
  getUpcPcvDecisionDate,
  isRegelingVanVerzilvering,
  isAfspraakDeelVanDeRegeling,
  isAfspraakDeelVanDeRegelingVanRegeling,
  isNietOpUitnodigingIngegaan,
};
