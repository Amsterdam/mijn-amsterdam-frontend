import { filterCombineRtmData } from './regeling-rtm';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

const RTM_1_AANVRAAG: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3162110',
  datumAanvraag: '2025-05-20',
  datumBeginLevering: null,
  datumBesluit: '2025-05-21',
  datumEindeGeldigheid: '2026-05-01',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  documenten: [
    {
      id: 'B3405439',
      title: 'AV-RTM Info aan klant GGD',
      url: '',
      datePublished: '2025-07-15T15:11:36.503',
    },
  ],
  isActueel: true,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-ALG',
  productIdentificatie: 'AV-RTM1',
  beschiktProductIdentificatie: '1516367',
  resultaat: 'toegewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: ['999994542', '999991000'],
  betrokkenPersonen: [
    {
      bsn: '999994542',
      name: '999994542 - Flex',
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    },
    {
      bsn: '999991000',
      name: '999991000 - Flex',
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    },
  ],
  bsnAanvrager: '000009945',
};

const RTM_2_TOEGEWEZEN: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3162696',
  datumAanvraag: '2025-05-28',
  datumBeginLevering: null,
  datumBesluit: '2025-05-28',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  documenten: [
    {
      id: 'B3400309',
      title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
      url: '',
      datePublished: '2025-05-28T14:36:05.743',
    },
  ],
  isActueel: true,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-D-RTM',
  productIdentificatie: 'AV-RTM',
  beschiktProductIdentificatie: '1516905',
  resultaat: 'toegewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: ['999994542', '999991000'],
  betrokkenPersonen: [
    {
      bsn: '999994542',
      name: '999994542 - Flex',
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    },
    {
      bsn: '999991000',
      name: '999991000 - Flex',
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    },
  ],
  bsnAanvrager: '000009945',
};

const RTM_2_EINDE_RECHT: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3166814',
  datumAanvraag: '2025-05-20',
  datumBeginLevering: null,
  datumBesluit: '2025-07-15',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  documenten: [
    {
      id: 'B3405442',
      title: 'AV-RTM afwijzing',
      url: '',
      datePublished: '2025-07-15T15:18:55.68',
    },
    {
      id: 'E1082460',
      title: 'aanvraagformulier HLI',
      url: '',
      datePublished: '2025-05-20T10:47:13.323',
    },
  ],
  isActueel: false,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-D-RTM',
  productIdentificatie: 'AV-RTM',
  beschiktProductIdentificatie: '329903',
  resultaat: 'afgewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: ['999994542', '999991000'],
  betrokkenPersonen: [],
  bsnAanvrager: '000009945',
};

const UNKNOWN: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '1111111',
  datumAanvraag: '2025-01-01',
  datumBeginLevering: null,
  datumBesluit: '2025-02-01',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  documenten: [],
  isActueel: true,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-UNKNOWN',
  productIdentificatie: 'AV-UNKNOWN',
  beschiktProductIdentificatie: '222222',
  resultaat: 'toegewezen',
  titel: 'UNKNOWN',
  betrokkenen: [],
  betrokkenPersonen: [],
  bsnAanvrager: '555555555',
};

describe('filterCombineRtmData', () => {
  test('Just aanvraag fase 1 and seperates rtm from other aanvragen', () => {
    const [remainder, rtmAanvragen] = filterCombineRtmData([
      UNKNOWN,
      RTM_1_AANVRAAG,
    ]);
    expect(rtmAanvragen[0].productIdentificatie).toBe('AV-RTM1');
    expect(remainder[0].productIdentificatie).toBe('AV-UNKNOWN');
  });

  test('Merged part one and two into Besluit afgewezen', () => {
    const [, result] = filterCombineRtmData([
      RTM_2_EINDE_RECHT,
      RTM_1_AANVRAAG,
    ]);
    expect(result).toStrictEqual([
      {
        beschiktProductIdentificatie: '329903',
        betrokkenPersonen: [],
        betrokkenen: ['999994542', '999991000'],
        bsnAanvrager: '000009945',
        datumAanvraag: '2025-05-20',
        datumBeginLevering: null,
        datumBesluit: '2025-07-15',
        datumEindeGeldigheid: null,
        datumEindeLevering: null,
        datumInBehandeling: '2025-05-21',
        datumIngangGeldigheid: null,
        datumOpdrachtLevering: null,
        datumToewijzing: null,
        documenten: [
          {
            id: 'B3405442',
            title: 'AV-RTM afwijzing',
            url: '',
            datePublished: '2025-07-15T15:18:55.68',
          },
          {
            id: 'E1082460',
            title: 'aanvraagformulier HLI',
            url: '',
            datePublished: '2025-05-20T10:47:13.323',
          },
          {
            id: 'B3405439',
            title: 'AV-RTM Info aan klant GGD',
            url: '',
            datePublished: '2025-07-15T15:11:36.503',
          },
        ],
        id: '3166814',
        isActueel: false,
        leverancier: '',
        leveringsVorm: '',
        productIdentificatie: 'AV-RTM',
        productsoortCode: 'AV-D-RTM',
        resultaat: 'afgewezen',
        titel: 'Regeling Tegemoetkoming Meerkosten',
      },
    ]);
  });

  test('Merged part one and two into: Besluit toegewezen', () => {
    const [, result] = filterCombineRtmData([RTM_2_TOEGEWEZEN, RTM_1_AANVRAAG]);
    expect(result).toStrictEqual([
      {
        beschiktProductIdentificatie: '1516905',
        betrokkenPersonen: [
          {
            bsn: '999994542',
            dateOfBirth: '2023-06-12',
            dateOfBirthFormatted: '12 juni 2023',
            name: '999994542 - Flex',
            partnernaam: 'partner-2 - Flex',
            partnervoorvoegsel: null,
          },
          {
            bsn: '999991000',
            dateOfBirth: '2023-06-12',
            dateOfBirthFormatted: '12 juni 2023',
            name: '999991000 - Flex',
            partnernaam: 'partner-2 - Flex',
            partnervoorvoegsel: null,
          },
        ],
        betrokkenen: ['999994542', '999991000'],
        bsnAanvrager: '000009945',
        datumAanvraag: '2025-05-20',
        datumBeginLevering: null,
        datumBesluit: '2025-05-28',
        datumEindeGeldigheid: null,
        datumEindeLevering: null,
        datumInBehandeling: '2025-05-21',
        datumIngangGeldigheid: '2025-05-01',
        datumOpdrachtLevering: null,
        datumToewijzing: null,
        documenten: [
          {
            datePublished: '2025-05-28T14:36:05.743',
            id: 'B3400309',
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
            url: '',
          },
          {
            datePublished: '2025-07-15T15:11:36.503',
            id: 'B3405439',
            title: 'AV-RTM Info aan klant GGD',
            url: '',
          },
        ],
        id: '3162696',
        isActueel: true,
        leverancier: '',
        leveringsVorm: '',
        productIdentificatie: 'AV-RTM',
        productsoortCode: 'AV-D-RTM',
        resultaat: 'toegewezen',
        titel: 'Regeling Tegemoetkoming Meerkosten',
      },
    ]);
  });

  test('One Einde recht, double voorzieningingen are merged and duplicate dropped', () => {
    const [, result] = filterCombineRtmData([
      {
        ...RTM_2_EINDE_RECHT,
        resultaat: 'toegewezen',
        datumIngangGeldigheid: '2025-02-01',
        datumEindeGeldigheid: '2025-06-30',
        documenten: [],
      },
      {
        ...RTM_2_EINDE_RECHT,
        resultaat: 'toegewezen',
        datumIngangGeldigheid: '2025-07-15',
        datumEindeGeldigheid: '2025-06-30',
        documenten: [
          {
            id: 'B3405450',
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
            url: '',
            datePublished: '2025-07-15T16:44:15.747',
          },
        ],
      },
      RTM_1_AANVRAAG,
    ]);
    expect(result).toStrictEqual([
      {
        beschiktProductIdentificatie: '329903',
        betrokkenPersonen: [],
        betrokkenen: ['999994542', '999991000'],
        bsnAanvrager: '000009945',
        datumAanvraag: '2025-05-20',
        datumBeginLevering: null,
        datumBesluit: '2025-07-15',
        datumEindeGeldigheid: '2025-06-30',
        datumEindeLevering: null,
        datumInBehandeling: '2025-05-21',
        datumIngangGeldigheid: '2025-02-01',
        datumOpdrachtLevering: null,
        datumToewijzing: null,
        documenten: [
          {
            datePublished: '2025-07-15T16:44:15.747',
            id: 'B3405450',
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
            url: '',
          },
          {
            datePublished: '2025-07-15T15:11:36.503',
            id: 'B3405439',
            title: 'AV-RTM Info aan klant GGD',
            url: '',
          },
        ],
        id: '3166814',
        isActueel: false,
        leverancier: '',
        leveringsVorm: '',
        productIdentificatie: 'AV-RTM',
        productsoortCode: 'AV-D-RTM',
        resultaat: 'toegewezen',
        titel: 'Regeling Tegemoetkoming Meerkosten',
      },
    ]);
  });
});
