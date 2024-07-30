import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import { EINDE_RECHT } from './generic';

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';

// Excludes AV_UPCC if AV_UPCZIL is found
// Excludes AV_PCVC if AV_PCVZIL is found
export function shouldIncludePcvcUpcc(
  aanvraag: ZorgnedAanvraagTransformed,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  const productIdentificatie = aanvraag.productIdentificatie;

  // Excludes aanvragen that have a verzilvering
  if (productIdentificatie === AV_UPCC || productIdentificatie === AV_PCVC) {
    const hasVerzilvering = allAanvragen.some((compareAanvraag) =>
      isVerzilveringVanRegeling(aanvraag, compareAanvraag)
    );
    return !hasVerzilvering;
  }

  return true;
}

// TODO: implement, kunnen er meerdere verzilveringen zijn voor één regeling
// die afgewezen worden. Adhv welke data kunnen we dan zien of een verzilvering wel/niet gebruikt moet worden.
function excludeRedundantVerzilveringen(
  aanvragen: ZorgnedAanvraagTransformed[]
) {
  const aanvragenFiltered = aanvragen;

  return aanvragenFiltered;
}

export function shouldExcludePcvZilUpcZil(
  aanvraag: ZorgnedAanvraagTransformed,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  const productIdentificatie = aanvraag.productIdentificatie;

  // Excludes aanvragen that have a verzilvering
  if (
    productIdentificatie === AV_UPCZIL ||
    productIdentificatie === AV_PCVZIL
  ) {
    const hasVerzilvering = allAanvragen.some((compareAanvraag) =>
      isVerzilveringVanRegeling(aanvraag, compareAanvraag)
    );
    return !hasVerzilvering;
  }

  return true;
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

export function combineUpcPcvData(aanvragen: ZorgnedAanvraagTransformed[]) {
  // Add AV_PCVC / AV_UPCC documenten to AV_PCVZIL / AV_UPCZIL
  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag) => {
    if (isVerzilvering(aanvraag)) {
      const baseRegeling = aanvragen.find((compareAanvraag) =>
        isRegelingVanVerzilvering(aanvraag, compareAanvraag)
      );
      const addedDocs = baseRegeling?.documenten ?? [];
      return {
        ...aanvraag,
        // Use Basis regeling om actualiteit en einde geldigheid te bepalen
        isActueel: baseRegeling?.isActueel ?? aanvraag.isActueel,
        datumEindeGeldigheid: baseRegeling?.datumEindeGeldigheid ?? null,
        documenten: [...aanvraag.documenten, ...addedDocs],
      };
    }
    return aanvraag;
  });

  return aanvragenWithDocumentsCombined;
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
            ? `U heeft recht op een ${regeling.titel}. U moet hiervoor eerst een cursus volgen`
            : `U heeft geen recht op een ${regeling.titel}`
        }.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  {
    status: 'Cursus',
    isVisible: (stepIndex, regeling) =>
      (!isVerzilvering(regeling) && regeling.resultaat !== 'afgewezen') ||
      (isVerzilvering(regeling) && regeling.resultaat !== 'toegewezen'),
    datePublished: '',
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) => true,
    description: (regeling) =>
      `
        <p>
         Wij wachten op de uitslag van uw te volgen cursus.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  {
    status: 'Cursus voldaan',
    isVisible: (stepIndex, regeling) =>
      isVerzilvering(regeling) && regeling.resultaat === 'toegewezen',
    datePublished: (regeling) => regeling.datumBesluit,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) => regeling.isActueel,
    description: (regeling) =>
      `
        <p>
         U heeft voldaan aan de cursus voorwaarde voor het recht op ${regeling.titel}.
        </p>
        <p>
          In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken of een klacht kan indienen.
        </p>
      `,
  },
  EINDE_RECHT,
];

export const forTesting = {
  isVerzilvering,
  isVerzilveringVanRegeling,
  isRegelingVanVerzilvering,
  getUpcPcvDecisionDate,
};
