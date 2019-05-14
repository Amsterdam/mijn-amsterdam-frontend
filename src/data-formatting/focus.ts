import { AppRoutes } from 'App.constants';
import { defaultDateFormat, entries } from 'helpers/App';
import { LinkProps } from 'App.types';
import { Chapter, Chapters } from '../App.constants';
import { addMonths, addDays } from 'date-fns';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';

type StepTitle = 'aanvraag' | 'inBehandeling' | 'herstelTermijn' | 'beslissing';
export type RequestStatus =
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Beslissing';
type Decision = 'Toekenning' | 'Afwijzing';
type ProductOrigin = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';
type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

interface Info {
  title: string;
  description: string;
  status: RequestStatus;
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
  status: RequestStatus;
  aantalDagenHerstelTermijn?: string;
  reden?: string;
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
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

type FocusApiResponse = FocusProduct[];

const processSteps: StepTitle[] = [
  'beslissing',
  'herstelTermijn',
  'inBehandeling',
  'aanvraag',
];

// Links can be added in the format of [text](link)
export const Labels: LabelData = {
  Participatiewet: {
    aanvraag: {
      title: '{title}',
      status: 'Aanvraag',
      description: `U hebt op {datePublished} een bijstandsuitkering aangevraagd.

        [Wat kunt u van ons verwachten?](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D)`,
    },
    inBehandeling: {
      title: '{title}',
      status: 'In behandeling',
      description: `Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.
        U ontvangt vóór {decisionDeadline} ons besluit.
        Lees meer over uw [rechten](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d) en [plichten](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d)
        `,
    },
    herstelTermijn: {
      title: '{title}',
      status: 'Meer informatie nodig',
      description: `Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.
        U moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {decisionDeadline} ons besluit.


        Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.`,
    },
    beslissing: {
      Afwijzing: {
        title: '{title}',
        status: 'Beslissing',
        description:
          'U heeft geen recht op een bijstandsuitkering. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: '{title}',
        status: 'Beslissing',
        description: `U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.
          [Bekijk hier de betaaldata van de uitkering](https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D)`,
      },
    },
  },
  'Bijzondere Bijstand': {
    aanvraag: {
      title: '{title}',
      status: 'Aanvraag',
      description:
        'U hebt op {datePublished} een bijzondere bijstandsuitkering aangevraagd.',
    },
    inBehandeling: {
      title: '{title} in behandeling',
      status: 'In behandeling',
      description: `Wij gaan nu bekijken of u recht hebt op bijzondere bijstand. Het kan zijn dat u nog extra informatie moet opsturen.
        U ontvangt vóór {decisionDeadline} ons besluit.`,
    },
    herstelTermijn: {
      title: '{title}',
      status: 'Meer informatie nodig',
      description: `Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.
        U moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {decisionDeadline} ons besluit.

        Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.`,
    },
    beslissing: {
      Afwijzing: {
        title: '{title}',
        status: 'Beslissing',
        description:
          'U heeft geen recht op bijzondere bijstand. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: '{title}',
        status: 'Beslissing',
        description:
          'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      },
    },
  },
  Minimafonds: {
    aanvraag: {
      title: '{title}',
      status: 'Aanvraag',
      description: 'U hebt op {datePublished} een Stadspas aangevraagd.',
    },
    inBehandeling: {
      title: 'In behandeling',
      status: 'In behandeling',
      description: `Het kan zijn dat u nog extra informatie moet opsturen.
        U ontvangt vóór {decisionDeadline} ons besluit.
        Let op: Deze status informatie betreft alleen uw aanvraag voor een Stadspas; uw eventuele andere Hulp bij Laag Inkomen producten worden via post en/of telefoon afgehandeld.`,
    },
    herstelTermijn: {
      title: '{title}',
      status: 'Meer informatie nodig',
      description: `Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken. Bekijk de brief voor meer details.
        U moet de extra informatie vóór {userActionDeadline} opsturen. Dan ontvangt u vóór {decisionDeadline} ons besluit.

        Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder wij verder kunnen met de behandeling van uw aanvraag.`,
    },
    beslissing: {
      Afwijzing: {
        title: '{title}',
        status: 'Beslissing',
        description:
          'U heeft geen recht op een Stadspas. De reden voor afwijzing is {reasonForDecision}. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        title: '{title}',
        status: 'Beslissing',
        description: `
          U heeft recht op een Stadspas. Bekijk de brief voor meer details.
          [Meer informatie over de stadspas](https://www.amsterdam.nl/stadspas)
          `,
      },
    },
  },
};

// Object with properties that are used to replace strings in generated messages.
interface StepSourceData {
  id: string;
  title: string;
  decision: Decision;
  datePublished?: string;
  decisionDeadline?: string;
  userActionDeadline?: string;
  reasonForDecision?: string;
  latestStep: StepTitle;
  daysUserActionRequired: number;
  daysSupplierActionRequired: number;
  daysRecoveryAction: number;
  dateOfRequestStart: string;
  reden?: string;
}

export interface ProcessStep {
  id: string;
  documents: GenericDocument[];
  title: string;
  datePublished: string;
  description: string;
  isActual: boolean;
  status: RequestStatus | '';
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
  | 'title'
  | 'latestStep'
  | 'decision'
  | 'id'
  | 'daysUserActionRequired'
  | 'daysSupplierActionRequired'
  | 'daysRecoveryAction'
  | 'dateOfRequestStart'
  | 'reden'
> & { stepData: Step | null };

// Data for replacement tags in label data.
function getStepSourceData({
  id,
  title,
  stepData,
  latestStep,
  decision,
  dateOfRequestStart,
  daysUserActionRequired,
  daysSupplierActionRequired,
  daysRecoveryAction,
}: GetStepSourceDataArgs): StepSourceData {
  const stepDate = stepData ? stepData.datum : '';
  const userActionDeadline = calculateUserActionDeadline(
    stepData,
    daysRecoveryAction
  );
  return {
    id,
    title: translateProductTitle(title),
    latestStep,
    decision,
    daysUserActionRequired,
    daysSupplierActionRequired,
    datePublished: defaultDateFormat(stepDate),
    decisionDeadline: calculateDecisionDeadline(
      dateOfRequestStart,
      daysSupplierActionRequired,
      daysUserActionRequired,
      daysRecoveryAction
    ), // Decision will be made before this deadline.
    userActionDeadline, // Deadline for person to take action.
    reasonForDecision: stepData ? stepData.reden : '', // Why a decision was made.
    daysRecoveryAction,
    dateOfRequestStart,
  };
}

function replaceSourceDataTags(text: string, data: StepSourceData): string {
  let rText = text || '';
  const matches =
    rText && (rText.match(/[^{\}]+(?=})/g) as Array<keyof StepSourceData>);
  if (Array.isArray(matches)) {
    return matches.reduce((rText, key) => {
      let value = '';
      if (data[key]) {
        value = `${data[key]}`;
      }
      return data[key] ? rText.replace(`{${key}}`, value) : rText;
    }, rText);
  }
  return rText;
}

function calculateUserActionDeadline(
  stepData: Step | null,
  daysUserActionRequired: number
) {
  return stepData
    ? defaultDateFormat(addDays(stepData.datum, daysUserActionRequired))
    : '';
}

function calculateDecisionDeadline(
  dateOfRequestStart: string,
  daysSupplierActionRequired: number,
  daysUserActionRequired: number,
  daysRecoveryAction: number = 0
) {
  return defaultDateFormat(
    addDays(
      dateOfRequestStart,
      daysSupplierActionRequired + daysUserActionRequired + daysRecoveryAction
    )
  );
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
    datePublished: stepData ? stepData.datum : '-',
    description: stepLabels
      ? replaceSourceDataTags(stepLabels.description, sourceData)
      : '--NNB--',
    documents: stepData
      ? stepData.document.map(document =>
          formatFocusDocument(stepTitle, stepData.datum, document)
        )
      : [],
    isActual: stepTitle === sourceData.latestStep,
    status: stepLabels.status,
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
    dienstverleningstermijn: daysSupplierActionRequired,
    inspanningsperiode: daysUserActionRequired,
  } = product;

  const inProgress = isInProgess(decision, steps);
  const stepData = steps[latestStep];
  const stepLabels = inProgress
    ? (Labels[productType][latestStep] as Info)
    : (Labels[productType][latestStep] as InfoExtended)[decision];
  const daysRecoveryAction =
    steps.herstelTermijn && steps.herstelTermijn.aantalDagenHerstelTermijn
      ? parseInt(steps.herstelTermijn.aantalDagenHerstelTermijn, 10)
      : 0;
  const dateOfRequestStart = steps.aanvraag.datum;

  const sourceData = getStepSourceData({
    id: `${id}-${latestStep}`,
    title,
    decision,
    latestStep,
    stepData,
    dateOfRequestStart,
    daysSupplierActionRequired,
    daysUserActionRequired,
    daysRecoveryAction,
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
    supplier: '',
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
          daysSupplierActionRequired,
          daysUserActionRequired,
          daysRecoveryAction,
          dateOfRequestStart,
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
