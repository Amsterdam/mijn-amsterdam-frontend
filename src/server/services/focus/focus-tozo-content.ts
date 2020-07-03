import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routing';
import { defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FeatureToggle } from '../../../universal/config/app';
import {
  DocumentTitles,
  FocusProduct,
  LabelData,
  ProductStepLabels,
} from './focus-types';

export const TOZO_AANVRAAG_STEP_ID = 'aanvraag-step-tozo';
export const TOZO_DUMMY_DECISION_STEP_ID = 'dummy-beslissing';

export const TOZO_VOORSCHOT_PRODUCT_TITLE =
  'Voorschot Tozo1 (voor ondernemers) (Eenm.)';

export const TOZO_LENING_PRODUCT_TITLE =
  'Tozo1 Bedrijfskapitaal (voor ondernemers)';

export const TOZO_UITKERING_PRODUCT_TITLE =
  'Tozo 1 Levensonderhoud (voor ondernemers)';

// Tozo 2 aangevraagd na 20 juni 2020
export const TOZO2_VOORSCHOT_PRODUCT_TITLE = 'Voorschot Tozo 2';

export const TOZO2_LENING_PRODUCT_TITLE = 'Tozo 2 Bedrijfskapitaal';

export const TOZO2_UITKERING_PRODUCT_TITLE =
  'Tozo 2 Levensonderhoud (voor ondernemers)';

// Used to filter the tozo documents from the api response
export const TOZO_AANVRAAG_DOCUMENT_TYPES = [
  'E-AANVR-TOZO',
  'E-AANVR-TOZ2',
  'E-AANVR-KBBZ',
];

export const TOZO_PRODUCT_TITLES = [
  TOZO_LENING_PRODUCT_TITLE,
  TOZO_UITKERING_PRODUCT_TITLE,
];

if (FeatureToggle.tozo2active) {
  TOZO_PRODUCT_TITLES.push(
    TOZO2_LENING_PRODUCT_TITLE,
    TOZO2_UITKERING_PRODUCT_TITLE
  );
}

export const tozoTitleTranslations: DocumentTitles = {
  // Aanvraag Tozo 1
  'E-AANVR-TOZO': 'Ontvangst- bevestiging Aanvraag',
  'E-AANVR-KBBZ': 'Ontvangst- bevestiging Aanvraag',

  // Aanvraag Tozo 2
  'E-AANVR-TOZ2': 'Ontvangst- bevestiging Aanvraag',

  // Product documenten vertalingen
  'Voorschot Bbz Corona regeling (Eenm.)': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo': 'Brief betaling voorschot',
  'Bbz Toekennen voorschot Tozo via batch': 'Brief betaling voorschot',
  'Hersteltermijn uitkering Tozo': 'Brief hersteltermijn',
  'Afwijzen uitkering Tozo': 'Brief besluit uitkering',
  'Toekennen uitkering Tozo': 'Brief besluit uitkering',
  'Tozo Toekennen': 'Brief besluit uitkering',
  'Tozo Afwijzen': 'Brief besluit [type]',
  'Tozo Buiten behandeling laten': 'Brief besluit [type]',
  'Tozo Hersteltermijn': 'Brief meer informatie',
  'Hersteltermijn lening Tozo': 'Brief meer informatie',
  'Afwijzen lening Tozo': 'Brief besluit lening',
  'Toekennen lening Tozo': 'Brief besluit lening',
  'Tozo Toekennen bedrijfskapitaal': 'Brief besluit lening ',
  'Tozo Toekennen via batch': 'Brief besluit uitkering',
  'Tozo Intrekken met terugvordering voorschot': 'Brief besluit uitkering',
  'Tozo Intrekken': 'Brief besluit [type]',
  'Tozo Vrije beschikking': 'Brief besluit [type]',
  'Tozo2 Toekennen voorschot via batch': 'Brief betaling voorschot',
  'Tozo2 Toekennen': 'Brief besluit [type]',
  'Tozo2 Afwijzen': 'Brief besluit [type]',
  'Tozo2 Buiten behandeling laten': 'Brief besluit [type]',
  'Tozo2 Hersteltermijn': 'Brief meer informatie',
  'Tozo2 Toekennen bedrijfskapitaal': 'Brief besluit lening',
  'Tozo2 Intrekken met terugvordering voorschot': 'Brief besluit uitkering',
  'Tozo2 Intrekken': 'Brief besluit [type]',

  // Tozo 1
  [TOZO_VOORSCHOT_PRODUCT_TITLE]: 'Tozo 1-voorschot',
  [TOZO_LENING_PRODUCT_TITLE]: 'Tozo 1-lening',
  [TOZO_UITKERING_PRODUCT_TITLE]: 'Tozo 1-uitkering',

  // Tozo 2
  [TOZO2_VOORSCHOT_PRODUCT_TITLE]: 'Tozo 2-voorschot',
  [TOZO2_LENING_PRODUCT_TITLE]: 'Tozo 2-lening',
  [TOZO2_UITKERING_PRODUCT_TITLE]: 'Tozo 2-uitkering',
};

const VoorschotLabels: ProductStepLabels = {
  link: (product: FocusProduct) => {
    return {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id: product.id }),
      title: 'Bekijk uw Tozo status',
    };
  },
  beslissing: {
    toekenning: {
      notification: {
        title: product => {
          return `${product.title}: Wij hebben een voorschot betaald`;
        },
        description: product =>
          `Wij hebben een voorschot naar uw rekening overgemaakt.`,
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
  link: (product: FocusProduct) => {
    return {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id: product.id }),
      title: 'Bekijk uw Tozo status',
    };
  },
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
          `U hebt geen recht op een ${
            product.title
          } (besluit: ${defaultDateFormat(product.datePublished)}).`,
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
          `U hebt recht op een ${product.title} (besluit: ${defaultDateFormat(
            product.datePublished
          )}).`,
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
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${defaultDateFormat(
            product.datePublished
          )}).`,
      },
      status: stepLabels.beslissing,
      description: product =>
        `<p>Uw aanvraag is buiten behandeling gesteld. Bekijk de brief voor meer
          details.</p>`,
    },
  },
};

const LeningLabels: ProductStepLabels = {
  link: (product: FocusProduct) => {
    return {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id: product.id }),
      title: 'Bekijk uw Tozo status',
    };
  },
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
          `U hebt geen recht op een ${
            product.title
          } (besluit: ${defaultDateFormat(product.datePublished)}).`,
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
          `U hebt recht op een ${product.title} (besluit: ${defaultDateFormat(
            product.datePublished
          )}).`,
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
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${defaultDateFormat(
            product.datePublished
          )}).`,
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

  // It's unclear wether the Tozo products belong to Bijzonder Bijstand or Participatiewet.
  // We've seen products been categorised under bot Bijzondere Bijstand as well as Participatiewet.
  Participatiewet: {
    'Tozo 1-uitkering': UitkeringLabels,
    'Tozo 1-lening': LeningLabels,
    'Tozo 1-voorschot': VoorschotLabels,
    // Tozo 2
    'Tozo 2-uitkering': UitkeringLabels,
    'Tozo 2-lening': LeningLabels,
    'Tozo 2-voorschot': VoorschotLabels,
  },
  'Bijzondere Bijstand': {
    'Tozo 1-uitkering': UitkeringLabels,
    'Tozo 1-lening': LeningLabels,
    'Tozo 1-voorschot': VoorschotLabels,
    // Tozo 2
    'Tozo 2-uitkering': UitkeringLabels,
    'Tozo 2-lening': LeningLabels,
    'Tozo 2-voorschot': VoorschotLabels,
  },
};

export const fakeDecisionStep = {
  id: TOZO_DUMMY_DECISION_STEP_ID,
  title: 'dummy-beslissing',
  status: 'Besluit',
  datePublished: '',
  documents: [],
  isChecked: false,
  isActive: false,
  description: `<p>
      Zodra we alle benodigde informatie binnen hebben, ontvangt u een besluit.
    </p>`,
};
