export type CreateVerificationRequestPayload = {
  email: string;
  reference: string;
  templateId: string;
  apiKey: string;
};

export type CreateVerificationRequestResponse = {
  requestId: string;
};

export type VerifyVerificationRequestPayload = {
  email: string;
  reference: string;
  code: string;
};

export type VerifyVerificationRequestResponse = {
  verified: boolean;
};
