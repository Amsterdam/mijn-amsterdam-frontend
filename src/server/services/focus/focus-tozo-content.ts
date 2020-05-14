import { AppRoutes, Chapter } from '../../../universal/config';
import { LinkProps, MyNotification } from '../../../universal/types';
import { ProcessStep } from './focus-aanvragen';
import { stepLabels } from './focus-aanvragen-content';
import { GenericDocument } from '../../../universal/types/App.types';
import {
  DocumentTitles,
  LabelData,
  ProductStepLabels,
  StepTitle,
  ProductTitle,
} from './focus-types';

export const TOZO_VOORSCHOT_PRODUCT_TITLE: TozoProductTitle =
  'Voorschot Tozo (voor ondernemers) (Eenm.)';

export const TOZO_LENING_PRODUCT_TITLE: TozoProductTitle =
  'Lening t.b.v. bedrijfskrediet TOZO';

export const TOZO_UITKERING_PRODUCT_TITLE: TozoProductTitle =
  'Tijdelijke Overbruggingsregeling Zelfst. Ondern.';

export const contentDocumentTitles: DocumentTitles = {
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

const VoorschotLabels: ProductStepLabels = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: null,
  bezwaar: null,
  beslissing: {
    toekenning: {
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
      description: data =>
        `<p>
          Wij hebben een voorschot naar uw rekening overgemaakt. Kijk voor de
          voorwaarden in de brief.
        </p>`,
    },
  },
};

const UitkeringLabels: ProductStepLabels = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: meer informatie nodig`,
      description: data =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
    status: stepLabels.herstelTermijn,
    description: data =>
      `<p>
        Er is meer informatie en tijd nodig om uw aanvraag te behandelen. Bekijk
        de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is afgewezen`,
        description: data =>
          `U hebt geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data =>
        `<p>
          U hebt geen recht op een ${data.productTitleTranslated} (besluit:
          ${data.datePublished}).
        </p>`,
    },
    toekenning: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is toegekend`,
        description: data =>
          `U hebt recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data =>
        `<p>
          U hebt recht op een ${data.productTitleTranslated} (besluit:
          ${data.datePublished}).
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished!}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => '<p>Uw aanvraag is buiten behandeling gesteld.</p>',
    },
  },
  bezwaar: null,
};

const LeningLabels: ProductStepLabels = {
  aanvraag: null,
  inBehandeling: null,
  herstelTermijn: {
    notification: {
      title: data => `${data.productTitleTranslated}: meer informatie nodig`,
      description: data =>
        `Er is meer informatie en tijd nodig om uw aanvraag te behandelen. `,
      linkTitle: 'Bekijk uw Tozo status',
    },
    title: data => data.productTitleTranslated,
    status: stepLabels.herstelTermijn,
    linkTitle: 'Bekijk uw Tozo status',
    linkTo: AppRoutes['INKOMEN/TOZO'],
    description: data =>
      `<p>
        Er is meer informatie en tijd nodig om uw aanvraag te behandelen. Bekijk
        de brief voor meer details.
      </p>`,
  },
  beslissing: {
    afwijzing: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is afgewezen`,
        description: data =>
          `<p>U hebt geen recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).</p>`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data =>
        `<p>
          U hebt geen recht op een ${data.productTitleTranslated} (besluit:
          ${data.datePublished}).
        </p>`,
    },
    toekenning: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is toegekend`,
        description: data =>
          `U hebt recht op een ${data.productTitleTranslated} (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data =>
        `<p>
          U hebt recht op een ${data.productTitleTranslated} (besluit:
          ${data.datePublished}).
        </p>`,
    },
    buitenbehandeling: {
      notification: {
        title: data =>
          `${data.productTitleTranslated}: uw aanvraag is buiten behandeling gesteld`,
        description: data =>
          `Uw aanvraag is buiten behandeling gesteld (besluit: ${data.datePublished}).`,
        linkTitle: 'Bekijk uw Tozo status',
      },
      title: data => data.productTitleTranslated,
      linkTitle: 'Bekijk uw Tozo status',
      linkTo: AppRoutes['INKOMEN/TOZO'],
      status: stepLabels.beslissing,
      description: data => '<p>Uw aanvraag is buiten behandeling gesteld.</p>',
    },
  },
  bezwaar: null,
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

export const fakeDecisionStep: ProcessStep = {
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

export function translateProductTitle(title: ProductTitle) {
  switch (title) {
    case TOZO_VOORSCHOT_PRODUCT_TITLE:
      return 'Tozo-voorschot';
    case TOZO_LENING_PRODUCT_TITLE:
      return 'Tozo-lening';
    case TOZO_UITKERING_PRODUCT_TITLE:
      return 'Tozo-uitkering';
  }
  return title;
}
