import { requestData } from '../../helpers';
import { getApiConfig } from '../../config';
import { GenericDocument } from '../../../universal/types/App.types';

/**
 * This is a blueprint of a service. Change `ServiceName and SERVICE_NAME` to your specific needs.
 */

// The items you get from the api source
export interface ServiceNameSource {
  title: string;
  documents: GenericDocument[];
}

// The root type of the api source
export type ServiceNameSourceData = ServiceNameSource[];

// The items you want to output in this api
export interface Service extends ServiceNameSource {}

// The root type of the items you want to output in this api
export type ServiceNameData = Service[];

// The function you can use to transform the api source data
export function transformServiceNameData(
  responseData: ServiceNameSourceData
): ServiceNameData {
  return responseData;
}

const SERVICE_NAME = 'STADSPAS'; // Change to your service name

export function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ServiceNameData>(
    getApiConfig(SERVICE_NAME, {
      transformResponse: transformServiceNameData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
