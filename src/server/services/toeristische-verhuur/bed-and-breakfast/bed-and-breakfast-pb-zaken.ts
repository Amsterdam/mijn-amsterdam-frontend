import type { BedAndBreakfastType } from './bed-and-breakfast-types.ts';
import {
  caseTypeBedAndBreakfast,
  documentNamenMA_PB,
} from './bed-and-breakfast-types.ts';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers.ts';
import { hasCaseTypeInFMT_CAPTION } from '../../powerbrowser/powerbrowser-helpers.ts';
import type { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types.ts';

export const RESULTATEN_VERLEEND = [
  'Verleend met overgangsrecht',
  'Verleend zonder overgangsrecht',
  'Verleend',
  'Van rechtswege verleend',
  'Gedeeltelijk verleend',
];

export const RESULTATEN_NIET_VERLEEND = [
  'Geweigerd op basis van Quotum',
  'Geweigerd',
  'Geweigerd met overgangsrecht',
  'Buiten behandeling',
];

export const RESULTATEN_INGETROKKEN = ['Ingetrokken', 'Vergunning ingetrokken'];

function transformZaakResultaat(resultaat: string | null) {
  if (resultaat === null) {
    return null;
  }

  switch (true) {
    case RESULTATEN_VERLEEND.includes(resultaat):
      return 'Verleend';
    case RESULTATEN_NIET_VERLEEND.includes(resultaat):
      return 'Niet verleend';
    case RESULTATEN_INGETROKKEN.includes(resultaat):
      return 'Ingetrokken';
  }

  return resultaat;
}

export const BedAndBreakfastZaakTransformer: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakFilter: (pbRecordFields) =>
      hasCaseTypeInFMT_CAPTION(
        caseTypeBedAndBreakfast.BedAndBreakfast,
        pbRecordFields
      ),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformFieldValues: {
      result: transformZaakResultaat,
    },
    transformDoclinks: documentNamenMA_PB,
    filterValidDocumentPredicate: (_) => true,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfastZaakTransformer];
