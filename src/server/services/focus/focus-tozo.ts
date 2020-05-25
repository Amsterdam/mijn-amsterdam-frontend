import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiSuccesResult,
  apiUnknownResult,
  dateFormat,
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { fetchFOCUS } from './focus-aanvragen';
import { fetchFOCUSCombined, FocusTozoDocument } from './focus-combined';
import {
  getLatestStep,
  isRecentItem,
  transformFocusProduct,
  transformFocusProductNotification,
  transformFocusProductRecentCase,
  getTozoProductSetStepsCollection,
} from './focus-helpers';
import {
  contentLabels,
  fakeDecisionStep,
  FocusTozo,
  TOZO_LENING_PRODUCT_TITLE,
  TOZO_UITKERING_PRODUCT_TITLE,
  TOZO_VOORSCHOT_PRODUCT_TITLE,
  tozoTitleTranslations,
} from './focus-tozo-content';
import { FocusItemStep, FocusProduct, LabelData } from './focus-types';
import { translateFocusProduct } from './focus-helpers';

// function transformFocusTozoItems({
//   documenten,
//   aanvragen,
//   contentLabels,
// }: {
//   documenten: FocusTozoDocument[];
//   aanvragen: FocusProduct[];
//   contentLabels: LabelData;
// }) {
//   const aanvragenLening = aanvragen.filter(
//     item => item.title === TOZO_LENING_PRODUCT_TITLE
//   );

//   const firstAanvraagLening = aanvragenLening.length
//     ? aanvragenLening[0]
//     : null;

//   const aanvragenVoorschot = aanvragen.filter(
//     item => item.title === TOZO_VOORSCHOT_PRODUCT_TITLE
//   );

//   const lastAanvraagVoorschot = aanvragenVoorschot.length
//     ? aanvragenVoorschot[aanvragenVoorschot.length - 1]
//     : null;

//   const aanvragenUitkering = aanvragen.filter(
//     item => item.title === TOZO_UITKERING_PRODUCT_TITLE
//   );

//   const firstAanvraagUitkering = aanvragenUitkering.length
//     ? aanvragenUitkering[0]
//     : null;

//   // TODO: make process handle multiple items
//   // collect first aanvraag datum
//   // collect first decision uitkering
//   // collect first decision lening
//   // If uitkering and lening are less than XX weeks apart
//   // collect all documents before last decision date of uitkering or lening
//   // If uitkering and lening are more than XX weeks apart
//   // Start new Item
//   // collect first aanvraag datum after previous decision, start again

//   const tozoDocuments = documenten
//     .filter(doc => ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type))
//     .sort(dateSort('datePublished'));

//   const aanvraagNotifications = tozoDocuments.map((aanvraag, index) => {
//     return {
//       id: 'tozo-regeling-notification-aanvraag-' + index,
//       datePublished: aanvraag.datePublished,
//       chapter: Chapters.INKOMEN,
//       title: 'Tozo-aanvraag: Wij hebben uw aanvraag ontvangen',
//       description: `Wij hebben uw aanvraag Tozo ontvangen op ${dateFormat(
//         aanvraag.datePublished,
//         'dd MMMM - HH:mm'
//       )}`,
//       link: {
//         to: AppRoutes['INKOMEN/TOZO'],
//         title: 'Bekijk uw Tozo status',
//       },
//     };
//   });

//   const mix = [
//     ...tozoDocuments,
//     ...aanvragenVoorschot,
//     ...aanvragenUitkering,
//     ...aanvragenLening,
//   ].sort(dateSort('datePublished'));

//   // Take last voorschot
//   const firstActivityDatePublished = mix.length ? mix[0].datePublished : '';
//   const lastActivityDatePublished = mix.length
//     ? mix[mix.length - 1].datePublished
//     : '';

//   const leningStatus = firstAanvraagLening
//     ? getLatestStep(firstAanvraagLening.steps)
//     : null;
//   const uitkeringStatus = firstAanvraagUitkering
//     ? getLatestStep(firstAanvraagUitkering.steps)
//     : null;

//   const isComplete = [leningStatus, uitkeringStatus]
//     .filter(status => !!status)
//     .every(status => status === 'beslissing');

//   const status = {
//     lening: leningStatus,
//     uitkering: uitkeringStatus,
//     isComplete,
//   };

//   const { steps: leningSteps = [] } = firstAanvraagLening
//     ? transformFocusProduct(firstAanvraagLening, contentLabels)
//     : {};

//   if (leningStatus === 'herstelTermijn') {
//     leningSteps.push(fakeDecisionStep);
//   }

//   const { steps: uitkeringSteps = [] } = firstAanvraagUitkering
//     ? transformFocusProduct(firstAanvraagUitkering, contentLabels)
//     : {};

//   if (uitkeringStatus === 'herstelTermijn') {
//     uitkeringSteps.push(fakeDecisionStep);
//   }

//   let voorschotSteps: FocusItemStep[] = [];
//   let voorschotNotifications: MyNotification[] = [];

//   if (aanvragenVoorschot.length) {
//     voorschotSteps = aanvragenVoorschot.flatMap((voorschot, index) => {
//       return transformFocusProduct(voorschot, contentLabels).steps;
//     });

//     voorschotNotifications = aanvragenVoorschot.map(voorschot => {
//       return transformFocusProductNotification(voorschot, contentLabels);
//     });
//   }

//   const tozoProcessItem = {
//     id: 'tozo-item-0',
//     dateStart: defaultDateFormat(firstActivityDatePublished),
//     datePublished: defaultDateFormat(lastActivityDatePublished),
//     title: 'Tozo-aanvraag',
//     description: '',
//     status,
//     chapter: Chapters.INKOMEN,
//     link: {
//       to: AppRoutes['INKOMEN/TOZO'],
//       title: 'Bekijk uw Tozo status',
//     },
//     steps: {
//       lening: leningSteps,
//       uitkering: uitkeringSteps,
//       aanvraag: voorschotSteps.length
//         ? [aanvraagStep, ...voorschotSteps]
//         : [aanvraagStep],
//     },
//     notifications: {
//       aanvraag: aanvraagNotifications,
//       lening: firstAanvraagLening
//         ? transformFocusProductNotification(firstAanvraagLening, contentLabels)
//         : null,
//       uitkering: firstAanvraagUitkering
//         ? transformFocusProductNotification(
//             firstAanvraagUitkering,
//             contentLabels
//           )
//         : null,
//       voorschot: voorschotNotifications,
//     },
//   };

//   return tozoProcessItem;
// }

function transformFocusTozoRecentCases(tozoItem: FocusTozo, compareDate: Date) {
  return isRecentItem(tozoItem.steps.aanvraag, compareDate) ||
    isRecentItem(tozoItem.steps.lening, compareDate) ||
    isRecentItem(tozoItem.steps.uitkering, compareDate)
    ? [transformFocusProductRecentCase(tozoItem)]
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
    const aanvragenNormalized = aanvragen.content
      .filter(product =>
        [TOZO_LENING_PRODUCT_TITLE, TOZO_UITKERING_PRODUCT_TITLE].includes(
          product.title
        )
      )
      .map(product => translateFocusProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const voorschottenNormalized = aanvragen.content
      .filter(product => [TOZO_VOORSCHOT_PRODUCT_TITLE].includes(product.title))
      .map(product => translateFocusProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const documenten = combined.content.tozodocumenten
      .filter(doc => ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type))
      .sort(dateSort('dateStart'));

    const collection = getTozoProductSetStepsCollection({
      aanvragen: aanvragenNormalized,
      voorschotten: voorschottenNormalized,
      documenten,
      titleTranslations: tozoTitleTranslations,
      contentLabels: contentLabels,
    });

    console.log('collection::', collection);

    const tozoItems: FocusTozo[] = [];

    return apiSuccesResult(tozoItems);
  }

  return apiUnknownResult('Cannot construct TOZO item');
}

export async function fetchFOCUSTozoGenerated(sessionID: SessionID) {
  const response = await fetchFOCUSTozo(sessionID);
  const compareDate = new Date();

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (response.status === 'OK') {
    const tozoItemNotifications = response.content
      .flatMap(tozoItem => Object.values(tozoItem.notifications))
      .filter(
        (notifications): notifications is MyNotification[] =>
          notifications !== null
      )
      .flatMap(x => x);

    notifications = tozoItemNotifications.filter(
      (notification: MyNotification | null): notification is MyNotification => {
        return notification !== null;
      }
    );
    cases = response.content.flatMap(tozoItem =>
      transformFocusTozoRecentCases(tozoItem, compareDate)
    );
  }

  return {
    cases,
    notifications,
  };
}
