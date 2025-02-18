import type {
  CaseTypeVaren,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  VarenVergunningLigplaatsType,
} from './config-and-types';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-types';

export const VarenRegistratieReder: DecosZaakTransformer<VarenRegistratieRederType> =
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

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Varen exploitatie vergunning - Afhandelen',
      },
      {
        status: 'In behandeling',
        stepTitle: 'Varen exploitatie vergunning - ??Meer info??',
      },
      {
        status: 'In behandeling',
        stepTitle: 'Varen exploitatie vergunning - Afgehandeld',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'vesselName',
      text21: 'vesselLength',
      text22: 'vesselWidth',
      text23: 'vesselHeight',
      text24: 'vesselDepth',
      num8: 'numberOfSeats',
      num10: {
        name: 'isCvoIssued',
        transform: (v) => !!v,
      },
      text10: 'segment',
      text15: 'formAppearance',
    },
    notificationLabels: {},
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
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
