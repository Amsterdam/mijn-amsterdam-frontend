import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
  sortAlpha,
} from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types';
import { stepLabels } from './focus-aanvragen-content';
import { FocusTozoDocument } from './focus-combined';
import { findStepsContent, transformFocusProductSteps } from './focus-helpers';
import {
  tozoTitleTranslations,
  TOZO_AANVRAAG_STEP_ID,
} from './focus-tozo-content';
import {
  DocumentTitles,
  FocusItemStep,
  FocusProduct,
  LabelData,
} from './focus-types';

interface collectTozoDocumentsProps {
  filter: (item: FocusTozoDocument) => boolean;
  documenten: FocusTozoDocument[];
  titleTranslations: DocumentTitles;
}

interface collectTozoVoorschottenProps {
  filter: (item: FocusProduct) => boolean;
  voorschotten: FocusProduct[];
  contentLabels: LabelData;
}

function collectTozoDocuments({
  filter,
  documenten,
  titleTranslations,
}: collectTozoDocumentsProps) {
  const documentenFiltered = documenten?.filter(filter);

  if (documentenFiltered?.length) {
    return createTozoAanvraagStep(documentenFiltered, titleTranslations);
  }

  return null;
}

function collectTozoVoorschotten({
  filter,
  voorschotten,
  contentLabels,
}: collectTozoVoorschottenProps) {
  const stepSet: FocusItemStep[] = [];
  const voorschottenFiltered = voorschotten.filter(filter);

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

interface createTozoProductSetStepsCollectionProps {
  aanvragen: FocusProduct[];
  voorschotten: FocusProduct[];
  documenten: FocusTozoDocument[];
  titleTranslations: DocumentTitles;
  contentLabels: LabelData;
}

export function createTozoProductSetStepsCollection({
  aanvragen,
  voorschotten,
  documenten,
  titleTranslations,
  contentLabels,
}: createTozoProductSetStepsCollectionProps) {
  const collection: Array<FocusProduct[]> = [];

  let productSet: FocusProduct[] = [];
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

    let documentsFilter: collectTozoDocumentsProps['filter'];
    let voorschottenFilter: collectTozoVoorschottenProps['filter'];

    if (index === 0) {
      // Collect all documents and voorschotten prior to the last update date in the first set
      documentsFilter = item => {
        return new Date(item.datePublished) <= datePublished;
      };
      voorschottenFilter = item => {
        return new Date(item.dateStart) <= datePublished;
      };
    } else if (index === collection.length - 1 && prevDatePublished) {
      // collect all documents and voorschotten published after last update date
      documentsFilter = item => {
        return new Date(item.datePublished) > prevDatePublished;
      };
      voorschottenFilter = item => {
        return new Date(item.dateStart) > prevDatePublished;
      };
    } else {
      documentsFilter = item => {
        const published = new Date(item.datePublished);
        return (
          !!prevDatePublished &&
          published > prevDatePublished &&
          published <= datePublished
        );
      };
      voorschottenFilter = item => {
        const start = new Date(item.dateStart);
        return (
          !!prevDatePublished &&
          start > prevDatePublished &&
          start <= datePublished
        );
      };
    }

    const generatedDocumentStep = collectTozoDocuments({
      filter: documentsFilter,
      documenten,
      titleTranslations: tozoTitleTranslations,
    });

    if (generatedDocumentStep) {
      stepSet.push(generatedDocumentStep);
    }

    const generatedVoorschottenSteps = collectTozoVoorschotten({
      filter: voorschottenFilter,
      voorschotten,
      contentLabels,
    });

    if (generatedVoorschottenSteps?.length) {
      stepSet.push(...generatedVoorschottenSteps);
    }

    return stepSet.sort(dateSort('datePublished'));
  });

  return stepCollection;
}

function createTozoAanvraagStep(
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
    product: 'Tozo-aanvraag-documenten',
    title: 'Tozo-aanvraag',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${defaultDateFormat(
      documents[0].datePublished
    )}.`,
    datePublished: documents[0].datePublished,
    status: 'Aanvraag',
    isChecked: true,
    isActive: true,
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

  if (
    aanvraagSteps.length === 1 &&
    aanvraagSteps[0].id === TOZO_AANVRAAG_STEP_ID
  ) {
    // 1 general aanvraag
    return 'Aanvraag';
  } else if (
    aanvraagSteps.length === 1 &&
    aanvraagSteps[0].id !== TOZO_AANVRAAG_STEP_ID
  ) {
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
  const mix = [...steps];
  const firstActivity = mix.sort(dateSort('dateStart', 'desc')).pop();
  const unknownId = 'unknown-first-activity';
  const firstActivityDatePublished = firstActivity?.datePublished || unknownId;

  const id = 'aanvraag-' + (firstActivity ? firstActivity.id : unknownId);
  const lastActivityDatePublished = lastStep.datePublished;
  const status = getTozoStatus(steps);

  let stepsOrganized = steps.sort(sortAlpha('product'));

  stepsOrganized = stepsOrganized.filter(step => step.title !== 'aanvraag');
  // console.log(steps);
  return {
    id,
    dateStart: firstActivityDatePublished,
    datePublished: lastActivityDatePublished,
    title: 'Tozo-aanvraag',
    status,
    chapter: Chapters.INKOMEN,
    link: {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id }),
      title: 'Bekijk uw Tozo status',
    },
    steps: stepsOrganized,
  };
}

export function createFocusTozoAanvraagNotification(
  focusItemId: string,
  document: GenericDocument
) {
  return {
    id: 'tozo-regeling-notification-aanvraag-' + document.id,
    datePublished: document.datePublished,
    chapter: Chapters.INKOMEN,
    title: 'Tozo-aanvraag: Wij hebben uw aanvraag ontvangen',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${dateFormat(
      document.datePublished,
      'dd MMMM - HH:mm'
    )}`,
    link: {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id: focusItemId }),
      title: 'Bekijk uw Tozo status',
    },
  };
}
