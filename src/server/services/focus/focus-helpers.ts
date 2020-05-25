import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { API_BASE_PATH, AppRoutes, Chapters } from '../../../universal/config';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
  omit,
} from '../../../universal/helpers';
import { GenericDocument, LinkProps, MyCase } from '../../../universal/types';
import {
  DAYS_KEEP_RECENT,
  processSteps,
  stepLabels,
} from './focus-aanvragen-content';
import { FocusTozoDocument } from './focus-combined';
import { tozoTitleTranslations, TOZO_AANVRAAG_STEP_ID } from './focus-tozo-content';
import slug from 'slugme';
import {
  Decision,
  DecisionFormatted,
  DocumentTitles,
  FocusDocumentFromSource,
  FocusItem,
  FocusItemStep,
  FocusProduct,
  FocusProductFromSource,
  FocusProductStep,
  FocusProductStepFromSource,
  FocusStepContent,
  FocusStepContentDecision,
  LabelData,
  StepTitle,
  TextPartContents,
} from './focus-types';

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(
  steps: Array<{ title: string; datePublished: string }>,
  compareDate: Date
) {
  return steps.some(
    step =>
      step.title === 'beslissing' &&
      differenceInCalendarDays(compareDate, new Date(step.datePublished)) <
        DAYS_KEEP_RECENT
  );
}

export function parseLabelContent(
  text: TextPartContents,
  product: FocusProduct & Record<string, string>
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(product);
  }

  return rText;
}

// Returns the date before which a client has to respond with information regarding a request for a product.
export function calculateUserActionDeadline(
  dateFrom: string,
  daysUserActionRequired: number
) {
  return dateFrom
    ? defaultDateFormat(addDays(parseISO(dateFrom), daysUserActionRequired))
    : '';
}

// Returns the date before which municipality has to inform the client about a decision that has been made regarding his/her request for a product.
export function calculateDecisionDeadline(
  dateStart: string,
  daysSupplierActionRequired: number = 28,
  daysUserActionRequired: number = 28,
  daysRecoveryAction: number = 0
) {
  return defaultDateFormat(
    addDays(
      parseISO(dateStart),
      daysSupplierActionRequired + daysUserActionRequired + daysRecoveryAction
    )
  );
}

export function getDecision(decision: Decision): DecisionFormatted {
  return decision.toLocaleLowerCase().replace(/\s/gi, '') as DecisionFormatted;
}

export function getLatestStep(steps: FocusProductStep[]) {
  return (
    [...processSteps].reverse().find(stepTitle => {
      return !!steps.find(stepData => stepTitle === stepData.title);
    }) || 'aanvraag'
  );
}

export function formatFocusDocument(
  datePublished: string,
  document: FocusDocumentFromSource,
  documentType: string
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title,
    url: `${API_BASE_PATH}/${url}`,
    datePublished,
    type: documentType,
  };
}

export function findStepsContent(
  product: FocusProduct,
  contentLabels: LabelData
) {
  const stepsContent: { [stepTitle in StepTitle]?: FocusStepContent } & {
    link?: LinkProps;
  } = {};

  const labelContent = contentLabels[product.type][product.title];

  processSteps.forEach(stepTitle => {
    const stepData = product.steps.find(step => step.title === stepTitle);
    const stepContent = labelContent[stepTitle];
    if (stepData && stepContent) {
      if (
        stepTitle === 'beslissing' &&
        product.decision &&
        product.decision in stepContent
      ) {
        stepsContent[stepTitle] = (stepContent as FocusStepContentDecision)[
          product.decision
        ];
      } else if (stepTitle !== 'beslissing') {
        stepsContent[stepTitle] = stepContent as FocusStepContent;
      }
    }
  });

  if (labelContent.link) {
    stepsContent.link = labelContent.link(product);
  }

  return stepsContent;
}

function normalizeFocusSourceProductStep(
  product: FocusProductFromSource,
  [stepTitle, stepData]: [StepTitle, FocusProductStepFromSource]
) {
  const stepNormalized: FocusProductStep = {
    id: `${product._id}-step-${stepTitle}`,
    title: stepTitle,
    documents:
      stepData.document.map(sourceDocument =>
        formatFocusDocument(stepData.datum, sourceDocument, 'PDF')
      ) || [],
    datePublished: stepData.datum,
  };

  if (stepTitle === 'herstelTermijn' && stepData.aantalDagenHerstelTermijn) {
    stepNormalized.aantalDagenHerstelTermijn = parseInt(
      stepData.aantalDagenHerstelTermijn,
      10
    );
  }

  return stepNormalized;
}

export function normalizeFocusSourceProduct(product: FocusProductFromSource) {
  const processSteps = product.processtappen;

  const steps = Object.entries(product.processtappen)
    // Filter out steps that don't have any data assiciated
    .filter(
      (stepEntry): stepEntry is [StepTitle, FocusProductStepFromSource] =>
        stepEntry[1] !== null
    )
    .map(step => normalizeFocusSourceProductStep(product, step));

  const latestStep = getLatestStep(steps);

  return {
    id: `${product._id}-${latestStep}`,
    title: product.naam,
    type: product.soortProduct,
    decision: product.typeBesluit
      ? getDecision(product.typeBesluit)
      : undefined,
    steps,
    datePublished: processSteps[latestStep]?.datum || '',
    dateStart: processSteps.aanvraag?.datum || '',
    dienstverleningstermijn: product.dienstverleningstermijn,
    inspanningsperiode: product.inspanningsperiode,
  };
}

export function fillStepContent(
  product: FocusProduct,
  stepData: FocusProductStep,
  stepContent: FocusStepContent
): FocusItemStep {
  const additionalInformationStep = product.steps.find(
    step => step.title === 'herstelTermijn'
  );

  let aantalDagenHerstelTermijn = 0;
  if (additionalInformationStep) {
    aantalDagenHerstelTermijn =
      additionalInformationStep.aantalDagenHerstelTermijn || 0;
  }

  // deadline corresponding to the 'inBehandeling' step.
  const decisionDeadline1 = calculateDecisionDeadline(
    product.dateStart,
    product.dienstverleningstermijn,
    product.inspanningsperiode,
    0
  );

  // deadline for the Municiaplity corresponding to the 'herstelTermijn' step.
  const decisionDeadline2 = calculateDecisionDeadline(
    product.dateStart,
    product.dienstverleningstermijn,
    product.inspanningsperiode,
    aantalDagenHerstelTermijn
  );

  // deadline for the Client (Civilian) corresponding to the 'herstelTermijn' step.
  const userActionDeadline = calculateUserActionDeadline(
    stepData.datePublished,
    aantalDagenHerstelTermijn
  );

  const customData = {
    decisionDeadline1,
    decisionDeadline2,
    userActionDeadline,
  };

  return Object.assign({}, stepData, {
    description: stepContent.description(product, customData),
    status: stepContent.status,
    isActive: getLatestStep(product.steps) === stepData.title,
    isChecked: true,
  });
}

export function transformFocusProductSteps(
  product: FocusProduct,
  stepsContent: ReturnType<typeof findStepsContent>
) {
  return processSteps
    .map(stepTitle => {
      const stepContent = stepsContent[stepTitle];
      const stepData = product.steps.find(step => step.title === stepTitle);
      if (stepContent && stepData) {
        return fillStepContent(product, stepData, stepContent);
      }
      return null;
    })
    .filter((stepData): stepData is FocusItemStep => stepData !== null);
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function transformFocusProduct(
  product: FocusProduct,
  contentLabels: LabelData
): FocusItem {
  const stepsContent = findStepsContent(product, contentLabels);
  const steps = transformFocusProductSteps(product, stepsContent);

  const productSanitized = omit(product, [
    'steps',
    'dienstverleningstermijn',
    'inspanningsperiode',
  ]);

  const link = {
    title: stepsContent.link?.title || 'Meer informatie',
    to: stepsContent.link?.to || AppRoutes['INKOMEN'],
  };

  return Object.assign({}, productSanitized, {
    steps,
    link,
    displayDateStart: defaultDateFormat(productSanitized.dateStart),
    displayDatePublished: defaultDateFormat(productSanitized.datePublished),
    status: steps[steps.length - 1].status,
  });
}

export function transformFocusProductNotification(
  product: FocusProduct,
  contentLabels: LabelData
) {
  const latestStepTitle = getLatestStep(product.steps);
  const stepsContent = findStepsContent(product, contentLabels)[
    latestStepTitle
  ];
  const titleTransform = stepsContent?.notification.title;
  const descriptionTransform = stepsContent?.notification.title;
  const linkTransform = stepsContent?.notification.link;

  return {
    id: `${product.id}-notification`,
    datePublished: product.datePublished,
    chapter: Chapters.INKOMEN,
    title: titleTransform
      ? titleTransform(product)
      : `Update: ${product.title} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(product)
      : `Er zijn updates in uw ${product.title} aanvraag.`,
    link: linkTransform
      ? linkTransform(product)
      : {
          to: AppRoutes['INKOMEN/TOZO'],
          title: 'Bekijk uw Tozo status',
        },
  };
}

export function transformFocusProductRecentCase(product: {
  id: string;
  datePublished: string;
  title: string;
}): MyCase {
  return {
    id: `${product.id}-case`,
    datePublished: product.datePublished,
    chapter: Chapters.INKOMEN,
    title: product.title,
    link: {
      to: AppRoutes['INKOMEN/TOZO'],
      title: 'Meer informatie',
    },
  };
}

export function translateFocusProduct(
  product: FocusProduct,
  titleTranslations: DocumentTitles
) {
  product.title = titleTranslations[product.title] || product.title;

  product.steps.forEach(step => {
    step.documents.forEach(doc => {
      doc.title = titleTranslations[doc.title] || doc.title;
    });
  });

  return product;
}

interface collectTozoDocumentsAndVoorschottenProps {
  filter: (item: FocusProduct | FocusTozoDocument) => boolean;
  voorschotten: FocusProduct[];
  documenten: FocusTozoDocument[];
  titleTranslations: DocumentTitles;
  contentLabels: LabelData;
}

export function collectTozoDocumentsAndVoorschotten({
  filter,
  voorschotten,
  documenten,
  titleTranslations,
  contentLabels,
}: collectTozoDocumentsAndVoorschottenProps) {
  const stepSet: FocusItemStep[] = [];
  const documentenFiltered = documenten.filter(filter);
  const voorschottenFiltered = voorschotten.filter(filter);

  if (documentenFiltered.length) {
    const aanvraagItem = createTozoAanvraagStep(
      documentenFiltered,
      titleTranslations
    );
    stepSet.push(aanvraagItem);
  }

  if (voorschottenFiltered.length) {
    stepSet.push(
      ...voorschottenFiltered.flatMap(voorschot => {
        const stepsContent = findStepsContent(voorschot, contentLabels);
        return transformFocusProductSteps(voorschot, stepsContent);
      })
    );
  }

  return stepSet;
}

interface getTozoProductSetStepsCollectionProps {
  aanvragen: FocusProduct[];
  voorschotten: FocusProduct[];
  documenten: FocusTozoDocument[];
  titleTranslations: DocumentTitles;
  contentLabels: LabelData;
}

export function getTozoProductSetStepsCollection({
  aanvragen,
  voorschotten,
  documenten,
  titleTranslations,
  contentLabels,
}: getTozoProductSetStepsCollectionProps) {
  let productSet: FocusProduct[] = [];
  const collection: Array<FocusProduct[]> = [];

  let stepCollection: Array<FocusItemStep[]> = [];

  // If there are no aanvragen products available, just gather the voorschotten and aanvraagdocumenten.
  if (!aanvragen.length) {
    stepCollection.push([
      createTozoAanvraagStep(documenten, titleTranslations),
      ...voorschotten.flatMap(voorschot => {
        const stepsContent = findStepsContent(voorschot, contentLabels);
        return transformFocusProductSteps(voorschot, stepsContent);
      }),
    ]);

    return stepCollection;
  }

  const newProductSet = () => {
    collection.push(productSet);
    productSet = [];
  };

  for (const item of aanvragen) {
    const previousProductSet =
      collection.length > 0 ? collection[collection.length - 1] : null;

    const currentProcessFirstStep = item.steps.find(
      (step: any) => step.title === 'aanvraag'
    );

    const currentProcessLastStep = item.steps.find(
      (step: any) => step.title === 'beslissing'
    );

    const previousProductSetLastStep =
      previousProductSet &&
      previousProductSet.find(step => step.title === 'beslissing');

    // Prevent placing 2 of the same items in a set.
    if (
      productSet.length === 1 &&
      previousProductSet &&
      previousProductSet.some(prevItem => item.title === prevItem.title)
    ) {
      newProductSet();
    }

    // If the current item request date lies before the end date of the previous item it's considered part of the previous set.
    if (
      previousProductSet?.length === 1 &&
      currentProcessLastStep &&
      currentProcessFirstStep &&
      previousProductSetLastStep &&
      new Date(previousProductSetLastStep.datePublished) >
        new Date(currentProcessFirstStep.datePublished)
    ) {
      previousProductSet.push(item);
    } else {
      productSet.push(item);
    }

    // Start a new process if the set contains 2 items
    if (productSet.length === 2) {
      newProductSet();
    }
  }

  newProductSet();

  stepCollection = collection.map((productSet, index) => {
    const [first, second] = productSet;
    const datePublished = new Date(
      second?.datePublished || first?.datePublished
    );
    const [prevFirst, prevSecond] = collection[index - 1] || [];
    const prevDatePublished =
      prevSecond || prevFirst
        ? new Date(prevSecond?.datePublished || prevFirst?.datePublished)
        : null;

    const stepSet: FocusItemStep[] = [];

    if (first) {
      const stepsContent = findStepsContent(first, contentLabels);
      stepSet.push(...transformFocusProductSteps(first, stepsContent));
    }

    if (second) {
      const stepsContent = findStepsContent(second, contentLabels);
      stepSet.push(...transformFocusProductSteps(second, stepsContent));
    }

    let filter: collectTozoDocumentsAndVoorschottenProps['filter'];

    if (index === 0) {
      // Collect all documents and voorschotten prior to the last update date in the first set
      filter = item => {
        return new Date(item.datePublished) < datePublished;
      };
    } else if (index === collection.length - 1 && prevDatePublished) {
      // collect all documents and voorschotten published after last update date
      filter = item => {
        return new Date(item.datePublished) >= prevDatePublished;
      };
    } else {
      filter = item => {
        const published = new Date(item.datePublished);
        return (
          !!prevDatePublished &&
          published >= prevDatePublished &&
          published < datePublished
        );
      };
    }

    stepSet.push(
      ...collectTozoDocumentsAndVoorschotten({
        filter,
        documenten,
        voorschotten,
        titleTranslations: tozoTitleTranslations,
        contentLabels,
      })
    );

    return stepSet.sort(dateSort('datePublished'));
  });

  return stepCollection;
}

export function createTozoAanvraagStep(
  tozoDocuments: FocusTozoDocument[],
  titleTranslations: DocumentTitles
) {
  const documents = tozoDocuments.map(doc => {
    return {
      id: doc.id,
      title: `${titleTranslations[doc.type] || doc.type}\n${dateFormat(
        doc.datePublished,
        'dd MMMM - HH:mm'
      )}`,
      url: `/api/${doc.url}`,
      datePublished: doc.datePublished,
      type: 'PDF',
    };
  });

  const aanvraag: FocusItemStep = {
    id: TOZO_AANVRAAG_STEP_ID,
    documents,
    title: 'Tozo-aanvraag',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${defaultDateFormat(
      documents[0].datePublished
    )}.`,
    datePublished: documents[0].datePublished,
    status: 'Aanvraag',
  };

  return aanvraag;
}

function getTozoStatus(steps: FocusItemStep[]) {
  const aanvraagSteps = steps.filter(
    step => step.status === stepLabels.aanvraag
  );
  const beslissingSteps = steps.filter(
    step => step.status === stepLabels.beslissing
  );


  if (aanvraagSteps.length === 1 && aanvraagSteps[0].id === TOZO_AANVRAAG_STEP_ID) {
    // 1 general aanvraag
    return 'Aanvraag';

  } else if (aanvraagSteps.length === 1 && aanvraagSteps[0].id !== TOZO_AANVRAAG_STEP_ID) {
    // Uitkering OR Lening aanvraag only, just display the last status
    return aanvraagSteps[aanvraagSteps.length - 1].status;

  } else if (aanvraagSteps.length === 3 && beslissingSteps.length === 2) {
    // 3 aanvragen, 1 general AND 1 uitkering AND 1 lening
    return 'Besluit';

  } else if (aanvraagSteps.length === 2 && beslissingSteps.length === 1) {
    // 2 aanvragen, 1 general AND (1 uitkering OR 1 lening)
    return 'Besluit';
  }

  return 'In behandeling';
}

export function createFocusItemTozo(steps: FocusItemStep[]) {
  const lastStep = steps[steps.length - 1];
  const firstActivityDatePublished = steps[0].datePublished;
  const lastActivityDatePublished = lastStep.datePublished;

  const status = getTozoStatus(steps);

  const tozoProcessItem = {
    id: `tozo-item-${slug(firstActivityDatePublished)}`,
    dateStart: defaultDateFormat(firstActivityDatePublished),
    datePublished: defaultDateFormat(lastActivityDatePublished),
    title: 'Tozo-aanvraag',
    description: '',
    status,
    chapter: Chapters.INKOMEN,
    link: {
      to: AppRoutes['INKOMEN/TOZO'],
      title: 'Bekijk uw Tozo status',
    },
    steps,
    notifications: ,
  };
}
