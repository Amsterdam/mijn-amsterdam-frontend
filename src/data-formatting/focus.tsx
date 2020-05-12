import { Chapter, Chapters } from 'config/Chapter.constants';
import { FocusCombined, FocusCombinedResponse } from 'hooks/api/api.focus';
import React, { ReactNode } from 'react';
import { StatusLineItem, StepType } from 'components/StatusLine/StatusLine';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { dateSort, defaultDateFormat } from 'helpers/App';

import { AppRoutes } from 'config/Routing.constants';
import { ReactComponent as DocumentIcon } from 'assets/icons/Document.svg';
import { FeatureToggle } from 'config/App.constants';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';
import { LinkProps } from 'App.types';
import Linkd from 'components/Button/Button';
import { MyNotification } from '../hooks/api/my-notifications-api.hook';
import { generatePath } from 'react-router';
import styles from 'pages/Inkomen/Inkomen.module.scss';
import { dateFormat } from '../helpers/App';

/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */

// The process steps are in order of:
export type StepTitle =
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
  | 'Voorschot'
  | 'Bezwaar'
  | string;

// A decision can be made and currently have 3 values.
type Decision = 'Toekenning' | 'Afwijzing' | 'Buiten Behandeling';
type DecisionFormatted = 'toekenning' | 'afwijzing' | 'buitenbehandeling';

export function getDecision(decision: Decision): DecisionFormatted {
  return decision.toLocaleLowerCase().replace(/\s/gi, '') as DecisionFormatted;
}

// The official terms of the Focus api "product categories" data how they are used within the Municipality of Amsterdam.
type ProductOrigin = 'Participatiewet' | 'Bijzondere Bijstand' | 'Minimafonds';

// The official terms of the Focus api "product" names how they are used within the Municipality of Amsterdam.
type ProductTitle = 'Levensonderhoud' | 'Stadspas' | string;

const formattedProductTitleWhitelisted = ['Levensonderhoud', 'Stadspas'];

type TextPartContent = string | JSX.Element;
type TextPartContentFormatter = (data: StepSourceData) => TextPartContent;
type TextPartContentFormatterString = (data: StepSourceData) => string;
type TextPartContents = TextPartContent | TextPartContentFormatter;

interface Info {
  title: string | TextPartContentFormatterString;
  description: TextPartContents;
  status: RequestStatus;
  notification: {
    title: string | TextPartContentFormatterString;
    description: TextPartContents;
    linkTitle?: string;
  };
}

type InfoExtended = { [decision: string]: Info };

export interface ProductType {
  aanvraag: Info | null;
  inBehandeling: Info | null;
  voorschot?: Info | null;
  herstelTermijn: Info | null;
  bezwaar?: Info | null;
  beslissing?: InfoExtended | null;
}

export type LabelData = {
  [origin in ProductOrigin]: { [productTitle in ProductTitle]: ProductType };
};

export interface FocusDocument {
  $ref: string;
  id: number;
  isBulk: boolean;
  isDms: boolean;
  omschrijving: string;
}

interface Step {
  document: FocusDocument[];
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
    aanvraag: Step | null;
    inBehandeling: Step | null;
    herstelTermijn: Step | null;
    beslissing: Step | null;
    bezwaar: Step | null;
  };
  dienstverleningstermijn: number;
  inspanningsperiode: number;
}

export type FocusApiResponse = FocusProduct[];

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
  stepType: StatusLineItem['stepType'];
}

export interface ProcessStep extends StatusLineItem {
  id: string;
  documents: GenericDocument[];
  title: string;
  description: JSX.Element | string;
  datePublished: string;
  status: RequestStatus | '';
  aboutStep: StepTitle;
  isRecent: boolean;
}

export interface FocusItem {
  id: string;
  dateStart: string;
  datePublished: string;
  ISODatePublished: string;
  title: string;
  description: JSX.Element | string;
  latestStep: StepTitle;
  status: string;
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
  productOrigin: ProductOrigin;
  notification?: MyNotification;
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
  Stadspas: 'https://www.amsterdam.nl/stadspas',
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
        status: stepLabels.aanvraag,
        description: data => (
          <>
            <p>
              U hebt op {data.dateStart} een bijstandsuitkering aangevraagd.
            </p>
            <p>
              <Linkd
                href={FocusExternalUrls.BijstandsUitkeringAanvragen}
                external={true}
              >
                Wat kunt u van ons verwachten?
              </Linkd>
            </p>
          </>
        ),
      },
      inBehandeling: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
          description: data =>
            `Wij hebben uw aanvraag voor een bijstandsuitkering in behandeling genomen op ${data.datePublished}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.inBehandeling,
        description: data => (
          <>
            <p>
              Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat
              u nog extra informatie moet opsturen. U ontvangt vóór{' '}
              {data.decisionDeadline1} ons besluit.
            </p>
            <p>
              Lees meer over uw
              <br />
              <Linkd
                href={FocusExternalUrls.BijstandsUitkeringAanvragenRechten}
                external={true}
              >
                rechten
              </Linkd>{' '}
              en{' '}
              <Linkd
                href={FocusExternalUrls.BijstandsUitkeringAanvragenPlichten}
                external={true}
              >
                plichten
              </Linkd>
            </p>
          </>
        ),
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description:
            'Er is meer informatie en tijd nodig om uw aanvraag voor een bijstandsuitkering te behandelen.',
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.herstelTermijn,
        description: data => (
          <>
            <p>
              Wij hebben meer informatie en tijd nodig om uw aanvraag te
              verwerken. Bekijk de brief voor meer details. U moet de extra
              informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
              vóór {data.decisionDeadline2} ons besluit.
            </p>
            <p>
              Tip: Lever de informatie die wij gevraagd hebben zo spoedig
              mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft,
              hoe eerder wij verder kunnen met de behandeling van uw aanvraag.`
            </p>
          </>
        ),
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
          status: stepLabels.beslissing,
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
          status: stepLabels.beslissing,
          description: data => (
            <>
              <p>
                U heeft recht op een bijstandsuitkering. Bekijk de brief voor
                meer details.
              </p>
              <p>
                <Linkd
                  href={FocusExternalUrls.BetaalDataUitkering}
                  external={true}
                >
                  Bekijk hier de betaaldata van de uitkering
                </Linkd>
              </p>
            </>
          ),
        },
        [getDecision('Buiten Behandeling')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description:
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
  },
  'Bijzondere Bijstand': {},
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
        status: stepLabels.aanvraag,
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
        status: stepLabels.inBehandeling,
        description: data => (
          <>
            <p>
              Het kan zijn dat u nog extra informatie moet opsturen. U ontvangt
              vóór {data.decisionDeadline1} ons besluit.
            </p>
            <p>
              <strong>
                Let op: Deze statusinformatie betreft alleen uw aanvraag voor
                een Stadspas.
              </strong>
              <br />
              Uw eventuele andere Hulp bij Laag Inkomen producten worden via
              post en/of telefoon afgehandeld.
            </p>
          </>
        ),
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description:
            'Er is meer informatie en tijd nodig om uw aanvraag voor een Stadspas te behandelen.',
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.herstelTermijn,
        description: data => (
          <>
            <p>
              Wij hebben meer informatie en tijd nodig om uw aanvraag te
              verwerken. Bekijk de brief voor meer details. U moet de extra
              informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
              vóór {data.decisionDeadline2} ons besluit.
            </p>
            <p>
              Tip: Lever de informatie die wij gevraagd hebben zo spoedig
              mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft,
              hoe eerder wij verder kunnen met de behandeling van uw aanvraag.
            </p>
          </>
        ),
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
          status: stepLabels.beslissing,
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
          status: stepLabels.beslissing,
          description: data => (
            <>
              <p>
                U heeft recht op een Stadspas. Bekijk de brief voor meer
                details.
              </p>
              <p>
                <Linkd href={FocusExternalUrls.Stadspas} external={true}>
                  Meer informatie over de stadspas
                </Linkd>
              </p>
            </>
          ),
        },
        [getDecision('Buiten Behandeling')]: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description:
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
  },
};

// NOTE: Possibly deprecated because it seems document titles actually contain meaningful names in the latest api response.
export const DocumentTitles: Record<string, string> = {
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
    'Voorschot Tozo (voor ondernemers) (Eenm.)': AppRoutes['INKOMEN/TOZO'],
    'Lening Tozo': AppRoutes['INKOMEN/TOZO'],
    'Uitkering Tozo': AppRoutes['INKOMEN/TOZO'],
  },
};

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(
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

export function translateProductTitle(title: ProductTitle) {
  switch (title) {
    case 'Levensonderhoud':
      return 'Bijstandsuitkering';
    case 'Voorschot Tozo (voor ondernemers) (Eenm.)':
      return 'Voorschot Tozo';
    case 'Lening t.b.v. bedrijfskrediet TOZO':
      return 'Lening Tozo';
    case 'Tijdelijke Overbruggingsregeling Zelfst. Ondern.':
      return 'Uitkering Tozo';
  }
  return title;
}

interface StepSourceDataArgs {
  stepData: Step;
  id: string;
  productTitle: string;
  latestStep: StepTitle;
  isLastActive: boolean;
  isRecent: boolean;
  stepType: StatusLineItem['stepType'];
  decision: DecisionFormatted;
  dateStart: string; // The official start date of the clients request process.
  daysUserActionRequired: number;
  daysSupplierActionRequired: number;
  daysRecoveryAction: number; // The number of days a client has to provide more information about a request
}

// Data for conveniently constructing the information shown to the clien.
function getStepSourceData({
  id,
  productTitle,
  stepData,
  latestStep,
  stepType,
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
    isLastActive,
    isRecent,
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

export function parseLabelContentString(
  text: string | TextPartContentFormatterString,
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

export function formatFocusDocument(
  stepTitle: StepTitle,
  datePublished: string,
  document: FocusDocument,
  DocumentTitles: Record<string, string>
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title: DocumentTitles[title]
      ? DocumentTitles[
          title
        ] /* + `\n${dateFormat(datePublished, 'dd MMMM')}` */
      : title,
    url: `/api/${url}`,
    datePublished,
    type: stepTitle,
  };
}

export function formatFocusNotificationItem(
  item: FocusItem,
  step: ProcessStep,
  productOrigin: ProductOrigin,
  sourceData: StepSourceData,
  Labels: LabelData
): MyNotification {
  const stepLabels = Labels[productOrigin][sourceData.productTitle][
    step.aboutStep
  ] as any; // Can't work the right TS construct here atm.

  const stepLabelSource = !!sourceData.decision
    ? stepLabels[sourceData.decision]
    : stepLabels;

  return {
    id: step.id,
    datePublished: step.datePublished,
    chapter: Chapters.INKOMEN,
    title:
      stepLabelSource &&
      stepLabelSource.notification &&
      parseLabelContentString(stepLabelSource.notification.title, sourceData),
    description:
      stepLabelSource &&
      stepLabelSource.notification &&
      parseLabelContent(stepLabelSource.notification.description, sourceData),
    link: {
      to: item.link.to,
      title:
        (stepLabelSource &&
          stepLabelSource.notification &&
          stepLabelSource &&
          stepLabelSource.notification.linkTitle) ||
        'Meer informatie',
    },
  };
}

function formatStepData(
  sourceData: StepSourceData,
  productOrigin: ProductOrigin,
  stepTitle: StepTitle,
  stepData: Step,
  Labels: LabelData,
  DocumentTitles: Record<string, string>
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
      ? parseLabelContentString(stepLabels.title, sourceData)
      : stepTitle,
    datePublished: stepData ? stepData.datum : '-',
    description: stepLabels
      ? parseLabelContent(stepLabels.description, sourceData)
      : '--NNB--',
    documents:
      stepData && FeatureToggle.focusDocumentDownload
        ? stepData.document.map(document =>
            formatFocusDocument(
              stepTitle,
              stepData.datum,
              document,
              DocumentTitles
            )
          )
        : [],
    status: stepLabels
      ? stepLabels.status
      : stepStatusLabels[sourceData.latestStep],
    aboutStep: stepTitle,
    isLastActive: sourceData.isLastActive,
    isChecked: !sourceData.isLastActive,
    stepType: sourceData.stepType,
    isRecent: sourceData.isRecent,
  };
}

export function findLatestStepWithLabels({
  productOrigin,
  productTitle,
  steps,
  Labels,
}: {
  productOrigin: FocusProduct['soortProduct'];
  productTitle: FocusProduct['naam'];
  steps: FocusProduct['processtappen'];
  Labels: LabelData;
}) {
  // Find the latest active step of the request process.
  const latestStep = [...processSteps].reverse().find(step => {
    const hasStepData = step in steps && steps[step] !== null;
    const hasLabelData = !!Labels[productOrigin][productTitle][step];
    return hasStepData && hasLabelData;
  });

  return latestStep;
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function formatFocusProduct(
  product: FocusProduct,
  compareData: Date,
  Labels: LabelData,
  DocumentTitles: Record<string, string>
): FocusItem {
  const {
    _id: id,
    soortProduct: productOrigin,
    typeBesluit: rawDecision,
    processtappen: steps,
    naam: productTitle,
    dienstverleningstermijn: daysSupplierActionRequired = 28,
    inspanningsperiode: daysUserActionRequired = 28,
  } = product;

  const latestStep = findLatestStepWithLabels({
    productOrigin,
    productTitle,
    steps,
    Labels,
  })!;

  const decision = getDecision(rawDecision || '');

  // Determine if this items falls within a recent period (of xx days)
  const isRecent = isRecentItem(decision, steps, compareData);

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
  const dateStart = steps.aanvraag!.datum;
  const productTitleTranslated = translateProductTitle(productTitle);
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
    isLastActive: false,
    isRecent,
    stepType: 'intermediate-step',
  });

  // Only use the process steps that have data to show
  const processStepsFiltered = processSteps.filter(stepTitle => {
    return (
      !!steps[stepTitle] && !!Labels[productOrigin][productTitle][stepTitle]
    );
  });

  const route = generatePath(
    AppRoutesByProductOrigin[productOrigin][sourceData.productTitle],
    {
      id,
    }
  );

  const item = {
    id,
    chapter: Chapters.INKOMEN,

    // Date on which the last updated information (Step) was published,
    datePublished: sourceData.datePublished || '',
    displayDate: sourceData.datePublished || '',
    ISODatePublished: latestStepData.datum || '',

    // Date on which the request process was first published
    dateStart: defaultDateFormat(dateStart),

    // Regular title, can be turned into more elaborate descriptive information. E.g Bijstandsuitkering could become Uw Aanvraag voor een bijstandsuitkering.
    title: stepLabels
      ? parseLabelContentString(stepLabels.title, sourceData)
      : productTitleTranslated,

    // The name of the product (Stadspas, Levensonderhoud ...)
    productTitle,
    productOrigin,
    description: stepLabels
      ? parseLabelContent(stepLabels.description, sourceData)
      : '',
    latestStep,
    status: stepLabels ? stepLabels.status : stepStatusLabels[latestStep],
    isRecent,
    hasDecision,
    isGranted: hasDecision ? decision === getDecision('Toekenning') : null,
    isDenied: hasDecision ? decision === getDecision('Afwijzing') : null,
    isDiscarded: hasDecision
      ? decision === getDecision('Buiten Behandeling')
      : null,
    link: {
      title: 'Meer informatie', // TODO: How to get custom link title?
      to: route,
    },
    process: processStepsFiltered.map((stepTitle, index) => {
      const stepData = steps[stepTitle] as Step;
      const isLastActive = stepTitle === latestStep;
      let stepType: StepType = 'intermediate-step';

      switch (true) {
        case index === 0 && stepTitle === 'beslissing':
          stepType = 'single-step';
          break;
        case index === 0:
          stepType = 'first-step';
          break;
        case stepTitle === 'beslissing':
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
        isLastActive,
        isRecent,
        stepType,
      });

      return formatStepData(
        sourceData,
        productOrigin,
        stepTitle,
        stepData,
        Labels,
        DocumentTitles
      );
    }),
  };

  const latestStepItem = item.process[item.process.length - 1];

  const focusItem = {
    ...item,
    notification: formatFocusNotificationItem(
      item,
      latestStepItem,
      productOrigin,
      sourceData,
      Labels
    ),
  };

  return focusItem;
}

function formatFocusApiResponse(
  products: FocusApiResponse,
  compareDate: Date
): FocusItem[] {
  if (!Array.isArray(products)) {
    return [];
  }
  return products
    .map(product =>
      formatFocusProduct(product, compareDate, Labels, DocumentTitles)
    )
    .sort(dateSort('ISODatePublished', 'desc'));
}

export function formatFocusItems(
  sourceItems: FocusProduct[],
  compareDate: Date
) {
  const items = formatFocusApiResponse(
    sourceItems.filter(item => {
      const isWhitelisted = formattedProductTitleWhitelisted.includes(
        item.naam
      );
      const hasLatestStepWithLabels =
        isWhitelisted &&
        !!findLatestStepWithLabels({
          productOrigin: item.soortProduct,
          productTitle: item.naam,
          steps: item.processtappen,
          Labels,
        });
      return isWhitelisted && hasLatestStepWithLabels;
    }),
    compareDate
  );
  const notifications = items.reduce<MyNotification[]>(
    (notifications, item) => {
      if (item.notification) {
        notifications.push(item.notification);
      }
      return notifications;
    },
    []
  );

  return {
    notifications,
    items,
  };
}

export function altDocumentContent(
  statusLineItem: StatusLineItem,
  stepNumber: number
) {
  if (!!statusLineItem.documents.length) {
    return '';
  }

  if (
    statusLineItem.status === 'Meer informatie nodig' &&
    statusLineItem.isRecent &&
    !statusLineItem.isLastActive
  ) {
    return <b>U heeft deze brief per post ontvangen.</b>;
  }

  return ['Meer informatie nodig', 'Besluit'].includes(
    statusLineItem.status
  ) ? (
    statusLineItem.isRecent ? (
      <b>
        U ontvangt{' '}
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post.
      </b>
    ) : (
      <b>
        U heeft{' '}
        {statusLineItem.status === 'Besluit' ? 'dit besluit' : 'deze brief'} per
        post ontvangen.
      </b>
    )
  ) : (
    ''
  );
}

export type FocusInkomenSpecificatieType =
  | 'IOAZ'
  | 'BBS'
  | 'WKO'
  | 'IOAW'
  | 'STIMREG'
  | 'BIBI'
  | 'PART'
  | 'BBZ';

export const focusInkomenSpecificatieTypes: {
  [type in FocusInkomenSpecificatieType]: string;
} = {
  IOAZ: 'IOAZ',
  BBS: 'Bijzonder bijstand en stimuleringsregelingen',
  WKO: 'Wet kinderopvang',
  IOAW: 'IOAW',
  STIMREG: 'Stimuleringsregelingen',
  BIBI: 'Bijzonder bijstand',
  PART: 'Participatiewet',
  BBZ: 'BBZ',
};

export interface FocusCombinedItemFromSource {
  title: string;
  datePublished: string;
  id: string;
  url: string;
  type: FocusInkomenSpecificatieType;
}

export interface FocusInkomenSpecificatie extends FocusCombinedItemFromSource {
  displayDate: string;
  documentUrl: ReactNode;
}

function documentDownloadName(item: FocusCombinedItemFromSource) {
  return `${format(new Date(item.datePublished), 'yyyy-MM-dd')}-${item.title}`;
}

function formatIncomSpecificationItem(
  item: FocusCombinedItemFromSource
): FocusInkomenSpecificatie {
  // Strip down to primitive date value.
  const datePublished = item.datePublished.split('T')[0];
  const displayDate = defaultDateFormat(new Date(datePublished));
  return {
    ...item,
    displayDate,
    datePublished,
    documentUrl: (
      <a
        href={`/api/${item.url}`}
        rel="external noopener noreferrer"
        className={styles.DownloadLink}
        download={documentDownloadName(item)}
      >
        <DocumentIcon width={14} height={14} /> PDF
      </a>
    ),
  };
}

export function getLatestStep(steps: FocusProduct['processtappen']) {
  return (
    [...processSteps].reverse().find(step => {
      return steps[step] !== null;
    }) || processSteps[0]
  );
}

export const incomSpecificationsRouteMonthly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES']
);

export const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    type: 'jaaropgaven',
  }
);

function formatIncomeSpecificationNotification(
  type: 'jaaropgave' | 'uitkeringsspecificatie',
  item: FocusInkomenSpecificatie
): MyNotification {
  if (type === 'jaaropgave') {
    return {
      id: 'nieuwe-jaaropgave',
      datePublished: item.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Nieuwe jaaropgave',
      description: `Uw jaaropgave ${dateFormat(
        item.datePublished,
        'yyyy'
      )} staat voor u klaar.`,
      link: {
        to: `/api/${item.url}`,
        title: 'Bekijk jaaropgave',
        download: documentDownloadName(item),
      },
    };
  }
  return {
    id: 'nieuwe-uitkeringsspecificatie',
    datePublished: item.datePublished,
    chapter: Chapters.INKOMEN,
    title: 'Nieuwe uitkeringsspecificatie',
    description: `Uw uitkeringsspecificatie van ${dateFormat(
      item.datePublished,
      'MMMM yyyy'
    )} staat voor u klaar.`,
    link: {
      to: `/api/${item.url}`,
      title: 'Bekijk uitkeringsspecificatie',
      download: documentDownloadName(item),
    },
  };
}

export function formatFocusCombinedSpecifications({
  content: { jaaropgaven, uitkeringsspecificaties },
}: FocusCombinedResponse): Omit<FocusCombined, 'tozodocumenten'> {
  const uitkeringsspecificatiesFormatted = uitkeringsspecificaties
    .sort(dateSort('datePublished', 'desc'))
    .map(formatIncomSpecificationItem);

  const jaaropgavenFormatted = jaaropgaven
    .sort(dateSort('datePublished', 'desc'))
    .map(formatIncomSpecificationItem);

  const notifications: MyNotification[] = [];

  if (uitkeringsspecificatiesFormatted.length) {
    notifications.push(
      formatIncomeSpecificationNotification(
        'uitkeringsspecificatie',
        uitkeringsspecificatiesFormatted[0]
      )
    );
  }
  if (jaaropgavenFormatted.length) {
    notifications.push(
      formatIncomeSpecificationNotification(
        'jaaropgave',
        jaaropgavenFormatted[0]
      )
    );
  }

  return {
    jaaropgaven: jaaropgavenFormatted,
    uitkeringsspecificaties: uitkeringsspecificatiesFormatted,
    notifications,
  };
}
