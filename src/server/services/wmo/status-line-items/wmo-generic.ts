import isAfter from 'date-fns/isAfter';
import isSameDay from 'date-fns/isSameDay';
import parseISO from 'date-fns/parseISO';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../../universal/helpers/date';
import { GenericDocument } from '../../../../universal/types';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import {
  DOCUMENT_TITLE_BESLUIT_STARTS_WITH,
  DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH,
  DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  DOCUMENT_PGB_BESLUIT,
} from '../wmo-config-and-types';

export function getDocumentDecisionDate(documents: GenericDocument[]) {
  return (
    documents.find((document) =>
      document.title.startsWith(DOCUMENT_TITLE_BESLUIT_STARTS_WITH)
    )?.datePublished ?? null
  );
}

function getDecisionDate(
  aanvraag: ZorgnedAanvraagTransformed,
  doTransformDate: boolean = false
) {
  let decisionDate = isDocumentDecisionDateActive(aanvraag.datumAanvraag)
    ? getDocumentDecisionDate(aanvraag.documenten)
    : aanvraag.datumBesluit;

  if (doTransformDate && decisionDate) {
    decisionDate = defaultDateFormat(decisionDate);
  }
  return decisionDate ?? null;
}

function getDecisionDateTransformed(aanvraag: ZorgnedAanvraagTransformed) {
  const DO_TRANSFORM = true;
  return getDecisionDate(aanvraag, DO_TRANSFORM);
}

export function getDocumentMeerInformatieDate(documents: GenericDocument[]) {
  return (
    documents.find((document) =>
      document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
    )?.datePublished ?? null
  );
}

export function hasMeerInformatieNodig(aanvraag: ZorgnedAanvraagTransformed) {
  return aanvraag.documenten.some((document) =>
    document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
  );
}

export function isAfterWCAGValidDocumentsDate(date: string) {
  return isAfter(parseISO(date), MINIMUM_REQUEST_DATE_FOR_DOCUMENTS);
}

// TODO: Determine if there are any other conditions that can be used.
// For example we might want to enable the document decision date based on a fixed date.
// It's unknown right now if all the existing data (documents) adhere to the updated document names.
function isDocumentDecisionDateActive(datumAanvraag: string) {
  return (
    isAfterWCAGValidDocumentsDate(datumAanvraag) &&
    FeatureToggle.zorgnedDocumentDecisionDateActive
  );
}

export function decisionParagraph(aanvraag: ZorgnedAanvraagTransformed) {
  let paragraph = '<p>In de brief leest u meer over dit besluit. ';
  if (isAfterWCAGValidDocumentsDate(aanvraag.datumAanvraag)) {
    paragraph += 'De brief staat bij brieven bovenaan deze pagina.';
  } else {
    paragraph += 'De brief is per post naar u verstuurd.';
  }
  paragraph += '</p>';

  return paragraph;
}

export const AANVRAAG: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Aanvraag ontvangen',
  datePublished: '',
  isChecked: () => true,
  isActive: () => false,
  description: () => {
    return '<p>Uw aanvraag is ontvangen.</p>';
  },
};

export const IN_BEHANDELING: ZorgnedStatusLineItemTransformerConfig = {
  status: 'In behandeling',
  datePublished: (aanvraag) => aanvraag.datumAanvraag,
  isChecked: () => true,
  isActive: (stepIndex, aanvraag) =>
    !aanvraag.resultaat && !hasMeerInformatieNodig(aanvraag),
  description: () => {
    return '<p>Uw aanvraag is in behandeling.</p>';
  },
};

export const MEER_INFORMATIE: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Meer informatie nodig',
  isVisible: (stepIndex, aanvraag) => hasMeerInformatieNodig(aanvraag),
  datePublished: (aanvraag) =>
    getDocumentMeerInformatieDate(aanvraag.documenten) ?? '',
  isChecked: (stepIndex, aanvraag) => hasMeerInformatieNodig(aanvraag),
  isActive: (stepIndex, aanvraag) =>
    !aanvraag.resultaat && hasMeerInformatieNodig(aanvraag),
  description: () => {
    return `<p>
      Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan op 2 manieren:<br />
      Uploaden via <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE}">amsterdam.nl/zorgdocumenten</a> of opsturen naar ons gratis antwoordnummer:<br />
      Gemeente Amsterdam <br />
      Services & Data <br />
      Antwoordnummer 9087 <br />
      1000 VV Amsterdam
    </p>`;
  },
};

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Einde recht',
  datePublished: (aanvraag) =>
    (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
  isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
    return aanvraag.resultaat !== 'afgewezen';
  },
  isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
  isActive: (stepIndex, aanvraag, today) => aanvraag.isActueel === false,
  description: (aanvraag) =>
    `<p>
      ${
        aanvraag.isActueel
          ? `Als uw recht op ${aanvraag.titel} stopt, krijgt u hiervan bericht.`
          : `Uw recht op ${aanvraag.titel} is beëindigd
          ${
            aanvraag.datumEindeGeldigheid
              ? ` per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}.`
              : ''
          }`
      }
    </p>
    ${
      aanvraag.isActueel && aanvraag.leveringsVorm === 'PGB'
        ? `<p>
           Wilt u verlenging aanvragen, dan moet u dat 8 weken voor ${
             aanvraag.datumEindeGeldigheid
               ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
               : ''
           } doen. Kijk in uw besluit op
            <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_PGB_BESLUIT}">amsterdam.nl/pgb </a>voor meer informatie.
          </p>`
        : ''
    }
    `,
};

export function getTransformerConfigBesluit(
  isActive: ZorgnedStatusLineItemTransformerConfig['isActive'],
  useAsProduct: boolean
): ZorgnedStatusLineItemTransformerConfig {
  return {
    status: 'Besluit',
    datePublished: (aanvraag) => getDecisionDate(aanvraag) ?? '',
    isChecked: (stepIndex, aanvraag) => !!aanvraag.resultaat,
    isActive: isActive,
    description: (aanvraag) =>
      `<p>
          ${
            aanvraag.resultaat === 'toegewezen'
              ? `U krijgt ${useAsProduct ? 'een ' : ''}${aanvraag.titel}${
                  aanvraag.datumEindeGeldigheid
                    ? ` per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                    : ''
                }.`
              : `U krijgt geen ${aanvraag.titel}.`
          }
      </p>
      ${decisionParagraph(aanvraag)}
      `,
  };
}

export function isBeforeToday(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return isSameDay(parseISO(dateStr), compareDate)
    ? false
    : isDateInPast(dateStr, compareDate);
}

export function isServiceDeliveryStarted(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isBeforeToday(sourceData.datumBeginLevering, compareDate);
}

export function isServiceDeliveryStopped(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isBeforeToday(sourceData.datumEindeLevering, compareDate);
}

export function isServiceDeliveryActive(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    sourceData.isActueel &&
    isServiceDeliveryStarted(sourceData, compareDate) &&
    !isServiceDeliveryStopped(sourceData, compareDate) &&
    !isBeforeToday(sourceData.datumEindeGeldigheid, compareDate)
  );
}

export function isDecisionActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed
) {
  if (aanvraag.resultaat === 'toegewezen') {
    return (
      !!(isDocumentDecisionDateActive(aanvraag.datumAanvraag)
        ? getDocumentDecisionDate(aanvraag.documenten)
        : aanvraag.resultaat) &&
      !isBeforeToday(aanvraag.datumEindeGeldigheid, new Date())
    );
  } else if (aanvraag.resultaat === 'afgewezen') {
    return true;
  }
  return false;
}

export function isDecisionWithDeliveryActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    aanvraag.resultaat === 'afgewezen' ||
    (isDecisionActive(stepIndex, aanvraag) &&
      !isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today))
  );
}
