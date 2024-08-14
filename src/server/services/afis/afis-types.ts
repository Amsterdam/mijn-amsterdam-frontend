type JaOfNee = 'Ja' | 'Nee';

/** Business partner private response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.BSN - Is a string when there is a leading zero present, otherwise a number.
 */
export type AFISBusinessPartnerPrivateSourceResponse = {
  BSN: number | string;
  Gevonden: JaOfNee;
  Zakenpartnernummer?: string;
  Blokkade?: JaOfNee;
  Afnemers_indicatie?: JaOfNee;
};

/** Business partner commercial response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.KVK - Is a string when there is a leading zero present, otherwise a number.
 */
type AFISBusinessPartnerRecord = {
  KVK: number | string;
  Zakenpartnernummer: string;
  Vestigingsnummer?: string;
  Blokkade: JaOfNee;
  Gevonden: JaOfNee;
};

export type AFISBusinessPartnerCommercialSourceResponse = {
  Record: AFISBusinessPartnerRecord | AFISBusinessPartnerRecord[];
};

export type BusinessPartnerKnownResponse = {
  isKnown: boolean;
  businessPartnerIdEncrypted: string | null;
};

export type AfisBusinessPartnerResponse<T> = {
  feed: {
    entry: [
      {
        content: {
          properties: T;
        };
      },
    ];
  };
};

export type AfisBusinessPartnerDetailsTransformedResponse = {
  BusinessPartner: string;
  BusinessPartnerFullName: string;
  BusinessPartnerAddress: string;
  AddressID?: string;
};

export type AfisBusinessPartnerPhoneTransformedResponse = {
  PhoneNumber: string;
  EmailAddress?: string; // dit” komt nog niet uit de api, bespreken met afis
};

export type AfisBusinessPartnerCombinedResponse =
  AfisBusinessPartnerDetailsTransformedResponse &
    AfisBusinessPartnerPhoneTransformedResponse;
