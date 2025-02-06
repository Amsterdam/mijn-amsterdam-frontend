import type {
  CaseTypeVaren,
  DecosVarenRegistratieReder,
  DecosVarenVergunningExploitatie,
  DecosVarenVergunningLigplaats,
} from './config-and-types';
import { DecosZaakTransformer, DecosZaakBase } from '../decos/config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../decos/decos-field-transformers';

export const VarenRegistratieReder: DecosZaakTransformer<DecosVarenRegistratieReder> =
  {
    isActive: true,
    caseType: 'Varen registratie reder',
    title: 'Varen registratie reder',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      company: 'company',
      num2: 'bsnkvk',
      mailaddress: 'address',
      zipcode: 'postalCode',
      city: 'city',
      phone1: 'phone',
      email1: 'email',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatie: DecosZaakTransformer<DecosVarenVergunningExploitatie> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'vesselName',
      num3: 'vesselLength',
      num4: 'vesselWidth',
      num5: 'vesselHeight',
      num7: 'vesselDepth',
      num8: 'numberOfSeats',
      num10: 'isCvoIssued',
      text10: 'segment',
      text15: 'formAppearance',
    },
    notificationLabels: {},
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<DecosVarenVergunningLigplaats> =
  {
    isActive: true,
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'vesselName',
      text6: 'location',
      date7: 'dateEnd',
    },
    notificationLabels: {},
  };

export const decosZaakTransformers = [
  VarenRegistratieReder,
  VarenVergunningExploitatie,
  VarenVergunningLigplaats,
];
export const decosCaseToZaakTransformers = decosZaakTransformers.reduce(
  (acc, zaakTransformer) => ({
    ...acc,
    [zaakTransformer.caseType]: zaakTransformer,
  }),
  {} as Record<CaseTypeVaren, DecosZaakTransformer<DecosZaakBase>>
);
