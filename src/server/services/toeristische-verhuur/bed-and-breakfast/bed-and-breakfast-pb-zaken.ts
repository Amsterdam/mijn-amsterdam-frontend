import {
  BedAndBreakfastType,
  caseTypeBedAndBreakfast,
  documentNamenMA_PB,
} from './bed-and-breakfast-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers';
import { hasCaseTypeInFMT_CAPTION } from '../../powerbrowser/powerbrowser-helpers';
import {
  PowerBrowserZaakTransformer,
  type PBZaakResultaat,
} from '../../powerbrowser/powerbrowser-types';

function isVerleend(resultaat: PBZaakResultaat) {
  if (!resultaat) {
    return false;
  }
  return [
    'verleend met overgangsrecht',
    'verleend zonder overgangsrecht',
    'verleend',
    'van rechtswege verleend',
    'gedeeltelijk verleend',
  ].includes(resultaat?.toLowerCase() ?? '');
}

export const BedAndBreakfastZaakTransformer: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        caseTypeBedAndBreakfast.BedAndBreakfast
      ),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformDoclinks: documentNamenMA_PB,
    isVerleend,
    filterValidDocumentPredicate: (_) => true,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfastZaakTransformer];
