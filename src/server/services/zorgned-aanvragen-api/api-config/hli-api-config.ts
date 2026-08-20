import type { AanvragenApiConfig } from '../zorgned-aanvragen-api-types.ts';

// Sample configuration for HLI ZorgNed aanvragen API.
const STADSPAS_REGELING: AanvragenApiConfig = {
  include: {
    productIdentificatie: 'AV-SPM',
    isActueel: true,
  },
  assign: {
    maActies: ['verlengen-stadspas'],
    maProductgroep: 'stadspas',
  },
};

export const hliAanvragenApiConfig: AanvragenApiConfig[] = [STADSPAS_REGELING];
