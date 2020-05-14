import { API_BASE_PATH, AppRoutes, Chapters } from '../../../universal/config';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
  apiSuccesResult,
  apiUnknownResult,
} from '../../../universal/helpers';
import {
  GenericDocument,
  MyCase,
  MyNotification,
} from '../../../universal/types';
import {
  fetchFOCUS,
  ProcessStep,
  transformFocusSourceProduct,
} from './focus-aanvragen';
import { fetchFOCUSCombined, FocusTozoDocument } from './focus-combined';
import {
  findLatestStepWithLabels,
  getLatestStep,
  isRecentItem,
  getDecision,
} from './focus-helpers';
import {
  contentDocumentTitles,
  contentLabels,
  fakeDecisionStep,
  FocusTozo,
  TOZO_LENING_PRODUCT_TITLE,
  TOZO_UITKERING_PRODUCT_TITLE,
  TOZO_VOORSCHOT_PRODUCT_TITLE,
  translateProductTitle,
} from './focus-tozo-content';
import {
  DocumentTitles,
  FocusProduct,
  FocusDocument,
  LabelData,
} from './focus-types';

function transformFocusTozoDocument(
  datePublished: string,
  document: FocusDocument,
  contentDocumentTitles: DocumentTitles
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title: contentDocumentTitles[title] || title,
    url: `${API_BASE_PATH}/${url}`,
    datePublished,
    type: 'PDF',
  };
}

type FocusTozoProduct = FocusProduct & { datePublished: string };

interface TransformFocusProductTozoProps {
  product: FocusTozoProduct;
  tozoDocuments: FocusTozoDocument[];
  compareDate: Date;
  contentLabels: LabelData;
  contentDocumentTitles: DocumentTitles;
}

function transformFocusProductTozo({
  product,
  tozoDocuments,
  compareDate,
  contentLabels,
  contentDocumentTitles,
}: TransformFocusProductTozoProps) {
  product.naam = translateProductTitle(product.naam);
  // Find the matching Aanvraag document id and change the omschrijving of the document so that it is the same as shown next to the top aanvraag item
  product.processtappen.aanvraag?.document.forEach(doc => {
    const matchingTozoDocument = tozoDocuments.find(
      tdoc => `${doc.id}` === `${tdoc.id}`
    );
    const datePublished = matchingTozoDocument
      ? matchingTozoDocument.datePublished
      : product.datePublished;
    doc.omschrijving = `${contentDocumentTitles[doc.omschrijving] ||
      doc.omschrijving}\n${dateFormat(datePublished, 'dd MMMM - HH:mm')}`;
  });

  return transformFocusSourceProduct(
    product,
    compareDate,
    contentLabels,
    contentDocumentTitles
  );
}

function transformFocusTozoItems({
  documenten,
  aanvragen,
  contentLabels,
  contentDocumentTitles,
  compareDate,
}: {
  documenten: FocusTozoDocument[];
  aanvragen: FocusProduct[];
  contentLabels: LabelData;
  contentDocumentTitles: DocumentTitles;
  compareDate: Date;
}) {
  const mapLastDatePublished = (item: FocusProduct): FocusTozoProduct => {
    const processSteps = item.processtappen;
    const latestStep = getLatestStep(processSteps);
    return {
      ...item,
      datePublished: processSteps[latestStep]?.datum || '',
    };
  };

  const aanvragenLening = aanvragen
    .filter(item => item.naam === TOZO_LENING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const firstAanvraagLening = aanvragenLening.length
    ? aanvragenLening[0]
    : null;

  const aanvragenVoorschot = aanvragen
    .filter(item => item.naam === TOZO_VOORSCHOT_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const lastAanvraagVoorschot = aanvragenVoorschot.length
    ? aanvragenVoorschot[aanvragenVoorschot.length - 1]
    : null;

  const aanvragenUitkering = aanvragen
    .filter(item => item.naam === TOZO_UITKERING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const firstAanvraagUitkering = aanvragenUitkering.length
    ? aanvragenUitkering[0]
    : null;

  // TODO: make process handle multiple items
  // collect first aanvraag datum
  // collect first decision uitkering
  // collect first decision lening
  // If uitkering and lening are less than XX weeks apart
  // collect all documents before last decision date of uitkering or lening
  // If uitkering and lening are more than XX weeks apart
  // Start new Item
  // collect first aanvraag datum after previous decision, start again

  const tozoDocuments = documenten.sort(dateSort('datePublished'));

  const aanvraagNotifications = tozoDocuments.map((aanvraag, index) => {
    return {
      id: 'tozo-regeling-notification-aanvraag-' + index,
      datePublished: aanvraag.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Tozo-aanvraag: Wij hebben uw aanvraag ontvangen',
      description: `Wij hebben uw aanvraag Tozo ontvangen op ${dateFormat(
        aanvraag.datePublished,
        'dd MMMM - HH:mm'
      )}`,
      link: {
        to: AppRoutes['INKOMEN/TOZO'],
        title: 'Bekijk uw Tozo status',
      },
    };
  });

  const mix = [
    ...tozoDocuments,
    ...aanvragenVoorschot,
    ...aanvragenUitkering,
    ...aanvragenLening,
  ].sort(dateSort('datePublished'));

  // Take last voorschot
  const firstActivityDatePublished = mix.length ? mix[0].datePublished : '';
  const lastActivityDatePublished = mix.length
    ? mix[mix.length - 1].datePublished
    : '';

  const leningStatus = firstAanvraagLening
    ? getLatestStep(firstAanvraagLening.processtappen)
    : null;
  const uitkeringStatus = firstAanvraagUitkering
    ? getLatestStep(firstAanvraagUitkering.processtappen)
    : null;

  const isComplete = [leningStatus, uitkeringStatus]
    .filter(status => !!status)
    .every(status => status === 'beslissing');

  const status = {
    lening: leningStatus,
    uitkering: uitkeringStatus,
    isComplete,
  };

  const hasDecision = {
    lening: status.lening === 'beslissing',
    uitkering: status.uitkering === 'beslissing',
  };

  const isRecentLening =
    firstAanvraagLening && firstAanvraagLening.typeBesluit
      ? isRecentItem(
          getDecision(firstAanvraagLening.typeBesluit),
          firstAanvraagLening.processtappen,
          compareDate
        )
      : false;

  const isRecentUitkering =
    firstAanvraagUitkering && firstAanvraagUitkering.typeBesluit
      ? isRecentItem(
          getDecision(firstAanvraagUitkering.typeBesluit),
          firstAanvraagUitkering.processtappen,
          compareDate
        )
      : false;

  const isRecentVoorschot =
    lastAanvraagVoorschot && lastAanvraagVoorschot.typeBesluit
      ? isRecentItem(
          getDecision(lastAanvraagVoorschot.typeBesluit),
          lastAanvraagVoorschot.processtappen,
          compareDate
        )
      : false;

  const isRecent = isRecentLening || isRecentUitkering || isRecentVoorschot;
  const aanvraagStep: ProcessStep = {
    id: 'aanvraag-step-0',
    documents: tozoDocuments.map(doc => {
      return {
        id: doc.id,
        title: `${contentDocumentTitles[doc.type] || doc.type}\n${dateFormat(
          doc.datePublished,
          'dd MMMM - HH:mm'
        )}`,
        url: `/api/${doc.url}`,
        datePublished: doc.datePublished,
        type: 'PDF',
      };
    }),
    title: 'Tozo-aanvraag',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${defaultDateFormat(
      firstActivityDatePublished
    )}.`,
    datePublished: firstActivityDatePublished,
    status: 'Aanvraag',
    isChecked: true,
    isLastActive: !(
      lastAanvraagVoorschot &&
      firstAanvraagLening &&
      firstAanvraagUitkering
    ),
  };

  const {
    item: { process: leningSteps = [] } = {},
    notification: leningNotification = null,
  } = firstAanvraagLening
    ? transformFocusProductTozo({
        product: firstAanvraagLening,
        tozoDocuments,
        compareDate,
        contentLabels,
        contentDocumentTitles,
      })
    : {};

  if (leningStatus === 'herstelTermijn') {
    leningSteps.push(fakeDecisionStep);
  }

  const {
    item: { process: uitkeringSteps = [] } = {},
    notification: uitkeringNotification = null,
  } = firstAanvraagUitkering
    ? transformFocusProductTozo({
        product: firstAanvraagUitkering,
        tozoDocuments,
        compareDate,
        contentLabels,
        contentDocumentTitles,
      })
    : {};

  if (uitkeringStatus === 'herstelTermijn') {
    uitkeringSteps.push(fakeDecisionStep);
  }

  let voorschotten: ProcessStep[] = [];
  let voorschotNotifications: MyNotification[] = [];

  if (aanvragenVoorschot.length) {
    const voorschotLabels =
      contentLabels['Bijzondere Bijstand']['Tozo-voorschot'].beslissing
        ?.toekenning;

    const voorschotLabelsTitle = voorschotLabels?.title;
    const voorschotLabelsDescription = voorschotLabels?.description;
    const voorschotLabelsNotificationDescription =
      voorschotLabels?.notification.description;
    const voorschotLabelsNotificationTitle =
      voorschotLabels?.notification.title;

    voorschotten = aanvragenVoorschot.map((voorschot, index) => {
      return {
        id: 'voorschot-' + index,
        documents:
          voorschot.processtappen.beslissing!.document.map(doc => {
            return transformFocusTozoDocument(
              dateFormat(voorschot.datePublished, 'dd MMMM'),
              doc,
              contentDocumentTitles
            );
          }) || [],
        title:
          typeof voorschotLabelsTitle === 'function'
            ? voorschotLabelsTitle({
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : 'Tozo-voorschot',
        description:
          typeof voorschotLabelsDescription === 'function'
            ? voorschotLabelsDescription({
                datePublished: voorschot.datePublished,
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : 'Uw Tozo-voorschot is toegekend.',
        datePublished: voorschot.datePublished,
        status: voorschotLabels?.status || 'Toegekend',
        isRecent,
        isChecked: true,
        isLastActive: !(leningSteps.length || uitkeringSteps.length), // Force large checkmark in UI
      };
    });

    voorschotNotifications = aanvragenVoorschot.map(voorschot => {
      return {
        id: 'tozo-regeling-notification-voorschot',
        datePublished: voorschot.datePublished,
        chapter: Chapters.INKOMEN,
        title:
          typeof voorschotLabelsNotificationTitle === 'function'
            ? voorschotLabelsNotificationTitle({
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : 'Tozo-voorschot',
        description:
          typeof voorschotLabelsNotificationDescription === 'function'
            ? voorschotLabelsNotificationDescription({
                datePublished: defaultDateFormat(voorschot.datePublished),
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : 'Er is een update in de status van uw Tozo-aanvraag',
        link: {
          to: AppRoutes['INKOMEN/TOZO'],
          title: 'Bekijk uw Tozo status',
        },
      };
    });
  }

  const tozoProcessItem = {
    id: 'tozo-item-0',
    dateStart: defaultDateFormat(firstActivityDatePublished),
    datePublished: defaultDateFormat(lastActivityDatePublished),
    ISODatePublished: lastActivityDatePublished,
    title: 'Tozo-aanvraag',
    description: '',
    status,
    hasDecision,
    isRecent,
    chapter: Chapters.INKOMEN,
    link: {
      to: AppRoutes['INKOMEN/TOZO'],
      title: 'Bekijk uw Tozo status',
    },
    process: {
      lening: leningSteps,
      uitkering: uitkeringSteps,
      aanvraag: voorschotten.length
        ? [aanvraagStep, ...voorschotten]
        : [aanvraagStep],
    },
    notifications: {
      aanvraag: aanvraagNotifications,
      lening: leningNotification,
      uitkering: uitkeringNotification,
      voorschot: voorschotNotifications,
    },
  };

  return tozoProcessItem;
}

export function transformFocusTozo({
  aanvragen,
  documenten,
  contentLabels,
  contentDocumentTitles,
  compareDate,
}: {
  documenten: FocusTozoDocument[];
  aanvragen: FocusProduct[];
  contentLabels: LabelData;
  contentDocumentTitles: DocumentTitles;
  compareDate: Date;
}) {
  const aanvragenFiltered = aanvragen.filter(item => {
    const isWhiteListed = [
      TOZO_LENING_PRODUCT_TITLE,
      TOZO_UITKERING_PRODUCT_TITLE,
      TOZO_VOORSCHOT_PRODUCT_TITLE,
    ].includes(item.naam);

    const hasLatestStepWithLabels =
      isWhiteListed &&
      !!findLatestStepWithLabels({
        productOrigin: item.soortProduct,
        productTitle: translateProductTitle(item.naam),
        steps: item.processtappen,
        contentLabels,
      });
    return isWhiteListed && hasLatestStepWithLabels;
  });

  const documentenFiltered = documenten.filter(doc =>
    ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type)
  );

  return transformFocusTozoItems({
    aanvragen: aanvragenFiltered,
    documenten: documentenFiltered,
    contentLabels,
    contentDocumentTitles,
    compareDate,
  });
}

function transformFocusTozoRecentCases(tozoItem: FocusTozo) {
  return tozoItem.isRecent
    ? [
        {
          id: tozoItem.id,
          chapter: Chapters.INKOMEN,
          datePublished: tozoItem.datePublished,
          title: tozoItem.title,
          link: {
            to: AppRoutes['INKOMEN/TOZO'],
            title: 'Bekijk uw Tozo status',
          },
        },
      ]
    : [];
}

export async function fetchFOCUSTozo(sessionID: SessionID) {
  const responseAanvragen = fetchFOCUS(sessionID);
  const responseCombined = fetchFOCUSCombined(sessionID);

  const [aanvragen, combined] = await Promise.all([
    responseAanvragen,
    responseCombined,
  ]);

  if (combined.status === 'OK' && aanvragen.status === 'OK') {
    const tozoItem = transformFocusTozo({
      aanvragen: aanvragen.content.filter(item =>
        [
          TOZO_LENING_PRODUCT_TITLE,
          TOZO_UITKERING_PRODUCT_TITLE,
          TOZO_VOORSCHOT_PRODUCT_TITLE,
        ].includes(item.naam)
      ),
      documenten: combined.content.tozodocumenten,
      contentLabels,
      contentDocumentTitles,
      compareDate: new Date(),
    });
    return apiSuccesResult(tozoItem);
  }

  return apiUnknownResult('Cannot construct TOZO item');
}

export async function fetchFOCUSTOZOGenerated(sessionID: SessionID) {
  const response = await fetchFOCUSTozo(sessionID);

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (response.status === 'OK') {
    const tozoItemNotifications = Object.values(
      response.content.notifications
    ).flatMap(x => x);
    notifications = tozoItemNotifications.filter(
      (notification: MyNotification | null): notification is MyNotification => {
        return notification !== null;
      }
    );
    cases = transformFocusTozoRecentCases(response.content);
  }

  return {
    cases,
    notifications,
  };
}
