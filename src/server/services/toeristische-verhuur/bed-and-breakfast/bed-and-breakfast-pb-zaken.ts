import {
  BedAndBreakfastType,
  caseTypeBedAndBreakfast,
} from './bed-and-breakfast-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers';
import { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types';

export const BedAndBreakfast: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakIdFilter: (pbRecordField) =>
      pbRecordField.fieldName === 'FMT_CAPTION' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(caseTypeBedAndBreakfast.BedAndBreakfast),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfast];
