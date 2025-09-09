import { filterCombineRtmData } from './regeling-rtm';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

/** The ID determines the sorting order.
 *  Thats why programmaticly adding an id makes predefined aanvragen more reusable.
 */
function attachIDToAanvragen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
  return aanvragen.map((aanvraag, i) => ({
    ...aanvraag,
    id: (i + 1).toString(),
  }));
}

function getLastID(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): string {
  const last = aanvragen.at(-1)?.id;
  if (!last) {
    throw Error('No id found in the last aanvraag.');
  }
  return last;
}

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
  id: '1',
  datumAanvraag: '2025-01-01',
  datumBeginLevering: null,
  datumBesluit: '2025-02-01',
  datumEindeGeldigheid: '2026-05-01',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 1',
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
  id: '2',
  datumAanvraag: '2025-05-28',
  datumBeginLevering: null,
  datumBesluit: '2025-05-28',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
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
  id: '3',
  datumAanvraag: '2025-05-20',
  datumBeginLevering: null,
  datumBesluit: '2025-07-15',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  // RP TODO: Characters look incorrect, is this because of our azure logging or send this way?
  procesAanvraagOmschrijving: 'BeÃ«indigen RTM',
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
  id: '4',
  datumAanvraag: '2025-08-18',
  datumBeginLevering: null,
  datumBesluit: '2025-08-18',
  datumEindeGeldigheid: '2026-08-18',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-08-18',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 1',
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
    id: '5',
    datumAanvraag: '2025-08-30',
    datumBeginLevering: null,
    datumBesluit: '2025-08-31',
    datumEindeGeldigheid: null,
    datumEindeLevering: null,
    datumIngangGeldigheid: '2025-05-01',
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    procesAanvraagOmschrijving: 'RTM Herkeuring',
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
  id: '9999999',
  datumAanvraag: '2025-01-01',
  datumBeginLevering: null,
  datumBesluit: '2025-02-01',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: null,
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
  test('Seperates from other zorgned type aanvragen', () => {
    const aanvragen = attachIDToAanvragen([RTM_1_AANVRAAG, UNKNOWN]);
    const [remainder, rtmAanvragen] = filterCombineRtmData(aanvragen);
    expect(rtmAanvragen[0].productIdentificatie).toBe('AV-RTM1');
    expect(remainder[0].productIdentificatie).toBe('AV-UNKNOWN');
  });

  test('Combines: Aanvraag -> Toegewezen', () => {
    const aanvragen = attachIDToAanvragen([RTM_1_AANVRAAG, RTM_2_TOEGEWEZEN]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...RTM_2_TOEGEWEZEN,
        betrokkenPersonen: base.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: getLastID(aanvragen),
      },
    ]);
  });

  test('Combines: Aanvraag -> Einde Recht', () => {
    const aanvragen = attachIDToAanvragen([RTM_1_AANVRAAG, RTM_2_EINDE_RECHT]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...RTM_2_EINDE_RECHT,
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_2_EINDE_RECHT.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: getLastID(aanvragen),
        titel: RTM_1_AANVRAAG.titel,
      },
    ]);
  });

  test('Combines: Aanvraag -> Toegewezen -> Duplicate of the previous one', () => {
    const differences: Partial<ZorgnedAanvraagWithRelatedPersonsTransformed> = {
      resultaat: 'toegewezen',
      datumIngangGeldigheid: '2025-02-01',
      datumEindeGeldigheid: '2025-06-30',
      documenten: [],
    };
    const aanvragen = attachIDToAanvragen([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      {
        // The 'duplicate'.
        ...RTM_2_EINDE_RECHT,
        ...differences,
      },
    ]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...RTM_2_EINDE_RECHT,
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        datumEindeGeldigheid: differences.datumEindeGeldigheid,
        datumIngangGeldigheid: differences.datumIngangGeldigheid,
        documenten: [
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: getLastID(aanvragen),
        resultaat: RTM_2_TOEGEWEZEN.resultaat,
      },
    ]);
  });

  test('Combines: Aanvraag -> Toegewezen -> Wijzigings aanvraag -> Wijziging toegewezen', () => {
    const aanvragen = attachIDToAanvragen([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
    ]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...RTM_WIJZIGINGS_TOEKENNING,
        betrokkenPersonen: base.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        bsnAanvrager: base.bsnAanvrager,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_WIJZIGINGS_TOEKENNING.documenten,
          ...RTM_WIJZIGINGS_AANVRAAG.documenten,
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        id: getLastID(aanvragen),
      },
    ]);
  });
});
