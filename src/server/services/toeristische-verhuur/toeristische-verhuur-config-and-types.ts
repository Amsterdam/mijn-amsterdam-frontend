import { BBVergunningFrontend } from './bed-and-breakfast/bed-and-breakfast-types';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-field-transformers';
import {
  DecosZaakTransformer,
  DecosZaakBase,
  WithLocation,
  WithDateRange,
} from '../decos/decos-types';
import { VergunningFrontend } from '../vergunningen/config-and-types';

export const caseTypeToeristischeVerhuur = {
  VakantieverhuurVergunningaanvraag: 'Vakantieverhuur vergunningsaanvraag',
} as const;

type CaseTypeToeristischeVerhuurKey = keyof typeof caseTypeToeristischeVerhuur;
export type GetCaseType<T extends CaseTypeToeristischeVerhuurKey> =
  (typeof caseTypeToeristischeVerhuur)[T];

export type DecosVakantieverhuurVergunningaanvraag = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
    title: 'Vergunning vakantieverhuur';
    decision: 'Verleend' | 'Ingetrokken';
  };

// LVV Registraties
export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieHouse {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  street: string | null;
}

export interface LVVRegistratieSource {
  rentalHouse: ToeristischeVerhuurRegistratieHouse;
  registrationNumber: string;
  agreementDate: string | null;
}

export interface LVVRegistratie {
  address: string;
  registrationNumber: string;
  agreementDate: string | null;
  agreementDateFormatted: string | null;
}

export interface LVVRegistratiesSourceData {
  content: LVVRegistratie[];
}

export type VakantieverhuurVergunningFrontend =
  VergunningFrontend<DecosVakantieverhuurVergunningaanvraag>;

export type ToeristischeVerhuurVergunning =
  | BBVergunningFrontend
  | VakantieverhuurVergunningFrontend;

export type ToeristischeVerhuur = {
  vakantieverhuurVergunningen: VakantieverhuurVergunningFrontend[];
  bbVergunningen: BBVergunningFrontend[];
  lvvRegistraties: LVVRegistratie[];
};

export const VakantieverhuurVergunningaanvraag: DecosZaakTransformer<DecosVakantieverhuurVergunningaanvraag> =
  {
    isActive: true,
    itemType: 'folders',
    caseType: caseTypeToeristischeVerhuur.VakantieverhuurVergunningaanvraag,
    title: 'Vergunning vakantieverhuur',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
      date6: dateStart,
      date7: dateEnd,
    },
    async afterTransform(vergunning) {
      /**
       * Vakantieverhuur vergunningen worden na betaling direct verleend en per mail toegekend zonder dat de juiste status in Decos wordt gezet.
       * Later, na controle, wordt mogelijk de vergunning weer ingetrokken.
       */
      vergunning.processed = true;
      vergunning.dateDecision = vergunning.dateDecision
        ? vergunning.dateDecision
        : vergunning.dateRequest;

      if (vergunning.decision?.toLowerCase().includes('ingetrokken')) {
        vergunning.decision = 'Ingetrokken';
      } else {
        vergunning.decision = 'Verleend';
      }

      return vergunning;
    },
  };

export const decosZaakTransformers = [VakantieverhuurVergunningaanvraag];
export const decosZaakTransformersByCaseType = {
  [VakantieverhuurVergunningaanvraag.caseType]:
    VakantieverhuurVergunningaanvraag,
};
