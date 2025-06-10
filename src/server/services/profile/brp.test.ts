import { transformBRPData, transformBRPNotifications } from './brp';
import { BRPDataFromSource } from './brp.types';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { getFullAddress } from '../../../universal/helpers/brp';

const BRP = {
  content: {
    kvkNummer: '123123123',
    adres: {
      _adresSleutel: 'xxxcasdasfada',
      huisletter: null,
      huisnummer: '113',
      huisnummertoevoeging: null,
      postcode: '1018 DN',
      straatnaam: 'Weesperstraat',
      landnaam: 'Nederland',
      woonplaatsNaam: 'Amsterdam',
      begindatumVerblijf: '1967-01-01',
      einddatumVerblijf: '1967-01-01',
      adresType: 'correspondentie',
    },
    adresHistorisch: [
      {
        begindatumVerblijf: '2005-09-01',
        einddatumVerblijf: '2012-08-01',
        huisletter: null,
        huisnummer: '9',
        huisnummertoevoeging: 'H',
        postcode: '1098 NK',
        straatnaam: 'Ampèrestraat',
        woonplaatsNaam: 'Amsterdam',
        landnaam: 'Nederland',
        adresType: 'woon',
      },
      {
        begindatumVerblijf: '1990-01-01',
        einddatumVerblijf: '2005-09-01',
        huisletter: null,
        huisnummer: '9',
        huisnummertoevoeging: '3',
        postcode: '1098 AA',
        straatnaam: 'Middenweg',
        woonplaatsNaam: 'Amsterdam',
        landnaam: 'Nederland',
        adresType: 'woon',
      },
    ],
    persoon: {
      vertrokkenOnbekendWaarheen: true,
      datumVertrekUitNederland: '1967-01-01',
      aanduidingNaamgebruikOmschrijving: 'Eigen geslachtsnaam',
      omschrijvingAdellijkeTitel: 'Hertogin',
      bsn: '129095205',
      geboortedatum: '1992-09-22',
      indicatieGeboortedatum: 'J',
      geboortelandnaam: 'Nederland',
      geboorteplaatsnaam: 'Lochem',
      gemeentenaamInschrijving: 'Amsterdam',
      geslachtsnaam: 'Beemsterboer',
      nationaliteiten: [
        {
          omschrijving: 'Nederlandse',
        },
        {
          omschrijving: 'Turkse',
        },
      ],
      omschrijvingBurgerlijkeStaat: 'Gehuwd',
      omschrijvingGeslachtsaanduiding: 'Man',
      opgemaakteNaam: 'W. B. C. X. Y. Z. Van beuningen Beemsterboer',
      overlijdensdatum: null,
      voornamen: 'Wesley',
      voorvoegselGeslachtsnaam: null,
      mokum: true,
      indicatieGeheim: true,
      adresInOnderzoek: '089999',
    },
    ouders: [
      {
        geboortedatum: '1920-01-01',
        indicatieGeboortedatum: 'M',
        geboortelandnaam: 'Nederland',
        geboorteplaatsnaam: 'Lochem',
        geslachtsnaam: 'Beemsterboer',
        nationaliteiten: [
          {
            omschrijving: 'Nederlandse',
          },
        ],
        omschrijvingGeslachtsaanduiding: 'Man',
        overlijdensdatum: null,
        opgemaakteNaam: 'S. Beemsterboer',
        voornamen: 'Senior',
        bsn: '123456780',
        voorvoegselGeslachtsnaam: null,
      },
      {
        geboortedatum: '1920-01-01',
        geboortelandnaam: 'Nederland',
        geboorteplaatsnaam: 'Lochem',
        geslachtsnaam: 'Beemsterboerin',
        bsn: '123456780',
        nationaliteiten: [
          {
            omschrijving: 'Nederlandse',
          },
        ],
        omschrijvingGeslachtsaanduiding: 'Vrouw',
        opgemaakteNaam: 'Sa. Beemsterboer',
        voornamen: 'Seniora',
        voorvoegselGeslachtsnaam: null,
      },
    ],
    verbintenis: {
      datumOntbinding: null,
      datumSluiting: '1999-01-01',
      landnaamSluiting: 'Marokko',
      persoon: {
        bsn: '123456780',
        geboortedatum: '2019-07-08',
        indicatieGeboortedatum: 'D',
        geslachtsnaam: 'Bakker',
        overlijdensdatum: null,
        voornamen: 'Souad',
        voorvoegselGeslachtsnaam: null,
      },
      plaatsnaamSluitingOmschrijving: 'Asilah',
      soortVerbintenis: 'H',
      soortVerbintenisOmschrijving: 'Huwelijk',
    },
    verbintenisHistorisch: [
      {
        datumOntbinding: '1998-07-08',
        datumSluiting: '1912-01-01',
        landnaamSluiting: 'Marokko',
        persoon: {
          bsn: '123456780',
          geboortedatum: '2019-07-08',
          indicatieGeboortedatum: 'V',
          geslachtsnaam: 'Bakker',
          overlijdensdatum: null,
          voornamen: 'Souad',
          voorvoegselGeslachtsnaam: null,
        },
        plaatsnaamSluitingOmschrijving: 'Asilah',
        soortVerbintenis: 'H',
        soortVerbintenisOmschrijving: 'Huwelijk',
      },
      {
        datumOntbinding: '2019-07-08',
        datumSluiting: '',
        landnaamSluiting: 'Marokko',
        persoon: {
          bsn: '123456780',
          geboortedatum: '2019-07-08',
          geslachtsnaam: 'Bakker',
          overlijdensdatum: null,
          voornamen: 'Souad',
          voorvoegselGeslachtsnaam: null,
        },
        plaatsnaamSluitingOmschrijving: 'Asilah',
        soortVerbintenis: 'H',
        soortVerbintenisOmschrijving: 'Huwelijk',
      },
      {
        datumOntbinding: '2006-01-01',
        datumSluiting: '2000-01-01',
        landnaamSluiting: 'Nederland',
        persoon: {
          bsn: '113731681',
          geboortedatum: '1950-01-06',
          geboortelandnaam: 'Nederland',
          geboorteplaatsnaam: 'Amsterdam',
          geslachtsnaam: 'Wolters',
          omschrijvingAdellijkeTitel: 'Barones',
          omschrijvingGeslachtsaanduiding: 'Vrouw',
          opgemaakteNaam: null,
          overlijdensdatum: null,
          voornamen: 'Renée',
          voorvoegselGeslachtsnaam: null,
        },
        plaatsnaamSluitingOmschrijving: 'Amsterdam',
        redenOntbindingOmschrijving: 'Overlijden één van beide partners',
        soortVerbintenis: 'H',
        soortVerbintenisOmschrijving: 'Huwelijk',
      },
    ],
    kinderen: [
      {
        bsn: '123456780',
        geboortedatum: '2016-07-08',
        geslachtsaanduiding: 'M',
        geslachtsnaam: 'Kosterijk',
        overlijdensdatum: null,
        voornamen: 'Yassine',
        voorvoegselGeslachtsnaam: null,
      },
      {
        bsn: '123456780',
        geboortedatum: '2019-07-08',
        geslachtsaanduiding: 'M',
        geslachtsnaam: 'Kosterijk',
        overlijdensdatum: null,
        voornamen: 'Marwan',
        voorvoegselGeslachtsnaam: null,
      },
    ],
    identiteitsbewijzen: [
      {
        datumAfloop: '2025-10-15',
        datumUitgifte: '2015-10-15',
        documentNummer: 'PP57XKG54',
        documentType: 'paspoort',
        id: 'een-hash-van-documentnummer-1',
      },
      {
        datumAfloop: '2020-09-11',
        datumUitgifte: '2010-09-11',
        documentNummer: 'IE9962819',
        documentType: 'europese identiteitskaart',
        id: 'een-hash-van-documentnummer-2',
      },
    ],
  },
  status: 'OK',
};

const brpDataTyped = BRP as ApiSuccessResponse<BRPDataFromSource>;
const {
  content: { adres },
} = brpDataTyped;

describe('BRP data api + transformation', () => {
  it('should construct a complete addresss', () => {
    expect(
      getFullAddress({ ...adres, huisletter: 'X', huisnummertoevoeging: 'h' })
    ).toBe('Weesperstraat 113 X h');
  });

  it('should transform the source data', () => {
    expect(transformBRPData(brpDataTyped)).toMatchSnapshot();
  });

  it('should transform the source data into notifications', () => {
    const data = transformBRPData(brpDataTyped);
    expect(
      transformBRPNotifications(data, new Date(2020, 3, 23))
    ).toStrictEqual([
      {
        datePublished: '2020-04-22T22:00:00.000Z',
        description: 'Op dit moment onderzoeken wij op welk adres u nu woont.',
        id: 'brpAdresInOnderzoek',
        isAlert: true,
        link: {
          title: 'Meer informatie',
          to: '/persoonlijke-gegevens',
        },
        themaID: 'BRP',
        themaTitle: 'Mijn gegevens',
        title: 'Adres in onderzoek',
      },
      {
        datePublished: '2020-04-22T22:00:00.000Z',
        description:
          "U staat sinds 01 januari 1967 in de Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.",
        id: 'brpVertrokkenOnbekendWaarheen',
        isAlert: true,
        link: {
          title: 'Meer informatie',
          to: '/persoonlijke-gegevens',
        },
        themaID: 'BRP',
        themaTitle: 'Mijn gegevens',
        title: 'Vertrokken Onbekend Waarheen (VOW)',
      },
    ]);
  });
});
