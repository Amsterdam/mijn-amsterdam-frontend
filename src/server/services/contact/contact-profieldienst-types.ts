export type PartijIdentificatieSource = {
  identificatieType: string;
  identificatieNummer: string;
};

export type IdentificatieSource = PartijIdentificatieSource;

export type DienstSource = {
  id: number;
  beschrijving: string;
};

export type ScopeSource = {
  partij: PartijIdentificatieSource;
  dienst: DienstSource;
};

export type VoorkeurSource = {
  id: number;
  voorkeurType: string;
  waarde: string;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: ScopeSource[];
};

export type ContactgegevenSource = {
  id: number;
  type: 'Email' | 'Telefoon' | string; // TODO: see list in source?
  waarde: string;
  isGeverifieerd: boolean;
  isValid: boolean;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  scopes: ScopeSource[];
};

export type ContactProfieldienstResponseSource = {
  partijId: number;
  identificaties: IdentificatieSource[];
  voorkeuren: VoorkeurSource[];
  contactgegevens: ContactgegevenSource[];
};

// TODO: Gelijktrekken met types uit API, dan is er geen transformatie nodig.
export type ContactgegevenTypeFrontend =
  | 'email'
  | 'phone'
  | 'app'
  | 'berichtenbox'
  | 'postadres'; // MA only.

export type ContactgegevenFrontend = {
  type: ContactgegevenTypeFrontend;
  value: string | null;
  dateModified: string | null; // ISO date string
  dateModifiedFormatted?: string | null; // TODO: make non optional
  isValidated?: boolean;
  disabled?: boolean;
};

export type CommunicatievoorkeurFrontend = {
  id: CommunicatievoorkeurPayloadSource['id'];
  // Hebben we wel een naam + beschrijving nodig van de dienst?
  dienstNaam: string;
  dienstBeschrijving: string;
  settings: ContactgegevenFrontend[];
};

// Van BFF naar Profieldienst API
export type CommunicatievoorkeurPayloadSource = {
  id?: VoorkeurSource['id'];
  voorkeurType: ContactgegevenSource['type'];
  waarde: string;
  scope: {
    scopeIdentificatieType: 'BSN' | 'KVK';
    scopeIdentificatieNummer: string;
    dienstId?: DienstSource['id'];
  };
};

export type CommunicatievoorkeurenResponseFrontend = {
  voorkeuren: CommunicatievoorkeurFrontend[];
  standaardContactvoorkeurPerType: Record<
    ContactgegevenTypeFrontend,
    ContactgegevenFrontend
  >;
};

// Van FE naar BFF
export type CommunicatievoorkeurPayloadFrontend = {
  type: ContactgegevenTypeFrontend;
  value: ContactgegevenFrontend['value'];
  dienstId?: DienstSource['id'];
  voorkeurId?: VoorkeurSource['id'];
};

export type SetCommunicatievoorkeurResponseFrontend = {
  success: boolean;
};
