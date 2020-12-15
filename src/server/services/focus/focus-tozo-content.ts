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
        `dd MMMM 'om' HH.mm 'uur'`
      )}`,
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
        Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.
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
        </p>` +
    (document.productTitle !== 'Tozo 1'
      ? '<p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>'
      : ''),
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
      </p>` +
    (document.productTitle !== 'Tozo 1'
      ? '<p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>'
      : ''),
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
  omschrijving: string;
  documentTitle: string;
  product: 'Tozo 1' | 'Tozo 2' | 'Tozo 3';
  productSpecific: 'uitkering' | 'lening' | 'voorschot' | 'aanvraag' | '';
  stepType: FocusTozoStepType;
};

export const tozoDocumentLabelSet: Record<
  FocusTozoDocument['documentCodeId'],
  FocusTozoLabelSet
> = {
  // Tozo 1
  '756': {
    omschrijving: 'Verkorte Aanvraag BBZ',
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },
  '770': {
    omschrijving: 'Tegemoetkoming Ondernemers en Zelfstandigen',
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 1',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },
  '175296': {
    omschrijving: 'Toekennen voorschot Tozo',
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 1',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  '175299': {
    omschrijving: 'Bbz Toekennen voorschot Tozo via batch',
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 1',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  '175303': {
    omschrijving: 'Tozo Toekennen',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 1',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '175304': {
    omschrijving: 'Tozo Afwijzen',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175305': {
    omschrijving: 'Tozo Buiten behandeling laten',
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175306': {
    omschrijving: 'Tozo Hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'herstelTermijn',
  },
  '175308': {
    omschrijving: 'Tozo Terugvordering voorschot',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175311': {
    omschrijving: 'Tozo Toekennen bedrijfskapitaal',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning lening',
    product: 'Tozo 1',
    productSpecific: 'lening',
    stepType: 'besluit',
  },
  '175314': {
    omschrijving: 'Tozo Toekennen via batch',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 1',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '175317': {
    omschrijving: 'Tozo Intrekken met terugvordering voorschot',
    labels: intrekkenLabels,
    documentTitle: 'Besluit intrekking met terugbetaling',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'intrekken',
  },
  '175331': {
    omschrijving: 'Tozo Intrekken',
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken Tozo 1 aanvraag',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'intrekken',
  },
  '175334': {
    omschrijving: 'Tozo Vrije beschikking',
    labels: vrijeBeschikkingLabels,
    documentTitle: 'Besluit Tozo 1 aanvraag',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'vrijeBeschikking',
  },
  '175335': {
    omschrijving: 'Tozo Afwijzen via batch',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 1',
    productSpecific: '',
    stepType: 'besluit',
  },

  // TOZO 2
  '777': {
    omschrijving:
      'TOZO 2 (vervolgregeling tegemoetkoming Ondernemers en Zelfstandigen)',
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 2',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },

  '175336': {
    omschrijving: 'Tozo2 Toekennen',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 2',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '175337': {
    omschrijving: 'Tozo2 Afwijzen',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175338': {
    omschrijving: 'Tozo2 Toekennen bedrijfskapitaal',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning lening',
    product: 'Tozo 2',
    productSpecific: 'lening',
    stepType: 'besluit',
  },
  '175340': {
    omschrijving: 'Tozo2 Hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'herstelTermijn',
  },
  '175341': {
    omschrijving: 'Tozo2 Intrekken',
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken Tozo 2 aanvraag',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'intrekken',
  },
  '175342': {
    omschrijving: 'Tozo2 Buiten behandeling laten',
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175343': {
    omschrijving: 'Tozo2 Terugvordering voorschot',
    labels: afwijzenLabels,
    documentTitle: 'Besluit terugvordering',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },
  '175344': {
    omschrijving: 'Tozo2 Intrekken met terugvordering voorschot',
    labels: intrekkenLabels,
    documentTitle: 'Besluit intrekking met terugbetaling',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'intrekken',
  },
  '175345': {
    omschrijving: 'Tozo2 Toekennen voorschot via batch',
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 2',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  '175346': {
    omschrijving: 'Tozo2 Toekennen voorschot',
    labels: voorschotToekennenLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Tozo 2',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
  },
  '175347': {
    omschrijving: 'Tozo2 Toekennen via batch',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Tozo 2',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '175359': {
    omschrijving: 'Tozo2 Afwijzen via batch',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tozo 2',
    productSpecific: '',
    stepType: 'besluit',
  },

  // TOZO 3
  '785': {
    omschrijving:
      'TOZO 3 (vervolgregeling tegemoetkoming Ondernemers en Zelfstandigen)',
    labels: aanvraagLabels,
    documentTitle: 'Ontvangst- bevestiging Aanvraag',
    product: 'Tozo 3',
    productSpecific: 'aanvraag',
    stepType: 'aanvraag',
  },
  '175309': {
    omschrijving: 'Tozo3 Toekennen',
    stepType: 'besluit',
    labels: toekennenLabels,
    product: 'Tozo 3',
    productSpecific: 'uitkering',
    documentTitle: 'Besluit toekenning uitkering',
  },
  '175307': {
    omschrijving: 'Tozo3 Toekennen voorschot',
    stepType: 'voorschot',
    labels: voorschotToekennenLabels,
    product: 'Tozo 3',
    productSpecific: 'voorschot',
    documentTitle: 'Brief betaling voorschot',
  },
  '175310': {
    omschrijving: 'Tozo3 Hersteltermijn',
    stepType: 'herstelTermijn',
    labels: herstelTermijnLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Brief meer informatie',
  },
  '175357': {
    omschrijving: 'Tozo3 Toekennen via batch',
    stepType: 'besluit',
    labels: toekennenLabels,
    product: 'Tozo 3',
    productSpecific: 'uitkering',
    documentTitle: 'Besluit toekenning uitkering',
  },
  '175358': {
    omschrijving: 'Tozo3 Buiten behandeling laten',
    stepType: 'besluit',
    labels: buitenBehandelingLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Besluit buiten behandeling',
  },
  '175364': {
    omschrijving: 'Tozo3 Afwijzen',
    stepType: 'besluit',
    labels: afwijzenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Besluit afwijzing',
  },
  '175367': {
    omschrijving: 'Tozo3 Intrekken met terugvordering voorschot',
    stepType: 'besluit',
    labels: intrekkenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Besluit intrekking met terugbetaling',
  },
  '175368': {
    omschrijving: 'Tozo3 Terugvordering voorschot',
    stepType: 'besluit',
    labels: afwijzenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Besluit terugvordering',
  },
  '175369': {
    omschrijving: 'Tozo3 Toekennen bedrijfskapitaal',
    stepType: 'besluit',
    labels: toekennenLabels,
    product: 'Tozo 3',
    productSpecific: 'lening',
    documentTitle: 'Besluit toekenning lening',
  },
  '175370': {
    omschrijving: 'Tozo3 Intrekken',
    stepType: 'intrekken',
    labels: intrekkenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Brief intrekken Tozo 3 aanvraag',
  },
  '175371': {
    omschrijving: 'Tozo3 Afwijzen via batch',
    stepType: 'besluit',
    labels: afwijzenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Besluit afwijzing',
  },
  '175372': {
    omschrijving: 'Tozo3 Toekennen voorschot via batch',
    stepType: 'voorschot',
    labels: voorschotToekennenLabels,
    product: 'Tozo 3',
    productSpecific: '',
    documentTitle: 'Brief betaling voorschot',
  },
};
