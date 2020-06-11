import {
  fetchWMO,
  fetchBRP,
  fetchTIPS,
  fetchBELASTING,
  fetchERFPACHT,
  fetchBAG,
  fetchAFVAL,
  fetchMILIEUZONE,
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchFOCUSTozo,
} from './index';

export type ApiResult<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export interface BFFApiData {
  BELASTINGEN: ApiResult<typeof fetchBELASTING>;
  TIPS: ApiResult<typeof fetchTIPS>;
  BRP: ApiResult<typeof fetchBRP>;
  WMO: ApiResult<typeof fetchWMO>;
  FOCUS_AANVRAGEN: ApiResult<typeof fetchFOCUSAanvragen>;
  FOCUS_SPECIFICATIES: ApiResult<typeof fetchFOCUSSpecificaties>;
  FOCUS_TOZO: ApiResult<typeof fetchFOCUSTozo>;
  ERFPACHT: ApiResult<typeof fetchERFPACHT>;
  BAG: ApiResult<typeof fetchBAG>;
  AFVAL: ApiResult<typeof fetchAFVAL>;
  MILIEUZONE: ApiResult<typeof fetchMILIEUZONE>;
  [key: string]: any;
}

export type ApiStateKey = keyof BFFApiData | string;
