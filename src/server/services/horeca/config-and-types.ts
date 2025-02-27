import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
  WithDateRange,
  WithLocation,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-types';
import { VergunningFrontend } from '../vergunningen/config-and-types';
import { caseNotificationLabelsExpirables } from '../vergunningen/vergunningen-notification-labels';

export type DecosZaakExploitatieHorecabedrijf = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
    dateStartPermit: string | null;
    numberOfPermits: string | null;
  };

export type HorecaVergunning =
  VergunningFrontend<DecosZaakExploitatieHorecabedrijf>;

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
