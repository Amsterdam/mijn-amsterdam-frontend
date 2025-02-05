import { parseISO } from 'date-fns';

import { BBVergunning } from './toeristische-verhuur-powerbrowser-bb-vergunning-types';
import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  DecosZaakTransformer,
  DecosZaakWithDateRange,
  DecosZaakWithLocation,
  SELECT_FIELDS_TRANSFORM_BASE,
  location,
} from '../decos/decos-types';
import { VergunningFrontendV2 } from '../vergunningen-v2/config-and-types';
import { caseNotificationLabelsExpirables } from '../vergunningen-v2/vergunningen-notification-labels';

export interface VakantieverhuurVergunningaanvraag
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
  title: 'Vergunning vakantieverhuur';
  decision: 'Verleend' | 'Ingetrokken';
}

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

export type VakantieverhuurVergunning =
  VergunningFrontendV2<VakantieverhuurVergunningaanvraag>;

export type ToeristischeVerhuurVergunning =
  | BBVergunning
  | VakantieverhuurVergunning;

export type ToeristischeVerhuur = {
  vakantieverhuurVergunningen: VakantieverhuurVergunning[];
  bbVergunningen: BBVergunning[];
  lvvRegistraties: LVVRegistratie[];
};

export const VakantieverhuurVergunningaanvraag: DecosZaakTransformer<VakantieverhuurVergunningaanvraag> =
  {
    isActive: true,
    caseType: CaseTypeV2.VakantieverhuurVergunningaanvraag,
    title: 'Vergunning vakantieverhuur',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
    },
    async afterTransform(vergunning) {
      /**
       * Vakantieverhuur vergunningen worden na betaling direct verleend en per mail toegekend zonder dat de juiste status in Decos wordt gezet.
       * Later, na controle, wordt mogelijk de vergunning weer ingetrokken.
       */
      if (vergunning.decision) {
        vergunning.decision = vergunning.decision
          .toLowerCase()
          .includes('ingetrokken')
          ? 'Ingetrokken'
          : 'Verleend';
      }

      // Vakantieverhuur vergunningen worden direct verleend (en dus voor Mijn Amsterdam afgehandeld)
      vergunning.status = 'Afgehandeld';

      const monthIndex = 4;
      // The validity of this case runs from april 1st until the next. set the end date to the next april the 1st
      if ('dateEnd' in vergunning && vergunning.dateRequest) {
        vergunning.dateEnd = new Date(
          parseISO(vergunning.dateRequest).getFullYear() + 1,
          monthIndex,
          1
        ).toISOString();
      }

      return vergunning;
    },
    notificationLabels: caseNotificationLabelsExpirables,
  };
