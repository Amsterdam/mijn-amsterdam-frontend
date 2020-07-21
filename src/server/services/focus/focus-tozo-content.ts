import { defaultDateFormat, dateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusStepContent, FocusItemStep } from './focus-types';

const aanvraagLabels: FocusStepContent = {
  notification: {
    title: document =>
      `Wij hebben uw aanvraag ${document.productTitle} ontvangen`,
    description: document =>
      `Wij hebben uw aanvraag ${
        document.productTitle
      } ontvangen op ${dateFormat(
        document.datePublished,
        `dd MMMM 'om' HH:mm`
      )} uur`,
  },
  status: stepLabels.aanvraag,
  description: document =>
    `<p>
        Wij hebben uw aanvraag ${document.productTitle} ontvangen.
      </p>`,
};

const voorschotToekennenLabels: FocusStepContent = {
  notification: {
    title: document => {
      return `${document.productTitle}: Wij hebben een voorschot betaald`;
    },
    description: document =>
      `Wij hebben een voorschot naar uw rekening overgemaakt.`,
  },
  status: 'Voorschot',
  description: document =>
    `<p>
          Wij hebben een voorschot naar uw rekening overgemaakt. Kijk voor de
          voorwaarden in de brief.
        </p>`,
};

const herstelTermijnLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Meer informatie nodig`,
    description: document =>
      `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
  },
  status: stepLabels.herstelTermijn,
  description: document =>
    `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te verwerken.
        Bekijk de brief voor meer details.
      </p>`,
};

const toekennenLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Uw aanvraag is toegekend`,
    description: document =>
      `U hebt recht op een ${
        document.productTitle
      } (besluit: ${defaultDateFormat(document.datePublished)}).`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>
          U hebt recht op een ${document.productTitle}. Bekijk de brief
          voor meer details.
        </p>`,
};

const afwijzenLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Uw aanvraag is afgewezen`,
    description: document =>
      `U hebt geen recht op een ${
        document.productTitle
      } (besluit: ${defaultDateFormat(document.datePublished)}).`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>
        U hebt geen recht op een ${document.productTitle}. Bekijk de
        brief voor meer details.
      </p>`,
};

const buitenBehandelingLabels: FocusStepContent = {
  notification: {
    title: document =>
      `${document.productTitle}: Wij behandelen uw aanvraag niet meer`,
    description: document => `Bekijk de brief voor meer details.`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>Wij behandelen uw aanvraag niet meer. Bekijk de brief voor meer
          details.</p>`,
};

const intrekkenLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Uw aanvraag is ingetrokken`,
    description: document =>
      `Uw aanvraag is ingetrokken (besluit: ${defaultDateFormat(
        document.datePublished
      )}).`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>Uw aanvraag is ingetrokken. Bekijk de brief voor meer
          details.</p>`,
};

export type FocusTozoStepType =
  | 'aanvraag'
  | 'herstelTermijn'
  | 'toekennen'
  | 'afwijzen'
  | 'buitenBehandeling'
  | 'intrekken'
  | 'voorschot';

export type FocusTozoLabelTranslations = {
  step: FocusStepContent;
  documentTitle: string;
  product: 'Tozo 1' | 'Tozo 2';
};

export type FocusTozoLabelSet = Record<string, FocusTozoLabelTranslations>;

export const documentStatusTranslation: {
  [type in FocusTozoStepType]: FocusTozoLabelSet;
} = {
  afwijzen: {
    'Afwijzen uitkering Tozo': {
      step: afwijzenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },
    'Tozo Afwijzen': {
      step: afwijzenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },
    'Afwijzen lening Tozo': {
      step: afwijzenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Afwijzen': {
      step: afwijzenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 2',
    },
  },
  voorschot: {
    'Voorschot Bbz Corona regeling (Eenm.)': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
    },
    'Bbz Toekennen voorschot Tozo': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
    },
    'Bbz Toekennen voorschot Tozo via batch': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Toekennen voorschot via batch': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 2',
    },
  },
  toekennen: {
    'Toekennen uitkering Tozo': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit uitkering',
      product: 'Tozo 1',
    },
    'Tozo Toekennen': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },
    'Toekennen lening Tozo': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit lening',
      product: 'Tozo 1',
    },
    'Tozo Toekennen bedrijfskapitaal': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit lening',
      product: 'Tozo 1',
    },
    'Tozo Vrije beschikking': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },
    'Tozo Toekennen via batch': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Toekennen': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 2',
    },
    'Tozo2 Toekennen bedrijfskapitaal': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit lening',
      product: 'Tozo 2',
    },
  },
  buitenBehandeling: {
    'Tozo Buiten behandeling laten': {
      step: buitenBehandelingLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Buiten behandeling laten': {
      step: buitenBehandelingLabels,
      documentTitle: 'Brief besluit',
      product: 'Tozo 2',
    },
  },
  intrekken: {
    'Tozo Intrekken': {
      step: intrekkenLabels,
      documentTitle: 'Brief intrekking',
      product: 'Tozo 1',
    },
    'Tozo Intrekken met terugvordering voorschot': {
      step: intrekkenLabels,
      documentTitle: 'Brief intrekking',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Intrekken met terugvordering voorschot': {
      step: intrekkenLabels,
      documentTitle: 'Brief besluit uitkering',
      product: 'Tozo 2',
    },
    'Tozo2 Intrekken': {
      step: intrekkenLabels,
      documentTitle: '',
      product: 'Tozo 2',
    },
  },
  herstelTermijn: {
    'Hersteltermijn uitkering Tozo': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
    },
    'Tozo Hersteltermijn': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
    },
    'Hersteltermijn lening Tozo': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
    },

    // TOZO-2
    'Tozo2 Hersteltermijn': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 2',
    },
  },
  aanvraag: {
    'E-AANVR-TOZO': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 1',
    },
    'E-AANVR-KBBZ': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 1',
    },

    // TOZO-2
    'E-AANVR-TOZ2': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 2',
    },
  },
};
