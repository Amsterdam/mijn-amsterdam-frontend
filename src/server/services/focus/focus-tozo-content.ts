import { TozoProductTitle } from './focus-tozo';
import { LabelData, DocumentTitles } from './focus-types';
import { stepLabels } from './focus-aanvragen-content';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle = 'Lening Tozo';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle = 'Uitkering Tozo';

export const contentDocumentTitles: DocumentTitles = {
  'E-AANVR-TOZO': 'Brief aanvraag',
  'E-AANVR-KBBZ': 'Brief aanvraag',
  'Voorschot Tozo (voor ondernemers) (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch 07 april': 'Brief betaling voorschot',
  'Tegemoetkoming Ondernemers en Zelfstandigen': 'aanvraag',
  'Hersteltermijn uitkering Tozo': 'Brief hersteltermijn',
  'Voorschot Bbz Corona regeling (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch': 'Brief betaling voorschot',
};

export const contentLabels: LabelData = {
  Minimafonds: {},
  Participatiewet: {
    [TOZO_UITKERING_PRODUCT_TITLE]: {
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
        afwijzing: {
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
        toekenning: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description: data =>
              `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
            linkTitle: 'Bekijk uw Tozo status',
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data =>
            `<p>
              U heeft recht op een ${data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>`,
        },
        buitenbehandeling: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished!}).`,
            linkTitle: 'Bekijk uw Tozo status',
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data =>
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
        toekenning: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description: data =>
              `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
            linkTitle: 'Bekijk uw Tozo status',
          },
          title: data => data.productTitleTranslated,
          status: 'Voorschot',
          description: data =>
            `<p>
              Uw voorschot Tozo uitkering is uitbetaald. Aan dit voorschot
              gelden voorwaarden. De voorwaarden vindt u in de brief.
            </p>`,
        },
      },
    },
    [TOZO_LENING_PRODUCT_TITLE]: {
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
        description: data =>
          `<p>
            Er is meer informatie en tijd nodig om uw aanvraag te behandelen.
            Bekijk de brief voor meer details.
          </p>`,
      },
      beslissing: {
        afwijzing: {
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
        toekenning: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is toegekend`,
            description: data =>
              `U heeft recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
            linkTitle: 'Bekijk uw Tozo status',
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data =>
            `<p>
              U heeft recht op een ${data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>`,
        },
        buitenbehandeling: {
          notification: {
            title: data =>
              `${data.productTitleTranslated}: Uw aanvraag is buiten behandeling gesteld`,
            description: data =>
              `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
            linkTitle: 'Bekijk uw Tozo status',
          },
          title: data => data.productTitleTranslated,
          status: stepLabels.beslissing,
          description: data =>
            'Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer details.',
        },
      },
      bezwaar: null,
    },
  },
};
