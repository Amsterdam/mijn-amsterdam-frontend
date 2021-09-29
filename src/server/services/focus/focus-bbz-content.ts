import {
  defaultDateTimeFormat,
  defaultDateFormat,
} from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusDocument } from './focus-combined';
import { productName } from './focus-tozo-content';
import { FocusStepContent, FocusBbzLabelSet } from './focus-types';

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
        Het kan zijn dat er meer informatie en tijd nodig is om uw aanvraag te behandelen. Bekijk de aanvraag voor meer details
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
          U hebt recht op ${productName(document)}. ${
      document.productTitle === 'IOAZ'
        ? 'Kijk voor de voorwaarden in de brief.'
        : 'Bekijk de brief voor meer details.'
    }
        </p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const voorschotLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${document.productTitle}: Wij hebben een voorschot betaald`,
    description: (document) =>
      `Wij hebben een voorschot naar uw rekening overgemaakt`,
  },
  status: stepLabels.voorschot,
  description: (document) =>
    `<p>
          Wij hebben een voorschot naar uw rekening overgemaakt. Kijk voor de voorwaarden in de brief.
        </p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const afwijzenLabels: FocusStepContent = {
  notification: {
    title: (document) => `${document.productTitle}: Uw aanvraag is afgewezen`,
    description: (document) =>
      `U hebt geen recht op ${productName(
        document,
        false
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
    `<p>U hebt uw Bbz aanvraag ingetrokken. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
};

const meerTijdLabels: FocusStepContent = {
  notification: {
    title: (document) => `${document.productTitle}: Meer tijd nodig`,
    description: (document) =>
      `Wij hebben meer tijd nodig om uw aanvraag te behandelen.`,
  },
  status: stepLabels.tijdNodig,
  description: (document) =>
    `<p>Wij hebben meer tijd nodig om uw aanvraag te behandelen. Bekijk de brief voor meer details.</p>`,
};

const akteLabels: FocusStepContent = {
  notification: {
    title: (document) =>
      `${document.productTitle}: Onderteken de akte voor bedrijfskapitaal`,
    description: (document) =>
      `Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend. Bekijk de brief voor meer details.`,
  },
  status: stepLabels.akte,
  description: (document) =>
    `<p>Wij kunnen de lening voor bedrijfskapitaal uitbetalen als u de akte voor bedrijfskapitaal hebt ondertekend. Bekijk de brief voor meer details.</p><p><a rel="external noopener noreferrer" href="https://www.amsterdam.nl/werk-inkomen/pak-je-kans/">Meer regelingen van de gemeente Amsterdam</a></p>`,
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

export const bbzDocumentLabelSet: Record<
  FocusDocument['documentCodeId'],
  FocusBbzLabelSet
> = {
  '844': {
    omschrijving: 'Bbz aanvraag',
    labels: aanvraagLabels,
    documentTitle: 'Aanvraag Bbz',
    product: 'Bbz',
    stepType: 'aanvraag',
    productSpecific: 'aanvraag',
  },
  '6195': {
    omschrijving: 'Transitie Bbz Toekennen batch',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Bbz',
    stepType: 'besluit',
    productSpecific: 'uitkering',
    decision: 'toekenning',
  },
  '5843': {
    omschrijving: 'Bbz toekenning bedrijfskapitaal',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'Bbz',
    stepType: 'besluit',
    productSpecific: 'lening',
    decision: 'toekenning',
  },
  '5855': {
    omschrijving: 'Bbz verlenging beslistermijn met 13 weken',
    labels: meerTijdLabels,
    documentTitle: 'Brief verzoek om meer informatie',
    product: 'Bbz',
    stepType: 'hersteltermijn',
    productSpecific: 'uitkering',
  },
  '6351': {
    omschrijving: 'Transitie Bbz Hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief verzoek om meer informatie',
    product: 'Bbz',
    stepType: 'hersteltermijn',
    productSpecific: 'uitkering',
  },
  '6368': {
    omschrijving: 'Brief aanvraag adviesrapport',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief aanvraag adviesrapport',
    product: 'Bbz',
    stepType: 'brief',
    productSpecific: 'uitkering',
  },
  '6350': {
    omschrijving: 'Transitie Bbz Intrekken',
    labels: intrekkenLabels,
    documentTitle: 'Brief intrekken Bbz aanvraag',
    product: 'Bbz',
    stepType: 'besluit',
    productSpecific: 'uitkering',
    decision: 'intrekking',
  },
  '6353': {
    omschrijving: 'Transitie Bbz buiten behandeling stellen',
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'Bbz',
    productSpecific: 'uitkering',
    stepType: 'besluit',
    decision: 'buitenbehandeling',
  },
  '5884': {
    omschrijving: 'Bbz akte bedrijfskapitaal',
    labels: akteLabels,
    documentTitle: 'Brief akte bedrijfskapitaal',
    product: 'Bbz',
    productSpecific: 'uitkering',
    stepType: 'brief',
  },
  '6196': {
    omschrijving: 'Transitie Bbz voorschot toekennen batch',
    labels: voorschotLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Bbz',
    productSpecific: 'uitkering',
    stepType: 'voorschot',
    decision: 'toekenning',
  },
  '6197': {
    omschrijving: 'Transitie Bbz voorschot toekennen handmatig',
    labels: voorschotLabels,
    documentTitle: 'Brief betaling voorschot',
    product: 'Bbz',
    productSpecific: 'voorschot',
    stepType: 'voorschot',
    decision: 'toekenning',
  },
  '6198': {
    omschrijving: 'Transitie Bbz Afwijzen',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Bbz',
    stepType: 'besluit',
    decision: 'afwijzing',
  },
  '6194': {
    omschrijving: 'Transitie Bbz Toekennen handmatig',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Bbz',
    stepType: 'besluit',
    decision: 'afwijzing',
  },
  '6301': {
    omschrijving: 'Ioaz Toekenning voorlopige uitkering',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'IOAZ',
    productSpecific: 'uitkering',
    stepType: 'besluit',
    decision: 'toekenning',
  },
  '6322': {
    omschrijving: 'Ioaz Aanvraag hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief verzoek meer informatie',
    product: 'IOAZ',
    productSpecific: 'aanvraag',
    stepType: 'hersteltermijn',
  },
  '6332': {
    omschrijving: 'Ioaz aanvraag buiten behandeling stellen',
    labels: buitenBehandelingLabels,
    documentTitle: 'Besluit buiten behandeling',
    product: 'IOAZ',
    stepType: 'besluit',
    decision: 'buitenbehandeling',
  },
  '36301': {
    omschrijving: 'Ioaz Toekenning voorlopige uitkering',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'IOAZ',
    stepType: 'besluit',
    decision: 'toekenning',
  },
  '36302': {
    omschrijving: 'Ioaz Toekenning definitieve uitkering',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekenning uitkering',
    product: 'IOAZ',
    stepType: 'besluit',
    productSpecific: 'uitkering',
    decision: 'toekenning',
  },
  '36303': {
    omschrijving: 'Ioaz afwijzing uitkering',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'IOAZ',
    stepType: 'besluit',
    decision: 'afwijzing',
  },
};
