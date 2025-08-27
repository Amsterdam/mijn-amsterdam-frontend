import {
  caseTypeBedAndBreakfast,
  GetCaseType,
} from './bed-and-breakfast-types';
import {
  PowerBrowserZaakBase,
  PowerBrowserZaakTransformer,
} from '../../powerbrowser/powerbrowser-types';

type BedAndBreakfastType = PowerBrowserZaakBase & {
  caseType: GetCaseType<'BedAndBreakfast'>;
};

export const BedAndBreakfast: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: caseTypeBedAndBreakfast.BedAndBreakfast,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfast];
