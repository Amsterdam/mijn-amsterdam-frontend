import type { CamelCasedPropertiesDeep } from 'type-fest';

export type ZwedVvEResponseType = {
  '@onformdata.context': string;
};

export type ZwdActivationTeam = {
  type: string;
  subject: string;
  meeting_date: string; // ISO date (YYYY-MM-DD)
};

export type ZwdHomeownerAssociation = {
  id: number;
  name: string;
  district: string;
  neighborhood: string;
  number_of_apartments: number;
};

export type ZwdCase = {
  activation_team: ZwdActivationTeam;
  advice_type: string;
  application_type: string;
  created: string; // ISO datetime
  end_date: string; // ISO date
  homeowner_association: ZwdHomeownerAssociation;
  id: number;
  legacy_id: string;
  prefixed_dossier_id: string;
  request_date: string; // ISO date
  status: string;
  updated: string; // ISO datetime
};

export type ZwdVveDataSource = {
  bag_id: string;
  beschermd_stadsdorpsgezicht: string;
  build_year: number;
  district: string;
  kvk_nummer: string;
  ligt_in_beschermd_gebied: string;
  monument_status: string;
  name: string;
  neighborhood: string;
  number_of_apartments: number;
  wijk: string;
  zip_code: string;
  cases: ZwdCase[];
};

export type VvEDataFrontend = Prettify<
  CamelCasedPropertiesDeep<
    Pick<
      ZwdVveDataSource,
      | 'name'
      | 'bag_id'
      | 'monument_status'
      | 'number_of_apartments'
      | 'kvk_nummer'
      | 'district'
      | 'build_year'
      | 'ligt_in_beschermd_gebied'
      | 'beschermd_stadsdorpsgezicht'
    >
  >
>;

export type Owner = {
  type:
    | 'Natuurlijk persoon'
    | 'Vereniging van eigenaren'
    | 'Onderneming'
    | 'Onbekend';
  name: string | null;
  number_of_apartments: number;
};
