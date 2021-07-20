import {
  defaultDateTimeFormat,
  defaultDateFormat,
} from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusDocument } from './focus-combined';
import { documentDownloadName } from './focus-specificaties';
import { productName } from './focus-tozo-content';
import { FocusStepContent, FocusTonkLabelSet } from './focus-types';

const aanvraagLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `Wij hebben uw aanvraag ${document.productTitle} ontvangen`,
    description: (document) =>
      `Wij hebben uw aanvraag ${
        document.productTitle
      } ontvangen op ${defaultDateTimeFormat(document.datePublished)}`,
  },
  status: stepLabels.aanvraag,
  description: (document) =>
    `<p>
        Wij hebben uw aanvraag ${document.productTitle} ontvangen.
      </p>`,
};

const herstelTermijnLabels: FocusStepContent = {
  notification: {
    title: (document) => `${document.productTitle}: Meer informatie nodig`,
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
    title: (document) => `${document.productTitle}: Uw aanvraag is toegekend`,
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
    title: (document) => `${document.productTitle}: Uw aanvraag is afgewezen`,
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
    title: (document) => `${document.productTitle}: Aanvraag ingetrokken`,
    description: (document) =>
      `U hebt uw ${document.productTitle} aanvraag ingetrokken.`,
  },
  status: stepLabels.brief,
  description: (document) =>
    `<p>U hebt uw ${document.productTitle} aanvraag ingetrokken. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const buitenBehandelingLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${document.productTitle}: Wij behandelen uw aanvraag niet meer`,
    description: (document) => `Bekijk de brief voor meer details.`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>Wij behandelen uw aanvraag voor ${productName(
      document
    )} niet meer. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const verlengingLabels: FocusStepContent = {
  notification: {
    title: (document) => `${document.productTitle}: Uw uitkering is verlengd`,
    description: (document) =>
      `Uw ${productName(document)} uitkering is verlengd.`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>U hebt recht op verlenging van de ${productName(
      document
    )}. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const besluitVerlengingLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${document.productTitle}: Er is een besluit over het wel of niet verlengen`,
    description: (document) =>
      `Er is een besluit over het wel of niet verlengen van uw ${productName(
        document
      )}.`,
  },
  status: stepLabels.besluit,
  description: (document) =>
    `<p>Wij hebben een besluit genomen over een mogelijke verlenging van uw ${productName(
      document
    )}. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const weigeringVerlengingLabels: FocusStepContent = {
  notification: {
    title: (document) => `${document.productTitle}: verlenging geweigerd`,
    description: (document) =>
      `U hebt de verlenging van uw ${productName(document)} geweigerd.`,
  },
  status: stepLabels.brief,
  description: (document) =>
    `<p> U hebt uw ${productName(
      document
    )} verlenging geweigerd. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const correctieMailLabels: FocusStepContent = {
  notification: {
    title: () => `Mail over verkeerde TONK-brief ontvangen`,
    description: (document) =>
      `U hebt een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen.`,
    link: (document) => ({
      to: document.url,
      title: 'Bekijk de mail',
      download: documentDownloadName(document),
    }),
  },
  status: stepLabels.brief,
  description: () =>
    `<p>U hebt een mail gekregen omdat u een verkeerde TONK-brief hebt ontvangen. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
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
    documentTitle: 'Brief intrekking TONK aanvraag',
    product: 'TONK',
    stepType: 'intrekken',
    productSpecific: 'uitkering',
  },
  '176149': {
    omschrijving: 'TONK toekennen',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'TONK',
    stepType: 'besluit',
    productSpecific: 'uitkering',
  },
  '176156': {
    omschrijving: 'TONK toekennen via batch',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
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
  '176180': {
    omschrijving: 'TONK Ambtshalve verlenging via batch',
    labels: verlengingLabels,
    documentTitle: 'Besluit verlenging',
    product: 'TONK',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '176182': {
    omschrijving: 'TONK Besluit over verlenging',
    labels: besluitVerlengingLabels,
    documentTitle: 'Besluit over verlenging',
    product: 'TONK',
    productSpecific: 'uitkering',
    stepType: 'besluit',
  },
  '1726182': {
    omschrijving: 'TONK Bevestigen weigering verlenging',
    labels: weigeringVerlengingLabels,
    documentTitle: 'Brief bevestiging weigering',
    product: 'TONK',
    productSpecific: 'uitkering',
    stepType: 'intrekken',
  },
  '17843': {
    omschrijving: 'Correctiemail Tonk',
    labels: correctieMailLabels,
    documentTitle: 'Mail verkeerde TONK-brief',
    product: 'TONK',
    productSpecific: 'uitkering',
    stepType: 'intrekken',
  },
};
