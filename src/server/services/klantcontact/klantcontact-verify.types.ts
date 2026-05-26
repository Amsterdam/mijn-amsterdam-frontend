import type { IdentificatieType } from './klantcontact-profieldienst-types.ts';

export type CreateVerificationRequestPayload = {
  type: 'Email' | 'Telefoonnummer' | 'Adres' | 'AppId';
  waarde: string;
  scope: {
    scopeIdentificatieType: string;
    scopeIdentificatieNummer: string;
    dienstId: number;
  };
};

export type CreateVerificationRequestResponse = {
  success: boolean;
};

export type VerifyVerificationRequestPayload = {
  email: string;
  identificatieNummer: string;
  identificatieType: IdentificatieType;
  verificatieCode: string;
};

export type VerifyVerificationRequestResponse = {
  verified: boolean;
};
