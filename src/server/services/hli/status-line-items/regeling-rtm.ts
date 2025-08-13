import { isAfter } from 'date-fns';

import { BESLUIT, EINDE_RECHT, isAanvrager } from './generic';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import type { ZorgnedHLIRegeling } from '../hli-regelingen-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

export const RTM_STATUS_IN_BEHANDELING = 'In behandeling genomen';

export function isRTMDeel2(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

export function isRTMDeel1(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

/** Aanvragen can contain duplicate RTMDeel2. We combine the documents and drop the dupe. */
function dedupCombineRTMDeel2(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const dedupedAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];
  const seenAanvragen: Record<string, ZorgnedHLIRegeling> = {};

  for (const aanvraag of structuredClone(aanvragen)) {
    if (!isRTMDeel2(aanvraag)) {
      dedupedAanvragen.push(aanvraag);
      continue;
    }
    const id = aanvraag.beschiktProductIdentificatie;
    if (seenAanvragen[id]) {
      seenAanvragen[id].documenten.push(...aanvraag.documenten);
      continue;
    }
    seenAanvragen[id] = aanvraag;
    dedupedAanvragen.push(aanvraag);
  }
  return dedupedAanvragen;
}

export function filterCombineRtmData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedHLIRegeling[] {
  const dedupedAanvragen = dedupCombineRTMDeel2(aanvragen);

  // The aanvragen are sorted by datumIngangGeldigheid/DESC
  // The first unseen deel1 aanvraag after a deel2 aanvraag is ___MOST_LIKELY___ related to that deel2 aanvraag.
  const deel2Aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];
  const combinedAanvragen: ZorgnedHLIRegeling[] = [];
  for (const aanvraag of dedupedAanvragen) {
    if (isRTMDeel2(aanvraag)) {
      deel2Aanvragen.push(aanvraag);
      continue;
    }
    if (isRTMDeel1(aanvraag)) {
      const deel1 = aanvraag;
      if (deel1.resultaat !== 'toegewezen') {
        combinedAanvragen.push(deel1);
        continue;
      }
      const deel2 = deel2Aanvragen.pop();
      if (!deel2) {
        // This deel1 does not belong to any deel2.
        combinedAanvragen.push(deel1);
        continue;
      }
      combinedAanvragen.push({
        ...deel2,
        datumInBehandeling: deel1?.datumBesluit,
        datumAanvraag: deel1?.datumAanvraag ?? deel2.datumAanvraag,
        betrokkenen: [...deel1.betrokkenen], // TODO: Will the RTM deel2 have betrokkenen?
        documenten: dedupDocuments([...deel2.documenten, ...deel1.documenten]),
      });
      continue;
    }
    combinedAanvragen.push(aanvraag);
  }

  combinedAanvragen.push(...deel2Aanvragen);
  return combinedAanvragen;
}

function dedupDocuments(
  docs: ZorgnedHLIRegeling['documenten']
): ZorgnedHLIRegeling['documenten'] {
  const seen = new Set();

  const deduped = docs.filter((doc) => {
    // datePublished includes miliseconds and it would be most unlikely -
    // for two different documents to be made at such an exact time.
    const id = doc.title + doc.datePublished;

    const hasDuplicate = seen.has(id);
    seen.add(id);
    return !hasDuplicate;
  });

  return deduped;
}

function getRtmDescriptionDeel1Toegewezen(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  let description = `<p>Voordat u de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;

  // Betrokkenen always has the aanvrager listed as well.
  const isAanvraagVoorMeerdereBetrokkenen = aanvraag.betrokkenen.length > 1;

  if (isAanvraagVoorMeerdereBetrokkenen) {
    description += `<p><strong>Vraagt u de ${aanvraag.titel} (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
    <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
    `;

    description += `<p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
  }

  return description;
}

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

const getNotEveryYearDescription = (regeling: ZorgnedHLIRegeling) => `
<p>U hoeft de ${regeling.titel} niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
<p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
<p><a href="${INFO_LINK}">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`;

const isEindeRechtForBetrokkenenActive = (regeling: ZorgnedHLIRegeling) =>
  isRTMDeel2(regeling) &&
  regeling.resultaat === 'toegewezen' &&
  regeling.isActueel === false &&
  !regeling.datumInBehandeling;

const isToegewezenEindeRecht = (regeling: ZorgnedHLIRegeling) =>
  !!regeling.datumInBehandeling && regeling.resultaat === 'toegewezen';

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
          (isRTMDeel1(aanvraag) && aanvraag.resultaat === 'toegewezen') ||
          (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag) // dateInBehandeling is een property die wordt togevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
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
      status: RTM_STATUS_IN_BEHANDELING,
      isChecked: true,
      description: getRtmDescriptionDeel1Toegewezen,
      isVisible(aanvraag) {
        return (
          (isRTMDeel1(aanvraag) && aanvraag.resultaat === 'toegewezen') ||
          (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag) // dateInBehandeling is een property die wordt toegevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
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
    // Einde recht - voor RTM Deel 2. Voor de aanvrager.
    {
      ...EINDE_RECHT,
      isVisible(regeling) {
        return isRTMDeel2(regeling) && isToegewezenEindeRecht(regeling);
      },
      description(regeling) {
        if (
          !!regeling.datumEindeGeldigheid &&
          isAfter(new Date(), regeling.datumEindeGeldigheid)
        ) {
          return `
        <p>Uw recht op ${regeling.titel} is beëindigd per ${defaultDateFormat(regeling.datumEindeGeldigheid)}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
        }
        return getNotEveryYearDescription(regeling);
      },
    },
    // Einde recht - voor RTM Deel 2. Voor de betrokkenen.
    {
      ...EINDE_RECHT,
      isVisible(regeling) {
        return isRTMDeel2(regeling) && !isToegewezenEindeRecht(regeling);
      },
      isChecked: isEindeRechtForBetrokkenenActive,
      isActive: isEindeRechtForBetrokkenenActive,
      description(regeling, today, allAanvragen) {
        const baseDescription =
          typeof EINDE_RECHT.description === 'function'
            ? EINDE_RECHT.description(regeling, today, allAanvragen)
            : EINDE_RECHT.description || '';
        // Betrokkenen always has the aanvrager listed as well.
        const isAanvraagVoorMeerdereBetrokkenen =
          regeling.betrokkenen.length > 1;
        const isAanvrager_ = isAanvrager(regeling);
        if (!isEindeRechtForBetrokkenenActive(regeling)) {
          return getNotEveryYearDescription(regeling);
        }
        if (!isAanvraagVoorMeerdereBetrokkenen) {
          return baseDescription;
        }
        return (
          baseDescription +
          `<p>
            ${isAanvrager_ ? 'Wordt uw kind 18? Dan moet uw kind deze regeling voor zichzelf aanvragen.' : 'Bent u net of binnenkort 18 jaar oud? Dan moet u deze regeling voor uzelf aanvragen.'} <a href="${INFO_LINK}">Lees meer over de voorwaarden</a>.
          </p>
          `
        );
      },
    },
  ];

export const forTesting = {
  isRTMDeel2,
};
