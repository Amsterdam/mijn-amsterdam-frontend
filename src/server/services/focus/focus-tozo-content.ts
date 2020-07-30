import { dateFormat, defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusTozoDocument } from './focus-combined';
import { FocusStepContent } from './focus-types';

function productName(
  document: Pick<FocusTozoDocument, 'productTitle' | 'productSpecific'>,
  includeArticle: boolean = true
) {
  const hasProductSpecific = !!document.productSpecific;
  return `${hasProductSpecific && includeArticle ? 'de ' : ''}${
    document.productTitle
  }${hasProductSpecific ? ` ${document.productSpecific}` : ''}`;
}

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
    title: document =>
      `${productName(document, false)}: Uw aanvraag is toegekend`,
    description: document =>
      `U hebt recht op ${productName(document)} (besluit: ${defaultDateFormat(
        document.datePublished
      )}).`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>
          U hebt recht op ${productName(document)}. Bekijk de brief
          voor meer details.
        </p>`,
};

const afwijzenLabels: FocusStepContent = {
  notification: {
    title: document =>
      `${productName(document, false)}: Uw aanvraag is afgewezen`,
    description: document =>
      `U hebt geen recht op ${productName(
        document
      )} (besluit: ${defaultDateFormat(document.datePublished)}).`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>
        U hebt geen recht op ${productName(
          document
        )}. Bekijk de brief voor meer details.
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
    `<p>Wij behandelen uw aanvraag voor ${document.productTitle} niet meer. Bekijk de brief voor meer details.</p>`,
};

const intrekkenLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Aanvraag ingetrokken`,
    description: document =>
      `U hebt uw ${document.productTitle} aanvraag ingetrokken.`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>U hebt uw ${document.productTitle} aanvraag ingetrokken. Bekijk de brief voor meer details.</p>`,
};

const vrijeBeschikkingLabels: FocusStepContent = {
  notification: {
    title: document => `${document.productTitle}: Besluit aanvraag`,
    description: document =>
      `Wij hebben een besluit genomen over uw ${document.productTitle} aanvraag.`,
  },
  status: stepLabels.beslissing,
  description: document =>
    `<p>Wij hebben een besluit genomen over uw ${document.productTitle} aanvraag. Bekijk de brief voor meer details.</p>`,
};

export type FocusTozoStepType =
  | 'aanvraag'
  | 'herstelTermijn'
  | 'toekennen'
  | 'afwijzen'
  | 'buitenBehandeling'
  | 'intrekken'
  | 'vrijeBeschikking'
  | 'voorschot';

export type FocusTozoLabelTranslations = {
  step: FocusStepContent;
  documentTitle: string;
  product: 'Tozo 1' | 'Tozo 2';
  productSpecific: 'uitkering' | 'lening' | 'voorschot' | 'aanvraag' | '';
};

export type FocusTozoLabelSet = Record<string, FocusTozoLabelTranslations>;

export const documentStatusTranslation: {
  [type in FocusTozoStepType]: FocusTozoLabelSet;
} = {
  afwijzen: {
    'Afwijzen uitkering Tozo': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing uitkering',
      product: 'Tozo 1',
      productSpecific: 'uitkering',
    },
    'Tozo Afwijzen': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing',
      product: 'Tozo 1',
      productSpecific: '',
    },
    'Afwijzen lening Tozo': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing lening',
      product: 'Tozo 1',
      productSpecific: 'lening',
    },
    'Tozo afwijzen via batch': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing',
      product: 'Tozo 1',
      productSpecific: '',
    },

    // TOZO-2
    'Tozo2 Afwijzen': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing',
      product: 'Tozo 2',
      productSpecific: '',
    },
    'Tozo2 afwijzen via batch': {
      step: afwijzenLabels,
      documentTitle: 'Besluit afwijzing',
      product: 'Tozo 2',
      productSpecific: '',
    },
  },
  voorschot: {
    'Voorschot Bbz Corona regeling (Eenm.)': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
      productSpecific: 'voorschot',
    },
    'Bbz Toekennen voorschot Tozo': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
      productSpecific: 'voorschot',
    },
    'Bbz Toekennen voorschot Tozo via batch': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 1',
      productSpecific: 'voorschot',
    },

    // TOZO-2
    'Tozo2 Toekennen voorschot via batch': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 2',
      productSpecific: 'voorschot',
    },
    'Tozo2 Toekennen voorschot': {
      step: voorschotToekennenLabels,
      documentTitle: 'Brief betaling voorschot',
      product: 'Tozo 2',
      productSpecific: 'voorschot',
    },
  },
  toekennen: {
    'Toekennen uitkering Tozo': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit uitkering',
      product: 'Tozo 1',
      productSpecific: 'uitkering',
    },
    'Tozo Toekennen': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning uitkering',
      product: 'Tozo 1',
      productSpecific: 'uitkering',
    },
    'Toekennen lening Tozo': {
      step: toekennenLabels,
      documentTitle: 'Brief besluit lening',
      product: 'Tozo 1',
      productSpecific: 'lening',
    },
    'Tozo Toekennen bedrijfskapitaal': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning lening',
      product: 'Tozo 1',
      productSpecific: 'lening',
    },
    'Tozo Vrije beschikking': {
      step: toekennenLabels,
      documentTitle: 'Besluit Tozo 1 aanvraag',
      product: 'Tozo 1',
      productSpecific: '',
    },
    'Tozo Toekennen via batch': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning uitkering',
      product: 'Tozo 1',
      productSpecific: 'uitkering',
    },

    // TOZO-2
    'Tozo2 Toekennen': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning uitkering',
      product: 'Tozo 2',
      productSpecific: 'uitkering',
    },
    'Tozo2 Toekennen bedrijfskapitaal': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning lening',
      product: 'Tozo 2',
      productSpecific: 'lening',
    },
    'Tozo2 Toekennen via batch': {
      step: toekennenLabels,
      documentTitle: 'Besluit toekenning uitkering',
      product: 'Tozo 2',
      productSpecific: 'uitkering',
    },
  },
  buitenBehandeling: {
    'Tozo Buiten behandeling laten': {
      step: buitenBehandelingLabels,
      documentTitle: 'Besluit buiten behandeling',
      product: 'Tozo 1',
      productSpecific: '',
    },

    // TOZO-2
    'Tozo2 Buiten behandeling laten': {
      step: buitenBehandelingLabels,
      documentTitle: 'Besluit buiten behandeling',
      product: 'Tozo 2',
      productSpecific: '',
    },
  },
  intrekken: {
    'Tozo Intrekken': {
      step: intrekkenLabels,
      documentTitle: 'Brief intrekken Tozo 1 aanvraag',
      product: 'Tozo 1',
      productSpecific: 'aanvraag',
    },
    'Tozo Intrekken met terugvordering voorschot': {
      step: intrekkenLabels,
      documentTitle: 'Besluit intrekking met terugbetaling',
      product: 'Tozo 1',
      productSpecific: 'aanvraag',
    },

    // TOZO-2
    'Tozo2 Intrekken met terugvordering voorschot': {
      step: intrekkenLabels,
      documentTitle: 'Besluit intrekking met terugbetaling',
      product: 'Tozo 2',
      productSpecific: 'aanvraag',
    },
    'Tozo2 Intrekken': {
      step: intrekkenLabels,
      documentTitle: 'Besluit intrekking met terugbetaling',
      product: 'Tozo 2',
      productSpecific: 'aanvraag',
    },
  },
  herstelTermijn: {
    'Hersteltermijn uitkering Tozo': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
      productSpecific: 'uitkering',
    },
    'Tozo Hersteltermijn': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
      productSpecific: '',
    },
    'Hersteltermijn lening Tozo': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 1',
      productSpecific: 'lening',
    },

    // TOZO-2
    'Tozo2 Hersteltermijn': {
      step: herstelTermijnLabels,
      documentTitle: 'Brief meer informatie',
      product: 'Tozo 2',
      productSpecific: '',
    },
  },
  aanvraag: {
    'E-AANVR-TOZO': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 1',
      productSpecific: 'aanvraag',
    },
    'E-AANVR-KBBZ': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 1',
      productSpecific: 'aanvraag',
    },

    // TOZO-2
    'E-AANVR-TOZ2': {
      step: aanvraagLabels,
      documentTitle: 'Ontvangst- bevestiging Aanvraag',
      product: 'Tozo 2',
      productSpecific: 'aanvraag',
    },
  },
  vrijeBeschikking: {
    'Tozo Vrije beschikking': {
      step: vrijeBeschikkingLabels,
      documentTitle: 'Besluit Tozo 1 aanvraag',
      product: 'Tozo 1',
      productSpecific: '',
    },

    // TOZO-2
    'Tozo2 Vrije beschikking': {
      step: vrijeBeschikkingLabels,
      documentTitle: 'Besluit Tozo 2 aanvraag',
      product: 'Tozo 2',
      productSpecific: '',
    },
  },
};
