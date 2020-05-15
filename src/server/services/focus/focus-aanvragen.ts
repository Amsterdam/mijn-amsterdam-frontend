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
import { findStepsWithLabels } from './focus-helpers';
import {
  AppRoutesByproductType,
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
  productType,
  RequestStatus,
  StepTitle,
  ProductTitle,
  FocusProductFromSource,
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
  productType: productType;
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

  // To determine in which list these items must be placed.
  hasDecision: boolean;
  isRecent: boolean;

  link: LinkProps;
  process: ProcessStep[];
}

interface StepSourceDataArgs {
  stepData: Step;
  id: string;
  productTitle: string;
  productType: productType;
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
  productType,
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
    productType,
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
    contentLabels[sourceData.productType][sourceData.productTitle][
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
      to:
        (notificationStepLabels &&
          notificationStepLabels.notification &&
          notificationStepLabels.notification.linkTo) ||
        item.link.to,
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
  productType: productType,
  stepTitle: StepTitle,
  stepData: Step,
  contentLabels: LabelData,
  contentDocumentTitles: DocumentTitles
): ProcessStep {
  const stepLabels =
    !!sourceData.decision && stepTitle === 'beslissing'
      ? (contentLabels[productType][sourceData.productTitle][
          stepTitle
        ] as InfoExtended)[sourceData.decision]
      : (contentLabels[productType][sourceData.productTitle][
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
    soortProduct: productType,
    typeBesluit,
    processtappen: steps,
    title: productTitle,
    datePublished,
    dienstverleningstermijn = 28,
    inspanningsperiode = 28,
  } = product;

  // Find the latest active step of the request process.
  const latestStep = getLatestStep(steps);
  const id = `${_id}-${latestStep}`;
  const decision = typeBesluit ? getDecision(typeBesluit) : undefined;

  // Determine if this items falls within a recent period (of xx days)
  const isRecent = decision ? isRecentItem(decision, steps, compareDate) : true;

  // The data about the latest step
  // const latestStepData = steps[latestStep] as Step;

  const stepLabels = findStepsWithLabels({
    productType,
    productTitle,
    steps,
    decision,
    contentLabels,
  });

  // within x days a person is required to take action
  const daysRecoveryAction =
    steps.herstelTermijn && steps.herstelTermijn.aantalDagenHerstelTermijn
      ? parseInt(steps.herstelTermijn.aantalDagenHerstelTermijn, 10)
      : 0;

  return {
    id,
    title,
    datePublished,
    processSteps: [],
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
  const sourceDataNormalized = requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,
      transformResponse: data => {
        return data.filter((item: FocusProductFromSource) => sourceProductsWhitelisted.includes(item.naam)).map((item: FocusProductFromSource) => {
          const processSteps = item.processtappen;
          const latestStep = getLatestStep(processSteps);

          return {
            id: `${item._id}-${latestStep}`,
            title: translateProductTitle(item.naam),
            type: item.soortProduct,
            decision: item.typeBesluit ? getDecision(item.typeBesluit)
            steps: Object.entries(item.processtappen).filter(
              ([stepTitle, stepData]) => stepData !== null
            ).map(([stepTitle, stepData]) => {
              return {
                title: stepTitle,
                documents: stepData?.document.map(sourceDocument => formatFocusDocument(stepTitle, stepData.datum, sourceDocument, contentDocumentTitles)),
                datePublished: stepData.datum,
              }
            }),
            datePublished: processSteps[latestStep]?.datum || '',
            dienstverleningstermijn: item.dienstverleningstermijn,
            inspanningsperiode: item.inspanningsperiode,
          };
        });
      },
    },
    sessionID,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );

  return sourceDataNormalized;
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
