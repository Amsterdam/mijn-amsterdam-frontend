export interface EnergieLabelTransformed {
  energieklasse: string | null;
  geldigTotDatum: string | null;
}

/**
 *  An incomplete slice of a EnergieLabelFractionData object.
 *  That is because not all fields are used.
 *  See https://api.data.amsterdam.nl/v1/duurzaamheid/energielabel for documentation
 */
export interface EnergieLabelFractionData {
  metingGeldigTot: string;
  energieklasse: string;
}

export interface EnergieLabelSourceData {
  _embedded: {
    energielabel: EnergieLabelFractionData[];
  };
}
