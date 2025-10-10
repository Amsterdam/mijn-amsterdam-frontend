import { getAuthProfileAndToken } from '../../../../testing/utils';
import { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';
import { forTesting } from '../hli';
import { HLIRegelingFrontend } from '../hli-regelingen-types';

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

const ONTVANGER_ID = '999999999';

// RP TODO: Use later in a test.
const SPECIFICATIE_DOCUMENENT = {
  id: 'B3374604',
  title: 'AV-RTM Specificatie',
  url: '',
  datePublished: '2025-02-20T11:49:30.42',
};

const base = {
  bsnAanvrager: ONTVANGER_ID,
  betrokkenen: [ONTVANGER_ID],
  betrokkenPersonen: [
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

const RTM_1_AFWIJZING: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '3170120',
  datumAanvraag: '2025-08-18',
  datumBeginLevering: null,
  datumBesluit: '2025-08-18',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 1',
  documenten: [
    {
      id: 'B3408764',
      title: 'AV-ALG Besluit Afwijzing',
      url: '',
      datePublished: '2025-08-18T15:28:48.047',
    },
  ],
  isActueel: false,
  leverancier: '',
  leveringsVorm: '',
  productsoortCode: 'AV-ALG',
  productIdentificatie: 'AV-RTM1',
  beschiktProductIdentificatie: '329930',
  resultaat: 'afgewezen',
  titel: 'Regeling Tegemoetkoming Meerkosten',
  betrokkenen: [],
  betrokkenPersonen: [],
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

const RTM_2_AFGEWEZEN: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '2',
  datumAanvraag: '2025-08-20',
  datumBeginLevering: null,
  datumBesluit: '2025-09-01',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: null,
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
  documenten: [
    {
      id: 'B3405442',
      title: 'AV-RTM afwijzing',
      url: '',
      datePublished: '2025-09-01T15:18:55.68',
    },
    {
      id: 'B3405443',
      title: 'advies GGD',
      url: '',
      datePublished: '2025-09-01T15:18:55.68',
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
  betrokkenen: [],
  betrokkenPersonen: [],
  bsnAanvrager: '999999999',
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
  documenten: [],
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
  bsnAanvrager: base.bsnAanvrager,
};

const auth = getAuthProfileAndToken();
auth.profile.id = ONTVANGER_ID;

function transformRegelingenForFrontend(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): HLIRegelingFrontend[] {
  return forTesting.transformRegelingenForFrontend(auth, aanvragen, new Date());
}

/** The following tests heavily use toMatchObject because I don't care about the following fields:
 * document.id: Contains encryption and will always be different.
 * document.url: Same as above.
 * steps[n].description: static text that can be subject to change.
 * The tests are mainly focussed on getting the right steps and documents.
 */
describe('Aanvrager is ontvanger', () => {
  test('Single Aanvraag toegewezen', () => {
    const regelingen = transformRegelingenForFrontend([RTM_1_AANVRAAG]);

    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      dateDecision: '2025-02-01',
      dateEnd: '2026-05-01',
      dateStart: '2025-05-01',
      decision: 'toegewezen',
      displayStatus: 'In behandeling genomen',
      documents: [],
      id: '1',
      isActual: true,
      title: 'Regeling Tegemoetkoming Meerkosten',
    });

    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        datePublished: '2025-02-01',
        documents: [],
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag',
      },
      {
        id: 'status-step-2',
        datePublished: '2025-02-01',
        documents: [
          {
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'In behandeling genomen',
      },
      {
        id: 'status-step-3',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        status: 'Einde recht',
      },
    ]);

    // Check these once, to know they exist.
    // id and url has encrypted data that changes every run.
    assert(regeling.steps[1].documents?.length == 1);

    const document = regeling.steps[1].documents[0];
    expect(document.id.length > 20);
    expect(document.url).toContain(
      '/services/v1/stadspas-en-andere-regelingen/document'
    );
  });

  test('Single Aanvraag afgewezen', () => {
    const regelingen = transformRegelingenForFrontend(
      attachIDs([RTM_1_AFWIJZING])
    );

    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      dateDecision: RTM_1_AFWIJZING.datumBesluit,
      dateEnd: null,
      dateStart: RTM_1_AFWIJZING.datumIngangGeldigheid,
      decision: RTM_1_AFWIJZING.resultaat,
      displayStatus: 'Afgewezen',
      documents: [],
      id: '1',
      isActual: RTM_1_AFWIJZING.isActueel,
      title: RTM_1_AFWIJZING.titel,
    });

    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        datePublished: RTM_1_AFWIJZING.datumBesluit,
        documents: [
          {
            title: 'AV-ALG Besluit Afwijzing',
          },
        ],
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
      },
    ]);
  });

  test('Migratie of active regeling', () => {
    const regelingen = transformRegelingenForFrontend([RTM_2_MIGRATIE]);

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];
    expect(regeling).toMatchObject({
      title: 'Regeling Tegemoetkoming Meerkosten',
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
      isActual: true,
      dateDecision: '2022-06-29',
      dateStart: '2022-06-01',
      dateEnd: null,
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Besluit',
        datePublished: '2022-06-29',
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        status: 'Einde recht',
      },
    ]);
  });

  test('Aanvraag -> Toegewezen -> Einde recht', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_2_EINDE_RECHT,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_EINDE_RECHT.titel,
      isActual: RTM_2_EINDE_RECHT.isActueel,
      dateDecision: RTM_2_EINDE_RECHT.datumBesluit,
      dateStart: RTM_2_EINDE_RECHT.datumIngangGeldigheid,
      dateEnd: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Einde recht',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Aanvraag',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
      },
      {
        id: 'status-step-3',
        status: 'Besluit',
        datePublished: RTM_2_TOEGEWEZEN.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
          },
        ],
      },
      {
        id: 'status-step-4',
        status: 'Einde recht',
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking beëindigen RTM',
          },
        ],
      },
    ]);
  });

  test('Aanvraag -> Afgewezen', () => {
    const aanvragen = attachIDs([RTM_1_AANVRAAG, RTM_2_AFGEWEZEN]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_AFGEWEZEN.titel,
      isActual: RTM_2_AFGEWEZEN.isActueel,
      dateDecision: RTM_2_AFGEWEZEN.datumBesluit,
      dateStart: RTM_2_AFGEWEZEN.datumIngangGeldigheid,
      dateEnd: null,
      decision: 'afgewezen',
      displayStatus: 'Afgewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Aanvraag',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
      },
      {
        id: 'status-step-3',
        status: 'Besluit',
        datePublished: RTM_2_AFGEWEZEN.datumBesluit,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'AV-RTM afwijzing',
          },
          {
            title: 'advies GGD',
          },
        ],
      },
    ]);
  });

  test('Aanvraag -> Toegewezen -> Wijzigings aanvraag -> Wijziging toegewezen', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_WIJZIGINGS_TOEKENNING.titel,
      isActual: RTM_WIJZIGINGS_TOEKENNING.isActueel,
      dateDecision: RTM_WIJZIGINGS_TOEKENNING.datumBesluit,
      dateStart: RTM_WIJZIGINGS_TOEKENNING.datumIngangGeldigheid,
      dateEnd: null,
      decision: RTM_WIJZIGINGS_TOEKENNING.resultaat,
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        documents: [],
        id: 'status-step-1',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag',
      },
      {
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        documents: [
          {
            datePublished: '2025-07-15T15:11:36.503',
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        id: 'status-step-2',
        isActive: false,
        isChecked: true,
        status: 'In behandeling genomen',
      },
      {
        datePublished: RTM_2_TOEGEWEZEN.datumBesluit,
        documents: [
          {
            datePublished: '2025-05-28T14:36:05.743',
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
          },
        ],
        id: 'status-step-3',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
      },
      {
        datePublished: '2025-08-18',
        documents: [
          {
            datePublished: '2025-08-18T15:17:08.773',
            title: 'AV-RTM Info aan klant GGD',
          },
          {
            datePublished: '2025-08-18T14:09:48.83',
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        id: 'status-step-4',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag wijziging',
      },
      {
        datePublished: RTM_WIJZIGINGS_TOEKENNING.datumBesluit,
        documents: [
          {
            datePublished: '2025-08-18T14:57:41.793',
            title: 'Beschikking wijziging RTM',
          },
        ],
        id: 'status-step-5',
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'Besluit wijziging',
      },
      {
        id: 'status-step-6',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        status: 'Einde recht',
      },
    ]);
  });

  test('Migratie -> Wijzigings aanvraag', () => {
    const aanvragen = attachIDs([RTM_2_MIGRATIE, RTM_WIJZIGINGS_AANVRAAG]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_WIJZIGINGS_AANVRAAG.titel,
      isActual: true,
      dateDecision: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
      dateStart: RTM_WIJZIGINGS_AANVRAAG.datumIngangGeldigheid,
      dateEnd: null,
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
        datePublished: RTM_2_MIGRATIE.datumBesluit,
        documents: [],
      },
      {
        id: 'status-step-2',
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag wijziging',
        datePublished: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
        documents: [
          {
            datePublished: '2025-08-18T15:17:08.773',
            title: 'AV-RTM Info aan klant GGD',
          },
          {
            datePublished: '2025-08-18T14:09:48.83',
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
      },
      {
        id: 'status-step-3',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        status: 'Einde recht',
      },
    ]);
  });

  test('Migratie -> Wijzigings aanvraag -> Wijzigings afwijzing', () => {
    const aanvragen = attachIDs([
      RTM_2_MIGRATIE,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_AFWIJZING,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_WIJZIGINGS_AFWIJZING.titel,
      isActual: true,
      dateDecision: RTM_WIJZIGINGS_AFWIJZING.datumBesluit,
      dateStart: RTM_WIJZIGINGS_AANVRAAG.datumIngangGeldigheid,
      dateEnd: null,
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        datePublished: RTM_2_MIGRATIE.datumBesluit,
        documents: [],
        id: 'status-step-1',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
      },
      {
        datePublished: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
        documents: [
          {
            datePublished: '2025-08-18T15:17:08.773',
            title: 'AV-RTM Info aan klant GGD',
          },
          {
            datePublished: '2025-08-18T14:09:48.83',
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        id: 'status-step-2',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag wijziging',
      },
      {
        datePublished: RTM_WIJZIGINGS_AFWIJZING.datumBesluit,
        documents: [
          {
            title: 'AV-RTM Afwijzing na herkeuring',
          },
        ],
        id: 'status-step-3',
        isActive: true,
        isChecked: true,
        isVisible: true,
        status: 'Besluit wijziging',
      },
      {
        id: 'status-step-4',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        status: 'Einde recht',
      },
    ]);
  });

  test('Migratie -> Wijzigings aanvraag -> Einde recht', () => {
    const aanvragen = attachIDs([
      RTM_2_MIGRATIE,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_2_EINDE_RECHT,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_EINDE_RECHT.titel,
      isActual: RTM_2_EINDE_RECHT.isActueel,
      dateDecision: RTM_2_EINDE_RECHT.datumBesluit,
      dateStart: RTM_2_EINDE_RECHT.datumIngangGeldigheid,
      dateEnd: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Einde recht',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        datePublished: RTM_2_MIGRATIE.datumBesluit,
        documents: [],
        id: 'status-step-1',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
      },
      {
        datePublished: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
        documents: [
          {
            datePublished: '2025-08-18T15:17:08.773',
            title: 'AV-RTM Info aan klant GGD',
          },
          {
            datePublished: '2025-08-18T14:09:48.83',
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        id: 'status-step-2',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Aanvraag wijziging',
      },
      {
        id: 'status-step-3',
        status: 'Einde recht',
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking beëindigen RTM',
          },
        ],
      },
    ]);
  });

  // A very unlucky person that has no one to look at their Wijzigings aanvragen for years now.
  test('Migratie -> Wijzigings aanvraag x3', () => {
    const aanvragen = attachIDs([
      RTM_2_MIGRATIE,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_AANVRAAG,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    const statusStepWijzigingsAanvraag = {
      datePublished: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
      documents: [
        {
          datePublished: '2025-08-18T15:17:08.773',
          title: 'AV-RTM Info aan klant GGD',
        },
        {
          datePublished: '2025-08-18T14:09:48.83',
          title: 'AV-RTM Info aan klant GGD',
        },
      ],
      isActive: false,
      isChecked: true,
      isVisible: true,
      status: 'Aanvraag wijziging',
    };

    expect(regeling).toMatchObject({
      title: RTM_WIJZIGINGS_AANVRAAG.titel,
      isActual: true,
      dateDecision: RTM_WIJZIGINGS_AANVRAAG.datumBesluit,
      dateStart: RTM_WIJZIGINGS_AANVRAAG.datumIngangGeldigheid,
      dateEnd: null,
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        datePublished: RTM_2_MIGRATIE.datumBesluit,
        documents: [],
        id: 'status-step-1',
        isActive: false,
        isChecked: true,
        isVisible: true,
        status: 'Besluit',
      },
      { ...statusStepWijzigingsAanvraag, id: 'status-step-2' },
      { ...statusStepWijzigingsAanvraag, id: 'status-step-3' },
      { ...statusStepWijzigingsAanvraag, id: 'status-step-4', isActive: true },
      {
        id: 'status-step-5',
        status: 'Einde recht',
        datePublished: '',
        isActive: false,
        isChecked: false,
        isVisible: true,
        documents: [],
      },
    ]);
  });
});

describe('Ontvanger but aanvragen made by someone else', () => {
  test('Besluit toegewezen', () => {
    const aanvragen = attachIDs([RTM_2_TOEGEWEZEN]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_TOEGEWEZEN.titel,
      isActual: true,
      dateDecision: RTM_2_TOEGEWEZEN.datumBesluit,
      dateStart: RTM_2_TOEGEWEZEN.datumIngangGeldigheid,
      dateEnd: RTM_2_TOEGEWEZEN.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Besluit',
        datePublished: RTM_2_TOEGEWEZEN.datumBesluit,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
          },
        ],
      },
      {
        id: 'status-step-2',
        status: 'Einde recht',
        datePublished: '',
        isActive: false,
        isChecked: false,
        isVisible: true,
        documents: [],
      },
    ]);
  });

  test('Besluit afgewezen', () => {
    const aanvragen = attachIDs([RTM_2_AFGEWEZEN]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_AFGEWEZEN.titel,
      isActual: false,
      dateDecision: RTM_2_AFGEWEZEN.datumBesluit,
      dateStart: RTM_2_AFGEWEZEN.datumIngangGeldigheid,
      dateEnd: RTM_2_AFGEWEZEN.datumEindeGeldigheid,
      decision: 'afgewezen',
      displayStatus: 'Afgewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Besluit',
        datePublished: RTM_2_AFGEWEZEN.datumBesluit,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'AV-RTM afwijzing',
          },
          {
            title: 'advies GGD',
          },
        ],
      },
    ]);
  });
});
