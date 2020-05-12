import { generatePath } from 'react-router-dom';
import { Chapters, FeatureToggle } from '../../../universal/config';
import {
  apiSuccesResult,
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers';
import {
  GenericDocument,
  LinkProps,
  MyCase,
  MyNotification,
} from '../../../universal/types';
import { ApiUrls, getApiConfigValue } from '../../config';
import { requestData } from '../../helpers';
import {
  AppRoutesByProductOrigin,
  contentDocumentTitles,
  contentLabels,
  processSteps,
  stepStatusLabels,
} from './focus-aanvragen-content';
import {
  calculateDecisionDeadline,
  calculateUserActionDeadline,
  formatFocusDocument,
  getDecision,
  getLatestStep,
  isRecentItem,
  parseLabelContent,
} from './focus-helpers';
import {
  DecisionFormatted,
  DocumentTitles,
  FocusProduct,
  Info,
  InfoExtended,
  LabelData,
  ProductOrigin,
  RequestStatus,
  Step,
  StepTitle,
  ProductTitle,
} from './focus-types';

/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */

export type FOCUSAanvragenSourceData = FocusProduct[];

const sourceProductsWhitelisted = ['Levensonderhoud', 'Stadspas'];

// Object with properties that are used to replace strings in the generated messages above.
interface StepSourceData {
  id: string;
  productTitle: string;
  productTitleTranslated: string;
  productOrigin: ProductOrigin;
  decision?: DecisionFormatted;
  datePublished?: string; // Generic date term for use as designated date about an item.
  decisionDeadline1?: string;
  decisionDeadline2?: string;
  userActionDeadline?: string;
  reasonForDecision?: string;
  latestStep: StepTitle;
  daysUserActionRequired: number;
  daysSupplierActionRequired: number;
  daysRecoveryAction: number; // The number of days a client has to provide more information about a request
  dateStart: string; // The official start date of the clients request process.
  reden?: string; // The reason why a decision was made about a clients request for product.
  isLastActive: boolean;
  isRecent: boolean;
}

export interface ProcessStep {
  id: string;
  documents: GenericDocument[];
  title: string;
  description: string;
  datePublished: string;
  status: RequestStatus | '';
  isLastActive: boolean;
  isChecked: boolean;
}

export interface FocusItem {
  id: string;
  datePublished: string;
  dateStart: string;
  title: string;
  description: string;

  // To determine in which list these items must occur.
  hasDecision: boolean;
  isRecent: boolean;

  link: LinkProps;
  process: ProcessStep[];
}

interface StepSourceDataArgs {
  stepData: Step;
  id: string;
  productTitle: string;
  productOrigin: ProductOrigin;
  latestStep: StepTitle;
  isLastActive: boolean;
  isRecent: boolean;
  decision?: DecisionFormatted;
  dateStart: string; // The official start date of the clients request process.
  daysUserActionRequired: number;
  daysSupplierActionRequired: number;
  daysRecoveryAction: number; // The number of days a client has to provide more information about a request
}

function translateProductTitle(title: ProductTitle) {
  switch (title) {
    case 'Levensonderhoud':
      return 'Bijstandsuitkering';
  }
  return title;
}

// Data for conveniently constructing the information shown to the client.
function getStepSourceData({
  id,
  productTitle,
  productOrigin,
  stepData,
  latestStep,
  isLastActive,
  isRecent,
  decision,
  dateStart,
  daysUserActionRequired,
  daysSupplierActionRequired,
  daysRecoveryAction,
}: StepSourceDataArgs): StepSourceData {
  const stepDate = stepData ? stepData.datum : '';
  const userActionDeadline = calculateUserActionDeadline(
    stepData.datum,
    daysRecoveryAction
  );

  return {
    id,
    productTitle,
    productTitleTranslated: translateProductTitle(productTitle),
    productOrigin,
    latestStep,
    decision,
    daysUserActionRequired,
    daysSupplierActionRequired,
    datePublished: defaultDateFormat(stepDate),
    // deadline for when a decision about a request is made before recovery action is required.
    decisionDeadline1: calculateDecisionDeadline(
      dateStart,
      daysSupplierActionRequired,
      daysUserActionRequired,
      0
    ),
    // deadline for when a decision about a request is made after recovery action is initiated.
    decisionDeadline2: calculateDecisionDeadline(
      dateStart,
      daysSupplierActionRequired,
      daysUserActionRequired,
      daysRecoveryAction
    ),
    // Deadline for person to take action.
    userActionDeadline,
    // Why a decision was made.
    reasonForDecision: stepData ? stepData.reden : '',
    daysRecoveryAction,
    // The first date of the request process.
    dateStart: defaultDateFormat(dateStart),
    isLastActive,
    isRecent,
  };
}

export function formatFocusNotificationItem(
  item: FocusItem,
  step: ProcessStep,
  sourceData: StepSourceData,
  contentLabels: LabelData
): MyNotification {
  const stepLabels =
    contentLabels[sourceData.productOrigin][sourceData.productTitle][
      sourceData.latestStep
    ];

  let stepLabelSource = stepLabels;

  if (
    sourceData?.decision &&
    stepLabels &&
    sourceData?.decision in stepLabels &&
    (stepLabels as InfoExtended)[sourceData.decision]
  ) {
    stepLabelSource = (stepLabels as InfoExtended)[sourceData.decision]!;
  }

  const notificationStepLabels = stepLabelSource as Info;

  return {
    id: `notification-${step.id}`,
    datePublished: step.datePublished,
    chapter: Chapters.INKOMEN,
    title:
      stepLabelSource && notificationStepLabels.notification
        ? parseLabelContent(
            notificationStepLabels.notification.title,
            sourceData
          )
        : '',
    description:
      notificationStepLabels && notificationStepLabels.notification
        ? parseLabelContent(
            notificationStepLabels.notification.description,
            sourceData
          )
        : '',
    link: {
      to: item.link.to,
      title:
        (notificationStepLabels &&
          notificationStepLabels.notification &&
          notificationStepLabels.notification.linkTitle) ||
        'Meer informatie',
    },
  };
}

function formatStepData(
  sourceData: StepSourceData,
  productOrigin: ProductOrigin,
  stepTitle: StepTitle,
  stepData: Step,
  contentLabels: LabelData,
  contentDocumentTitles: DocumentTitles
): ProcessStep {
  const stepLabels =
    !!sourceData.decision && stepTitle === 'beslissing'
      ? (contentLabels[productOrigin][sourceData.productTitle][
          stepTitle
        ] as InfoExtended)[sourceData.decision]
      : (contentLabels[productOrigin][sourceData.productTitle][
          stepTitle
        ] as Info);

  return {
    id: sourceData.id,
    title: stepLabels
      ? parseLabelContent(stepLabels.title, sourceData)
      : stepTitle,
    datePublished: stepData ? stepData.datum : '-',
    description: stepLabels
      ? parseLabelContent(stepLabels.description, sourceData)
      : '--NNB--',
    documents:
      stepData && FeatureToggle.focusDocumentDownload
        ? stepData.document.map(doc =>
            formatFocusDocument(
              stepTitle,
              stepData.datum,
              doc,
              contentDocumentTitles
            )
          )
        : [],
    status: stepLabels
      ? stepLabels.status
      : stepStatusLabels[sourceData.latestStep],
    isLastActive: sourceData.isLastActive,
    isChecked: !sourceData.isLastActive,
  };
}

// This function transforms the source data from the api into readable/presentable messages for the client.
interface FocusProductTransformed {
  item: FocusItem;
  notification: MyNotification;
  case: MyCase | null;
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function transformFocusSourceProduct(
  product: FocusProduct,
  compareDate: Date,
  contentLabels: LabelData,
  contentDocumentTitles: DocumentTitles
): FocusProductTransformed {
  const {
    _id,
    soortProduct: productOrigin,
    typeBesluit: rawDecision,
    processtappen: steps,
    naam: productTitle,
    dienstverleningstermijn: daysSupplierActionRequired = 28,
    inspanningsperiode: daysUserActionRequired = 28,
  } = product;

  // Find the latest active step of the request process.
  const latestStep = getLatestStep(steps);

  const id = `${_id}-${latestStep}`;

  const hasDecision = !!rawDecision;
  const decision = rawDecision ? getDecision(rawDecision) : undefined;
  // Determine if this items falls within a recent period (of xx days)
  const isRecent = decision ? isRecentItem(decision, steps, compareDate) : true;

  // The data about the latest step
  const latestStepData = steps[latestStep] as Step;

  const stepLabels = !decision
    ? (contentLabels[productOrigin][productTitle][latestStep] as Info)
    : (contentLabels[productOrigin][productTitle][latestStep] as InfoExtended)[
        decision
      ];

  // within x days a person is required to take action
  const daysRecoveryAction =
    steps.herstelTermijn && steps.herstelTermijn.aantalDagenHerstelTermijn
      ? parseInt(steps.herstelTermijn.aantalDagenHerstelTermijn, 10)
      : 0;

  // Start of the request process
  const dateStart = steps.aanvraag?.datum || '';
  const productTitleTranslated = translateProductTitle(productTitle);
  const sourceData = getStepSourceData({
    id,
    productTitle,
    productOrigin,
    decision,
    latestStep,
    stepData: latestStepData,
    dateStart,
    daysSupplierActionRequired,
    daysUserActionRequired,
    daysRecoveryAction,
    isLastActive: false,
    isRecent,
  });

  // Only use the process steps that have data to show
  const processStepsFiltered = processSteps.filter(stepTitle => {
    return (
      !!steps[stepTitle] &&
      !!contentLabels[productOrigin][productTitle][stepTitle]
    );
  });

  const route = generatePath(
    AppRoutesByProductOrigin[productOrigin][productTitle],
    {
      id,
    }
  );

  const item = {
    id,
    chapter: Chapters.INKOMEN,

    // Date on which the last updated information (Step) was published,
    datePublished: sourceData.datePublished || '',

    // Date on which the request process was first published
    dateStart: defaultDateFormat(dateStart),

    // Regular title, can be turned into more elaborate descriptive information.
    // E.g Bijstandsuitkering could become Uw Aanvraag voor een bijstandsuitkering.
    title: stepLabels
      ? parseLabelContent(stepLabels.title, sourceData)
      : productTitleTranslated,

    description: stepLabels
      ? parseLabelContent(stepLabels.description, sourceData)
      : '',

    status: stepLabels ? stepLabels.status : stepStatusLabels[latestStep],
    isRecent,
    hasDecision,
    link: {
      title: 'Meer informatie', // TODO: How to get custom link title?
      to: route,
    },
    process: processStepsFiltered
      .filter(stepTitle => {
        return !!steps[stepTitle];
      })
      .map((stepTitle, index) => {
        const stepData = steps[stepTitle] as Step;
        const isLastActive = stepTitle === latestStep;

        const sourceData = getStepSourceData({
          id: `${id}-${stepTitle}`,
          productTitle,
          productOrigin,
          decision,
          latestStep,
          stepData,
          daysSupplierActionRequired,
          daysUserActionRequired,
          daysRecoveryAction,
          dateStart,
          isLastActive,
          isRecent,
        });

        return formatStepData(
          sourceData,
          productOrigin,
          stepTitle,
          stepData,
          contentLabels,
          contentDocumentTitles
        );
      }),
  };

  const latestStepItem = item.process[item.process.length - 1];

  return {
    item,
    notification: formatFocusNotificationItem(
      item,
      latestStepItem,
      sourceData,
      contentLabels
    ),
    case: isRecent
      ? {
          id: `recent-case-${item.id}`,
          title: item.title,
          datePublished: item.datePublished,
          link: item.link,
          chapter: Chapters.INKOMEN,
        }
      : null,
  };
}

export function transformFOCUSAanvragenData(
  responseData: FOCUSAanvragenSourceData,
  compareDate: Date,
  contentLabels: LabelData,
  contentDocumentTitles: DocumentTitles
): FocusProductTransformed[] {
  if (!Array.isArray(responseData)) {
    return [];
  }

  return responseData
    .filter(item => sourceProductsWhitelisted.includes(item.naam))
    .sort(dateSort('datePublished', 'desc'))
    .map(product =>
      transformFocusSourceProduct(
        product,
        compareDate,
        contentLabels,
        contentDocumentTitles
      )
    );
}

export function fetchFOCUS(sessionID: SessionID) {
  return requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,
      transformResponse: data => {
        return data.map((item: FocusProduct) => {
          const processSteps = item.processtappen;
          const latestStep = getLatestStep(processSteps);
          return {
            ...item,
            datePublished: processSteps[latestStep]?.datum || '',
          };
        });
      },
    },
    sessionID,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );
}

async function fetchFOCUSAanvragenFormatted(sessionID: SessionID) {
  const response = await fetchFOCUS(sessionID);
  if (response.status === 'OK') {
    const focusItemsSource = response.content.filter(item =>
      sourceProductsWhitelisted.includes(item.naam)
    );
    const focusItems = transformFOCUSAanvragenData(
      focusItemsSource,
      new Date(),
      contentLabels,
      contentDocumentTitles
    );
    return apiSuccesResult(focusItems);
  }
  return response;
}

export async function fetchFOCUSAanvragen(sessionID: SessionID) {
  const responseFormatted = await fetchFOCUSAanvragenFormatted(sessionID);
  if (responseFormatted.status === 'OK') {
    return apiSuccesResult(responseFormatted.content.map(({ item }) => item));
  }
  return responseFormatted;
}

export async function fetchFOCUSAanvragenGenerated(sessionID: SessionID) {
  const response = await fetchFOCUSAanvragenFormatted(sessionID);

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (response.status === 'OK') {
    notifications = response.content.map(({ notification }) => notification);
    cases = response.content
      .map(prod => prod.case)
      .filter((myCase): myCase is MyCase => myCase !== null);
  }

  return {
    cases,
    notifications,
  };
}
