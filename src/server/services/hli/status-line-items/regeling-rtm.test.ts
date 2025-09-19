import { filterCombineRtmData } from './regeling-rtm';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

/** The ID determines the sorting order.
 *  Thats why programmaticly adding an id makes predefined aanvragen more reusable.
 */
function attachIDs(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
  return aanvragen.map((aanvraag, i) => {
    const id = (i + 1).toString();
    return {
      ...aanvraag,
      id,
      beschiktProductIdentificatie: `voorziening-${id}`,
    };
  });
}

function attachBetrokkenen(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  ids: string[]
): ZorgnedAanvraagWithRelatedPersonsTransformed {
  const betrokkenPersonen = ids.map((id) => {
    return {
      bsn: id,
      name: `${id} - Flex`,
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    };
  });
  return { ...aanvraag, betrokkenen: ids, betrokkenPersonen };
}

const base = {
  bsnAanvrager: '000009945',
  betrokkenen: ['999991000', '999994542'],
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
  datumAanvraag: '2025-06-28',
  datumBeginLevering: null,
  datumBesluit: '2025-06-28',
  datumEindeGeldigheid: '2025-06-30',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-06-28',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Beëindigen RTM',
  documenten: [
    {
      id: 'B3408768',
      title: 'Beschikking beëindigen RTM',
      url: '',
      datePublished: '2025-06-28T15:39:49',
    },
  ],
  isActueel: false,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-D-RTM',
  productIdentificatie: 'AV-RTM',
  beschiktProductIdentificatie: '1523496',
  resultaat: 'toegewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: base.betrokkenen,
  betrokkenPersonen: base.betrokkenPersonen,
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

const RTM_WIJZIGINGS_AFWIJZING: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '6',
  datumAanvraag: '2025-09-30',
  datumBeginLevering: null,
  datumBesluit: '2025-09-31',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
  documenten: [
    {
      id: 'B3415374',
      title: 'AV-RTM Afwijzing na herkeuring',
      url: '',
      datePublished: '2025-09-18T14:39:40.957',
    },
  ],
  isActueel: false,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-D-RTM',
  productIdentificatie: 'AV-RTM',
  beschiktProductIdentificatie: '329934',
  resultaat: 'afgewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: [],
  betrokkenPersonen: [],
  bsnAanvrager: base.bsnAanvrager,
};

const RTM_2_MIGRATIE: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '7',
  datumAanvraag: '2022-06-29',
  datumBeginLevering: null,
  datumBesluit: '2022-06-29',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: '2022-06-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Migratie RTM',
  documenten: [
    {
      id: 'B3374604',
      title: 'AV-RTM Specificatie',
      url: '',
      datePublished: '2025-02-20T11:49:30.42',
    },
    {
      id: 'B3300648',
      title: 'AV-RTM Specificatie',
      url: '',
      datePublished: '2025-01-20T16:26:12.387',
    },
    {
      id: 'B3262746',
      title: 'AV-RTM Specificatie',
      url: '',
      datePublished: '2024-12-20T11:22:29.4',
    },
    {
      id: 'B3216445',
      title: 'AV-RTM Specificatie',
      url: '',
      datePublished: '2024-11-20T18:27:42.367',
    },
  ],
  isActueel: true,
  leverancier: '',
  leveringsVorm: 'ZIN',
  productsoortCode: 'AV-D-RTM',
  productIdentificatie: 'AV-RTM',
  beschiktProductIdentificatie: '1436337',
  resultaat: 'toegewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: [],
  betrokkenPersonen: [],
  bsnAanvrager: '000009945',
};

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
  test('Orders betrokkenen', () => {
    const aanvragen = [
      { ...RTM_1_AANVRAAG, betrokkenen: ['3', '2', '12', '1'] },
    ];
    const [, result] = filterCombineRtmData(aanvragen);

    expect(result.length).toBe(1);
    // This may look weird but I'm only after a consistent ordering, the actual order does not matter.
    expect(result[0].betrokkenen).toStrictEqual(['1', '12', '2', '3']);
  });

  test('Seperates from other zorgned type aanvragen', () => {
    const aanvragen = attachIDs([RTM_1_AANVRAAG, UNKNOWN]);
    const [remainder, rtmAanvragen] = filterCombineRtmData(aanvragen);
    expect(rtmAanvragen[0].productIdentificatie).toBe('AV-RTM1');
    expect(remainder[0].productIdentificatie).toBe('AV-UNKNOWN');
  });

  test('Migratie', () => {
    const aanvragen = attachIDs([RTM_2_MIGRATIE]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([aanvragen.at(-1)]);
  });

  test('Combines: Aanvraag -> Toegewezen', () => {
    const aanvragen = attachIDs([RTM_1_AANVRAAG, RTM_2_TOEGEWEZEN]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...aanvragen.at(-1),
        betrokkenPersonen: base.betrokkenPersonen,
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_2_TOEGEWEZEN.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
      },
    ]);
  });

  test('Combines: Aanvraag -> Einde Recht', () => {
    const aanvragen = attachIDs([RTM_1_AANVRAAG, RTM_2_EINDE_RECHT]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...aanvragen.at(-1),
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_2_EINDE_RECHT.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        titel: RTM_1_AANVRAAG.titel,
      },
    ]);
  });

  test('Combines: Aanvraag -> Toegewezen -> Duplicate of the previous one', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_EINDE_RECHT,
      RTM_2_EINDE_RECHT,
    ]);
    aanvragen[2].beschiktProductIdentificatie =
      aanvragen[1].beschiktProductIdentificatie;

    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...aanvragen.at(-1),
        id: '2',
        betrokkenen: base.betrokkenen,
        datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
        documenten: [
          ...RTM_2_EINDE_RECHT.documenten,
          ...RTM_2_EINDE_RECHT.documenten,
          ...RTM_1_AANVRAAG.documenten,
        ],
        resultaat: RTM_2_TOEGEWEZEN.resultaat,
      },
    ]);
  });

  test('Combines: Aanvraag -> Toegewezen -> Wijzigings aanvraag -> Wijziging toegewezen', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
    ]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result).toStrictEqual([
      {
        ...aanvragen.at(-1),
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
      },
    ]);
  });

  test(`Combines long chain:\
 Aanvraag -> Toegewezezen -> Herkeuring -> Toegewezen\
 -> Herkeuring -> Afgewezen -> Herkeuring -> Toegewezen`, () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_AFWIJZING,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
      RTM_2_EINDE_RECHT,
    ]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      ...aanvragen.at(-1),
      datumAanvraag: RTM_1_AANVRAAG.datumAanvraag,
      documenten: [
        ...RTM_2_EINDE_RECHT.documenten,
        ...RTM_WIJZIGINGS_TOEKENNING.documenten,
        ...RTM_WIJZIGINGS_AANVRAAG.documenten,
        ...RTM_WIJZIGINGS_AFWIJZING.documenten,
        ...RTM_WIJZIGINGS_AANVRAAG.documenten,
        ...RTM_WIJZIGINGS_TOEKENNING.documenten,
        ...RTM_WIJZIGINGS_AANVRAAG.documenten,
        ...RTM_2_TOEGEWEZEN.documenten,
        ...RTM_1_AANVRAAG.documenten,
      ],
    });
  });

  test('Does not combine: Aanvraag, Aanvraag, Aanvraag', () => {
    const aanvragen = attachIDs([
      attachBetrokkenen(RTM_1_AANVRAAG, ['1']),
      attachBetrokkenen(RTM_1_AANVRAAG, ['2']),
      attachBetrokkenen(RTM_1_AANVRAAG, ['3']),
    ]);
    const [, result] = filterCombineRtmData(aanvragen);
    expect(result.length).toBe(3);
  });

  test('To combine or not to combined: Aanvraag, Aanvraag -> Toegewezen -> Aanvraag', () => {
    const BETROKKENEN_IDS = ['2'];
    const aanvraag = attachBetrokkenen(RTM_1_AANVRAAG, ['3']);
    const aanvragen = attachIDs([
      attachBetrokkenen(RTM_1_AANVRAAG, ['1']),
      attachBetrokkenen(RTM_1_AANVRAAG, BETROKKENEN_IDS),
      attachBetrokkenen(RTM_2_TOEGEWEZEN, BETROKKENEN_IDS),
      aanvraag,
    ]);

    const [, result] = filterCombineRtmData(aanvragen);
    expect(result.length).toBe(3);
    const combinedAanvraag = result.find((a) => a.id === '3')!;
    expect(combinedAanvraag.procesAanvraagOmschrijving).toBe(
      'Aanvraag RTM fase 2'
    );
  });
});
