export type ServicesMapData = Nullable<{
  embedUrl: string;
}>;

// const API_ID = 'SERVICES_MAP';

export function useServicesMap(): ServicesMapData {
  return {
    embedUrl: 'string',
  };
}
