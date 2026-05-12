// Generated TypeScript types for the contact profieldienst response

export type PartijIdentificatie = {
  identificatieType: string;
  identificatieNummer: string;
};

export type Identificatie = PartijIdentificatie;

export type Dienst = {
  id: number;
  beschrijving: string;
};

export type Scope = {
  partij: PartijIdentificatie;
  dienst: Dienst;
};

export type Voorkeur = {
  id: number;
  voorkeurType: string;
  waarde: string;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: Scope[];
};

export type Contactgegeven = {
  id: number;
  type: 'Email' | 'Telefoon' | string; // TODO: see list
  waarde: string;
  isGeverifieerd: boolean;
  isValid: boolean;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: Scope[];
};

export type ContactProfieldienstResponseSource = {
  partijId: number;
  identificaties: Identificatie[];
  voorkeuren: Voorkeur[];
  contactgegevens: Contactgegeven[];
};

export type CommunicatievoorkeurPayloadFrontend = {
  type: MediumType;
  value: CommunicatieMediumSetting['value'];
  dienstId?: number;
  voorkeurId?: number;
};

export type SetCommunicatievoorkeurResponseFrontend = {
  success: boolean;
};

export type CommunicatievoorkeurPayload = {
  id?: number;
  voorkeurType: Contactgegeven['type'];
  waarde: string;
  scope: {
    scopeIdentificatieType: 'BSN' | 'KVK';
    scopeIdentificatieNummer: string;
    dienstId?: number;
  };
};

export type MediumType =
  | 'email'
  | 'phone'
  | 'app'
  | 'berichtenbox'
  | 'postadres';

export type CommunicatieMedium = {
  type: MediumType;
  value: string | null;
};

export type CommunicatieMediumSetting = {
  type: MediumType;
  value: string | null;
};

export type Communicatievoorkeur = {
  id: CommunicatievoorkeurPayload['id'];
  stakeholder: string;
  description: string;
  settings: CommunicatieMediumSetting[];
};

export type CommunicatievoorkeurenResponseFrontend = {
  voorkeuren: Communicatievoorkeur[];
  defaultMediumsByType: Record<MediumType, CommunicatieMedium>;
};
