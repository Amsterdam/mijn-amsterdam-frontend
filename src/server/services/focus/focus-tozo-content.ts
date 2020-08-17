import { dateFormat, defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusTozoDocument } from './focus-combined';
import { FocusStepContent, FocusDocumentFromSource } from './focus-types';

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
  | 'besluit'
  | 'intrekken'
  | 'vrijeBeschikking'
  | 'voorschot';

export type FocusTozoLabelSet = {
  labels: FocusStepContent;
  documentTitle: string;
  product: 'Tozo 1' | 'Tozo 2';
  productSpecific: 'uitkering' | 'lening' | 'voorschot' | 'aanvraag' | '';
  stepType: FocusTozoStepType;
};

export const tozoDocumentLabelSet: Record<
  FocusDocumentFromSource['omschrijving'],
  FocusTozoLabelSet
> = {
  //-------------------------------------------------------
  // aanvraag
  //-------------------------------------------------------
  'Verkorte Aanvraag BBZ': {
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },
  'Tegemoetkoming Ondernemers en Zelfstandigen': {
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },

  // TOZO-2
  'TOZO 2 (vervolgregeling tegemoetkoming Ondernemers en Zelfstandigen)': {
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 2',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },
  //-------------------------------------------------------
  // voorschot
  //-------------------------------------------------------
  'Bbz Toekennen voorschot Tozo': {
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 1',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  'Bbz Toekennen voorschot Tozo via batch': {
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 1',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  'Tozo Toekennen voorschot': {
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 1',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },

  // TOZO-2
  'Tozo2 Toekennen voorschot via batch': {
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 2',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  'Tozo2 Toekennen voorschot': {
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 2',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },

  //-------------------------------------------------------
  // herstelTermijn
  //-------------------------------------------------------
  'Tozo Hersteltermijn': {
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'herstelTermijn',
  },

  // TOZO-2
  'Tozo2 Hersteltermijn': {
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'herstelTermijn',
  },

  //-------------------------------------------------------
  // afwijzen
  //-------------------------------------------------------
  'Tozo Afwijzen': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },
  'Tozo Afwijzen via batch': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },
  'Tozo Terugvordering voorschot': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },

  // TOZO-2
  'Tozo2 Afwijzen': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },
  'Tozo2 Afwijzen via batch': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit terugvordering',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },
  'Tozo2 Terugvordering voorschot': {
    labels: afwijzenLabels,
    documentTitle: 'Besluit terugvordering',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },

  //-------------------------------------------------------
  // toekennen
  //-------------------------------------------------------
  'Tozo Toekennen': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 1',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  'Tozo Toekennen bedrijfskapitaal': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning lening',
    product: 'Tozo 1',
    productSpecific: 'lening',
    stepType: 'besluit',
  },
  'Tozo Toekennen via batch': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 1',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },

  // TOZO-2
  'Tozo2 Toekennen': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 2',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  'Tozo2 Toekennen bedrijfskapitaal': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning lening',
    product: 'Tozo 2',
    productSpecific: 'lening',
    stepType: 'besluit',
  },
  'Tozo2 Toekennen via batch': {
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 2',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },

  //-------------------------------------------------------
  // buitenBehandeling
  //-------------------------------------------------------
  'Tozo Buiten behandeling laten': {
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },

  // TOZO-2
  'Tozo2 Buiten behandeling laten': {
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },

  //-------------------------------------------------------
  // intrekken
  //-------------------------------------------------------
  'Tozo Intrekken': {
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken Tozo 1 aanvraag',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'intrekken',
  },
  'Tozo Intrekken met terugvordering voorschot': {
    labels: intrekkenLabels,
    documentTitle: 'Besluit intrekking met terugbetaling',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'intrekken',
  },

  // TOZO-2
  'Tozo2 Intrekken met terugvordering voorschot': {
    labels: intrekkenLabels,
    documentTitle: 'Besluit intrekking met terugbetaling',
    product: 'Tozo 2',
    productSpecific: 'aanvraag',
    stepType: 'intrekken',
  },
  'Tozo2 Intrekken': {
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken Tozo 2 aanvraag',
    product: 'Tozo 2',
    productSpecific: 'aanvraag',
    stepType: 'intrekken',
  },

  //-------------------------------------------------------
  // vrijeBeschikking
  //-------------------------------------------------------
  'Tozo Vrije beschikking': {
    labels: vrijeBeschikkingLabels,
    documentTitle: 'Besluit Tozo 1 aanvraag',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'vrijeBeschikking',
  },

  // TOZO-2
  'Tozo2 Vrije beschikking': {
    labels: vrijeBeschikkingLabels,
    documentTitle: 'Besluit Tozo 2 aanvraag',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'vrijeBeschikking',
  },
};
