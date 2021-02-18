import { dateFormat, defaultDateFormat } from '../../../universal/helpers';
import { stepLabels } from './focus-aanvragen-content';
import { FocusDocument } from './focus-combined';
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
    title: (document) => `Tonk: Uw aanvraag is toegekend`,
    description: (document) =>
      `U hebt recht op Tonk (besluit: ${defaultDateFormat(
        document.datePublished
      )}).`,
  },
  status: stepLabels.beslissing,
  description: (document) =>
    `<p>
          U hebt recht op Tonk. Bekijk de brief
          voor meer details.
        </p>`,
};

const afwijzenLabels: FocusStepContent = {
  notification: {
    title: (document) => `Tonk: Uw aanvraag is afgewezen`,
    description: (document) =>
      `U hebt geen recht op Tonk (besluit: ${defaultDateFormat(
        document.datePublished
      )}).`,
  },
  status: stepLabels.beslissing,
  description: (document) =>
    `<p>
        U hebt geen recht op Tonk. Bekijk de brief voor meer details.
      </p>`,
};

export const tonkDocumentLabelSet: Record<
  FocusDocument['documentCodeId'],
  FocusTonkLabelSet
> = {
  'TONK-111': {
    omschrijving: 'Tonk regeling aanvraag',
    labels: aanvraagLabels,
    documentTitle: 'Aanvraag Tonk regeling',
    product: 'Tonk 1',
    stepType: 'aanvraag',
  },
  'TONK-222': {
    omschrijving: 'Tonk regeling hersteltermijn',
    labels: herstelTermijnLabels,
    documentTitle: 'Brief meer informatie',
    product: 'Tonk 1',
    stepType: 'herstelTermijn',
  },
  'TONK-333': {
    omschrijving: 'Tonk regeling besluit toekennen',
    labels: toekennenLabels,
    documentTitle: 'Besluit toekennimg',
    product: 'Tonk 1',
    stepType: 'besluit',
  },
  'TONK-444': {
    omschrijving: 'Tonk regeling besluit afwijzen',
    labels: afwijzenLabels,
    documentTitle: 'Besluit afwijzing',
    product: 'Tonk 1',
    stepType: 'besluit',
  },
};
