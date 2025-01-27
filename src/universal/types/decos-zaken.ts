export const CaseTypeV2 = {
  TVMRVVObject: 'TVM - RVV - Object',
  GPK: 'GPK',
  GPP: 'GPP',
  EvenementMelding: 'Evenement melding',
  EvenementVergunning: 'Evenement vergunning',
  Omzettingsvergunning: 'Omzettingsvergunning',
  ERVV: 'E-RVV - TVM',
  VakantieverhuurVergunningaanvraag: 'Vakantieverhuur vergunningsaanvraag',
  BZP: 'Parkeerontheffingen Blauwe zone particulieren',
  BZB: 'Parkeerontheffingen Blauwe zone bedrijven',
  Flyeren: 'Flyeren-Sampling',
  AanbiedenDiensten: 'Aanbieden van diensten',
  NachtwerkOntheffing: 'Nachtwerkontheffing',
  ZwaarVerkeer: 'Zwaar verkeer',
  Samenvoegingsvergunning: 'Samenvoegingsvergunning',
  Onttrekkingsvergunning: 'Onttrekkingsvergunning voor ander gebruik',
  OnttrekkingsvergunningSloop: 'Onttrekkingsvergunning voor sloop',
  VormenVanWoonruimte: 'Woningvormingsvergunning',
  Splitsingsvergunning: 'Splitsingsvergunning',
  VOB: 'VOB',
  ExploitatieHorecabedrijf: 'Horeca vergunning exploitatie Horecabedrijf',
  RVVHeleStad: 'RVV - Hele stad',
  RVVSloterweg: 'RVV Sloterweg',
  EigenParkeerplaats: 'Eigen parkeerplaats',
  EigenParkeerplaatsOpheffen: 'Eigen parkeerplaats opheffen',
  TouringcarDagontheffing: 'Touringcar Dagontheffing',
  TouringcarJaarontheffing: 'Touringcar Jaarontheffing',
  WVOS: 'Werk en vervoer op straat',
} as const;

export type DecosCaseTypeKey = keyof typeof CaseTypeV2;
export type DecosCaseType = (typeof CaseTypeV2)[DecosCaseTypeKey];
export type GetCaseType<T extends DecosCaseTypeKey> = (typeof CaseTypeV2)[T];
