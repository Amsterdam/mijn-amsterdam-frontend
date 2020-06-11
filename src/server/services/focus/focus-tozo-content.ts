import { defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import {
  DocumentTitles,
  FocusItemStep,
  LabelData,
  ProductStepLabels,
} from './focus-types';

export const TOZO_AANVRAAG_STEP_ID = 'aanvraag-step-tozo';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';

export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle =
  'Tozo Bedrijfskapitaal (voor ondernemers)';

export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle =
  'Tozo Levensonderhoud (voor ondernemers)';

export const tozoTitleTranslations: DocumentTitles = {
  'E-AANVR-TOZO': 'Brief aanvraag',
  'E-AANVR-KBBZ': 'Brief aanvraag',
  'Voorschot Bbz Corona regeling (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch': 'Brief betaling voorschot',
  'Hersteltermijn uitkering Tozo': 'Brief meer informatie',
  'Afwijzen uitkering Tozo': 'Brief besluit uitkering',
  'Toekennen uitkering Tozo': 'Brief besluit uitkering',
  'Hersteltermijn lening Tozo': 'Brief meer informatie',
  'Afwijzen lening Tozo': 'Brief besluit lening',
  'Toekennen lening Tozo': 'Brief besluit lening',
  [TOZO_VOORSCHOT_PRODUCT_TITLE]: 'Tozo-voorschot',
  [TOZO_LENING_PRODUCT_TITLE]: 'Tozo-lening',
  [TOZO_UITKERING_PRODUCT_TITLE]: 'Tozo-uitkering',
};

const VoorschotLabels: ProductStepLabels = {
  beslissing: {
    toekenning: {
      notification: {
        title: product => {
          return `${product.title}: wij hebben een voorschot betaald`;
        },
        description: product =>
          `Wij hebben een voorschot naar uw rekening overgemaakt.`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: 'Voorschot',
      description: product =>
        `<p>
          Wij hebben een voorschot naar uw rekening overgemaakt. Kijk voor de
          voorwaarden in de brief.
        </p>`,
    },
  },
};

const UitkeringLabels: ProductStepLabels = {
  aanvraag: {
    notification: {
      title: product => `${product.title}: Wij hebben uw aanvraag ontvangen`,
      description: product =>
        `Wij hebben uw aanvraag voor een ${product.title} ontvangen op ${product.dateStart}.`,
      link: product => ({
        title: 'Bekijk uw Tozo status',
        to: '',
      }),
    },
    status: stepLabels.aanvraag,
    description: product =>
      `U hebt op ${defaultDateFormat(product.datePublished)} een ${
        product.title
      } aangevraagd.`,
  },
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: Informatie nodig`,
      description: product =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      link: product => ({
        title: 'Bekijk uw Tozo status',
        to: '',
      }),
    },
    status: stepLabels.herstelTermijn,
    description: product =>
      `<p>
        Er is meer informatie en tijd nodig om uw aanvraag te behandelen. Bekijk
        de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: product => `${product.title}: uw aanvraag is afgewezen`,
        description: product =>
          `U hebt geen recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt geen recht op een ${product.title} (besluit:
          ${product.datePublished}).
        </p>`,
    },
    toekenning: {
      notification: {
        title: product => `${product.title}: uw aanvraag is toegekend`,
        description: product =>
          `U hebt recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt recht op een ${product.title} (besluit:
          ${product.datePublished}).
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: product =>
          `${product.title}: uw aanvraag is buiten behandeling gesteld`,
        description: product =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${product.datePublished!}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        '<p>Uw aanvraag is buiten behandeling gesteld.</p>',
    },
  },
};

const LeningLabels: ProductStepLabels = {
  aanvraag: {
    notification: {
      title: product => `${product.title}: Wij hebben uw aanvraag ontvangen`,
      description: product =>
        `Wij hebben uw aanvraag voor een ${product.title} ontvangen op ${product.dateStart}.`,
      link: product => ({
        title: 'Bekijk uw Tozo status',
        to: '',
      }),
    },
    status: stepLabels.aanvraag,
    description: product =>
      `U hebt op ${defaultDateFormat(product.datePublished)} een ${
        product.title
      } aangevraagd.`,
  },
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: Informatie nodig`,
      description: product =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      link: product => ({
        title: 'Bekijk uw Tozo status',
        to: '',
      }),
    },
    status: stepLabels.herstelTermijn,
    description: product =>
      `<p>
        Er is meer informatie en tijd nodig om uw aanvraag te behandelen. Bekijk
        de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: product => `${product.title}: uw aanvraag is afgewezen`,
        description: product =>
          `<p>U hebt geen recht op een ${product.title} (besluit: ${product.datePublished}).</p>`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt geen recht op een ${product.title} (besluit:
          ${product.datePublished}).
        </p>`,
    },
    toekenning: {
      notification: {
        title: product => `${product.title}: uw aanvraag is toegekend`,
        description: product =>
          `U hebt recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt recht op een ${product.title} (besluit:
          ${product.datePublished}).
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: product =>
          `${product.title}: uw aanvraag is buiten behandeling gesteld`,
        description: product =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
          to: '',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        '<p>Uw aanvraag is buiten behandeling gesteld.</p>',
    },
  },
};

export const contentLabels: LabelData = {
  Minimafonds: {},
  Participatiewet: {
    'Tozo-uitkering': UitkeringLabels,
  },
  'Bijzondere Bijstand': {
    'Tozo-voorschot': VoorschotLabels,
    'Tozo-lening': LeningLabels,
  },
};

export const fakeDecisionStep: FocusItemStep = {
  id: 'fake-decision-filler',
  title: '',
  status: 'Besluit',
  datePublished: '',
  documents: [],
  isChecked: false,
  isActive: false,
  description: `<p>
      Zodra we alle benodigde informatie binnen hebben, ontvangt u een besluit.
    </p>`,
};

export type TozoProductTitle =
  | 'Lening Tozo'
  | 'Uitkering Tozo'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;
