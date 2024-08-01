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
} from '../wmo-config-and-types';

export function getDocumentDecisionDate(documents: GenericDocument[]) {
  return (
    documents.find((document) =>
      document.title.startsWith(DOCUMENT_TITLE_BESLUIT_STARTS_WITH)
    )?.datePublished ?? null
  );
}

function getDecisionDate(aanvraag: ZorgnedAanvraagTransformed) {
  const decisionDate = isDocumentDecisionDateActive(aanvraag.datumAanvraag)
    ? getDocumentDecisionDate(aanvraag.documenten)
    : aanvraag.datumBesluit;

  return decisionDate ? defaultDateFormat(decisionDate) : null;
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
    paragraph += 'Dit document staat bij documenten bovenaan deze pagina.';
  } else {
    paragraph += 'Dit document is verstuurd per post.';
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
    return '<p>Wij hebben uw aanvraag ontvangen</p>';
  },
};

export const IN_BEHANDELING: ZorgnedStatusLineItemTransformerConfig = {
  status: 'In behandeling',
  datePublished: (aanvraag) => aanvraag.datumAanvraag,
  isChecked: () => true,
  isActive: (stepIndex, aanvraag) =>
    !aanvraag.resultaat && !hasMeerInformatieNodig(aanvraag),
  description: () => {
    return '<p>Uw aanvraag is in behandeling genomen</p>';
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
      Om uw aanvraag te kunnen beoordelen hebben wij meer informatie nodig.
      U kunt de informatie aanleveren via dit <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE}">formulier</a>.
    </p>`;
  },
};

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Einde recht',
  datePublished: (aanvraag) =>
    (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
  isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
  isActive: (stepIndex, aanvraag, today) => aanvraag.isActueel === false,
  description: (aanvraag) =>
    `<p>
      ${
        aanvraag.isActueel
          ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
          : `Uw recht op ${aanvraag.titel} is beëindigd ${
              aanvraag.datumEindeGeldigheid
                ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}`
                : ''
            }`
      }
    </p>
    ${
      aanvraag.isActueel && aanvraag.leveringsVorm === 'PGB'
        ? `<p>
            Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
            verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
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
          U heeft recht op ${useAsProduct ? 'een ' : ''}${aanvraag.titel} per ${getDecisionDate(aanvraag)}.
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
    isDecisionActive(stepIndex, aanvraag) &&
    !isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
    !isServiceDeliveryStarted(aanvraag, today)
  );
}
