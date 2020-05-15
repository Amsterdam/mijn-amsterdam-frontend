import { AppRoutes, Chapter } from '../../../universal/config';
import {
  LinkProps,
  MyNotification,
  GenericDocument,
} from '../../../universal/types';
import { stepLabels } from './focus-aanvragen-content';
import {
  DocumentTitles,
  FocusItemStep,
  LabelData,
  ProductStepLabels,
  StepTitle,
} from './focus-types';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';

export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle =
  'Lening t.b.v. bedrijfskrediet TOZO';

export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle =
  'Tijdelijke Overbruggingsregeling Zelfst. Ondern.';

export const tozoContentDocumentTitles: DocumentTitles = {
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
};

export const tozoProductTitleTranslations: DocumentTitles = {
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: meer informatie nodig`,
      description: product =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      linkTitle: product => 'Bekijk uw Tozo status',
    },
    title: product => product.title,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: product =>
        '<p>Uw aanvraag is buiten behandeling gesteld.</p>',
    },
  },
};

const LeningLabels: ProductStepLabels = {
  herstelTermijn: {
    notification: {
      title: product => `${product.title}: meer informatie nodig`,
      description: product =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      linkTitle: product => 'Bekijk uw Tozo status',
    },
    title: product => product.title,
    status: stepLabels.herstelTermijn,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
        linkTitle: product => 'Bekijk uw Tozo status',
      },
      title: product => product.title,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
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
  isLastActive: false,
  description: `<p>
      Zodra we alle benodigde informatie binnen hebben, ontvangt u een besluit.
    </p>`,
};

export type TozoProductTitle =
  | 'Lening Tozo'
  | 'Uitkering Tozo'
  | 'Voorschot Tozo (voor ondernemers) (Eenm.)'
  | string;

export type FocusTozoDocumentType = 'E-AANVR-KBBZ' | 'E-AANVR-TOZO';

export interface FocusTozoDocument extends GenericDocument {
  displayDate: string;
  displayTime: string;
  status: 'Ontvangen';
  process: FocusItemStep[];
}

export interface FocusTozo {
  id: string;
  chapter: Chapter;
  link: LinkProps;
  title: string;
  dateStart: string;
  datePublished: string;
  description: string;
  status: {
    lening: StepTitle | null;
    uitkering: StepTitle | null;
    isComplete: boolean;
  };
  notifications: {
    lening: MyNotification | null;
    uitkering: MyNotification | null;
    voorschot: MyNotification[];
    aanvraag: MyNotification[];
  };
  steps: {
    lening: FocusItemStep[];
    uitkering: FocusItemStep[];
    aanvraag: FocusItemStep[];
  };
}
