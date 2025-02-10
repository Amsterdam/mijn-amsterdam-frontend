import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  WithDateRange,
  WithLocation,
} from '../decos/config-and-types';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-field-transformers';
import { VergunningFrontend } from '../vergunningen/config-and-types';
import { caseNotificationLabelsExpirables } from '../vergunningen/vergunningen-notification-labels';

export type DecosZaakExploitatieHorecabedrijf = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
    dateStartPermit: string | null;
    numberOfPermits: string | null;
  };

export type HorecaVergunningFrontend =
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
