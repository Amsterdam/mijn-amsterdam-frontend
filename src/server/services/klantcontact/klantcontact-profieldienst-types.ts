export type ContactgegevenType =
  | 'Email'
  | 'Telefoonnummer'
  | 'ApplicatieId'
  // MA specifieke types, worden niet ondersteund in de profieldienst maar zijn wel onderdeel van de FE logica
  | 'Berichtenbox'
  | 'Postadres';

export type IdentificatieType = 'BSN' | 'KVK' | 'RSIN';

export type PartijIdentificatieSource = {
  identificatieType: string;
  identificatieNummer: string;
};

export type IdentificatieSource = PartijIdentificatieSource;

export type DienstSource = {
  id: string;
  beschrijving: string;
};

export type DienstverlenerSource = {
  naam: string;
  oin?: string;
  diensten?: DienstSource[];
};

export type ScopeSource = {
  partij: PartijIdentificatieSource;
  dienst: DienstSource;
};

export type VoorkeurSource = {
  id: string;
  voorkeurType: string;
  waarde: string;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: ScopeSource[];
};

export type ContactgegevenSource = {
  id: string;
  type: ContactgegevenType;
  waarde: string;
  isGeverifieerd: boolean;
  isDefault: boolean;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: ScopeSource[];
};

export type ContactProfieldienstResponseSource = {
  partijId: string;
  identificaties: IdentificatieSource[];
  voorkeuren: VoorkeurSource[];
  contactgegevens: ContactgegevenSource[];
};

export type ContactgegevenFrontend = {
  id: ContactgegevenSource['id'] | null;
  type: ContactgegevenType;
  value: string | null;
  dateModified: string | null; // ISO date string
  dateModifiedFormatted: string | null;
  isVerified?: boolean;
  disabled?: boolean;
};

type ContactGegegevenScopeSource = {
  dienstverlenerNaam: string;
  dienstNaam: string;
};

export type ContactgegevenPayloadSource = {
  identificatieType: IdentificatieType;
  identificatieNummer: string; // BSN of KVK nummer
  type: ContactgegevenSource['type'];
  waarde: string;
  scope?: ContactGegegevenScopeSource;
  isDefault: boolean;
};

export type ContactgegevenPerTypeFrontend = Record<
  ContactgegevenType,
  ContactgegevenFrontend
>;

export type CommunicatievoorkeurenResponseFrontend = {
  standaardContactgegevens: ContactgegevenPerTypeFrontend | null;
  aangeslotenDiensten?: DienstSource[];
};

export type CommunicatievoorkeurPayloadFrontend = {
  type: ContactgegevenType;
  value: ContactgegevenFrontend['value'];
  dienstId?: DienstSource['id'];
  voorkeurId?: VoorkeurSource['id'];
};

export type DeleteContactgegevenResponseFrontend = {
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
