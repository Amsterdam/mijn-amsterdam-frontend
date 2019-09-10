import { AppRoutes } from 'App.constants';
import { LinkProps } from 'App.types';
import { addDays, addMonths, differenceInCalendarDays } from 'date-fns';
import { defaultDateFormat } from 'helpers/App';
import { MyNotification } from 'hooks/api/my-notifications-api.hook';
import { Chapter, Chapters } from '../App.constants';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import React from 'react';
import { StatusLineItem } from 'components/StatusLine/StatusLine';
import { StepType } from '../components/StatusLine/StatusLine';
/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */

// The process steps are in order of:
type StepTitle =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'beslissing'
  | 'bezwaar';
export type RequestStatus =
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Beslissing';

// A decision can be made and currently have 3 values.
type Decision = 'Toekenning' | 'Afwijzing' | 'Buiten Behandeling';

// The official terms of the Focus api "product categories" data how they are used within the Municipality of Amsterdam.
type ProductOrigin = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

type TextPartContent = string | JSX.Element;
type TextPartContentFormatter = (data: StepSourceData) => TextPartContent;
type TextPartContents = TextPartContent | TextPartContentFormatter;

interface Info {
  title: TextPartContents;
  description: TextPartContents;
  status: RequestStatus;
  notification: {
    title: TextPartContents;
    description: TextPartContents;
  };
}

type InfoExtended = { [type in Decision]: Info };

interface ProductType {
  aanvraag: Info;
  inBehandeling: Info;
  herstelTermijn: Info;
  bezwaar: Info | null;
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
  // status: RequestStatus;
  aantalDagenHerstelTermijn?: string;
  reden?: string;
}

// Shape of the data returned from the Api
export interface FocusProduct {
  _id: string;
  soortProduct: ProductOrigin;
  typeBesluit: Decision;
  naam: string;
  processtappen: {
    aanvraag: Step;
    inBehandeling: Step | null;
    herstelTermijn: Step | null;
    beslissing: Step | null;
    bezwaar: Step | null;
  };
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

type FocusApiResponse = FocusProduct[];

// NOTE: MUST Keep in this order
const processSteps: StepTitle[] = [
  'aanvraag',
  'inBehandeling',
  'herstelTermijn',
  'beslissing',
];

const DAYS_KEEP_RECENT = 28;

// Object with properties that are used to replace strings in the generated messages above.
interface StepSourceData {
  id: string;
  productTitle: string;
  decision?: Decision;
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
  isActual: boolean;
  stepType: StatusLineItem['stepType'];
}

export interface ProcessStep extends StatusLineItem {
  id: string;
  documents: GenericDocument[];
  title: JSX.Element | string;
  description: JSX.Element | string;
  datePublished: string;
  status: RequestStatus | '';
  aboutStep: StepTitle;
}

export interface FocusItem {
  id: string;
  datePublished: string;
  title: JSX.Element | string;
  description: JSX.Element | string;
  latestStep: StepTitle;
  hasDecision: boolean;
  isRecent: boolean;

  // The null values are used to indicate there is no decision made yet
  isGranted: boolean | null;
  isDenied: boolean | null;
  isDiscarded: boolean | null;

  chapter: Chapter;
  link: LinkProps;
  process: ProcessStep[];
  productTitle: ProductTitle;
  notification?: MyNotification;
}

export interface ProductCollection {
  [productTitle: string]: {
    notifications: MyNotification[];
    items: FocusItem[];
  };
}

/**
 * A library of messages and titles with which we construct the information shown to the client */
export const Labels: LabelData = {
  Participatiewet: {
    aanvraag: {
      notification: {
        title: data => `${data.productTitle}: Wij hebben uw aanvraag ontvangen`,
        description: data =>
          `Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen op ${
            data.dateStart
          }.`,
      },
      title: data => data.productTitle,
      status: 'Aanvraag',
      description: data => (
        <>
          <p>U hebt op {data.dateStart} een bijstandsuitkering aangevraagd.</p>
          <p>
            <ButtonLinkExternal to="https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D">
              Wat kunt u van ons verwachten?
            </ButtonLinkExternal>
          </p>
        </>
      ),
    },
    inBehandeling: {
      notification: {
        title: data => `${data.productTitle}: Wij behandelen uw aanvraag`,
        description: data =>
          `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${
            data.datePublished
          }.`,
      },
      title: data => data.productTitle,
      status: 'In behandeling',
      description: data => (
        <>
          <p>
            Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u
            nog extra informatie moet opsturen. U ontvangt vóór{' '}
            {data.decisionDeadline1} ons besluit.
          </p>
          <p>
            Lees meer over uw
            <br />
            <ButtonLinkExternal to="https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d">
              rechten
            </ButtonLinkExternal>{' '}
            en{' '}
            <ButtonLinkExternal to="https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d">
              plichten
            </ButtonLinkExternal>
          </p>
        </>
      ),
    },
    herstelTermijn: {
      notification: {
        title: data => `${data.productTitle}: Neem actie`,
        description:
          'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
      },
      title: data => data.productTitle,
      status: 'Meer informatie nodig',
      description: data => (
        <>
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
            vóór {data.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.`
          </p>
        </>
      ),
    },
    beslissing: {
      Afwijzing: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is afgewezen`,
          description: data =>
            `U heeft geen recht op een bijstandsuitkering (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'U heeft geen recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is toegekend`,
          description: data =>
            `U heeft recht op een bijstandsuitkering (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description: data => (
          <>
            <p>
              U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer
              details.
            </p>
            <p>
              <ButtonLinkExternal to="https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D">
                Bekijk hier de betaaldata van de uitkering
              </ButtonLinkExternal>
            </p>
          </>
        ),
      },
      'Buiten Behandeling': {
        notification: {
          title: data =>
            `${data.productTitle}: Uw aanvraag is buiten behandeling gesteld`,
          description: data =>
            `Uw aanvraag is buiten behandeling gesteld (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
      },
    },
    bezwaar: null,
  },
  'Bijzondere Bijstand': {
    aanvraag: {
      notification: {
        title: data => `${data.productTitle}: Wij hebben uw aanvraag ontvangen`,
        description: data =>
          `Wij hebben uw aanvraag voor bijzondere bijstand ontvangen op ${
            data.dateStart
          }.`,
      },
      title: data => data.productTitle,
      status: 'Aanvraag',
      description: data =>
        `U hebt op ${
          data.dateStart
        } een bijzondere bijstandsuitkering aangevraagd.`,
    },
    inBehandeling: {
      notification: {
        title: data => `${data.productTitle}: Wij behandelen uw aanvraag`,
        description: data =>
          `Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen op ${
            data.datePublished
          }.`,
      },
      title: data => `${data.productTitle} in behandeling`,
      status: 'In behandeling',
      description: data => (
        <p>
          Wij gaan nu bekijken of u recht hebt op bijzondere bijstand. Het kan
          zijn dat u nog extra informatie moet opsturen. U ontvangt vóór{' '}
          {data.decisionDeadline1} ons besluit.
        </p>
      ),
    },
    herstelTermijn: {
      notification: {
        title: data => `${data.productTitle}: Neem actie`,
        description:
          'Er is meer informatie en tijd nodig om uw aanvraag voor bijzondere bijstand te behandelen.',
      },
      title: data => data.productTitle,
      status: 'Meer informatie nodig',
      description: data => (
        <>
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
            vóór {data.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.`
          </p>
        </>
      ),
    },
    beslissing: {
      Afwijzing: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is afgewezen`,
          description: data =>
            `U heeft geen recht op bijzondere bijstand (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'U heeft geen recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is toegekend`,
          description: data =>
            `U heeft recht op bijzondere bijstand (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
      },
      'Buiten Behandeling': {
        notification: {
          title: data =>
            `${data.productTitle}: Uw aanvraag is buiten behandeling gesteld`,
          description: data =>
            `Uw aanvraag is buiten behandeling gesteld (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
      },
    },
    bezwaar: null,
  },
  Minimafonds: {
    aanvraag: {
      notification: {
        title: data => `${data.productTitle}: Wij hebben uw aanvraag ontvangen`,
        description: data =>
          `Wij hebben uw aanvraag voor een Stadspas ontvangen op ${
            data.dateStart
          }.`,
      },
      title: data => data.productTitle,
      status: 'Aanvraag',
      description: data =>
        `U hebt op ${data.datePublished} een Stadspas aangevraagd.`,
    },
    inBehandeling: {
      notification: {
        title: data => `${data.productTitle}: Wij behandelen uw aanvraag`,
        description: data =>
          `Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op ${
            data.datePublished
          }.`,
      },
      title: data => data.productTitle,
      status: 'In behandeling',
      description: data => (
        <>
          <p>
            Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
            vóór {data.decisionDeadline1} ons besluit.
            <br />
            <strong>
              Let op: Deze status informatie betreft alleen uw aanvraag voor een
              Stadspas;
            </strong>
            <br />
            uw eventuele andere Hulp bij Laag Inkomen producten worden via post
            en/of telefoon afgehandeld.
          </p>
        </>
      ),
    },
    herstelTermijn: {
      notification: {
        title: data => `${data.productTitle}: Neem actie`,
        description:
          'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
      },
      title: data => data.productTitle,
      status: 'Meer informatie nodig',
      description: data => (
        <>
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
            vóór {data.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        </>
      ),
    },
    beslissing: {
      Afwijzing: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is afgewezen`,
          description: data =>
            `U heeft geen recht op een Stadspas (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'U heeft geen recht op een Stadspas. Bekijk de brief voor meer details.',
      },
      Toekenning: {
        notification: {
          title: data => `${data.productTitle}: Uw aanvraag is toegekend`,
          description:
            'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description: data => (
          <>
            <p>
              U heeft recht op een Stadspas. Bekijk de brief voor meer details.
            </p>
            <p>
              <ButtonLinkExternal to="https://www.amsterdam.nl/stadspas">
                Meer informatie over de stadspas
              </ButtonLinkExternal>
            </p>
          </>
        ),
      },
      'Buiten Behandeling': {
        notification: {
          title: data =>
            `${data.productTitle}: Uw aanvraag is buiten behandeling gesteld`,
          description: data =>
            `Uw aanvraag is buiten behandeling gesteld (besluit: ${
              data.datePublished
            }).`,
        },
        title: data => data.productTitle,
        status: 'Beslissing',
        description:
          'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
      },
    },
    bezwaar: null,
  },
};

export const ProductTitles = {
  Bijstandsuitkering: 'Levensonderhoud',
  Stadspas: 'Stadspas',
  BijzondereBijstand: 'Bijzondere bijstand',
};

export const ProductOrigins = {
  Participatiewet: 'Participatiewet',
  'Bijzondere Bijstand': 'Bijzondere Bijstand',
  Minimafonds: 'Minimafonds',
};

// NOTE: Possibly deprecated because it seems document titles actually contain meaningful names in the latest api response.
const DocumentTitles: { [originalTitle: string]: string } = {
  'LO: Aanvraag': 'Aanvraag bijstandsuitkering',
  'LO: Besluit': 'Besluit aanvraag bijstandsuitkering',
  'LO: In behandeling': 'Uw aanvraag is in behandeling genomen',
  'LO: Herstel': 'Verzoek om aanvullende informatie van u',
};

const AppRoutesByProductOrigin = {
  [ProductOrigins.Participatiewet]: AppRoutes.BIJSTANDSUITKERING,
  [ProductOrigins.Minimafonds]: AppRoutes.STADSPAS,
  [ProductOrigins['Bijzondere Bijstand']]: AppRoutes.BIJZONDERE_BIJSTAND,
};

/** Checks if an item returned from the api is considered recent */
function isRecentItem(
  decision: Decision,
  steps: FocusProduct['processtappen'],
  compareDate: Date
) {
  const noDecision = !decision;

  let hasRecentDecision = false;

  if (steps.beslissing !== null) {
    hasRecentDecision =
      differenceInCalendarDays(compareDate, steps.beslissing.datum) <
      DAYS_KEEP_RECENT;
  }

  return noDecision || hasRecentDecision;
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
  | 'productTitle'
  | 'latestStep'
  | 'stepType'
  | 'isActual'
  | 'decision'
  | 'id'
  | 'daysUserActionRequired'
  | 'daysSupplierActionRequired'
  | 'daysRecoveryAction'
  | 'dateStart'
  | 'reden'
> & { stepData: Step | null };

// Data for conveniently constructing the information shown to the clien.
function getStepSourceData({
  id,
  productTitle,
  stepData,
  latestStep,
  stepType,
  isActual,
  decision,
  dateStart,
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
    productTitle: translateProductTitle(productTitle),
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
    stepType,
    isActual,
  };
}

export function parseLabelContent(
  text: TextPartContents,
  data: StepSourceData
): string | JSX.Element {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(data);
  }

  return rText;
}

// Returns the date before which a client has to respond with information regarding a request for a product.
function calculateUserActionDeadline(
  stepData: Step | null,
  daysUserActionRequired: number
) {
  return stepData
    ? defaultDateFormat(addDays(stepData.datum, daysUserActionRequired))
    : '';
}

// Returns the date before which municipality has to inform the client about a decision that has been made regarding his/her request for a product.
function calculateDecisionDeadline(
  dateStart: string,
  daysSupplierActionRequired: number,
  daysUserActionRequired: number,
  daysRecoveryAction: number = 0
) {
  return defaultDateFormat(
    addDays(
      dateStart,
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
    title: DocumentTitles[title] || title,
    url: `/api/${url}`,
    datePublished,
    type: stepTitle,
  };
}

export function formatFocusNotificationItem(
  item: FocusItem,
  step: ProcessStep,
  productOrigin: ProductOrigin,
  sourceData: StepSourceData
): MyNotification {
  const stepLabels = Labels[productOrigin][step.aboutStep] as any; // Can't work the right TS construct here atm.
  const stepLabelSource = !!sourceData.decision
    ? stepLabels[sourceData.decision]
    : stepLabels;
  const route = AppRoutesByProductOrigin[productOrigin];

  return {
    id: step.id,
    datePublished: step.datePublished,
    chapter: Chapters.INKOMEN,
    title:
      stepLabelSource.notification &&
      parseLabelContent(stepLabelSource.notification.title, sourceData),
    description:
      stepLabelSource.notification &&
      parseLabelContent(stepLabelSource.notification.description, sourceData),
    link: {
      to: `${route}/${item.id}#${step.id}`,
      title: 'Meer informatie',
    },
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
      ? parseLabelContent(stepLabels.title, sourceData)
      : stepTitle,
    datePublished: stepData ? stepData.datum : '-',
    description: stepLabels
      ? parseLabelContent(stepLabels.description, sourceData)
      : '--NNB--',
    documents: stepData
      ? stepData.document.map(document =>
          formatFocusDocument(stepTitle, stepData.datum, document)
        )
      : [],
    status: stepLabels.status,
    aboutStep: stepTitle,
    isActual: sourceData.isActual,
    isHistorical: !sourceData.isActual,
    stepType: sourceData.stepType,
  };
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function formatFocusProduct(
  product: FocusProduct,
  compareData: Date
): FocusItem {
  const {
    _id: id,
    soortProduct: productOrigin,
    typeBesluit: decision,
    processtappen: steps,
    naam: productTitle,
    dienstverleningstermijn: daysSupplierActionRequired,
    inspanningsperiode: daysUserActionRequired = 28,
  } = product;

  // Find the latest active step of the request process.
  const latestStep =
    [...processSteps].reverse().find(step => {
      return step in steps && steps[step] !== null;
    }) || processSteps[0];

  // Determine if this items falls within a recent period (of xx days)
  const isRecent = isRecentItem(decision, steps, compareData);

  // The data about the latest step
  const latestStepData = steps[latestStep];

  const hasDecision = steps.beslissing !== null;

  const stepLabels = !hasDecision
    ? (Labels[productOrigin][latestStep] as Info)
    : (Labels[productOrigin][latestStep] as InfoExtended)[decision];

  // within x days a person is required to take action
  const daysRecoveryAction =
    steps.herstelTermijn && steps.herstelTermijn.aantalDagenHerstelTermijn
      ? parseInt(steps.herstelTermijn.aantalDagenHerstelTermijn, 10)
      : 0;

  // Start of the request process
  const dateStart = steps.aanvraag.datum;

  const sourceData = getStepSourceData({
    id: `${id}-${latestStep}`,
    productTitle,
    decision,
    latestStep,
    stepData: latestStepData,
    dateStart,
    daysSupplierActionRequired,
    daysUserActionRequired,
    daysRecoveryAction,
    isActual: false,
    stepType: 'intermediate-step',
  });

  const processStepsFiltered = processSteps.filter(
    stepTitle => !!steps[stepTitle]
  );

  const item = {
    id,
    chapter: Chapters.INKOMEN,

    // Date on which the last updated information (Step) was published,
    datePublished: sourceData.datePublished || '',

    // Date on which the request process was first published
    dateStart: defaultDateFormat(dateStart),

    // Regular title, can be turned into more elaborate descriptive information. E.g Bijstandsuitkering could become Uw Aanvraag voor een bijstandsuitkering.
    title: parseLabelContent(stepLabels.title, sourceData),

    // The name of the product (Stadspas, Levensonderhoud ...)
    productTitle,
    description: parseLabelContent(stepLabels.description, sourceData),
    latestStep,
    isRecent,
    hasDecision,
    isGranted: hasDecision ? decision === 'Toekenning' : null,
    isDenied: hasDecision ? decision === 'Afwijzing' : null,
    isDiscarded: hasDecision ? decision === 'Buiten Behandeling' : null,
    link: {
      title: 'Meer informatie', // TODO: How to get custom link title?
      to: `${AppRoutesByProductOrigin[productOrigin]}/${id}`,
    },
    process: processStepsFiltered.map((stepTitle, index) => {
      const stepData = steps[stepTitle] || null;
      const isActual = stepTitle === latestStep;
      let stepType: StepType = 'intermediate-step';

      switch (stepTitle) {
        case 'aanvraag':
          stepType = 'first-step';
          break;
        case 'beslissing':
          stepType = 'last-step';
          break;
        default:
          break;
      }

      const sourceData = getStepSourceData({
        id: `${id}-${stepTitle}`,
        productTitle,
        decision,
        latestStep,
        stepData,
        daysSupplierActionRequired,
        daysUserActionRequired,
        daysRecoveryAction,
        dateStart,
        isActual,
        stepType,
      });

      return formatStepData(sourceData, productOrigin, stepTitle, stepData);
    }),
  };

  const latestStepItem = item.process[item.process.length - 1];

  const focusItem = {
    ...item,
    notification: formatFocusNotificationItem(
      item,
      latestStepItem,
      productOrigin,
      sourceData
    ),
  };

  return focusItem;
}

function formatFocusApiResponse(products: FocusApiResponse): FocusItem[] {
  const d = new Date();
  return products.map(product => formatFocusProduct(product, d));
}

/**
 * Organise the data in a easy to access object so we can refer to
 * specific types of products when using the data throughout the app
 */
export function formatProductCollections(items: FocusProduct[]) {
  const allItems = formatFocusApiResponse(items);
  const products: ProductCollection = {};
  const allNotifications: MyNotification[] = [];

  for (const item of allItems) {
    const { productTitle } = item;
    // Exclude Bijzondere Bijstand
    if (productTitle !== ProductTitles.BijzondereBijstand) {
      let productCollecton = products[productTitle];

      if (!productCollecton) {
        productCollecton = products[productTitle] = {
          notifications: [],
          items: [],
        };
      }

      if (item.notification) {
        productCollecton.notifications.push(item.notification);
        allNotifications.push(item.notification);
      }

      productCollecton.items.push(item);
    }
  }

  return {
    allItems,
    allNotifications,
    products,
  };
}
