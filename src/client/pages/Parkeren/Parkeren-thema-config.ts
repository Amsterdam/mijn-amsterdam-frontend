import {
  DecosCaseType,
  CaseTypeV2,
} from '../../../universal/types/decos-zaken';

export const PARKEER_CASE_TYPES: Set<DecosCaseType> = new Set([
  CaseTypeV2.GPK,
  CaseTypeV2.GPP,
  CaseTypeV2.BZP,
  CaseTypeV2.BZB,
  CaseTypeV2.EigenParkeerplaats,
  CaseTypeV2.EigenParkeerplaatsOpheffen,
  CaseTypeV2.TouringcarDagontheffing,
  CaseTypeV2.TouringcarJaarontheffing,
]);
