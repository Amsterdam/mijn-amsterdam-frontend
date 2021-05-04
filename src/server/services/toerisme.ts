import { requestData } from '../helpers';
import { getApiConfig } from '../config';
import { GenericDocument } from '../../universal/types/App.types';

export interface ServiceNameSource {
  title: string;
  documents: GenericDocument[];
}

// The root type of the api source
export type ServiceNameSourceData = ServiceNameSource[];

// The items you want to output in this api
export interface Service extends ServiceNameSource {}

// The root type of the items you want to output in this api
export type ToerismeData = Service[];

// The function you can use to transform the api source data
export function transformToerismeData(
  responseData: ServiceNameSourceData
): ToerismeData {
  return responseData;
}

export function fetchToerisme(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ToerismeData>(
    getApiConfig('TOERISME', {
      transformResponse: transformToerismeData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
