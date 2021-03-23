import { dateFormat, defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusDocument } from './focus-combined';
import { productName } from './focus-tozo-content';
import { FocusStepContent, FocusTonkLabelSet } from './focus-types';

const aanvraagLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `Wij hebben uw aanvraag ${document.productTitle} ontvangen`,
    description: (document) =>
      `Wij hebben uw aanvraag ${
        document.productTitle
      } ontvangen op ${dateFormat(
        document.datePublished,
        `dd MMMM 'om' HH.mm 'uur'`
      )}`,
  },
  status: stepLabels.aanvraag,
  description: (document) =>
    `<p>
        Wij hebben uw aanvraag ${document.productTitle} ontvangen.
      </p>`,
};

const herstelTermijnLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${productName(document, false)}: Meer informatie nodig`,
    description: (document) =>
      `Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.`,
  },
  status: stepLabels.herstelTermijn,
  description: (document) =>
    `<p>
        Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.
        Bekijk de brief voor meer details.
      </p>`,
};

const toekennenLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${productName(document, false)}: Uw aanvraag is toegekend`,
    description: (document) =>
      `U hebt recht op ${productName(document)} (besluit: ${defaultDateFormat(
        document.datePublished
      )}).`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>
          U hebt recht op ${productName(document)}. Bekijk de brief
          voor meer details.
        </p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const afwijzenLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${productName(document, false)}: Uw aanvraag is afgewezen`,
    description: (document) =>
      `U hebt geen recht op ${productName(
        document
      )} (besluit: ${defaultDateFormat(document.datePublished)}).`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>
        U hebt geen recht op ${productName(
          document
        )}. Bekijk de brief voor meer details.
      </p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const intrekkenLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${productName(document, false)}: Aanvraag ingetrokken`,
    description: (document) =>
      `U hebt uw ${document.productTitle} aanvraag ingetrokken.`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>U hebt uw ${document.productTitle} aanvraag ingetrokken. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const buitenBehandelingLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${productName(document, false)}: Wij behandelen uw aanvraag niet meer`,
    description: (document) => `Bekijk de brief voor meer details.`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>Wij behandelen uw aanvraag voor ${productName(
      document
    )} niet meer. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

export const tonkDocumentLabelSet: Record<
  FocusDocument['documentCodeId'],
  FocusTonkLabelSet
> = {
  '802': {
    omschrijving: 'TONK aanvraag',
    labels: aanvraagLabels,
    documentTitle: 'Aanvraag TONK',
    product: 'TONK',
    stepType: 'aanvraag',
    productSpecific: 'uitkering',
  },
  '176137': {
    omschrijving: 'TONK hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'TONK',
    stepType: 'herstelTermijn',
    productSpecific: 'uitkering',
  },
  '176138': {
    omschrijving: 'TONK intrekken',
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken TONK aanvraag',
    product: 'TONK',
    stepType: 'intrekken',
    productSpecific: 'uitkering',
  },
  '176149': {
    omschrijving: 'TONK toekennen',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning',
    product: 'TONK',
    stepType: 'besluit',
    productSpecific: 'uitkering',
  },
  '176156': {
    omschrijving: 'TONK toekennen via batch',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning',
    product: 'TONK',
    stepType: 'besluit',
    productSpecific: 'uitkering',
  },
  '176145': {
    omschrijving: 'TONK afwijzen',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'TONK',
    stepType: 'besluit',
    productSpecific: 'uitkering',
  },
  '176155': {
    omschrijving: 'TONK afwijzen via batch',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'TONK',
    stepType: 'besluit',
    productSpecific: 'uitkering',
  },
  '176146': {
    omschrijving: 'TONK Buiten behandeling laten',
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'TONK',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
};
