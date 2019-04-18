import { AppRoutes } from 'App.constants';
import { defaultDateFormat, entries } from 'helpers/App';
import { LinkProps } from '../App.types';
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

export const Labels: LabelData = {
  Participatiewet: {
    aanvraag: {
      title: 'Aanvraag {title}',
      description:
        'U hebt op {datePublished} een bijstandsuitkering aangevraagd.',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {decisionDeadline} ons besluit.',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig over {title}',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {recoveryDeadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
    },
    beslissing: {
      Afwijzing: {
        title: 'Besluit {title}',
        description:
          'U heeft geen recht op een bijstandsuitkering. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: 'Besluit {title}',
        description:
          'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
      },
    },
  },
  'Bijzondere Bijstand': {
    aanvraag: {
      title: 'Aanvraag {title}',
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
      title: 'Aanvraag {title}',
      description: 'U hebt op {datePublished} een Stadspas aangevraagd.',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      description:
        'Het kan zijn dat u nog extra informatie moet opsturen.\nU ontvangt vóór {decisionDeadline} ons besluit.\nLet op: Deze status informatie betreft alleen uw aanvraag voor een Stadspas; uw eventuele andere Hulp bij Laag Inkomen producten worden via post en/of telefoon afgehandeld.',
    },
    herstelTermijn: {
      title: 'Meer informatie nodig {title}',
      description:
        'Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.\nU moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {recoveryDeadline} ons besluit.\n\nTip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.',
    },
    beslissing: {
      Afwijzing: {
        title: 'Besluit {title}',
        description:
          'U heeft geen recht op een Stadspas. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: 'Besluit',
        description:
          'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
      },
    },
  },
};

interface StepSourceData {
  title: string;
  decision: Decision;
  datePublished: string;
  decisionDeadline: string;
  userActionDeadline: string;
  recoveryDeadline: string;
  reasonForDecision: string;
}

export interface ProcessStep {
  documents: GenericDocument[];
  title: string;
  datePublished: string;
  description: string;
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

function replaceSourceDataTags(text: string, data: StepSourceData): string {
  const matches = text.match(/[^{\}]+(?=})/g) as Array<keyof StepSourceData>;
  if (Array.isArray(matches)) {
    return matches.reduce((text, key) => {
      return text.replace(`{${key}}`, data[key] || '');
    }, text);
  }
  return text;
}

function calculateUserActionDeadline(date: string) {
  return date;
}

function calculateDecisionDeadline(date: string) {
  return date;
}

function calculateRecoveryDeadline(date: string) {
  return date;
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
    url,
    datePublished,
    type: stepTitle,
  };
}

function formatStepData(
  sourceData: StepSourceData,
  productOrigin: ProductOrigin,
  stepTitle: StepTitle,
  stepData: Step
): ProcessStep {
  const stepLabels =
    !!sourceData.decision && stepTitle === 'beslissing'
      ? (Labels[productOrigin][stepTitle] as InfoExtended)[sourceData.decision]
      : (Labels[productOrigin][stepTitle] as Info);

  return {
    title: replaceSourceDataTags(stepLabels.title, sourceData),
    datePublished: defaultDateFormat(stepData.datum),
    description: replaceSourceDataTags(stepLabels.description, sourceData),
    documents: stepData.document.map(document =>
      formatFocusDocument(stepTitle, stepData.datum, document)
    ),
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
    processtappen,
  } = product;

  const inProgress = isInProgess(decision, steps);
  const stepData = steps[latestStep];
  const stepLabels = inProgress
    ? (Labels[productType][latestStep] as Info)
    : (Labels[productType][latestStep] as InfoExtended)[decision];

  // Data for replacement tags in label data.
  const sourceData: StepSourceData = {
    title: translateProductTitle(title),
    decision,
    datePublished: defaultDateFormat(stepData.datum),
    decisionDeadline: calculateDecisionDeadline(stepData.datum), // Decision will be made before this deadline.
    userActionDeadline: calculateUserActionDeadline(stepData.datum), // Deadline for person to take action.
    recoveryDeadline: calculateRecoveryDeadline(stepData.datum), // Deadline with decision after userAction.
    reasonForDecision: '--onbekend--', // Why a decision was made. // TODO: Do we have a reden?
  };

  return {
    id,
    chapter: Chapters.INKOMEN,
    datePublished: sourceData.datePublished,
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
    process: entries(processtappen)
      .filter(([, stepData]) => stepData !== null)
      .map(([stepTitle, stepData]) => {
        return formatStepData(sourceData, productType, stepTitle, stepData);
      }),
  };
}

export default function formatFocusApiResponse(
  products: FocusApiResponse
): FocusItem[] {
  return products.map(product => formatFocusProduct(product));
}
