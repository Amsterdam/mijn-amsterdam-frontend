import type { CamelCasedPropertiesDeep } from 'type-fest';

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
  kvk_number: string | null;
  ligt_in_beschermd_gebied: 'nee' | 'ja';
  monument_status: string | null;
  name: string;
  neighborhood: string;
  number_of_apartments: number;
  owners: Owner[];
  wijk: string;
  zip_code: string;
};
export type VvEDataFrontend = Prettify<
  CamelCasedPropertiesDeep<
    Pick<
      VvEDataSource,
      | 'name'
      | 'monument_status'
      | 'number_of_apartments'
      | 'kvk_number'
      | 'district'
      | 'build_year'
      | 'is_priority_neighborhood'
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
