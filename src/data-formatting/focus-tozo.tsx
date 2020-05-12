import React from 'react';
import {
  FocusCombinedItemFromSource,
  getLatestStep,
  FocusProduct,
  ProcessStep,
  StepTitle,
  isRecentItem,
  getDecision,
  formatFocusProduct,
  FocusDocument,
  LabelData,
  stepLabels,
  findLatestStepWithLabels,
  ProductType,
  translateProductTitle,
} from './focus';
import { dateSort, dateFormat, defaultDateFormat } from 'helpers/App';
import { Chapters } from 'config/Chapter.constants';
import { AppRoutes } from 'config/Routing.constants';
import { MyNotification } from '../hooks/api/my-notifications-api.hook';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';
import { Chapter } from '../config/Chapter.constants';
import { LinkProps } from '../App.types';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle =
  'Lening t.b.v. bedrijfskrediet TOZO';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle =
  'Tijdelijke Overbruggingsregeling Zelfst. Ondern.';

const DocumentTitles: Record<string, string> = {
  'E-AANVR-TOZO': 'Brief aanvraag',
  'E-AANVR-KBBZ': 'Brief aanvraag',
  'Voorschot Tozo (voor ondernemers) (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch 07 april': 'Brief betaling voorschot',
  'Tegemoetkoming Ondernemers en Zelfstandigen': 'aanvraag',
  'Hersteltermijn uitkering Tozo': 'Brief hersteltermijn',
  'Voorschot Bbz Corona regeling (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch': 'Brief betaling voorschot',
};

const UitkeringLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: Neem actie`,
      description: data =>
        `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    status: stepLabels.herstelTermijn,
    description: data => (
      <p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
        Bekijk de brief voor meer details.{' '}
      </p>
    ),
  },
  beslissing: {
    [getDecision('Afwijzing')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is afgewezen`,
        description: data =>
          `U heeft geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description: data =>
        `U heeft geen recht op een ${data.productTitleTranslated}. Bekijk de brief voor meer details.`,
    },
    [getDecision('Toekenning')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
        description: data =>
          `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U heeft recht op een {data.productTitleTranslated}. Bekijk de brief
          voor meer details.
        </p>
      ),
    },
    [getDecision('Buiten Behandeling')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished!}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description:
        'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
    },
  },
  bezwaar: null,
};

const VoorschotLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: null,
  bezwaar: null,
  beslissing: {
    [getDecision('Toekenning')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
        description: data =>
          `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: 'Voorschot',
      description: data => (
        <p>
          U heeft recht op een {data.productTitleTranslated}. Bekijk de brief
          voor meer details.
        </p>
      ),
    },
  },
};

const LeningLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: Neem actie`,
      description: data =>
        `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    status: stepLabels.herstelTermijn,
    description: data => (
      <p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
        Bekijk de brief voor meer details.
      </p>
    ),
  },
  beslissing: {
    [getDecision('Afwijzing')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is afgewezen`,
        description: data =>
          `U heeft geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description: data =>
        `U heeft geen recht op een ${data.productTitleTranslated}. Bekijk de brief voor meer details.`,
    },
    [getDecision('Toekenning')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
        description: data =>
          `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U heeft recht op een {data.productTitleTranslated}. Bekijk de brief
          voor meer details.
        </p>
      ),
    },
    [getDecision('Buiten Behandeling')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      status: stepLabels.beslissing,
      description:
        'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
    },
  },
  bezwaar: null,
};

const Labels: LabelData = {
  Minimafonds: {},
  Participatiewet: {
    [TOZO_UITKERING_PRODUCT_TITLE]: UitkeringLabels,
  },
  'Bijzondere Bijstand': {
    [TOZO_VOORSCHOT_PRODUCT_TITLE]: VoorschotLabels,
    [TOZO_LENING_PRODUCT_TITLE]: LeningLabels,
  },
};

const fakeDecisionStep: ProcessStep = {
  id: 'fake-decision-filler',
  title: '',
  status: 'Besluit',
  datePublished: '',
  documents: [],
  isChecked: false,
  isLastActive: false,
  stepType: 'last-step',
  aboutStep: 'beslissing',
  isRecent: false,
  description: (
    <p>
      Zodra we alle benodigde informatie binnen hebben, ontvangt u een besluit.
    </p>
  ),
};

export type TozoProductTitle =
  | 'Lening Tozo'
  | 'Uitkering Tozo'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;

export type FocusTozoDocumentType = 'E-AANVR-KBBZ' | 'E-AANVR-TOZO';

export interface FocusTozoDocument extends FocusCombinedItemFromSource {
  displayDate: string;
  displayTime: string;
  status: 'Ontvangen';
  // documentUrl: ReactNode;
  // link: LinkProps;
  process: ProcessStep[];
}

export interface FocusTozo {
  id: string;
  chapter: Chapter;
  link: LinkProps;
  title: string;
  isRecent: boolean;
  dateStart: string;
  datePublished: string;
  ISODatePublished: string;
  description: string;
  status: {
    lening: StepTitle | null;
    uitkering: StepTitle | null;
    voorschot: StepTitle | null;
    isComplete: boolean;
  };
  hasDecision: {
    lening: boolean;
    uitkering: boolean;
    voorschot: boolean;
  };
  notifications: {
    lening: MyNotification | null;
    uitkering: MyNotification | null;
    voorschot: MyNotification | null;
  };
  process: {
    lening: ProcessStep[];
    uitkering: ProcessStep[];
    aanvraag: ProcessStep[];
  };
}

function formatFocusTozoDocument(
  datePublished: string,
  document: FocusDocument,
  hasDatePublished: boolean = true
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title:
      (DocumentTitles[title] || title) +
      (hasDatePublished ? `\n${datePublished}` : ''),
    url: `/api/${url}`,
    datePublished,
    type: 'PDF',
  };
}

type FocusTozoProduct = FocusProduct & { datePublished: string };

function formatFocusProductTozo(
  product: FocusTozoProduct,
  tozoDocuments: FocusCombinedItemFromSource[],
  compareDate: Date
) {
  // Find the matching Aanvraag document id and change the omschrijving of the document so that it is the same as shown next to the top aanvraag item
  product.processtappen.aanvraag?.document.forEach(doc => {
    const matchingTozoDocument = tozoDocuments.find(
      tdoc => `${doc.id}` === `${tdoc.id}`
    );
    const datePublished = matchingTozoDocument
      ? matchingTozoDocument.datePublished
      : product.datePublished;
    doc.omschrijving = `${DocumentTitles[doc.omschrijving] ||
      doc.omschrijving}\n${dateFormat(datePublished, 'dd MMMM - HH:mm')}`;
  });

  return formatFocusProduct(product, compareDate, Labels, DocumentTitles);
}

function formatFocusTozoItems({
  documenten,
  aanvragen,
}: {
  documenten: FocusCombinedItemFromSource[];
  aanvragen: FocusProduct[];
}) {
  const mapLastDatePublished = (item: FocusProduct): FocusTozoProduct => {
    const processSteps = item.processtappen;
    const latestStep = getLatestStep(processSteps);
    return {
      ...item,
      datePublished: processSteps[latestStep]?.datum || '',
    };
  };

  const aanvragenLening = aanvragen
    .filter(item => item.naam === TOZO_LENING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const firstAanvraagLening = aanvragenLening.length
    ? aanvragenLening[0]
    : null;

  const aanvragenVoorschot = aanvragen
    .filter(item => item.naam === TOZO_VOORSCHOT_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const firstAanvraagVoorschot = aanvragenVoorschot.length
    ? aanvragenVoorschot[0]
    : null;

  const lastAanvraagVoorschot = aanvragenVoorschot.length
    ? aanvragenVoorschot[aanvragenVoorschot.length - 1]
    : null;

  const aanvragenUitkering = aanvragen
    .filter(item => item.naam === TOZO_UITKERING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const firstAanvraagUitkering = aanvragenUitkering.length
    ? aanvragenUitkering[0]
    : null;

  // TODO: make process handle multiple items
  // collect first aanvraag datum
  // collect first decision uitkering
  // collect first decision lening
  // If uitkering and lening are less than XX weeks apart
  // collect all documents before last decision date of uitkering or lening
  // If uitkering and lening are more than XX weeks apart
  // Start new Item
  // collect first aanvraag datum after previous decision, start again

  const tozoDocuments = documenten.sort(dateSort('datePublished'));

  const aanvraagNotification = {
    id: 'tozo-regeling-notification-aanvraag',
    datePublished: tozoDocuments.length
      ? tozoDocuments[tozoDocuments.length - 1]?.datePublished
      : '',
    chapter: Chapters.INKOMEN,
    title: 'Tozo aanvraag: Wij hebben uw aanvraag ontvangen',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${
      tozoDocuments.length
        ? dateFormat(
            tozoDocuments[tozoDocuments.length - 1].datePublished,
            'dd MMMM - HH:mm'
          )
        : ''
    }`,
    link: {
      to: AppRoutes['INKOMEN/TOZO'],
      title: 'Bekijk uw Tozo status',
    },
  };

  const mix = [
    ...tozoDocuments,
    ...aanvragenVoorschot,
    ...aanvragenUitkering,
    ...aanvragenLening,
  ].sort(dateSort('datePublished'));

  // Take last voorschot
  const firstActivityDatePublished = mix.length ? mix[0].datePublished : '';
  const lastActivityDatePublished = mix.length
    ? mix[mix.length - 1].datePublished
    : '';

  const voorschotStatus = firstAanvraagVoorschot
    ? getLatestStep(firstAanvraagVoorschot.processtappen)
    : null;
  const leningStatus = firstAanvraagLening
    ? getLatestStep(firstAanvraagLening.processtappen)
    : null;
  const uitkeringStatus = firstAanvraagUitkering
    ? getLatestStep(firstAanvraagUitkering.processtappen)
    : null;

  const isComplete = [voorschotStatus, leningStatus, uitkeringStatus]
    .filter(status => !!status)
    .every(status => status === 'beslissing');

  const status = {
    lening: leningStatus,
    uitkering: uitkeringStatus,
    voorschot: voorschotStatus,
    isComplete,
  };

  const hasDecision = {
    lening: status.lening === 'beslissing',
    uitkering: status.uitkering === 'beslissing',
    voorschot: status.voorschot === 'beslissing',
  };

  const now = new Date();

  const isRecentLening =
    firstAanvraagLening && firstAanvraagLening.typeBesluit
      ? isRecentItem(
          getDecision(firstAanvraagLening.typeBesluit),
          firstAanvraagLening.processtappen,
          now
        )
      : false;

  const isRecentUitkering =
    firstAanvraagUitkering && firstAanvraagUitkering.typeBesluit
      ? isRecentItem(
          getDecision(firstAanvraagUitkering.typeBesluit),
          firstAanvraagUitkering.processtappen,
          now
        )
      : false;

  const isRecentVoorschot =
    firstAanvraagVoorschot && firstAanvraagVoorschot.typeBesluit
      ? isRecentItem(
          getDecision(firstAanvraagVoorschot.typeBesluit),
          firstAanvraagVoorschot.processtappen,
          now
        )
      : false;

  const isRecent = isRecentLening || isRecentUitkering || isRecentVoorschot;

  const aanvraagStep: ProcessStep = {
    id: 'aanvraag-step-0',
    documents: tozoDocuments.map(doc => {
      return {
        id: doc.id,
        title: `${DocumentTitles[doc.type] || doc.type}\n${dateFormat(
          doc.datePublished,
          'dd MMMM - HH:mm'
        )}`,
        url: `/api/${doc.url}`,
        datePublished: doc.datePublished,
        type: 'PDF',
      };
    }),
    title: 'Aanvraag regeling',
    description: `Wij hebben uw aanvraag voor een Tozo regeling ontvangen op ${defaultDateFormat(
      firstActivityDatePublished
    )}.`,
    datePublished: firstActivityDatePublished,
    status: 'Aanvraag',
    aboutStep: 'aanvraag',
    isRecent,
    isChecked: true,
    isLastActive: false, // Force large checkmark in UI
    stepType: 'single-step',
  };

  let voorschotten: ProcessStep[] = [];
  let voorschotNotification: MyNotification | null = null;

  const {
    process: leningSteps = [],
    notification: leningNotification = null,
  } = firstAanvraagLening
    ? formatFocusProductTozo(firstAanvraagLening, tozoDocuments, now)
    : {};

  if (leningStatus === 'herstelTermijn') {
    leningSteps.push(fakeDecisionStep);
  }

  const {
    process: uitkeringSteps = [],
    notification: uitkeringNotification = null,
  } = firstAanvraagUitkering
    ? formatFocusProductTozo(firstAanvraagUitkering, tozoDocuments, now)
    : {};

  if (uitkeringStatus === 'herstelTermijn') {
    uitkeringSteps.push(fakeDecisionStep);
  }

  if (firstAanvraagVoorschot && lastAanvraagVoorschot !== null) {
    const voorschotLabels = Labels['Bijzondere Bijstand'][
      TOZO_VOORSCHOT_PRODUCT_TITLE
    ].beslissing![getDecision('Toekenning')];

    const voorschotLabelsTitle = voorschotLabels.title;
    const voorschotLabelsDescription = voorschotLabels.description;
    const voorschotLabelsNotificationDescription =
      voorschotLabels.notification.description;
    const voorschotLabelsNotificationTitle = voorschotLabels.notification.title;

    voorschotNotification = {
      id: 'tozo-regeling-notification-voorschot',
      datePublished: lastAanvraagVoorschot.datePublished,
      chapter: Chapters.INKOMEN,
      title:
        typeof voorschotLabelsNotificationTitle === 'function'
          ? voorschotLabelsNotificationTitle({
              productTitleTranslated: translateProductTitle(
                firstAanvraagVoorschot.naam
              ),
            } as any)
          : voorschotLabelsNotificationTitle,
      description:
        typeof voorschotLabelsNotificationDescription === 'function'
          ? voorschotLabelsNotificationDescription({
              datePublished: defaultDateFormat(
                firstAanvraagVoorschot.datePublished
              ),
              productTitleTranslated: translateProductTitle(
                firstAanvraagVoorschot.naam
              ),
            } as any)
          : voorschotLabelsNotificationDescription,
      link: {
        to: AppRoutes['INKOMEN/TOZO'],
        title: 'Bekijk uw Tozo status',
      },
    };

    voorschotten = aanvragenVoorschot.map((voorschot, index) => {
      return {
        id: 'voorschot-' + index,
        documents:
          voorschot.processtappen.beslissing!.document.map(doc => {
            return formatFocusTozoDocument(
              dateFormat(voorschot.datePublished, 'dd MMMM'),
              doc
            );
          }) || [],
        title:
          typeof voorschotLabelsTitle === 'function'
            ? voorschotLabelsTitle({
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : voorschotLabelsTitle,
        description:
          typeof voorschotLabelsDescription === 'function'
            ? voorschotLabelsDescription({
                datePublished: voorschot.datePublished,
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : voorschotLabelsDescription,
        datePublished: voorschot.datePublished,
        status: voorschotLabels.status,
        aboutStep: 'beslissing',
        isRecent,
        isChecked: true,
        isLastActive: !(leningSteps.length || uitkeringSteps.length), // Force large checkmark in UI
        stepType: 'single-step',
      };
    });
  }

  const tozoProcessItem = {
    id: 'tozo-item-0',
    dateStart: defaultDateFormat(firstActivityDatePublished),
    datePublished: defaultDateFormat(lastActivityDatePublished),
    ISODatePublished: lastActivityDatePublished,
    title: 'Tozo regeling',
    description: '',
    status,
    hasDecision,
    isRecent,
    chapter: Chapters.INKOMEN,
    link: {
      to: AppRoutes['INKOMEN/TOZO'], // TODO: make specific
      title: 'Bekijk uw Tozo status',
    },
    process: {
      lening: leningSteps,
      uitkering: uitkeringSteps,
      aanvraag: voorschotten.length
        ? [aanvraagStep, ...voorschotten]
        : [aanvraagStep],
    },
    notifications: {
      aanvraag: aanvraagNotification,
      lening: leningNotification,
      uitkering: uitkeringNotification,
      voorschot: voorschotNotification,
    },
  };

  return tozoProcessItem;
}

export function formatFocusTozo({
  aanvragen,
  documenten,
}: {
  documenten: FocusCombinedItemFromSource[];
  aanvragen: FocusProduct[];
}) {
  const aanvragenFiltered = aanvragen.filter(item => {
    const isWhiteListed = [
      TOZO_LENING_PRODUCT_TITLE,
      TOZO_UITKERING_PRODUCT_TITLE,
      TOZO_VOORSCHOT_PRODUCT_TITLE,
    ].includes(item.naam);

    const hasLatestStepWithLabels =
      isWhiteListed &&
      !!findLatestStepWithLabels({
        productOrigin: item.soortProduct,
        productTitle: item.naam,
        steps: item.processtappen,
        Labels,
      });
    return isWhiteListed && hasLatestStepWithLabels;
  });

  const documentenFiltered = documenten.filter(doc =>
    ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type)
  );

  return formatFocusTozoItems({
    aanvragen: aanvragenFiltered,
    documenten: documentenFiltered,
  });
}
