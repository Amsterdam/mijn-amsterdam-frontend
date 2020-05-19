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
import { generatePath } from 'react-router';
import slug from 'slugme';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle =
  'Tozo Bedrijfskapitaal (voor ondernemers)';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle =
  'Tozo Levensonderhoud (voor ondernemers)';

const DocumentTitles: Record<string, string> = {
  // Aanvraag
  'E-AANVR-TOZO': 'Brief aanvraag',
  'E-AANVR-KBBZ': 'Brief aanvraag',

  // Voorschot
  'Voorschot Bbz Corona regeling (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch': 'Brief betaling voorschot',

  // Uitkering
  'Hersteltermijn uitkering Tozo': 'Brief meer informatie',
  'Afwijzen uitkering Tozo': 'Brief besluit uitkering',
  'Toekennen uitkering Tozo': 'Brief besluit uitkering',
  'Tozo Toekennen': 'Brief besluit uitkering',
  'Tozo Hersteltermijn': 'Brief meer informatie',

  // Lening
  'Hersteltermijn lening Tozo': 'Brief meer informatie',
  'Afwijzen lening Tozo': 'Brief besluit lening',
  'Toekennen lening Tozo': 'Brief besluit lening',
};

const VoorschotLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: null,
  bezwaar: null,
  beslissing: {
    [getDecision('Toekenning')]: {
      notification: {
        title: data => {
          return `${data.productTitleTranslated}: wij hebben een voorschot betaald`;
        },
        description: data =>
          `Wij hebben een voorschot naar uw rekening overgemaakt.`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: 'Voorschot',
      description: data => (
        <p>
          Wij hebben een voorschot naar uw rekening overgemaakt. Kijk voor de
          voorwaarden in de brief.
        </p>
      ),
    },
  },
};

const UitkeringLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: Neem actie`,
      description: data =>
        `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
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
          `U hebt geen recht op een ${data.productTitleTranslated} (besluit ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U hebt geen recht op een {data.productTitleTranslated}. Bekijk de
          brief voor meer details.
        </p>
      ),
    },
    [getDecision('Toekenning')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
        description: data =>
          `U hebt recht op een ${data.productTitleTranslated} (besluit ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U hebt recht op een {data.productTitleTranslated}. Bekijk de brief
          voor meer details.
        </p>
      ),
    },
    [getDecision('Buiten Behandeling')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit ${data.datePublished!}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: (
        <p>
          Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer
          details.
        </p>
      ),
    },
  },
  bezwaar: null,
};

const LeningLabels: ProductType = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: Neem actie`,
      description: data =>
        `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    status: stepLabels.herstelTermijn,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
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
          `U hebt geen recht op een ${data.productTitleTranslated} (besluit ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U hebt geen recht op een {data.productTitleTranslated}. Bekijk de
          brief voor meer details.
        </p>
      ),
    },
    [getDecision('Toekenning')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
        description: data =>
          `U hebt recht op een ${data.productTitleTranslated} (besluit ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => (
        <p>
          U hebt recht op een {data.productTitleTranslated}. Bekijk de brief
          voor meer details.
        </p>
      ),
    },
    [getDecision('Buiten Behandeling')]: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: (
        <p>
          Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer
          details.
        </p>
      ),
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
  dateStart: string;
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
    isComplete: boolean;
  };
  hasDecision: {
    lening: boolean;
    uitkering: boolean;
  };
  notifications: {
    lening: MyNotification | null;
    uitkering: MyNotification | null;
    voorschot: MyNotification[];
    aanvraag: MyNotification[];
  };
  process: {
    lening: ProcessStep[];
    uitkering: ProcessStep[];
    aanvraag: ProcessStep[];
  };
}

function formatFocusTozoDocument(
  document: FocusDocument,
  datePublished: string
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title: DocumentTitles[title] || title,
    url: `/api/${url}`,
    datePublished,
    type: 'PDF',
  };
}

type FocusTozoProduct = FocusProduct & {
  datePublished: string;
  dateStart: string;
};

type TozoSet = {
  aanvragen: FocusTozoProduct[];
  voorschotten: FocusTozoProduct[];
  documenten: FocusTozoDocument[];
};

const mapDates = (item: FocusProduct): FocusTozoProduct => {
  const processSteps = item.processtappen;
  const latestStep = getLatestStep(processSteps);
  return {
    ...item,
    datePublished: processSteps[latestStep]?.datum || '',
    dateStart: processSteps.aanvraag?.datum || '',
  };
};

function formatFocusTozoItem({
  documenten,
  voorschotten,
  aanvragen,
}: {
  documenten: FocusTozoDocument[];
  aanvragen: FocusTozoProduct[];
  voorschotten: FocusTozoProduct[];
}): FocusTozo {
  const firstActivityDatePublished = [
    ...documenten,
    ...voorschotten,
    ...aanvragen,
  ]
    .sort(dateSort('dateStart', 'desc'))
    .pop()!.dateStart;

  const lastActivityDatePublished = [
    ...documenten,
    ...voorschotten,
    ...aanvragen,
  ]
    .sort(dateSort('datePublished'))
    .pop()!.datePublished;

  const id = 'aanvraag-' + slug(firstActivityDatePublished);

  const aanvraagLening = aanvragen.find(
    item => item.naam === TOZO_LENING_PRODUCT_TITLE
  );

  const aanvraagUitkering = aanvragen.find(
    item => item.naam === TOZO_UITKERING_PRODUCT_TITLE
  );

  const leningStatus = aanvraagLening
    ? getLatestStep(aanvraagLening.processtappen)
    : null;

  const uitkeringStatus = aanvraagUitkering
    ? getLatestStep(aanvraagUitkering.processtappen)
    : null;

  const isComplete = [leningStatus, uitkeringStatus]
    .filter(status => !!status)
    .every(status => status === 'beslissing');

  const status = {
    lening: leningStatus,
    uitkering: uitkeringStatus,
    isComplete,
  };

  const hasDecision = {
    lening: status.lening === 'beslissing',
    uitkering: status.uitkering === 'beslissing',
  };

  const now = new Date();

  const isRecentLening =
    aanvraagLening && aanvraagLening.typeBesluit
      ? isRecentItem(
          getDecision(aanvraagLening.typeBesluit),
          aanvraagLening.processtappen,
          now
        )
      : true;

  const isRecentUitkering =
    aanvraagUitkering && aanvraagUitkering.typeBesluit
      ? isRecentItem(
          getDecision(aanvraagUitkering.typeBesluit),
          aanvraagUitkering.processtappen,
          now
        )
      : true;

  const isRecent = isRecentLening || isRecentUitkering;

  const aanvraagStep: ProcessStep = {
    id: 'aanvraag-step-' + id,
    documents: documenten.map(doc => {
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
    title: 'Tozo-aanvraag',
    description: `Wij hebben uw aanvraag Tozo ontvangen op ${defaultDateFormat(
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

  const aanvraagNotifications = documenten.map((doc, index) => {
    return {
      id: 'tozo-regeling-notification-aanvraag-' + index + '-' + id,
      datePublished: doc.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Tozo-aanvraag: Wij hebben uw aanvraag ontvangen',
      description: `Wij hebben uw aanvraag Tozo ontvangen op ${dateFormat(
        doc.datePublished,
        'dd MMMM - HH:mm'
      )}`,
      link: {
        to: generatePath(AppRoutes['INKOMEN/TOZO'], { id }),
        title: 'Bekijk uw Tozo status',
      },
    };
  });

  let voorschottenSteps: ProcessStep[] = [];
  let voorschotNotifications: MyNotification[] = [];

  const {
    process: leningSteps = [],
    notification: leningNotification = null,
  } = aanvraagLening
    ? formatFocusProduct(aanvraagLening, now, Labels, DocumentTitles)
    : {};

  if (leningNotification && leningNotification.link) {
    leningNotification.link.to = generatePath(AppRoutes['INKOMEN/TOZO'], {
      id,
    });
  }

  if (leningStatus === 'herstelTermijn') {
    leningSteps.push(fakeDecisionStep);
  }

  const {
    process: uitkeringSteps = [],
    notification: uitkeringNotification = null,
  } = aanvraagUitkering
    ? formatFocusProduct(aanvraagUitkering, now, Labels, DocumentTitles)
    : {};

  if (uitkeringNotification && uitkeringNotification.link) {
    uitkeringNotification.link.to = generatePath(AppRoutes['INKOMEN/TOZO'], {
      id,
    });
  }

  if (uitkeringStatus === 'herstelTermijn') {
    uitkeringSteps.push(fakeDecisionStep);
  }

  if (voorschotten.length) {
    const voorschotLabels = Labels['Bijzondere Bijstand'][
      TOZO_VOORSCHOT_PRODUCT_TITLE
    ].beslissing![getDecision('Toekenning')];

    const voorschotLabelsTitle = voorschotLabels.title;
    const voorschotLabelsDescription = voorschotLabels.description;
    const voorschotLabelsNotificationDescription =
      voorschotLabels.notification.description;
    const voorschotLabelsNotificationTitle = voorschotLabels.notification.title;

    voorschottenSteps = voorschotten.map((voorschot, index) => {
      return {
        id: 'voorschot-' + index + '-' + id,
        documents:
          voorschot.processtappen.beslissing!.document.map(doc => {
            return formatFocusTozoDocument(
              doc,
              dateFormat(voorschot.datePublished, 'dd MMMM')
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

    voorschotNotifications = voorschotten.map((voorschot, index) => {
      return {
        id: 'tozo-regeling-notification-voorschot-' + index + '-' + id,
        datePublished: voorschot.datePublished,
        chapter: Chapters.INKOMEN,
        title:
          typeof voorschotLabelsNotificationTitle === 'function'
            ? voorschotLabelsNotificationTitle({
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : voorschotLabelsNotificationTitle,
        description:
          typeof voorschotLabelsNotificationDescription === 'function'
            ? voorschotLabelsNotificationDescription({
                datePublished: defaultDateFormat(voorschot.datePublished),
                productTitleTranslated: translateProductTitle(voorschot.naam),
              } as any)
            : voorschotLabelsNotificationDescription,
        link: {
          to: generatePath(AppRoutes['INKOMEN/TOZO'], { id }),
          title: 'Bekijk uw Tozo status',
        },
      };
    });
  }

  const tozoProcessItem = {
    id,
    dateStart: defaultDateFormat(firstActivityDatePublished),
    datePublished: lastActivityDatePublished
      ? defaultDateFormat(lastActivityDatePublished)
      : firstActivityDatePublished,
    ISODatePublished: lastActivityDatePublished
      ? lastActivityDatePublished
      : firstActivityDatePublished,
    title: 'Tozo-aanvraag',
    description: '',
    status,
    hasDecision,
    isRecent,
    chapter: Chapters.INKOMEN,
    link: {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], {
        id,
      }),
      title: 'Bekijk uw Tozo status',
    },
    process: {
      lening: leningSteps,
      uitkering: uitkeringSteps,
      aanvraag: voorschottenSteps.length
        ? [aanvraagStep, ...voorschottenSteps]
        : [aanvraagStep],
    },
    notifications: {
      aanvraag: aanvraagNotifications,
      lening: leningNotification,
      uitkering: uitkeringNotification,
      voorschot: voorschotNotifications,
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

  const documentenFiltered: FocusTozoDocument[] = documenten
    .filter(doc => ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type))
    .map(item => ({ ...item, dateStart: item.datePublished })) // for convience
    .sort(dateSort('datePublished', 'asc'));

  const aanvragenSorted = aanvragenFiltered
    .map(mapDates)
    .filter(aanvraag => {
      return (
        aanvraag.naam === TOZO_LENING_PRODUCT_TITLE ||
        aanvraag.naam === TOZO_UITKERING_PRODUCT_TITLE
      );
    })
    .sort(dateSort('dateStart'));

  const voorschottenSorted = aanvragenFiltered
    .map(mapDates)
    .filter(aanvraag => {
      return aanvraag.naam === TOZO_VOORSCHOT_PRODUCT_TITLE;
    })
    .sort(dateSort('dateStart'));

  let process: FocusTozoProduct[] = [];
  const processes: Array<FocusTozoProduct[]> = [];

  const newProcess = (aanvraag?: FocusTozoProduct) => {
    // Start a new process.
    aanvraag && process.push(aanvraag);
    processes.push(process);
    process = [];
  };

  for (const aanvraag of aanvragenSorted) {
    const lastDecisionItem = processes.length
      ? [...processes[processes.length - 1]]
          .reverse()
          .filter((item): item is FocusTozoProduct => item !== undefined)
          .find(item => item.processtappen.beslissing !== null)
      : null;

    const previousDateDecision =
      lastDecisionItem &&
      lastDecisionItem.processtappen.beslissing &&
      new Date(lastDecisionItem.processtappen.beslissing.datum);

    const dateRequest =
      aanvraag.processtappen.aanvraag &&
      new Date(aanvraag.processtappen.aanvraag.datum);

    // A request can be about max 2 products
    if (process.length === 2) {
      newProcess();
    }

    // A request can have 2 distinct products
    if (process.length && process[0].naam === aanvraag.naam) {
      newProcess();
    }

    if (aanvraag.processtappen.beslissing !== null) {
      // Has 1 decision item in previous set. A set can have max 2 decision items
      const hasOneDecision = processes.length
        ? processes[processes.length - 1].filter(
            (item: any) => item.processtappen.beslissing !== null
          ).length === 1
        : false;
      if (
        previousDateDecision &&
        dateRequest &&
        dateRequest < previousDateDecision &&
        hasOneDecision
      ) {
        // Add item to previous processs, it was started before the decision date of the previous item so it's likely to belong to that set of items.
        processes[processes.length - 1].push(aanvraag);
      } else {
        newProcess(aanvraag);
      }
    } else {
      process.push(aanvraag);
    }
  }

  // Add the remaining set to the processes.
  if (process.length) {
    processes.push(process);
  }

  const items: TozoSet[] = processes.map(
    (aanvragen: FocusTozoProduct[], index: number) => {
      const prev = processes[index - 1] || null;

      const [first, second] = aanvragen;

      let prevDate = null;

      const toDate =
        first?.processtappen.beslissing?.datum ||
        second?.processtappen.beslissing?.datum ||
        null;

      if (
        prev &&
        prev[prev.length - 1] &&
        prev[prev.length - 1].processtappen.beslissing
      ) {
        prevDate = prev[prev.length - 1].processtappen.beslissing!.datum;
      }

      const documenten = findDocuments(prevDate, toDate, documentenFiltered);

      const voorschotten = findVoorschotten(
        prevDate,
        toDate,
        voorschottenSorted
      );

      return {
        aanvragen,
        voorschotten,
        documenten,
      };
    }
  );

  const tozoItemsFormatted: FocusTozo[] = items.map(
    ({ documenten, aanvragen, voorschotten }) =>
      formatFocusTozoItem({
        aanvragen,
        voorschotten,
        documenten,
      })
  );

  return tozoItemsFormatted;
}

function findDocuments(
  fromDate: string | null,
  toDate: string | null,
  documents: FocusTozoDocument[]
) {
  return documents.filter((doc: FocusTozoDocument) => {
    const datePublished = new Date(doc.datePublished);
    return (
      (fromDate === null || datePublished > new Date(fromDate)) &&
      (toDate === null || datePublished <= new Date(toDate))
    );
  });
}

function findVoorschotten(
  fromDate: string | null,
  toDate: string | null,
  voorschotten: FocusTozoProduct[]
) {
  return voorschotten.filter((voorschot: FocusTozoProduct) => {
    const dateStart = new Date(voorschot.dateStart);
    return (
      (fromDate === null || dateStart > new Date(fromDate)) &&
      (toDate === null || dateStart <= new Date(toDate))
    );
  });
}
