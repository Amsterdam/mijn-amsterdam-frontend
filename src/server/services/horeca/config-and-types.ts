import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  DecosZaakTransformer,
  DecosZaakWithDateRange,
  DecosZaakWithLocation,
  SELECT_FIELDS_TRANSFORM_BASE,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-types';
import { VergunningFrontendV2 } from '../vergunningen/config-and-types';
import { caseNotificationLabelsExpirables } from '../vergunningen/vergunningen-notification-labels';

interface DecosZaakExploitatieHorecabedrijf
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
  dateStartPermit: string | null;
  numberOfPermits: string | null;
}

export type HorecaVergunning =
  VergunningFrontendV2<DecosZaakExploitatieHorecabedrijf>;

export const ExploitatieHorecabedrijf: DecosZaakTransformer<DecosZaakExploitatieHorecabedrijf> =
  {
    isActive: FeatureToggle.horecaActive,
    caseType: CaseTypeV2.ExploitatieHorecabedrijf,
    title: CaseTypeV2.ExploitatieHorecabedrijf,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle:
          'Horeca vergunning exploitatie Horecabedrijf - In behandeling nemen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date2: dateEnd,
      date6: dateStart,
      text6: location,
    },
    notificationLabels: caseNotificationLabelsExpirables,
  };

export const horecaVergunningTypes: HorecaVergunning['caseType'][] = [
  CaseTypeV2.ExploitatieHorecabedrijf,
];
