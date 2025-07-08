import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-field-transformers.ts';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  WithDateRange,
  WithLocation,
} from '../decos/decos-types.ts';
import { VergunningFrontend } from '../vergunningen/config-and-types.ts';

export const caseTypeHorecaVergunningen = {
  ExploitatieHorecabedrijf: 'Horeca vergunning exploitatie Horecabedrijf',
} as const;

type CaseTypeHorecaVergunningenKey = keyof typeof caseTypeHorecaVergunningen;
export type CaseTypeHorecaVergunningen =
  (typeof caseTypeHorecaVergunningen)[CaseTypeHorecaVergunningenKey];
export type GetCaseType<T extends CaseTypeHorecaVergunningenKey> =
  (typeof caseTypeHorecaVergunningen)[T];

export type DecosZaakExploitatieHorecabedrijf = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
  };

export type HorecaVergunningFrontend =
  VergunningFrontend<DecosZaakExploitatieHorecabedrijf>;

export const ExploitatieHorecabedrijf: DecosZaakTransformer<DecosZaakExploitatieHorecabedrijf> =
  {
    isActive: FeatureToggle.horecaActive,
    caseType: caseTypeHorecaVergunningen.ExploitatieHorecabedrijf,
    title: caseTypeHorecaVergunningen.ExploitatieHorecabedrijf,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        decosActionCode:
          'Horeca vergunning exploitatie Horecabedrijf - In behandeling nemen',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date7: dateEnd,
      date6: dateStart,
      text6: location,
    },
  };

export const decosZaakTransformers = [ExploitatieHorecabedrijf];
export const decosZaakTransformersByCaseType = {
  [ExploitatieHorecabedrijf.caseType]: ExploitatieHorecabedrijf,
};
