import {
  FocusCombinedItemFromSource,
  getLatestStep,
  FocusProduct,
  ProcessStep,
  StepTitle,
  isRecentItem,
  getDecision,
} from './focus';
import { dateSort } from 'helpers/App';
import { Chapters } from 'config/Chapter.constants';
import { AppRoutes } from 'config/Routing.constants';
import { MyNotification } from '../hooks/api/my-notifications-api.hook';

export type TozoProductTitle =
  | 'Lening Tozo'
  | 'Uitkering Tozo'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle = 'Lening Tozo';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle = 'Uitkering Tozo';
export type FocusTozoDocumentType = 'E-AANVR-KBBZ' | 'E-AANVR-TOZO';

// if (FeatureToggle.tozoActive) {
//   formattedProductTitleWhitelisted.push(
//     TOZO_VOORSCHOT_PRODUCT_TITLE,
//     TOZO_LENING_PRODUCT_TITLE,
//     TOZO_UITKERING_PRODUCT_TITLE
//   );
// }

export interface FocusTozoDocument extends FocusCombinedItemFromSource {
  displayDate: string;
  displayTime: string;
  status: 'Ontvangen';
  // documentUrl: ReactNode;
  // link: LinkProps;
  process: ProcessStep[];
}

export interface FocusTozo {
  title: string;
  isRecent: boolean;
  dateStart: string;
  datePublished: string;
  status: {
    lening: StepTitle;
    uitkering: StepTitle;
    voorschot: StepTitle;
  };
  hasDecision: {
    lening: boolean;
    uitkering: boolean;
    voorschot: boolean;
  };
  notifications: {
    lening: MyNotification | null;
    uitkering: MyNotification | null;
    voorschot: MyNotification | null;
  };
  process: {
    lening: ProcessStep[];
    uitkering: ProcessStep[];
    voorschot: ProcessStep[];
  };
}

export function formatFocusCombinedTozo({
  documenten,
  aanvragen,
}: {
  documenten: FocusCombinedItemFromSource[];
  aanvragen: FocusProduct[];
}) {
  let hasDecisionTozoLening = false;
  let hasDecisionTozoUitkering = false;

  const mapLastDatePublished = (
    item: FocusProduct
  ): FocusProduct & { datePublished: string } => {
    const processSteps = item.processtappen;
    const latestStep = getLatestStep(processSteps);
    return {
      ...item,
      datePublished: processSteps[latestStep]?.datum,
    };
  };

  const aanvragenLening = aanvragen
    .filter(item => item.naam === TOZO_LENING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));
  const lastAanvraagLening = aanvragenLening[aanvragenLening.length - 1];

  const aanvragenVoorschot = aanvragen
    .filter(item => item.naam === TOZO_VOORSCHOT_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));
  const lastAanvraagVoorschot =
    aanvragenVoorschot[aanvragenVoorschot.length - 1];

  const aanvragenUitkering = aanvragen
    .filter(item => item.naam === TOZO_UITKERING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));
  const lastAanvraagUitkering =
    aanvragenUitkering[aanvragenUitkering.length - 1];

  const tozoDocuments = documenten.sort(dateSort('datePublished'));

  const mix = [
    ...tozoDocuments,
    ...aanvragenVoorschot,
    ...aanvragenUitkering,
    ...aanvragenLening,
  ].sort(dateSort('datePublished'));

  const lastTozoItem = mix[mix.length - 1];

  const lastAanvraagLeningDecisionDate = lastAanvraagLening.datePublished;
  const lastAanvraagUitkeringDecisionDate = lastAanvraagUitkering.datePublished;
  const lastAanvraagVoorschotDecisionDate = lastAanvraagVoorschot.datePublished;

  // Take last voorschot
  const firstActivityDatePublished = mix[0].datePublished;
  const lastActivityDatePublished = mix[mix.length - 1].datePublished;

  const status = {
    lening: getLatestStep(lastAanvraagLening.processtappen),
    uitkering: getLatestStep(lastAanvraagUitkering.processtappen),
    voorschot: getLatestStep(lastAanvraagVoorschot.processtappen),
  };

  const hasDecision = {
    lening: status.lening === 'beslissing',
    uitkering: status.uitkering === 'beslissing',
    voorschot: status.voorschot === 'beslissing',
  };

  const now = new Date();
  const isRecent =
    isRecentItem(
      getDecision(lastAanvraagLening.typeBesluit),
      lastAanvraagLening.processtappen,
      now
    ) ||
    isRecentItem(
      getDecision(lastAanvraagUitkering.typeBesluit),
      lastAanvraagUitkering.processtappen,
      now
    ) ||
    isRecentItem(
      getDecision(lastAanvraagVoorschot.typeBesluit),
      lastAanvraagVoorschot.processtappen,
      now
    );

  // let notificationDescription = '';
  // {
  //       id: 'tozo-regeling-notification-0',
  //       datePublished: lastTozoItem.datePublished,
  //       chapter: Chapters.INKOMEN,
  //       title: 'Tijdelijke overbruggingsregeling zelfstandig ondernemers',
  //       description: notificationDescription,
  //       link: {
  //         to: AppRoutes['INKOMEN/TOZO'],
  //         title: 'Bekijk status',
  //       },
  //     }

  const tozoProcessItem = {
    id: 'tozo-item-0',
    dateStart: firstActivityDatePublished,
    datePublished: lastActivityDatePublished,
    ISODatePublished: lastActivityDatePublished,
    title: 'Tijdelijke overbruggingsregeling zelfstandig ondernemers',
    description: '',
    status,
    hasDecision,
    isRecent,
    chapter: Chapters.INKOMEN,
    link: {
      to: AppRoutes['INKOMEN/TOZO'], // TODO: make specific
      title: 'Bekijk status',
    },
    process: {
      lening: [],
      uitkering: [],
      voorschot: [],
    },
    notifications: {
      lening: null,
      uitkering: null,
      voorschot: null,
    },
  };

  return tozoProcessItem;
}

// function formatTozoDocumentItem(
//   item: FocusCombinedItemFromSource
// ): FocusTozoDocument {
//   // // Strip down to primitive date value.
//   // const datePublished = item.datePublished.split('T')[0];
//   const displayDate = dateFormat(item.datePublished, 'dd MMMM yyyy');
//   const displayTime = dateFormat(item.datePublished, 'HH:mm');
//   const title = TOZO_REQUEST_CONFIRMATION;
//   return {
//     ...item,
//     title,
//     displayDate,
//     displayTime,
//     status: 'Ontvangen',
//     documentUrl: (
//       <a
//         href={`/api/${item.url}`}
//         rel="external noopener noreferrer"
//         className={styles.DownloadLink}
//         download={documentDownloadName(item)}
//       >
//         <DocumentIcon width={14} height={14} /> PDF
//       </a>
//     ),
//     link: {
//       to: generatePath(AppRoutes['INKOMEN/TOZO'], {
//         type: 'aanvraag-bevestiging',
//         id: item.id,
//       }),
//       title: 'Meer informatie over ' + title,
//     },
//     process: [formatTozoDocumentStepData(item)],
//   };
// }
