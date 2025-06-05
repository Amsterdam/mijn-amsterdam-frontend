import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { fetchContentTips, prefixTipNotification } from './tips-service';
import WPI_E from '../../../../mocks/fixtures/wpi-e-aanvragen.json';
import { type ThemaID } from '../../../universal/config/thema';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types/App.types';
import { WpiRequestProcess } from '../wpi/wpi-types';

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

const tozoContent = WPI_E.content.filter(
  (c) => c.about === 'Tozo 5'
) as unknown as WpiRequestProcess[];

const TOZO: ApiSuccessResponse<WpiRequestProcess[]> = {
  content: tozoContent,
  status: 'OK',
};

const TOERISTISCHE_VERHUUR = {
  content: {
    lvvRegistraties: [],
    vakantieverhuurVergunningen: [1],
    bbVergunningen: [1],
  },
};

describe('createTipsFromServiceResults', () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(vi.getRealSystemTime());
  });

  it('should show tip mijn-36', async () => {
    const now = new Date('2021-09-25');
    vi.setSystemTime(now);

    const TOZO_copy = { ...structuredClone(TOZO) };

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    const personalTips = await fetchContentTips(
      {
        WPI_TOZO: TOZO_copy,
      },
      now,
      'private'
    );

    expect(personalTips.find((t) => t.id === 'mijn-36')).toBeTruthy();
  });

  it('should show tip mijn-35 and mijn-36', async () => {
    const now = new Date('2021-09-25');
    vi.setSystemTime(now);

    const TOZO_copy = structuredClone(TOZO);
    const VERHUUR_copy = structuredClone(TOERISTISCHE_VERHUUR);

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    const tips = await fetchContentTips(
      {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
        TOERISTISCHE_VERHUUR: VERHUUR_copy as ApiSuccessResponse<any>,
        BRP: BRP as ApiSuccessResponse<any>,
      },
      now,
      'private'
    );

    expect(
      tips.filter((t) => ['mijn-35', 'mijn-36'].includes(t.id)).length
    ).toBe(2);
  });

  it("should return tip mijn-43 when user has only expired id's", async () => {
    const now = new Date('2023-11-25');
    vi.setSystemTime(now);

    const BRPCopy = structuredClone(BRP);

    BRPCopy.content.identiteitsbewijzen[0].datumAfloop = '2020-07-24';

    const tips = await fetchContentTips(
      {
        BRP: BRPCopy as ApiSuccessResponse<any>,
        HLI: {
          content: {
            regelingen: [],
            stadspas: [{ foo: 'bar' }],
          },
          status: 'OK',
        },
      },
      now,
      'private'
    );

    expect(tips.find((t) => t.id === 'mijn-43')).toBeTruthy();
  });

  describe('prefixTipNotification', () => {
    const tip: MyNotification = {
      id: 'test',
      title: 'test',
      description: 'test',
      themaID: 'test' as ThemaID,
      datePublished: 'test',
      isTip: true,
      isAlert: false,
      tipReason: 'test',
    };

    it('should prefix a tip notification with "Tip: "', async () => {
      const result = prefixTipNotification(tip);

      expect(result.title).toBe('Tip: test');

      const result2 = prefixTipNotification({
        ...tip,
        title: 'tip: test',
      });

      expect(result2.title).toBe('Tip: test');

      const result3 = prefixTipNotification({
        ...tip,
        title: 'tip test',
      });

      expect(result3.title).toBe('Tip: test');

      const result4 = prefixTipNotification({
        ...tip,
        title: 'tip:test',
      });

      expect(result4.title).toBe('Tip: test');

      const result5 = prefixTipNotification({
        ...tip,
        title: 'test',
      });

      expect(result5.title).toBe('Tip: test');

      const result6 = prefixTipNotification({
        ...tip,
        title: 'Tip: test',
      });

      expect(result6.title).toBe('Tip: test');
    });
  });
});
