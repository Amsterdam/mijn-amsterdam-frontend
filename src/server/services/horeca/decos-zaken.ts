import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  dateEnd,
  dateStart,
  location,
} from '../decos/decos-field-transformers.ts';
import type {
  DecosZaakBase,
  DecosZaakTransformer,
} from '../decos/decos-types.ts';
import { type DecosZaakFrontend } from '../decos/decos-types.ts';
import type {
  WithDateRange,
  WithLocation,
} from '../vergunningen/config-and-types.ts';

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
  DecosZaakFrontend<DecosZaakExploitatieHorecabedrijf>;

export const ExploitatieHorecabedrijf: DecosZaakTransformer<DecosZaakExploitatieHorecabedrijf> =
  {
    isActive: FeatureToggle.horecaActive,
    itemType: 'folders',
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
