import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';

export const AV_UPCC = 'AV-UPCC';
export const AV_UPCZIL = 'AV-UPCZIL';
export const AV_PCVC = 'AV-PCVC';
export const AV_PCVZIL = 'AV-PCVZIL';

// Excludes AV_UPCC if AV_UPCZIL is found
// Excludes AV_PCVC if AV_PCVZIL is found
export function maybeExcludePcvcUpcc(
  aanvraag: ZorgnedAanvraagTransformed,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  const productIdentificatie = aanvraag.productIdentificatie;

  const hasUPCZIL = allAanvragen.some(
    (aanvraag) => aanvraag.productIdentificatie === AV_UPCZIL
  );
  const hasPCVZIL = allAanvragen.some(
    (aanvraag) => aanvraag.productIdentificatie === AV_PCVZIL
  );

  //
  switch (true) {
    case productIdentificatie === AV_UPCC && hasUPCZIL:
      return false;
    case productIdentificatie === AV_PCVC && hasPCVZIL:
      return false;
  }

  return true;
}

function isVerzilvering(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVZIL, AV_UPCZIL].includes(aanvraag.productIdentificatie)
  );
}

function isOppositeOf(aanvraag: ZorgnedAanvraagTransformed) {
  const aanvraagProductId = aanvraag.productIdentificatie;
  if (!aanvraagProductId || aanvraag.resultaat === 'afgewezen') {
    return false;
  }
  const avCode = aanvraagProductId === AV_PCVZIL ? AV_PCVC : AV_UPCC;
  return aanvraagProductId === avCode;
}

function getUpcPcvDecisionDate(
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  if (isVerzilvering(aanvraag)) {
    const oppositeOfVerzilvering = allAanvragen.find(isOppositeOf);
    return oppositeOfVerzilvering?.datumBesluit ?? aanvraag.datumBesluit;
  }
  return aanvraag.datumBesluit;
}

export function combineUpcPcvDocuments(
  aanvragen: ZorgnedAanvraagTransformed[]
) {
  // Add AV_PCVC / AV_UPCC documenten to AV_PCVZIL / AV_UPCZIL
  const aanvragenWithDocumentsCombined = aanvragen.map((aanvraag) => {
    if (isVerzilvering(aanvraag)) {
      const addedDocs = aanvragen.find(isOppositeOf)?.documenten ?? [];
      return {
        ...aanvraag,
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
      !isVerzilvering(regeling) &&
      (regeling.resultaat === 'afgewezen' || regeling.isActueel === true),
    description: (regeling) =>
      `<p>
        ${
          regeling.resultaat === 'toegewezen'
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
      !isVerzilvering(regeling) && regeling.resultaat !== 'afgewezen',
    datePublished: getUpcPcvDecisionDate,
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
    status: 'Cursus niet voldaan',
    isVisible: (stepIndex, aanvraag) =>
      isVerzilvering(aanvraag) && aanvraag.resultaat === 'afgewezen',
    datePublished: (aanvraag) => aanvraag.datumBesluit,
    isChecked: (stepIndex, aanvraag) => true,
    isActive: (stepIndex, aanvraag) => true,
    description: (aanvraag) =>
      `
        <p>
         U heeft geen recht op ${aanvraag.titel}
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
    isActive: (stepIndex, regeling) => true,
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
  {
    status: 'Einde recht',
    isVisible: (i, regeling) =>
      isVerzilvering(regeling) && regeling.resultaat === 'toegewezen',
    datePublished: (regeling) => regeling.datumEindeGeldigheid ?? '',
    isChecked: () => false,
    isActive: (stepIndex, regeling) => regeling.isActueel === false,
    description: (regeling) =>
      `
        <p>
          ${
            regeling.isActueel
              ? `Uw recht op ${regeling.titel} stopt per ${regeling.datumEindeGeldigheid ? defaultDateFormat(regeling.datumEindeGeldigheid) : ''}.`
              : `Uw recht op ${regeling.titel} is beëindigd ${
                  regeling.datumEindeGeldigheid
                    ? `per ${defaultDateFormat(regeling.datumEindeGeldigheid)}`
                    : ''
                }`
          }
        </p>
      `,
  },
];
