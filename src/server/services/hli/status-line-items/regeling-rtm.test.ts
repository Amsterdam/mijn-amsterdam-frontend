import Mockdate from 'mockdate';

import { getAuthProfileAndToken } from '../../../../testing/utils';
import { AuthProfileAndToken } from '../../../auth/auth-types';
import {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';
import { forTesting } from '../hli';
import { HLIRegelingFrontend } from '../hli-regelingen-types';

const ONTVANGER_ID = '999999999';

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

type Betrokkene = { bsn: string; isAanvrager?: true };

function replacePropsInAanvragen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  props: {
    betrokkenen: Betrokkene[];
    bsnAanvrager: string;
  }
): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
  return aanvragen.map((aanvraag) => {
    const aanvraagWithBetrokkenenReplaced = replaceBetrokkenen(
      aanvraag,
      props.betrokkenen
    );

    return {
      ...aanvraagWithBetrokkenenReplaced,
      bsnAanvrager: props.bsnAanvrager,
    };
  });
}

function replaceBetrokkenen(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  betrokkenen: Betrokkene[]
): ZorgnedAanvraagWithRelatedPersonsTransformed {
  return {
    ...aanvraag,
    betrokkenen: betrokkenen.map(({ bsn }) => bsn),
    betrokkenPersonen: betrokkenen.map(({ bsn, isAanvrager }) => {
      const betrokkenPersoon: ZorgnedPerson = {
        bsn,
        name: `${bsn} - Flex`,
        dateOfBirth: '2023-06-12',
        dateOfBirthFormatted: '12 juni 2023',
        partnernaam: 'partner-2 - Flex',
        partnervoorvoegsel: null,
      };
      if (isAanvrager) {
        betrokkenPersoon.isAanvrager = true;
      }
      return betrokkenPersoon;
    }),
  };
}

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
      bsn: ONTVANGER_ID,
      name: `${ONTVANGER_ID} - Flex`,
      isAanvrager: true,
      dateOfBirth: '2023-06-12',
      dateOfBirthFormatted: '12 juni 2023',
      partnernaam: 'partner-2 - Flex',
      partnervoorvoegsel: null,
    },
  ] as ZorgnedPerson[],
};

const descriptions = {
  toegewezen:
    '<p> U krijgt Regeling Tegemoetkoming Meerkosten per 01 mei 2025. </p> <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>',
  afgewezen: `<p> U krijgt geen Regeling Tegemoetkoming Meerkosten. </p> <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`,
  wijzigingsAanvraag: `<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
<p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>`,
  wijzigingsBesluit:
    '<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>',
  inBehandeling: `<p>Voordat u de Regeling Tegemoetkoming Meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`,
  inBehandelingVoorMeerdereBetrokkenen: `<p>Voordat u de Regeling Tegemoetkoming Meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p><p><strong>Vraagt u de Regeling Tegemoetkoming Meerkosten (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p> <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p> <p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`,
  activeEindeRecht: `<p>Uw recht op Regeling Tegemoetkoming Meerkosten is beëindigd per 30 juni 2025.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`,
  activeEindeRechtForChild: `<p>Uw recht op Regeling Tegemoetkoming Meerkosten is beëindigd per 30 juni 2025.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p> <p>Wordt uw kind 18? Dan moet uw kind deze regeling voor zichzelf aanvragen.</p>`,
  activeEindeRechtAtChild: `<p>Uw recht op Regeling Tegemoetkoming Meerkosten is beëindigd per 30 juni 2025.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p><p>Bent u net of binnenkort 18 jaar oud? Dan moet u deze regeling voor uzelf aanvragen.'} <a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Lees meer over de voorwaarden</a>.</p>`,
  inactiveEindeRecht: `<p>U hoeft de Regeling Tegemoetkoming Meerkosten niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p><p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p><p><a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`,
};

const RTM_1_AANVRAAG: ZorgnedAanvraagWithRelatedPersonsTransformed = {
  id: '1',
  beschikkingNummer: 101,
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
  beschikkingNummer: 102,
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
  beschikkingNummer: 102,
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
  beschikkingNummer: 102,
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
  beschikkingNummer: 103,
  datumAanvraag: '2025-05-28',
  datumBeginLevering: null,
  datumBesluit: '2025-05-28',
  datumEindeGeldigheid: '2025-06-30',
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
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
  beschikkingNummer: 104,
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
    beschikkingNummer: 105,
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
  beschikkingNummer: 106,
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
  beschikkingNummer: 107,
  datumAanvraag: '2025-03-29',
  datumBeginLevering: null,
  datumBesluit: '2025-04-01',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: '2025-05-01',
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

const defaultAuthProfileAndToken = getAuthProfileAndToken();
defaultAuthProfileAndToken.profile.id = ONTVANGER_ID;

function transformRegelingenForFrontend(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  authProfileAndToken?: AuthProfileAndToken
): HLIRegelingFrontend[] {
  return forTesting.transformRegelingenForFrontend(
    authProfileAndToken ?? defaultAuthProfileAndToken,
    aanvragen,
    new Date()
  );
}

afterEach(() => {
  Mockdate.reset();
});

/** The following tests heavily use toMatchObject because I don't care about the following fields:
 *    document.id: Contains encryption and will always be different.
 *    document.url: Same as above.
 *  These are checked once for existing and containing data.
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
        status: 'Aanvraag',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        description: '',
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        documents: [
          {
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        isActive: true,
        isChecked: true,
        isVisible: true,
        description: descriptions.inBehandeling,
      },
      {
        id: 'status-step-3',
        status: 'Einde recht',
        datePublished: '',
        isActive: false,
        isChecked: false,
        isVisible: true,
        documents: [],
        description: descriptions.inactiveEindeRecht,
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

  test('Single Aanvraag toegewezen voor meerdere betrokkenen', () => {
    const aanvragen = replacePropsInAanvragen([RTM_1_AANVRAAG], {
      betrokkenen: [
        { bsn: ONTVANGER_ID, isAanvrager: true },
        { bsn: '222222222' },
      ],
      bsnAanvrager: ONTVANGER_ID,
    });
    const regelingen = transformRegelingenForFrontend(aanvragen);

    const expectedRegelingenAmount = 2;
    expect(regelingen.length).toBe(expectedRegelingenAmount);

    const expectedRegeling = {
      dateDecision: '2025-02-01',
      dateEnd: '2026-05-01',
      dateStart: '2025-05-01',
      decision: 'toegewezen',
      displayStatus: 'In behandeling genomen',
      documents: [],
      id: '1',
      isActual: true,
      title: 'Regeling Tegemoetkoming Meerkosten',
    };
    const expectedSteps = [
      {
        id: 'status-step-1',
        status: 'Aanvraag',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        description: '',
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        documents: [
          {
            title: 'AV-RTM Info aan klant GGD',
          },
        ],
        isActive: true,
        isChecked: true,
        isVisible: true,
        description: descriptions.inBehandelingVoorMeerdereBetrokkenen,
      },
      {
        id: 'status-step-3',
        status: 'Einde recht',
        datePublished: '',
        isActive: false,
        isChecked: false,
        isVisible: true,
        documents: [],
        description: descriptions.inactiveEindeRecht,
      },
    ];

    expect(regelingen[0]).toMatchObject(expectedRegeling);
    expect(regelingen[0].steps).toMatchObject(expectedSteps);

    expect(regelingen[1]).toMatchObject(expectedRegeling);
    expect(regelingen[1].steps).toMatchObject(expectedSteps);
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
        description: descriptions.afgewezen,
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

  test('Single aanvraag for external betrokkenen is no longer shown because of expiry', () => {
    Mockdate.set('2025-01-02');

    const regelingen = transformRegelingenForFrontend([
      { ...RTM_1_AANVRAAG, datumEindeGeldigheid: '2025-01-01' },
    ]);

    expect(regelingen.length).toBe(0);
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
      dateDecision: RTM_2_MIGRATIE.datumBesluit,
      dateStart: RTM_2_MIGRATIE.datumIngangGeldigheid,
      dateEnd: null,
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Besluit',
        datePublished: RTM_2_MIGRATIE.datumBesluit,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [],
        description: descriptions.toegewezen,
      },
      {
        id: 'status-step-2',
        status: 'Einde recht',
        datePublished: '',
        documents: [],
        isActive: false,
        isChecked: false,
        isVisible: true,
        description: descriptions.inactiveEindeRecht,
      },
    ]);
  });

  test('Aanvraag -> Toegewezen -> Einde recht', () => {
    const aanvragen = attachIDs([RTM_1_AANVRAAG, RTM_2_EINDE_RECHT]);
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
        description: '',
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        description: descriptions.inBehandeling,
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
        description: descriptions.toegewezen,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking beëindigen RTM',
          },
        ],
      },
      {
        id: 'status-step-4',
        status: 'Einde recht',
        description: descriptions.activeEindeRecht,
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [],
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

  test('Aanvraag -> Toegewezen -> Wijzigings aanvraag -> Einde Recht', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_2_EINDE_RECHT,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_EINDE_RECHT.titel,
      isActual: false,
      dateDecision: RTM_2_EINDE_RECHT.datumBesluit,
      dateStart: RTM_2_EINDE_RECHT.datumIngangGeldigheid,
      dateEnd: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Einde recht',
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
        id: 'status-step-5',
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        documents: [],
        isActive: true,
        isChecked: true,
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

  test('Able to extract two regelingen from a list of aanvragen', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_EINDE_RECHT,
      RTM_1_AANVRAAG,
      RTM_2_EINDE_RECHT,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(2);

    const expectedRegeling = {
      title: RTM_2_EINDE_RECHT.titel,
      isActual: RTM_2_EINDE_RECHT.isActueel,
      dateDecision: RTM_2_EINDE_RECHT.datumBesluit,
      dateStart: RTM_2_EINDE_RECHT.datumIngangGeldigheid,
      dateEnd: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Einde recht',
      documents: [],
    };
    const expectedSteps = [
      {
        id: 'status-step-1',
        status: 'Aanvraag',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        description: '',
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
      {
        id: 'status-step-2',
        status: 'In behandeling genomen',
        datePublished: RTM_1_AANVRAAG.datumBesluit,
        description: descriptions.inBehandeling,
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
        description: descriptions.toegewezen,
        isActive: false,
        isChecked: true,
        isVisible: true,
        documents: [
          {
            title: 'Beschikking beëindigen RTM',
          },
        ],
      },
      {
        id: 'status-step-4',
        status: 'Einde recht',
        description: descriptions.activeEindeRecht,
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        isActive: true,
        isChecked: true,
        isVisible: true,
        documents: [],
      },
    ];

    expect(regelingen[0]).toMatchObject(expectedRegeling);
    expect(regelingen[0].steps).toMatchObject(expectedSteps);

    expect(regelingen[1]).toMatchObject(expectedRegeling);
    expect(regelingen[1].steps).toMatchObject(expectedSteps);
  });

  test('Only two regelingen expected', () => {
    const aanvragen = attachIDs([
      RTM_1_AANVRAAG,
      RTM_2_EINDE_RECHT,
      RTM_2_MIGRATIE,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_2_EINDE_RECHT,
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);

    expect(regelingen.length).toBe(2);
  });
});

describe('Ontvanger but aanvragen made by someone else', () => {
  const ONTVANGER_ID = '111111111';

  const authProfileAndToken = getAuthProfileAndToken();
  authProfileAndToken.profile.id = ONTVANGER_ID;

  function prepTestData(
    aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
  ): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
    const aanvragenWithIDs = attachIDs(aanvragen);
    return replacePropsInAanvragen(aanvragenWithIDs, {
      betrokkenen: [{ bsn: ONTVANGER_ID }],
      bsnAanvrager: '999999999',
    });
  }

  test('Besluit toegewezen', () => {
    const aanvragen = prepTestData([RTM_2_TOEGEWEZEN]);
    const regelingen = transformRegelingenForFrontend(
      aanvragen,
      authProfileAndToken
    );

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
        description: descriptions.toegewezen,
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
    const aanvragen = prepTestData([RTM_2_AFGEWEZEN]);
    const regelingen = transformRegelingenForFrontend(
      aanvragen,
      authProfileAndToken
    );

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
        description: descriptions.afgewezen,
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

  test('Besluit toegewezen -> Wijzigings aanvraag -> Wijzigings toegewezen', () => {
    const aanvragen = prepTestData([
      RTM_2_TOEGEWEZEN,
      RTM_WIJZIGINGS_AANVRAAG,
      RTM_WIJZIGINGS_TOEKENNING,
    ]);
    const regelingen = transformRegelingenForFrontend(
      aanvragen,
      authProfileAndToken
    );

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_WIJZIGINGS_TOEKENNING.titel,
      isActual: true,
      dateDecision: RTM_WIJZIGINGS_TOEKENNING.datumBesluit,
      dateStart: RTM_WIJZIGINGS_TOEKENNING.datumIngangGeldigheid,
      dateEnd: RTM_WIJZIGINGS_TOEKENNING.datumEindeGeldigheid,
      decision: 'toegewezen',
      displayStatus: 'Toegewezen',
      documents: [],
    });
    expect(regeling.steps).toMatchObject([
      {
        id: 'status-step-1',
        status: 'Besluit',
        datePublished: RTM_2_TOEGEWEZEN.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        description: descriptions.toegewezen,
        documents: [
          {
            title: 'Beschikking toekenning Reg Tegemoetk Meerkosten',
          },
        ],
      },
      {
        id: 'status-step-2',
        status: 'Aanvraag wijziging',
        isActive: false,
        isChecked: true,
        isVisible: true,
        datePublished: '2025-08-18',
        description: descriptions.wijzigingsAanvraag,
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
        status: 'Besluit wijziging',
        isActive: true,
        isChecked: true,
        isVisible: true,
        description: descriptions.wijzigingsBesluit,
        datePublished: RTM_WIJZIGINGS_TOEKENNING.datumBesluit,
        documents: [
          {
            datePublished: '2025-08-18T14:57:41.793',
            title: 'Beschikking wijziging RTM',
          },
        ],
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

  test('Besluit toegewezen -> Einde Recht', () => {
    const aanvragen = prepTestData([RTM_2_EINDE_RECHT]);
    const regelingen = transformRegelingenForFrontend(
      aanvragen,
      authProfileAndToken
    );

    expect(regelingen.length).toBe(1);

    const regeling = regelingen[0];

    expect(regeling).toMatchObject({
      title: RTM_2_EINDE_RECHT.titel,
      isActual: false,
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
        status: 'Besluit',
        datePublished: RTM_2_TOEGEWEZEN.datumBesluit,
        isActive: false,
        isChecked: true,
        isVisible: true,
        description: descriptions.toegewezen,
        documents: [
          {
            title: 'Beschikking beëindigen RTM',
          },
        ],
      },
      {
        id: 'status-step-2',
        status: 'Einde recht',
        datePublished: RTM_2_EINDE_RECHT.datumEindeGeldigheid,
        isActive: true,
        isChecked: true,
        isVisible: true,
        description: descriptions.activeEindeRechtAtChild,
        documents: [],
      },
    ]);
  });
});

describe('Mixed betrokkenen', () => {
  test.skip('Migratie into toegewezen with different but overlapping betrokkenen', () => {
    const betrokkeneAanvrager: Betrokkene = {
      bsn: ONTVANGER_ID,
      isAanvrager: true,
    };
    const betrokkeneOther: Betrokkene = { bsn: '111111111' };
    const betrokkenenAll: Betrokkene[] = [betrokkeneAanvrager, betrokkeneOther];
    const aanvragen = attachIDs([
      RTM_2_MIGRATIE,
      replaceBetrokkenen(RTM_WIJZIGINGS_AANVRAAG, betrokkenenAll),
      RTM_WIJZIGINGS_TOEKENNING,
      replaceBetrokkenen(RTM_WIJZIGINGS_AANVRAAG, [betrokkeneOther]),
      replaceBetrokkenen(RTM_WIJZIGINGS_AANVRAAG, [betrokkeneOther]),
    ]);
    const regelingen = transformRegelingenForFrontend(aanvragen);
    expect(regelingen.length).toBe(2);

    const regelingAanvrager = regelingen[1];
    const regelingOther = regelingen[0];

    expect(regelingAanvrager).toMatchObject({
      betrokkenen: '999999999 - Flex',
    });
    expect(regelingAanvrager.steps).toMatchObject([
      { status: 'Besluit' },
      { status: 'Aanvraag wijziging' },
      { status: 'Besluit wijziging', isActive: true },
      { status: 'Einde recht', isActive: false },
    ]);
    expect(regelingOther).toMatchObject({
      betrokkenen: '111111111 - Flex',
    });
    expect(regelingOther.steps).toMatchObject([
      { status: 'Aanvraag wijziging', isActive: false },
      { status: 'Aanvraag wijziging', isActive: false },
      { status: 'Aanvraag wijziging', isActive: true },
    ]);
  });
});

// RP TODO: When testing a long chain, make it contaitn some complicated ID's like here.
// Then we no longer need to have this test.
test('Correctly sorted on the first part of the id', () => {
  const regelingen = transformRegelingenForFrontend([
    { ...RTM_2_TOEGEWEZEN, id: '11-22' },
    { ...RTM_WIJZIGINGS_AANVRAAG, id: '12-22' },
    { ...RTM_1_AANVRAAG, id: '10-22' },
    { ...RTM_2_EINDE_RECHT, id: '13-22' },
    { ...RTM_2_TOEGEWEZEN, id: '21-11' },
    { ...RTM_WIJZIGINGS_AANVRAAG, id: '22-11' },
    { ...RTM_1_AANVRAAG, id: '20-11' },
  ]);
  // Only the end of the ids are taken from the aanvragen chain when being combined into a regeling.
  expect(regelingen.map((r) => r.id)).toStrictEqual(['13-22', '22-11']);
});

test('Does not contain docx (word) documents', () => {
  const regelingen = transformRegelingenForFrontend([
    {
      ...RTM_1_AANVRAAG,
      documenten: [
        {
          id: '1',
          title: 'Info bij regeling',
          filename: 'abc.docx',
          url: '',
          datePublished: '2025-01-01',
        },
      ],
    },
  ]);

  expect(regelingen.length).toBe(1);
  const regeling = regelingen[0];
  expect(regeling.documents).toStrictEqual([]);

  const statusLineDocs = regeling.steps.flatMap((step) => step.documents);
  expect(statusLineDocs).toStrictEqual([]);
});
