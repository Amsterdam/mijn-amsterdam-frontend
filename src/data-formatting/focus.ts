import { AppRoutes } from 'App.constants';
import { defaultDateFormat, entries } from 'helpers/App';
import { LinkProps } from 'App.types';
import { Chapter, Chapters } from '../App.constants';
import { addMonths } from 'date-fns';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';

type StepTitle = 'aanvraag' | 'inBehandeling' | 'herstelTermijn' | 'beslissing';
type Decision = 'Toekenning' | 'Afwijzing';
type ProductOrigin = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';
type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

interface Info {
  title: string;
  description: string;
  infoLink?: LinkProps | LinkProps[];
}

type InfoExtended = { [type in Decision]: Info };

interface ProductType {
  aanvraag: Info;
  inBehandeling: Info;
  herstelTermijn: Info;
  beslissing: InfoExtended;
}

type LabelData = { [origin in ProductOrigin]: ProductType };

interface Document {
  $ref: string;
  id: number;
  isBulk: boolean;
  isDms: boolean;
  omschrijving: string;
}

interface Step {
  document: Document[];
  datum: string;
}

interface FocusProduct {
  _id: string;
  _meest_recent: StepTitle;
  soortProduct: ProductOrigin;
  typeBesluit: Decision;
  naam: string;
  processtappen: {
    aanvraag: Step;
    inBehandeling: Step;
    herstelTermijn: Step;
    beslissing: Step;
  };
  document: Document[];
}

type FocusApiResponse = FocusProduct[];

const processSteps: StepTitle[] = [
  'beslissing',
  'herstelTermijn',
  'inBehandeling',
  'aanvraag',
];

export const Labels: LabelData = {
  Participatiewet: {
    aanvraag: {
      title: 'Aanvraag {title}',
      description:
        'U hebt op {datePublished} een bijstandsuitkering aangevraagd.',
      infoLink: {
        to:
          'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D',
        title: 'Meer informatie',
        target: '_self',
      },
    },
    inBehandeling: {
      title: '{title} in behandeling',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {decisionDeadline} ons besluit.',
      infoLink: [
        {
          to:
            'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d',
          title: 'Meer informatie over uw rechten.',
          target: '_self',
        },
        {
          to:
            'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d',
          title: 'Meer informatie over uw plichten.',
          target: '_self',
        },
      ],
    },
    herstelTermijn: {
      title: 'Meer informatie nodig over {title}',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {recoveryDeadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
    },
    beslissing: {
      Afwijzing: {
        title: '{title}',
        description:
          'U heeft geen recht op een bijstandsuitkering. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: '{title}',
        description:
          'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
        infoLink: {
          to:
            'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D',
          title: 'Meer informatie over de betaling van uw uitkering',
          target: '_self',
        },
      },
    },
  },
  'Bijzondere Bijstand': {
    aanvraag: {
      title: '{title}',
      description:
        'U hebt op {datePublished} een bijzondere bijstandsuitkering aangevraagd.',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijzondere bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {decisionDeadline} ons besluit.',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig - {title}',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {recoveryDeadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
    },
    beslissing: {
      Afwijzing: {
        title: 'Besluit {title}',
        description:
          'U heeft geen recht op bijzondere bijstand. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: 'Besluit {title}',
        description:
          'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      },
    },
  },
  Minimafonds: {
    aanvraag: {
      title: 'Aanvraag',
      description: 'U hebt op {datePublished} een Stadspas aangevraagd.',
    },
    inBehandeling: {
      title: 'In behandeling',
      description:
        'Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {decisionDeadline} ons besluit.\nLet op: Deze status informatie betreft alleen uw aanvraag voor een Stadspas; uw eventuele andere Hulp bij Laag Inkomen producten worden via post en/of telefoon afgehandeld.',
    },
    herstelTermijn: {
      title: 'Meer informatie',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {recoveryDeadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
    },
    beslissing: {
      Afwijzing: {
        title: 'Besluit',
        description:
          'U heeft geen recht op een Stadspas. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: 'Besluit',
        description:
          'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
        infoLink: {
          to: 'https://www.amsterdam.nl/stadspas',
          title: 'Meer informatie over de stadspas',
          target: '_self',
        },
      },
    },
  },
};

interface StepSourceData {
  id: string;
  title: string;
  decision: Decision;
  datePublished?: string;
  decisionDeadline?: string;
  userActionDeadline?: string;
  recoveryDeadline?: string;
  reasonForDecision?: string;
  latestStep: StepTitle;
}

export interface ProcessStep {
  id: string;
  documents: GenericDocument[];
  title: string;
  datePublished: string;
  description: string;
  infoLink?: LinkProps | LinkProps[];
  isActual: boolean;
}

export interface FocusItem {
  id: string;
  datePublished: string;
  title: string;
  description: string;
  latestStep: StepTitle;
  supplier: string;
  inProgress: boolean;
  isGranted: boolean;
  isDenied: boolean;
  chapter: Chapter;
  link: LinkProps;
  process: ProcessStep[];
}

function isInProgess(decision: Decision, steps: FocusProduct['processtappen']) {
  const noDecision = !decision;

  let aMonthHasPasedSinceDecision = false;

  if (steps.beslissing !== null) {
    aMonthHasPasedSinceDecision =
      addMonths(steps.beslissing.datum, 1) > new Date();
  }

  return noDecision || aMonthHasPasedSinceDecision;
}

function translateProductTitle(title: ProductTitle) {
  switch (title) {
    case 'Levensonderhoud':
      return 'Bijstandsuitkering';
  }
  return title;
}

type GetStepSourceDataArgs = Pick<
  StepSourceData,
  'title' | 'latestStep' | 'decision' | 'id'
> & { stepData: Step | null };

// Data for replacement tags in label data.
function getStepSourceData({
  id,
  title,
  stepData,
  latestStep,
  decision,
}: GetStepSourceDataArgs): StepSourceData {
  const stepDate = stepData ? stepData.datum : '';
  return {
    id,
    title: translateProductTitle(title),
    latestStep,
    decision,
    datePublished: defaultDateFormat(stepDate),
    decisionDeadline: calculateDecisionDeadline(stepDate), // Decision will be made before this deadline.
    userActionDeadline: calculateUserActionDeadline(stepDate), // Deadline for person to take action.
    recoveryDeadline: calculateRecoveryDeadline(stepDate), // Deadline with decision after userAction.
    reasonForDecision: '--onbekend--', // Why a decision was made. // TODO: Do we have a reden?
  };
}

function replaceSourceDataTags(text: string, data: StepSourceData): string {
  let rText = text || '';
  const matches =
    rText && (rText.match(/[^{\}]+(?=})/g) as Array<keyof StepSourceData>);
  if (Array.isArray(matches)) {
    return matches.reduce((rText, key) => {
      return data[key] ? rText.replace(`{${key}}`, data[key] || '') : rText;
    }, rText);
  }
  return rText;
}

function calculateUserActionDeadline(date: string) {
  return defaultDateFormat(date);
}

function calculateDecisionDeadline(date: string) {
  return defaultDateFormat(date);
}

function calculateRecoveryDeadline(date: string) {
  return defaultDateFormat(date);
}

function formatFocusDocument(
  stepTitle: StepTitle,
  datePublished: string,
  document: Document
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title,
    url: `/api/${url}`,
    datePublished,
    type: stepTitle,
  };
}

function formatStepData(
  sourceData: StepSourceData,
  productOrigin: ProductOrigin,
  stepTitle: StepTitle,
  stepData: Step | null
): ProcessStep {
  const stepLabels =
    !!sourceData.decision && stepTitle === 'beslissing'
      ? (Labels[productOrigin][stepTitle] as InfoExtended)[sourceData.decision]
      : (Labels[productOrigin][stepTitle] as Info);

  return {
    id: sourceData.id,
    title: stepLabels
      ? replaceSourceDataTags(stepLabels.title, sourceData)
      : stepTitle,
    datePublished: stepData ? defaultDateFormat(stepData.datum) : '--NNB--',
    description: stepLabels
      ? replaceSourceDataTags(stepLabels.description, sourceData)
      : '--NNB--',
    documents: stepData
      ? stepData.document.map(document =>
          formatFocusDocument(stepTitle, stepData.datum, document)
        )
      : [],
    isActual: stepTitle === sourceData.latestStep,
    infoLink: stepLabels.infoLink,
  };
}

function formatFocusProduct(product: FocusProduct): FocusItem {
  const {
    _meest_recent: latestStep,
    soortProduct: productType,
    typeBesluit: decision,
    processtappen: steps,
    naam: title,
    _id: id,
  } = product;

  const inProgress = isInProgess(decision, steps);
  const stepData = steps[latestStep];
  const stepLabels = inProgress
    ? (Labels[productType][latestStep] as Info)
    : (Labels[productType][latestStep] as InfoExtended)[decision];

  const sourceData = getStepSourceData({
    id: `${id}-${latestStep}`,
    title,
    decision,
    latestStep,
    stepData,
  });

  return {
    id,
    chapter: Chapters.INKOMEN,
    datePublished: sourceData.datePublished || '',
    title: replaceSourceDataTags(stepLabels.title, sourceData),
    description: replaceSourceDataTags(stepLabels.description, sourceData),
    latestStep,
    inProgress,
    isGranted: decision === 'Toekenning',
    isDenied: decision === 'Afwijzing',
    supplier: 'Werk en inkomen', // TODO: How to get supplier?
    link: {
      title: 'Meer informatie', // TODO: How to get custom link title?
      to: `${AppRoutes.INKOMEN}/${id}`,
    },
    process: processSteps
      .filter(stepTitle => !!steps[stepTitle])
      .map(stepTitle => {
        const stepData = steps[stepTitle] || null;
        const sourceData = getStepSourceData({
          id: `${id}-${stepTitle}`,
          title,
          decision,
          latestStep,
          stepData,
        });
        return formatStepData(sourceData, productType, stepTitle, stepData);
      }),
  };
}

export default function formatFocusApiResponse(
  products: FocusApiResponse
): FocusItem[] {
  return products.map(product => formatFocusProduct(product));
}
