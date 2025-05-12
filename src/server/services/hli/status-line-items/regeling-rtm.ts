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

function isRTMDeel1(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

function isRTMDeel2(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

// Zoek bijbehorende regelingDeel1
function isRegelingDeel1GekoppeldAanDeel2(
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

function getRtmDecisionDate(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  if (isRTMDeel1(aanvraag)) {
    const regelingDeel1 = allAanvragen.find((compareAanvraag) =>
      isRegelingDeel1GekoppeldAanDeel2(aanvraag, compareAanvraag)
    );
    return regelingDeel1?.datumBesluit ?? aanvraag.datumBesluit;
  }
  return aanvraag.datumBesluit;
}

export function filterCombineRtmData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const baseRegelingIdWithDeel2: string[] = [];

  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag) => {
    // Exclude baseRegelingen that have deel2
    if (baseRegelingIdWithDeel2.includes(aanvraag.id)) {
      return null;
    }

    // Add AV_RTM_DEEL1 documenten to AV_RTM_DEEL2
    if (isRTMDeel1(aanvraag)) {
      // Find first corresponding regelingDeel1
      const regelingDeel1 = aanvragen.find((compareAanvraag) =>
        isRegelingDeel1GekoppeldAanDeel2(aanvraag, compareAanvraag)
      );

      if (!regelingDeel1) {
        return null;
      }

      baseRegelingIdWithDeel2.push(regelingDeel1.id);

      const addedDocs = regelingDeel1?.documenten ?? [];

      return {
        ...aanvraag,
        // Use Basis regeling to determine actualiteit en einde geldigheid.
        // If deel2 is denied we treat regeling as "niet actueel"
        isActueel:
          aanvraag.resultaat === 'toegewezen'
            ? (regelingDeel1?.isActueel ?? aanvraag.isActueel)
            : false,
        datumEindeGeldigheid: regelingDeel1?.datumEindeGeldigheid ?? null,
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

export function heeftDeel2VanDeRegelingNietVoltooid(
  regeling: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    isRTMDeel2(regeling) &&
    !isRTMDeel1(regeling) &&
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
      datePublished: getRtmDecisionDate,
      isChecked: (regeling) => true,
      isActive: (regeling) =>
        !isRTMDeel1(regeling) && regeling.resultaat === 'afgewezen',
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `<p>
        ${
          regeling.resultaat === 'toegewezen' || isRTMDeel1(regeling)
            ? `U krijgt ${regeling.titel} per ${regeling.datumIngangGeldigheid ? defaultDateFormat(regeling.datumIngangGeldigheid) : ''} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
            : `U krijgt geen ${regeling.titel} voor uw kind${betrokkenKinderen ? ` ${betrokkenKinderen}` : ''}.`
        }
        </p>
        <p>
          ${regeling.resultaat === 'toegewezen' || isRTMDeel1(regeling) ? '' : 'In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.'}
        </p>
      `;
      },
    },
    {
      status: 'Uitnodiging afspraak GGD',
      isVisible: (regeling) =>
        !isRTMDeel1(regeling) &&
        regeling.resultaat === 'toegewezen' &&
        !heeftDeel2VanDeRegelingNietVoltooid(regeling),
      datePublished: '',
      isChecked: (regeling) => true,
      isActive: (regeling) => true,
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
      isVisible: (regeling) =>
        isRTMDeel1(regeling) && regeling.resultaat === 'toegewezen',
      datePublished: (regeling) => regeling.datumBesluit,
      isChecked: () => true,
      isActive: () => true,
      description: (regeling) => {
        const betrokkenKinderen = getBetrokkenKinderen(regeling);
        return `<p>Uw kind ${betrokkenKinderen} krijgt ${regeling.titel}. Lees in de brief meer informatie over deze regeling.</p>
        ${regeling.datumEindeGeldigheid ? `<p>U kunt per ${defaultDateFormat(regeling.datumEindeGeldigheid)} opnieuw ${regeling.titel} aanvragen.</p>` : ''}`;
      },
    },
    {
      status: 'Afspraak GGD niet gemaakt',
      isVisible: (regeling) => heeftDeel2VanDeRegelingNietVoltooid(regeling),
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
  getRtmDecisionDate,
  isRegelingDeel1GekoppeldAanDeel2,
  isDeel2VanDeRegeling: isRTMDeel1,
  heeftDeel2VanDeRegelingNietVoltooid,
};
