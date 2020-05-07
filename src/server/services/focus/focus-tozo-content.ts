import { TozoProductTitle } from './focus-tozo';
import { LabelData } from './focus-types';
import { stepLabels } from './focus-aanvragen-content';
import { getDecision } from './focus-helpers';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';
export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle = 'Lening Tozo';
export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle = 'Uitkering Tozo';

export const contentDocumentTitles: DocumentTitles = {
  'E-AANVR-TOZO': 'aanvraag',
  'E-AANVR-KBBZ': 'aanvraag',
  'Voorschot Tozo (voor ondernemers) (Eenm.)': 'toekenning',
  'Tegemoetkoming Ondernemers en Zelfstandigen': 'aanvraag',
};

export const contentLabels: LabelData = {
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
        description: data =>
          `<p>
            U hebt op ${data.dateStart} een ${data.productTitleTranslated}
            aangevraagd.
          </p>`,
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
        description: data =>
          `<p>
            Wij gaan nu bekijken of u recht hebt op
            ${data.productTitleTranslated}. Het kan zijn dat u nog extra
            informatie moet opsturen. U ontvangt vóór ${data.decisionDeadline1}
            ons besluit.
          </p>`,
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description: data =>
            `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
        },
        title: data => data.productTitleTranslated,
        status: stepLabels.herstelTermijn,
        description: data =>
          `
            <p>
              Wij hebben meer informatie en tijd nodig om uw aanvraag te
              verwerken. Bekijk de brief voor meer details. U moet de extra
              informatie vóór {data.userActionDeadline} opsturen. Dan ontvangt u
              vóór ${data.decisionDeadline2} ons besluit.
            </p>
            <p>
              Tip: Lever de informatie die wij gevraagd hebben zo spoedig
              mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft,
              hoe eerder wij verder kunnen met de behandeling van uw aanvraag.
            </p>
          `,
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
          description: data =>
            `<p>
              U heeft recht op een ${data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>`,
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
          description: data =>
            `
              <p>
                U heeft recht op een ${data.productTitleTranslated}. Bekijk de
                brief voor meer details.
              </p>
            `,
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
        description: data =>
          `<p>
            U hebt op ${data.dateStart} een ${data.productTitleTranslated}
            aangevraagd.
          </p>`,
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
        description: data =>
          `<p>
            Wij gaan nu bekijken of u recht hebt op
            ${data.productTitleTranslated}. Het kan zijn dat u nog extra
            informatie moet opsturen. U ontvangt vóór ${data.decisionDeadline1}
            ons besluit.
          </p>`,
      },
      herstelTermijn: {
        notification: {
          title: data => `${data.productTitleTranslated}: Neem actie`,
          description: data =>
            `Er is meer informatie en tijd nodig om uw aanvraag voor een ${data.productTitleTranslated} te behandelen.`,
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
              Tip: Lever de informatie die wij gevraagd hebben zo spoedig
              mogelijk in. Hoe eerder u ons de noodzakelijke informatie geeft,
              hoe eerder wij verder kunnen met de behandeling van uw aanvraag.
            </p>
          `,
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
          description: data =>
            `<p>
              U heeft recht op een ${data.productTitleTranslated}. Bekijk de
              brief voor meer details.
            </p>`,
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
