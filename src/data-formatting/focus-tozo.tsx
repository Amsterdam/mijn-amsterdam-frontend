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
} from './focus';
import { dateSort, dateFormat, defaultDateFormat } from 'helpers/App';
import { Chapters } from 'config/Chapter.constants';
import { AppRoutes } from 'config/Routing.constants';
import { MyNotification } from '../hooks/api/my-notifications-api.hook';
import { Document as GenericDocument } from '../components/DocumentList/DocumentList';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle = 'Lening Tozo';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle = 'Uitkering Tozo';

const DocumentTitles: Record<string, string> = {
  'E-AANVR-TOZO': 'aanvraag',
  'E-AANVR-KBBZ': 'aanvraag',
  'Voorschot Tozo (voor ondernemers) (Eenm.)': 'toekenning',
  'Tegemoetkoming Ondernemers en Zelfstandigen': 'aanvraag',
};

const Labels: LabelData = {
  Minimafonds: {},
  Participatiewet: {
    [TOZO_UITKERING_PRODUCT_TITLE]: {
      aanvraag: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij hebben uw aanvraag ontvangen`,
          description: data =>
            `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} ontvangen op ${data.dateStart}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.aanvraag,
        description: data => (
          <p>
            U hebt op {data.dateStart} een {data.productTitleTranslated}{' '}
            aangevraagd.
          </p>
        ),
      },
      inBehandeling: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
          description: data =>
            `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} in behandeling genomen op ${data.datePublished}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.inBehandeling,
        description: data => (
          <p>
            Wij gaan nu bekijken of u recht hebt op
            {data.productTitleTranslated}. Het kan zijn dat u nog extra
            informatie moet opsturen. U ontvangt vóór {data.decisionDeadline1}{' '}
            ons besluit.
          </p>
        ),
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description: data =>
            `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
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
              `U heeft geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
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
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data => (
            <p>
              U heeft recht op een {data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>
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
  'Bijzondere Bijstand': {
    [TOZO_VOORSCHOT_PRODUCT_TITLE]: {
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
              `U heeft recht op een ${data.productTitleTranslated}. Bekijk de brief voor meer details.`,
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data => (
            <>
              <p>
                U heeft recht op een {data.productTitleTranslated}. Bekijk de
                brief voor meer details.
              </p>
            </>
          ),
        },
      },
    },
    [TOZO_LENING_PRODUCT_TITLE]: {
      aanvraag: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij hebben uw aanvraag ontvangen`,
          description: data =>
            `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} ontvangen op ${data.dateStart}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.aanvraag,
        description: data => (
          <p>
            U hebt op {data.dateStart} een {data.productTitleTranslated}{' '}
            aangevraagd.
          </p>
        ),
      },
      inBehandeling: {
        notification: {
          title: data =>
            `${data.productTitleTranslated}: Wij behandelen uw aanvraag`,
          description: data =>
            `Wij hebben uw aanvraag voor een ${data.productTitleTranslated} in behandeling genomen op ${data.datePublished}.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.inBehandeling,
        description: data => (
          <p>
            Wij gaan nu bekijken of u recht hebt op
            {data.productTitleTranslated}. Het kan zijn dat u nog extra
            informatie moet opsturen. U ontvangt vóór {data.decisionDeadline1}{' '}
            ons besluit.
          </p>
        ),
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description: data =>
            `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
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
              `U heeft geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
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
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data => (
            <p>
              U heeft recht op een {data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>
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

export type TozoProductTitle =
  | 'Lening Tozo'
  | 'Uitkering Tozo'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;

export type FocusTozoDocumentType = 'E-AANVR-KBBZ' | 'E-AANVR-TOZO';

// if (FeatureToggle.tozoActive) {
//   formattedProductTitleWhitelisted.push(
//     TOZO_VOORSCHOT_PRODUCT_TITLE,
//     TOZO_LENING_PRODUCT_TITLE,
//     TOZO_UITKERING_PRODUCT_TITLE
//   );
// }

export interface FocusTozoDocument extends FocusCombinedItemFromSource {
  displayDate: string;
  displayTime: string;
  status: 'Ontvangen';
  // documentUrl: ReactNode;
  // link: LinkProps;
  process: ProcessStep[];
}

export interface FocusTozo {
  title: string;
  isRecent: boolean;
  dateStart: string;
  datePublished: string;
  status: {
    lening: StepTitle | null;
    uitkering: StepTitle | null;
    voorschot: StepTitle | null;
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

export function formatFocusTozo({
  documenten,
  aanvragen,
}: {
  documenten: FocusCombinedItemFromSource[];
  aanvragen: FocusProduct[];
}) {
  let hasDecisionTozoLening = false;
  let hasDecisionTozoUitkering = false;

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

  const lastAanvraagLening = aanvragenLening.length
    ? aanvragenLening[aanvragenLening.length - 1]
    : null;

  const aanvragenVoorschot = aanvragen
    .filter(item => item.naam === TOZO_VOORSCHOT_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const lastAanvraagVoorschot = aanvragenVoorschot.length
    ? aanvragenVoorschot[aanvragenVoorschot.length - 1]
    : null;

  const firstAanvraagVoorschot = aanvragenVoorschot.length
    ? aanvragenVoorschot[0]
    : null;

  const aanvragenUitkering = aanvragen
    .filter(item => item.naam === TOZO_UITKERING_PRODUCT_TITLE)
    .map(mapLastDatePublished)
    .sort(dateSort('datePublished'));

  const lastAanvraagUitkering = aanvragenUitkering.length
    ? aanvragenUitkering[aanvragenUitkering.length - 1]
    : null;

  const tozoDocuments = documenten.sort(dateSort('datePublished'));

  const mix = [
    ...tozoDocuments,
    ...aanvragenVoorschot,
    ...aanvragenUitkering,
    ...aanvragenLening,
  ].sort(dateSort('datePublished'));

  const lastTozoItem = mix.length ? mix[mix.length - 1] : null;

  const lastAanvraagLeningDecisionDate = lastAanvraagLening?.datePublished;
  const lastAanvraagUitkeringDecisionDate =
    lastAanvraagUitkering?.datePublished;
  const lastAanvraagVoorschotDecisionDate =
    lastAanvraagVoorschot?.datePublished;

  // Take last voorschot
  const firstActivityDatePublished = mix.length ? mix[0].datePublished : '';
  const lastActivityDatePublished = mix.length
    ? mix[mix.length - 1].datePublished
    : '';

  const status = {
    lening: lastAanvraagLening
      ? getLatestStep(lastAanvraagLening.processtappen)
      : null,
    uitkering: lastAanvraagUitkering
      ? getLatestStep(lastAanvraagUitkering.processtappen)
      : null,
    voorschot: lastAanvraagVoorschot
      ? getLatestStep(lastAanvraagVoorschot.processtappen)
      : null,
  };

  const hasDecision = {
    lening: status.lening === 'beslissing',
    uitkering: status.uitkering === 'beslissing',
    voorschot: status.voorschot === 'beslissing',
  };

  const now = new Date();

  const isRecentLening =
    lastAanvraagLening && lastAanvraagLening.typeBesluit
      ? isRecentItem(
          getDecision(lastAanvraagLening.typeBesluit),
          lastAanvraagLening.processtappen,
          now
        )
      : false;

  const isRecentUitkering =
    lastAanvraagUitkering && lastAanvraagUitkering.typeBesluit
      ? isRecentItem(
          getDecision(lastAanvraagUitkering.typeBesluit),
          lastAanvraagUitkering.processtappen,
          now
        )
      : false;

  const isRecentVoorschot =
    lastAanvraagVoorschot && lastAanvraagVoorschot.typeBesluit
      ? isRecentItem(
          getDecision(lastAanvraagVoorschot.typeBesluit),
          lastAanvraagVoorschot.processtappen,
          now
        )
      : false;

  const isRecent = isRecentLening || isRecentUitkering || isRecentVoorschot;

  // let notificationDescription = '';
  // {
  //       id: 'tozo-regeling-notification-0',
  //       datePublished: lastTozoItem.datePublished,
  //       chapter: Chapters.INKOMEN,
  //       title: 'Tijdelijke overbruggingsregeling zelfstandig ondernemers',
  //       description: notificationDescription,
  //       link: {
  //         to: AppRoutes['INKOMEN/TOZO'],
  //         title: 'Bekijk status',
  //       },
  //     }
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

  let voorschotStep: ProcessStep | null = null;

  if (firstAanvraagVoorschot) {
    voorschotStep = {
      id: 'aanvraag-step-01',
      documents: aanvragenVoorschot.flatMap(voorschot => {
        return voorschot.processtappen.beslissing!.document.map(doc => {
          return formatFocusTozoDocument(
            dateFormat(voorschot.datePublished, 'dd MMMM - HH:mm'),
            doc
          );
        });
      }),
      title: 'Voorschot',
      description: `Voorschot toegekend.`,
      datePublished: firstAanvraagVoorschot.datePublished,
      status: 'Voorschot',
      aboutStep: 'beslissing',
      isRecent,
      isChecked: true,
      isLastActive: true, // Force large checkmark in UI
      stepType: 'single-step',
    };
  }

  const tozoProcessItem = {
    id: 'tozo-item-0',
    dateStart: firstActivityDatePublished,
    datePublished: lastActivityDatePublished,
    ISODatePublished: lastActivityDatePublished,
    title: 'Tijdelijke overbruggingsregeling zelfstandig ondernemers',
    description: '',
    status,
    hasDecision,
    isRecent,
    chapter: Chapters.INKOMEN,
    link: {
      to: AppRoutes['INKOMEN/TOZO'], // TODO: make specific
      title: 'Bekijk status',
    },
    process: {
      lening: lastAanvraagLening
        ? formatFocusProductTozo(lastAanvraagLening, tozoDocuments, now).process
        : [],
      uitkering: lastAanvraagUitkering
        ? formatFocusProductTozo(lastAanvraagUitkering, tozoDocuments, now)
            .process
        : [],
      aanvraag: voorschotStep ? [aanvraagStep, voorschotStep] : [aanvraagStep],
    },
    notifications: {
      lening: null,
      uitkering: null,
      voorschot: null,
    },
  };

  return tozoProcessItem;
}
