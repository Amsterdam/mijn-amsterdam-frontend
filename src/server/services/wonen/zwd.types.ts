export type ZwedVvEResponseType = {
  '@onformdata.context': string;
};


export type VvEDataSource = {
  beschermd_stadsdorpsgezicht: string | null;
  build_year: number;
  contacts: [];
  district: string;
  id: number;
  is_priority_neighborhood: boolean;
  is_small: boolean;
  kvk_nummer: string | null;
  ligt_in_beschermd_gebied: 'nee' | 'ja';
  monument_status: string | null;
  name: string;
  neighborhood: string;
  number_of_apartments: number;
  owners: Owner[];
  wijk: string;
  zip_code: string;
};

export type Owner = {
  type:
    | 'Natuurlijk persoon'
    | 'Vereniging van eigenaren'
    | 'Onderneming'
    | 'Onbekend';
  name: string | null;
  number_of_apartments: number;
};
