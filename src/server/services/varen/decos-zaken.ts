import {
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-types';
import type {
  CaseTypeVaren,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  VarenVergunningLigplaatsType,
} from './config-and-types';

export const VarenRegistratieReder: DecosZaakTransformer<VarenRegistratieRederType> =
  {
    isActive: true,
    caseType: 'Varen registratie reder',
    title: 'Varen registratie reder',
    fetchWorkflowStatusDatesFor: [
      // TODO: Stapnaam komt nog door vanuit bronsysteem
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      company: 'company',
      num2: 'bsnkvk',
      mailaddress: 'adres',
      zipcode: 'postal',
      city: 'city',
      phone1: 'phone',
      email1: 'email',
    },
    notificationLabels: {}, // TODO
  };

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    fetchWorkflowStatusDatesFor: [
      // TODO
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'boatName',
      num3: 'boatLength',
      num4: 'boatWidth',
      num5: 'boatHeight',
      num7: 'boatDepth',
      num8: 'numberOfSeats',
      num10: 'isCvoIssued',
      text10: 'segment',
      text15: 'formAppearance',
    },
    notificationLabels: {}, // TODO
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
  {
    isActive: true,
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    fetchWorkflowStatusDatesFor: [
      // TODO
      {
        status: 'In behandeling',
        stepTitle: 'Varen - Behandelen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'boatName',
      text6: 'location',
      date7: 'dateEnd',
    },
    notificationLabels: {}, // TODO
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
  {} as Record<CaseTypeVaren, DecosZaakTransformer<any>> // TODO: type key as varen casetype
);
