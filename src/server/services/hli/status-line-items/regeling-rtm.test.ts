import { filterCombineRtmData } from './regeling-rtm';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

const base = {
  bsnAanvrager: '000009945',
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
};

const RTM_1_AANVRAAG: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3162110',
  datumAanvraag: '2025-01-01',
  datumBeginLevering: null,
  datumBesluit: '2025-02-01',
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
  betrokkenen: base.betrokkenen,
  betrokkenPersonen: base.betrokkenPersonen,
  bsnAanvrager: base.bsnAanvrager,
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
  betrokkenen: base.betrokkenen,
  betrokkenPersonen: base.betrokkenPersonen,
  bsnAanvrager: base.bsnAanvrager,
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
  betrokkenen: base.betrokkenen,
  betrokkenPersonen: [],
  bsnAanvrager: base.bsnAanvrager,
};

const RTM_WIJZIGINGS_AANVRAAG: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3170110',
  datumAanvraag: '2025-08-18',
  datumBeginLevering: null,
  datumBesluit: '2025-08-18',
  datumEindeGeldigheid: '2026-08-18',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-08-18',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  documenten: [
    {
      id: 'B3408760',
      title: 'AV-RTM Info aan klant GGD',
      url: '',
      datePublished: '2025-08-18T15:17:08.773',
    },
    {
      id: 'B3408752',
      title: 'AV-RTM Info aan klant GGD',
      url: '',
      datePublished: '2025-08-18T14:09:48.83',
    },
  ],
  isActueel: true,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-ALG',
  productIdentificatie: 'AV-RTM1',
  beschiktProductIdentificatie: '1523491',
  resultaat: 'toegewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: base.betrokkenen,
  betrokkenPersonen: base.betrokkenPersonen,
  bsnAanvrager: base.bsnAanvrager,
};

const RTM_WIJZIGINGS_TOEKENNING: ZorgnedAanvraagWithRelatedPersonsTransformed =
  {
    id: '3170113',
    datumAanvraag: '2025-08-30',
    datumBeginLevering: null,
    datumBesluit: '2025-08-31',
    datumEindeGeldigheid: null,
    datumEindeLevering: null,
    datumIngangGeldigheid: '2025-05-01',
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    documenten: [
      {
        id: 'B3408757',
        title: 'Beschikking wijziging RTM',
        url: '',
        datePublished: '2025-08-18T14:57:41.793',
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
    betrokkenen: base.betrokkenen,
    betrokkenPersonen: base.betrokkenPersonen,
    bsnAanvrager: base.bsnAanvrager,
  };

// const RTM_WIJZIGINGS_AFWIJZING: ZorgnedAanvraagWithRelatedPersonsTransformed =
//   {};

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
        beschiktProductIdentificatie:
          RTM_2_EINDE_RECHT.beschiktProductIdentificatie,
        betrokkenPersonen: RTM_2_EINDE_RECHT.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        bsnAanvrager: RTM_2_EINDE_RECHT.bsnAanvrager,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        datumBeginLevering: RTM_2_EINDE_RECHT.datumBeginLevering,
        datumBesluit: RTM_2_EINDE_RECHT.datumBesluit,
        datumEindeGeldigheid: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        datumEindeLevering: RTM_2_EINDE_RECHT.datumEindeLevering,
        datumInBehandeling: RTM_1_AANVRAAG.datumBesluit,
        datumIngangGeldigheid: RTM_2_EINDE_RECHT.datumIngangGeldigheid,
        datumOpdrachtLevering: RTM_2_EINDE_RECHT.datumOpdrachtLevering,
        datumToewijzing: RTM_2_EINDE_RECHT.datumToewijzing,
        documenten: [
          ...RTM_2_EINDE_RECHT.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: RTM_2_EINDE_RECHT.id,
        isActueel: RTM_2_EINDE_RECHT.isActueel,
        leverancier: RTM_2_EINDE_RECHT.leverancier,
        leveringsVorm: RTM_2_EINDE_RECHT.leveringsVorm,
        productIdentificatie: RTM_2_EINDE_RECHT.productIdentificatie,
        productsoortCode: RTM_2_EINDE_RECHT.productsoortCode,
        resultaat: RTM_2_EINDE_RECHT.resultaat,
        titel: RTM_1_AANVRAAG.titel,
      },
    ]);
  });

  test('Merged part one and two into: Besluit toegewezen', () => {
    const [, result] = filterCombineRtmData([RTM_2_TOEGEWEZEN, RTM_1_AANVRAAG]);
    expect(result).toStrictEqual([
      {
        beschiktProductIdentificatie:
          RTM_2_TOEGEWEZEN.beschiktProductIdentificatie,
        betrokkenPersonen: base.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        bsnAanvrager: RTM_2_TOEGEWEZEN.bsnAanvrager,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        datumBeginLevering: RTM_2_TOEGEWEZEN.datumBeginLevering,
        datumBesluit: RTM_2_TOEGEWEZEN.datumBesluit,
        datumEindeGeldigheid: RTM_2_TOEGEWEZEN.datumEindeGeldigheid,
        datumEindeLevering: RTM_2_TOEGEWEZEN.datumEindeLevering,
        datumInBehandeling: RTM_1_AANVRAAG.datumBesluit,
        datumIngangGeldigheid: RTM_2_TOEGEWEZEN.datumIngangGeldigheid,
        datumOpdrachtLevering: RTM_2_TOEGEWEZEN.datumOpdrachtLevering,
        datumToewijzing: RTM_2_TOEGEWEZEN.datumToewijzing,
        documenten: [
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: RTM_2_TOEGEWEZEN.id,
        isActueel: RTM_2_TOEGEWEZEN.isActueel,
        leverancier: RTM_2_TOEGEWEZEN.leverancier,
        leveringsVorm: RTM_2_TOEGEWEZEN.leveringsVorm,
        productIdentificatie: RTM_2_TOEGEWEZEN.productIdentificatie,
        productsoortCode: RTM_2_TOEGEWEZEN.productsoortCode,
        resultaat: RTM_2_TOEGEWEZEN.resultaat,
        titel: RTM_2_TOEGEWEZEN.titel,
      },
    ]);
  });

  test('One Einde recht, double voorzieningingen are merged and duplicate dropped', () => {
    const differences: Partial<ZorgnedAanvraagWithRelatedPersonsTransformed> = {
      resultaat: 'toegewezen',
      datumIngangGeldigheid: '2025-02-01',
      datumEindeGeldigheid: '2025-06-30',
      documenten: [],
    };
    const [, result] = filterCombineRtmData([
      {
        ...RTM_2_EINDE_RECHT,
        ...differences,
      },
      RTM_2_TOEGEWEZEN,
      RTM_1_AANVRAAG,
    ]);
    expect(result).toStrictEqual([
      {
        beschiktProductIdentificatie:
          RTM_2_EINDE_RECHT.beschiktProductIdentificatie,
        betrokkenPersonen: RTM_2_EINDE_RECHT.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        bsnAanvrager: RTM_2_EINDE_RECHT.bsnAanvrager,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        datumBeginLevering: RTM_2_EINDE_RECHT.datumBeginLevering,
        datumBesluit: RTM_2_EINDE_RECHT.datumBesluit,
        datumEindeGeldigheid: differences.datumEindeGeldigheid,
        datumEindeLevering: RTM_2_EINDE_RECHT.datumEindeLevering,
        datumInBehandeling: RTM_2_TOEGEWEZEN.datumBesluit,
        datumIngangGeldigheid: differences.datumIngangGeldigheid,
        datumOpdrachtLevering: RTM_2_EINDE_RECHT.datumOpdrachtLevering,
        datumToewijzing: RTM_2_EINDE_RECHT.datumToewijzing,
        documenten: [
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: RTM_2_EINDE_RECHT.id,
        isActueel: RTM_2_EINDE_RECHT.isActueel,
        leverancier: RTM_2_EINDE_RECHT.leverancier,
        leveringsVorm: RTM_2_EINDE_RECHT.leveringsVorm,
        productIdentificatie: RTM_2_EINDE_RECHT.productIdentificatie,
        productsoortCode: RTM_2_EINDE_RECHT.productsoortCode,
        resultaat: RTM_2_TOEGEWEZEN.resultaat,
        titel: RTM_2_EINDE_RECHT.titel,
      },
    ]);
  });

  // test('Combines: Aanvraag -> Toegewezen -> Wijzigings aanvraag -> Wijziging toegewezen', () => {
  //   const [, result] = filterCombineRtmData([
  //     RTM_WIJZIGINGS_TOEKENNING,
  //     RTM_WIJZIGINGS_AANVRAAG,
  //     RTM_2_TOEGEWEZEN,
  //     RTM_1_AANVRAAG,
  //   ]);
  //   expect(result).toStrictEqual([
  //     {
  //       beschiktProductIdentificatie: '1523491',
  //       betrokkenPersonen: base.betrokkenPersonen,
  //       betrokkenen: ['129095205'],
  //       bsnAanvrager: '000009945',
  //       datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
  //       datumBeginLevering: null,
  //       datumBesluit: '2025-08-18',
  //       datumEindeGeldigheid: '2026-08-18',
  //       datumEindeLevering: null,
  //       datumInBehandeling: '2025-02-01',
  //       datumIngangGeldigheid: '2025-08-18',
  //       datumOpdrachtLevering: null,
  //       datumToewijzing: null,
  //       documenten: [
  //         {
  //           datePublished: '2025-08-18T15:17:08.773',
  //           id: 'B3408760',
  //           title: 'AV-RTM Info aan klant GGD',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-08-18T14:09:48.83',
  //           id: 'B3408752',
  //           title: 'AV-RTM Info aan klant GGD',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-08-18T14:11:57',
  //           id: 'E1082971',
  //           title: 'advies GGD',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-05-28T14:36:05.743',
  //           id: 'B3400309',
  //           title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-05-28T14:31:15',
  //           id: 'E1082518',
  //           title: 'advies GGD',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-08-18T14:57:41.793',
  //           id: 'B3408757',
  //           title: 'Beschikking wijziging RTM',
  //           url: '',
  //         },
  //         {
  //           datePublished: '2025-07-15T15:31:56.833',
  //           id: 'B3405439',
  //           title: 'AV-RTM Info aan klant GGD',
  //           url: '',
  //         },
  //       ],
  //       id: '3170110',
  //       isActueel: true,
  //       leverancier: '',
  //       leveringsVorm: '',
  //       productIdentificatie: 'AV-RTM',
  //       productsoortCode: 'AV-ALG',
  //       resultaat: 'toegewezen',
  //       titel: 'Regeling Tegemoetkoming Meerkosten',
  //     },
  //   ]);
  // });
});
