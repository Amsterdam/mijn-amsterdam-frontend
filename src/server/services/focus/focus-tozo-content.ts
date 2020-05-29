import { stepLabels } from './focus-aanvragen-content';
import {
  DocumentTitles,
  FocusItemStep,
  LabelData,
  ProductStepLabels,
} from './focus-types';

export const TOZO_AANVRAAG_STEP_ID = 'aanvraag-step-tozo';

export const TOZO_VOORSCHOT_PRODUCT_TITLE =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';

export const TOZO_LENING_PRODUCT_TITLE =
  'Tozo Bedrijfskapitaal (voor ondernemers)';

export const TOZO_UITKERING_PRODUCT_TITLE =
  'Tozo Levensonderhoud (voor ondernemers)';

export const tozoTitleTranslations: DocumentTitles = {
  // Aanvraag
  'E-AANVR-TOZO': 'Ontvangst- bevestiging Aanvraag',
  'E-AANVR-KBBZ': 'Ontvangst- bevestiging Aanvraag',

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
  [TOZO_VOORSCHOT_PRODUCT_TITLE]: 'Tozo-voorschot',
  [TOZO_LENING_PRODUCT_TITLE]: 'Tozo-lening',
  [TOZO_UITKERING_PRODUCT_TITLE]: 'Tozo-uitkering',
};

const VoorschotLabels: ProductStepLabels = {
  beslissing: {
    toekenning: {
      notification: {
        title: product => {
          return `${product.title}: Wij hebben een voorschot betaald`;
        },
        description: product =>
          `Wij hebben een voorschot naar uw rekening overgemaakt.`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
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
  // Step is only here to catch data from the api with an Aanvraag step. We don't actually show this step in the front-end but functionality
  // requires data to have matching labels for them to be processed by the service. By putting 'fake' data here we can process normally and
  // remove the aanvraag step manually after processing
  aanvraag: {
    status: stepLabels.aanvraag,
    description: product => '',
  },
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: Neem actie`,
      description: product =>
        `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
      link: product => ({
        title: 'Bekijk uw Tozo status',
      }),
    },
    status: stepLabels.herstelTermijn,
    description: product =>
      `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
        Bekijk de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: product => `${product.title}: Uw aanvraag is afgewezen`,
        description: product =>
          `U hebt geen recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt geen recht op een ${product.title}. Bekijk de
          brief voor meer details.
        </p>`,
    },
    toekenning: {
      notification: {
        title: product => `${product.title}: Uw aanvraag is toegekend`,
        description: product =>
          `U hebt recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt recht op een ${product.title}. Bekijk de brief
          voor meer details.
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: product =>
          `${product.title}: Uw aanvraag is buiten behandeling gesteld`,
        description: product =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${product.datePublished!}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer
          details.</p>`,
    },
  },
};

const LeningLabels: ProductStepLabels = {
  // See comment above UitkeringLabels.aanvraag
  aanvraag: {
    status: stepLabels.aanvraag,
    description: product => '',
  },
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: Neem actie`,
      description: product =>
        `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
      link: product => ({
        title: 'Bekijk uw Tozo status',
      }),
    },
    status: stepLabels.herstelTermijn,
    description: product =>
      `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
        Bekijk de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: product => `${product.title}: Uw aanvraag is afgewezen`,
        description: product =>
          `U hebt geen recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt geen recht op een ${product.title}. Bekijk de
          brief voor meer details.
        </p>`,
    },
    toekenning: {
      notification: {
        title: product => `${product.title}: Uw aanvraag is toegekend`,
        description: product =>
          `U hebt recht op een ${product.title} (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>
          U hebt recht op een ${product.title}. Bekijk de brief
          voor meer details.
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: product =>
          `${product.title}: Uw aanvraag is buiten behandeling gesteld`,
        description: product =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${product.datePublished}).`,
        link: product => ({
          title: 'Bekijk uw Tozo status',
        }),
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer
          details.</p>`,
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
  title: 'fake-beslissing',
  status: 'Besluit',
  datePublished: '',
  documents: [],
  isChecked: false,
  isActive: false,
  description: `<p>
      Zodra we alle benodigde informatie binnen hebben, ontvangt u een besluit.
    </p>`,
};
