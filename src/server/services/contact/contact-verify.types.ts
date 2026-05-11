export type CreateVerificationRequestPayload<T extends 'email' | 'phone'> = {
  reference: string;
  templateId: string;
  apiKey: string;
} & (T extends 'email' ? { email: string } : { phoneNumber: string });

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
