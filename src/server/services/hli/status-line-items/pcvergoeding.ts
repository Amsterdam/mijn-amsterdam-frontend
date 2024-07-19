import { isDateInPast } from '../../../../universal/helpers/date';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import {
  AV_PCVC,
  AV_PCVZIL,
  AV_UPCC,
  AV_UPCZIL,
} from '../hli-status-line-items';

function isVerzilvering(aanvraag: ZorgnedAanvraagTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_PCVZIL, AV_UPCZIL].includes(aanvraag.productIdentificatie)
  );
}

export function isEindeGeldigheidVerstreken(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return (
    !!aanvraag.datumEindeGeldigheid &&
    isDateInPast(aanvraag.datumEindeGeldigheid)
  );
}

function getUpcPcvDecisionDate(
  regeling: ZorgnedAanvraagTransformed,
  today: Date,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  const regelingProductId = regeling.productIdentificatie;
  if (regelingProductId === AV_PCVZIL || regelingProductId === AV_UPCZIL) {
    console.log(
      'íszills',
      allAanvragen.find((regeling) =>
        regelingProductId === AV_PCVZIL
          ? regeling.productIdentificatie === AV_PCVC
          : regeling.productIdentificatie === AV_UPCC
      )
    );
    return (
      allAanvragen.find((regeling) =>
        regelingProductId === AV_PCVZIL
          ? regeling.productIdentificatie === AV_PCVC
          : regeling.productIdentificatie === AV_UPCC
      )?.datumBesluit ?? regeling.datumBesluit
    );
  }
  return regeling.datumBesluit;
}

export const PCVERGOEDING: ZorgnedStatusLineItemTransformerConfig[] = [
  {
    status: 'Besluit',
    datePublished: getUpcPcvDecisionDate,
    isChecked: (stepIndex, regeling) => true,
    isActive: (stepIndex, regeling) =>
      !isVerzilvering(regeling) &&
      (regeling.isActueel === true || regeling.resultaat === 'afgewezen'),
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
];
