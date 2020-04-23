import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { generatePath } from 'react-router-dom';
import {
  AppRoutes,
  Chapters,
  FeatureToggle,
  TOZO_PRODUCT_TITLE,
} from '../../universal/config';
import {
  dateSort,
  defaultDateFormat,
  apiSuccesResult,
} from '../../universal/helpers';
import {
  LinkProps,
  MyCase,
  MyNotification,
} from '../../universal/types/App.types';
import { requestData } from '../helpers';
import { ApiUrls, getApiConfigValue } from './config';

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
  | 'Besluit'
  | 'Bezwaar';

// A decision can be made and currently have 3 values.
type Decision = 'Toekenning' | 'Afwijzing' | 'Buiten Behandeling';
type DecisionFormatted = 'toekenning' | 'afwijzing' | 'buitenbehandeling';

function getDecision(decision: Decision): DecisionFormatted {
  return decision.toLocaleLowerCase().replace(/\s/gi, '') as DecisionFormatted;
}

// The official terms of the Focus api "product categories" data how they are used within the Municipality of Amsterdam.
type ProductOrigin = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
type ProductTitle =
  | 'Levensonderhoud'
  | 'Stadspas'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;

const sourceProductsWhitelisted = [
  'Levensonderhoud',
  'Stadspas',
  TOZO_PRODUCT_TITLE,
];

type TextPartContent = string;
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

type InfoExtended = { [decision: string]: Info };

interface ProductType {
  aanvraag: Info;
  inBehandeling: Info | null;
  herstelTermijn: Info | null;
  bezwaar: Info | null;
  beslissing: InfoExtended | null;
}

type LabelData = {
  [origin in ProductOrigin]: { [productTitle in ProductTitle]: ProductType };
};

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
    inBehandeling: Step;
    herstelTermijn: Step;
    beslissing: Step;
    bezwaar: Step;
  };
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

export type FOCUSAanvragenSourceData = FocusProduct[];

// NOTE: MUST Keep in this order
const processSteps: StepTitle[] = [
  'aanvraag',
  'inBehandeling',
  'herstelTermijn',
  'beslissing',
];

export const stepLabels: Record<StepTitle, RequestStatus> = {
  aanvraag: 'Aanvraag',
  inBehandeling: 'In behandeling',
  herstelTermijn: 'Meer informatie nodig',
  beslissing: 'Besluit',
  bezwaar: 'Bezwaar',
};

const stepStatusLabels = stepLabels;

const DAYS_KEEP_RECENT = 28;

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

interface FocusDocument {
  id: string;
  title: string;
  url: string;
  type: string;
  datePublished: string;
}

export interface ProcessStep {
  id: string;
  documents: FocusDocument[];
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
  ISODatePublished: string;
  dateStart: string;
  title: string;
  description: string;

  // To determine in which list these items must occur.
  hasDecision: boolean;
  isRecent: boolean;

  link: LinkProps;
  process: ProcessStep[];
}

export interface ProductCollection {
  [productTitle: string]: {
    notifications: MyNotification[];
    items: FocusItem[];
  };
}

const FocusExternalUrls = {
  BijstandsUitkeringAanvragenRechten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d',
  BijstandsUitkeringAanvragenPlichten:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d',
  BijstandsUitkeringAanvragen:
    'https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D',
  BetaalDataUitkering:
    'https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D',
  StadsPas: 'https://www.amsterdam.nl/stadspas',
};

/**
 * A library of messages and titles with which we construct the information shown to the client */
export const Labels: LabelData = {
  Participatiewet: {
    Levensonderhoud: {
      aanvraag: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij hebben uw aanvraag ontvangen`,
          description: data =>
            `Wij hebben uw aanvraag voor een bijstandsuitkering ontvangen op ${data.dateStart}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.aanvraag,
        description: data =>
          `
          <p>U hebt op ${data.dateStart} een bijstandsuitkering aangevraagd.</p>
          <p>
            <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragen}
              rel="external noopener noreferrer"
            >
              Wat kunt u van ons verwachten?
            </a>
          </p>
        `,
      },
      inBehandeling: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
          description: data =>
            `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${data.datePublished}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.inBehandeling,
        description: data =>
          `
          <p>
            Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u
            nog extra informatie moet opsturen. U ontvangt vóór ${data.decisionDeadline1} ons besluit.
          </p>
          <p>
            Lees meer over uw
            <br />
            <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragenRechten}
              rel="external noopener noreferrer"
            >
              rechten
            </a> en <a
              href=${FocusExternalUrls.BijstandsUitkeringAanvragenPlichten}
              rel="external noopener noreferrer"
            >
              plichten
            </a>
          </p>
        `,
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description:
            'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.herstelTermijn,
        description: data =>
          `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór ${data.userActionDeadline} opsturen. Dan ontvangt u
            vóór ${data.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
      },
      beslissing: {
        [getDecision('Afwijzing')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is afgewezen`,
            description: data =>
              `U heeft geen recht op een bijstandsuitkering (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'U heeft geen recht op een bijstandsuitkering. Bekijk de brief voor meer details.',
        },
        [getDecision('Toekenning')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description: data =>
              `U heeft recht op een bijstandsuitkering (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description: data =>
            `
            <p>
              U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer
              details.
            </p>
            <p>
              <a
                href=${FocusExternalUrls.BetaalDataUitkering}
                rel="external noopener noreferrer"
              >
                Bekijk hier de betaaldata van de uitkering
              </a>
            </p>
          `,
        },
        [getDecision('Buiten Behandeling')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
  },
  'Bijzondere Bijstand': {
    [TOZO_PRODUCT_TITLE]: {
      aanvraag: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij hebben uw aanvraag ontvangen`,
          description: data =>
            `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} ontvangen op ${data.datePublished}`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.aanvraag,
        description: data =>
          `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} ontvangen op ${data.datePublished}`,
      },
      inBehandeling: null,
      herstelTermijn: null,
      // inBehandeling: {
      //   notification: {
      //     title: data => `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
      //     description: data =>
      //       `Wij hebben uw aanvraag voor bijzondere bijstand in behandeling genomen op ${data.datePublished}.`,
      //   },
      //   title: data => `${data.productTitleTranslated} in behandeling`,
      //   status: stepStatusLabels.inBehandeling,
      //   description: data =>
      //     `<p>
      //            Wij gaan nu bekijken of u recht hebt op bijzondere bijstand.
      //            Het kan zijn dat u nog extra informatie moet opsturen. U
      //            ontvangt vóór ${data.decisionDeadline1} ons besluit.
      //          </p>`,
      // },
      // herstelTermijn: {
      //   notification: {
      //     title: data => `${data.productTitleTranslated}: Neem actie`,
      //     description:
      //       'Er is meer informatie en tijd nodig om uw aanvraag voor bijzondere bijstand te behandelen.',
      //   },
      //   title: data => data.productTitleTranslated,
      //   status: stepStatusLabels.herstelTermijn,
      //   description: data =>
      //     `
      //     <p>
      //       Wij hebben meer informatie en tijd nodig om uw aanvraag te
      //       verwerken. Bekijk de brief voor meer details. U moet de extra
      //       informatie vóór ${data.userActionDeadline} opsturen. Dan ontvangt u
      //       vóór ${data.decisionDeadline2} ons besluit.
      //     </p>
      //     <p>
      //       Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
      //       in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
      //       wij verder kunnen met de behandeling van uw aanvraag.
      //     </p>
      //   `,
      // },
      beslissing: {
        [getDecision('Afwijzing')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is afgewezen`,
            description: data =>
              `U heeft geen recht op bijzondere bijstand (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'U heeft geen recht op bijzondere bijstand. Bekijk de brief voor meer details.',
        },
        [getDecision('Toekenning')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description: data =>
              `U heeft recht op bijzondere bijstand (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'U heeft recht op bijzondere bijstand. Bekijk de brief voor meer details.',
        },
        [getDecision('Buiten Behandeling')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
  },
  Minimafonds: {
    Stadspas: {
      aanvraag: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij hebben uw aanvraag ontvangen`,
          description: data =>
            `Wij hebben uw aanvraag voor een Stadspas ontvangen op ${data.dateStart}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.aanvraag,
        description: data =>
          `U hebt op ${data.datePublished} een Stadspas aangevraagd.`,
      },
      inBehandeling: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
          description: data =>
            `Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op ${data.datePublished}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.inBehandeling,
        description: data =>
          `
          <p>
            Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
            vóór ${data.decisionDeadline1} ons besluit.
          </p>
          <p>
            <strong>
              Let op: Deze statusinformatie betreft alleen uw aanvraag voor een
              Stadspas.
            </strong>
            <br />
            Uw eventuele andere Hulp bij Laag Inkomen producten worden via post
            en/of telefoon afgehandeld.
          </p>
        `,
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description:
            'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
        },
        title: data => data.productTitleTranslated,
        status: stepStatusLabels.herstelTermijn,
        description: data =>
          `
          <p>
            Wij hebben meer informatie en tijd nodig om uw aanvraag te
            verwerken. Bekijk de brief voor meer details. U moet de extra
            informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
            vóór ${data.decisionDeadline2} ons besluit.
          </p>
          <p>
            Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
            in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
            wij verder kunnen met de behandeling van uw aanvraag.
          </p>
        `,
      },
      beslissing: {
        [getDecision('Afwijzing')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is afgewezen`,
            description: data =>
              `U heeft geen recht op een Stadspas (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'U heeft geen recht op een Stadspas. Bekijk de brief voor meer details.',
        },
        [getDecision('Toekenning')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description:
              'U heeft recht op een Stadspas. Bekijk de brief voor meer details.',
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description: data =>
            `
            <p>
              U heeft recht op een Stadspas. Bekijk de brief voor meer details.
            </p>
            <p>
              <a href=${FocusExternalUrls.StadsPas} external={true}>
                Meer informatie over de stadspas
              </a>
            </p>
          `,
        },
        [getDecision('Buiten Behandeling')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepStatusLabels.beslissing,
          description:
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
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

type RoutesByProductOrigin = {
  [origin in ProductOrigin]: { [productTitle in ProductTitle]: string };
};

const AppRoutesByProductOrigin: RoutesByProductOrigin = {
  Participatiewet: {
    Levensonderhoud: AppRoutes['INKOMEN/BIJSTANDSUITKERING'],
  },
  Minimafonds: {
    Stadspas: AppRoutes['INKOMEN/STADSPAS'],
  },
  'Bijzondere Bijstand': {
    'Bijzondere Bijstand': AppRoutes['INKOMEN/BIJZONDERE_BIJSTAND'],
    [TOZO_PRODUCT_TITLE]: AppRoutes['INKOMEN/TOZO_COVID19'],
  },
};

/** Checks if an item returned from the api is considered recent */
function isRecentItem(
  decision: DecisionFormatted,
  steps: FocusProduct['processtappen'],
  compareDate: Date
) {
  const noDecision = !decision;

  let hasRecentDecision = false;

  if (steps.beslissing !== null) {
    hasRecentDecision =
      differenceInCalendarDays(compareDate, new Date(steps.beslissing.datum)) <
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

interface StepSourceDataArgs {
  stepData: Step;
  id: string;
  productTitle: string;
  productOrigin: ProductOrigin;
  latestStep: StepTitle;
  isLastActive: boolean;
  isRecent: boolean;
  decision: DecisionFormatted;
  dateStart: string; // The official start date of the clients request process.
  daysUserActionRequired: number;
  daysSupplierActionRequired: number;
  daysRecoveryAction: number; // The number of days a client has to provide more information about a request
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
    stepData,
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

function parseLabelContent(
  text: TextPartContents,
  data: StepSourceData
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(data);
  }

  return rText;
}

// Returns the date before which a client has to respond with information regarding a request for a product.
function calculateUserActionDeadline(
  stepData: Step,
  daysUserActionRequired: number
) {
  return stepData
    ? defaultDateFormat(
        addDays(parseISO(stepData.datum), daysUserActionRequired)
      )
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
      parseISO(dateStart),
      daysSupplierActionRequired + daysUserActionRequired + daysRecoveryAction
    )
  );
}

function formatFocusDocument(
  stepTitle: StepTitle,
  datePublished: string,
  document: Document
): FocusDocument {
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
  sourceData: StepSourceData
): MyNotification {
  const stepLabels = Labels[sourceData.productOrigin][sourceData.productTitle][
    sourceData.latestStep
  ] as any; // Can't work the right TS construct here atm.

  const stepLabelSource = !!sourceData.decision
    ? stepLabels[sourceData.decision]
    : stepLabels;

  return {
    id: `notification-${step.id}`,
    datePublished: step.datePublished,
    chapter: Chapters.INKOMEN,
    title:
      stepLabelSource &&
      stepLabelSource.notification &&
      parseLabelContent(stepLabelSource.notification.title, sourceData),
    description:
      stepLabelSource &&
      stepLabelSource.notification &&
      parseLabelContent(stepLabelSource.notification.description, sourceData),
    link: {
      to: item.link.to,
      title: 'Meer informatie',
    },
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
      ? (Labels[productOrigin][sourceData.productTitle][
          stepTitle
        ] as InfoExtended)[sourceData.decision]
      : (Labels[productOrigin][sourceData.productTitle][stepTitle] as Info);

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
        ? stepData.document.map(document =>
            formatFocusDocument(stepTitle, stepData.datum, document)
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
  ISODatePublished: string;
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function transformFocusSourceProduct(
  product: FocusProduct,
  compareDate: Date
): FocusProductTransformed {
  const {
    _id,
    soortProduct: productOrigin,
    typeBesluit: rawDecision,
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

  const id = `${_id}-${latestStep}`;

  const decision = getDecision(rawDecision || '');

  // Determine if this items falls within a recent period (of xx days)
  const isRecent = isRecentItem(decision, steps, compareDate);

  // The data about the latest step
  const latestStepData = steps[latestStep] as Step;

  const hasDecision = steps.beslissing !== null;

  const stepLabels = !hasDecision
    ? (Labels[productOrigin][productTitle][latestStep] as Info)
    : (Labels[productOrigin][productTitle][latestStep] as InfoExtended)[
        decision
      ];

  // within x days a person is required to take action
  const daysRecoveryAction =
    steps.herstelTermijn && steps.herstelTermijn.aantalDagenHerstelTermijn
      ? parseInt(steps.herstelTermijn.aantalDagenHerstelTermijn, 10)
      : 0;

  // Start of the request process
  const dateStart = steps.aanvraag.datum;
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
      !!steps[stepTitle] && !!Labels[productOrigin][productTitle][stepTitle]
    );
  });

  const route = generatePath(
    AppRoutesByProductOrigin[productOrigin][productTitle],
    {
      id,
    }
  );

  const ISODatePublished = latestStepData?.datum || '';

  const item = {
    id,
    chapter: Chapters.INKOMEN,

    // Date on which the last updated information (Step) was published,
    datePublished: sourceData.datePublished || '',
    ISODatePublished: latestStepData?.datum || '',

    // Date on which the request process was first published
    dateStart: defaultDateFormat(dateStart),

    // Regular title, can be turned into more elaborate descriptive information. E.g Bijstandsuitkering could become Uw Aanvraag voor een bijstandsuitkering.
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

        return formatStepData(sourceData, productOrigin, stepTitle, stepData);
      }),
  };

  const latestStepItem = item.process[item.process.length - 1];

  return {
    item,
    ISODatePublished,
    notification: formatFocusNotificationItem(item, latestStepItem, sourceData),
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

function transformFOCUSAanvragenData(
  responseData: FOCUSAanvragenSourceData,
  compareDate: Date
) {
  if (!Array.isArray(responseData)) {
    return [];
  }

  return responseData
    .filter(item => sourceProductsWhitelisted.includes(item.naam))
    .map(product => transformFocusSourceProduct(product, compareDate))
    .sort(dateSort('ISODatePublished', 'desc'));
}

function fetchFOCUS(sessionID: SessionID) {
  return requestData<FocusProductTransformed[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,
      transformResponse: data => transformFOCUSAanvragenData(data, new Date()),
    },
    sessionID,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );
}

export async function fetchFOCUSAanvragen(sessionID: SessionID) {
  const response = await fetchFOCUS(sessionID);
  if (response.status === 'OK') {
    const focusItems = response.content.map(prod => prod.item);

    console.log('focusItems:::', response.content);
    return apiSuccesResult(focusItems);
  }
  return response;
}

export async function fetchFOCUSAanvragenGenerated(sessionID: SessionID) {
  const response = await fetchFOCUS(sessionID);

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
