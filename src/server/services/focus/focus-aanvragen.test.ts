import { transformFOCUSAanvragenData } from './focus-aanvragen';
import {
  contentLabels,
  contentDocumentTitles,
} from './focus-aanvragen-content';
import { transformFocusTozo } from './focus-tozo';
import { FocusTozoDocument } from './focus-combined';
import { FocusProduct, Decision } from './focus-types';
import {
  isRecentItem,
  calculateUserActionDeadline,
  calculateDecisionDeadline,
  getDecision,
  getLatestStep,
} from './focus-helpers';

const testData: FocusProduct[] = [
  {
    _id: '123123123',
    dienstverleningstermijn: 28,
    inspanningsperiode: 28,
    datePublished: '2020-04-03T00:00:00',
    naam: 'Voorschot Tozo (voor ondernemers) (Eenm.)',
    processtappen: {
      aanvraag: {
        datum: '2020-04-03T00:00:00',
        document: [],
      },
      beslissing: {
        datum: '2020-04-03T00:00:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000027&isBulk=false&isDms=false',
            id: 660000000000027,
            isBulk: false,
            isDms: false,
            omschrijving: 'Voorschot Tozo (voor ondernemers) (Eenm.)',
          },
        ],
      },
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: {
        datum: '2020-04-03T00:00:00',
        document: [],
      },
    },
    soortProduct: 'Bijzondere Bijstand',
    typeBesluit: 'Toekenning',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 42,
    inspanningsperiode: 28,
    datePublished: '2019-07-08T15:05:52+02:00',
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        datum: '2019-07-08T15:05:52+02:00',
        document: [
          {
            $ref: 'focus/document?id=4400000004&isBulk=true&isDms=false',
            id: 4400000004,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (papier)',
          },
          {
            $ref: 'focus/document?id=4400000005&isBulk=true&isDms=false',
            id: 4400000005,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (balie)',
          },
          {
            $ref: 'focus/document?id=4400000006&isBulk=true&isDms=false',
            id: 4400000006,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (digitaal)',
          },
        ],
      },
      beslissing: null,
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: null,
    },
    soortProduct: 'Minimafonds',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 42,
    inspanningsperiode: 28,
    datePublished: '2019-07-08T15:05:52+02:00',
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        datum: '2019-07-07T15:05:52+02:00',
        document: [
          {
            $ref: 'focus/document?id=4400000004&isBulk=true&isDms=false',
            id: 4400000004,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (papier)',
          },
          {
            $ref: 'focus/document?id=4400000005&isBulk=true&isDms=false',
            id: 4400000005,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (balie)',
          },
          {
            $ref: 'focus/document?id=4400000006&isBulk=true&isDms=false',
            id: 4400000006,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (digitaal)',
          },
        ],
      },
      beslissing: null,
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: {
        datum: '2019-07-08T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Minimafonds',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 42,
    inspanningsperiode: 28,
    datePublished: '2019-07-06T15:05:52+02:00',
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        datum: '2019-07-03T15:05:52+02:00',
        document: [
          {
            $ref: 'focus/document?id=4400000004&isBulk=true&isDms=false',
            id: 4400000004,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (papier)',
          },
          {
            $ref: 'focus/document?id=4400000005&isBulk=true&isDms=false',
            id: 4400000005,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (balie)',
          },
          {
            $ref: 'focus/document?id=4400000006&isBulk=true&isDms=false',
            id: 4400000006,
            isBulk: true,
            isDms: false,
            omschrijving: 'Aanvraag Stadspas (digitaal)',
          },
        ],
      },
      beslissing: null,
      bezwaar: null,
      herstelTermijn: {
        aantalDagenHerstelTermijn: '10',
        datum: '2019-07-06T15:05:52+02:00',
        document: [],
      },
      inBehandeling: {
        datum: '2019-07-04T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Minimafonds',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    datePublished: '2019-07-28T15:05:51+02:00',
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        datum: '2019-07-24T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000004&isBulk=false&isDms=false',
            id: 660000000000004,
            isBulk: false,
            isDms: false,
            omschrijving: 'Aanvraag WWB (GALO)',
          },
        ],
      },
      beslissing: {
        datum: '2019-07-28T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000005&isBulk=false&isDms=false',
            id: 660000000000005,
            isBulk: false,
            isDms: false,
            omschrijving: 'Afwijzen Levensonderhoud (BIJ)',
          },
        ],
      },
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: {
        datum: '2019-07-25T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Toekenning',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    datePublished: '2019-05-07T15:05:51+02:00',
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        datum: '2019-04-09T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000006&isBulk=false&isDms=false',
            id: 660000000000006,
            isBulk: false,
            isDms: false,
            omschrijving: 'Aanvraag WWB (GALO)',
          },
        ],
      },
      beslissing: {
        datum: '2019-05-07T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000007&isBulk=false&isDms=false',
            id: 660000000000007,
            isBulk: false,
            isDms: false,
            omschrijving: 'Afwijzen Levensonderhoud',
          },
        ],
        reden: 'Test LO',
      },
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: {
        datum: '2019-04-11T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Afwijzing',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    datePublished: '2019-06-08T15:05:51+02:00',
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        datum: '2019-05-09T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000008&isBulk=false&isDms=false',
            id: 660000000000008,
            isBulk: false,
            isDms: false,
            omschrijving: 'Aanvraag WWB (GALO)',
          },
        ],
      },
      beslissing: {
        datum: '2019-06-08T15:05:51+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000009&isBulk=false&isDms=false',
            id: 660000000000009,
            isBulk: false,
            isDms: false,
            omschrijving: 'Toekennen Levensonderhoud (BIJ)',
          },
        ],
      },
      bezwaar: null,
      herstelTermijn: {
        aantalDagenHerstelTermijn: '20',
        datum: '2019-05-19T15:05:51+02:00',
        document: [],
      },
      inBehandeling: {
        datum: '2019-05-11T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Toekenning',
  },
  {
    _id: '123123123',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    datePublished: '2019-07-03T15:05:52+02:00',
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        datum: '2019-06-08T15:05:52+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000010&isBulk=false&isDms=false',
            id: 660000000000010,
            isBulk: false,
            isDms: false,
            omschrijving: 'Aanvraag WWB (GALO)',
          },
          {
            $ref: 'focus/document?id=660000000000019&isBulk=false&isDms=false',
            id: 660000000000019,
            isBulk: false,
            isDms: false,
            omschrijving: 'Aanvraag WWB (GALO)',
          },
        ],
      },
      beslissing: {
        datum: '2019-07-03T15:05:52+02:00',
        document: [
          {
            $ref: 'focus/document?id=660000000000011&isBulk=false&isDms=false',
            id: 660000000000011,
            isBulk: false,
            isDms: false,
            omschrijving: 'Niet in behandeling nemen',
          },
        ],
      },
      bezwaar: null,
      herstelTermijn: {
        aantalDagenHerstelTermijn: '15',
        datum: '2019-06-13T15:05:52+02:00',
        document: [],
      },
      inBehandeling: {
        datum: '2019-06-11T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: '  Buiten   BEHANDELING' as Decision, // writing of the decision name is being normalized
  },
  {
    _id: '999999',
    dienstverleningstermijn: 28,
    inspanningsperiode: 28,
    datePublished: '2020-05-12T00:00:00+02:00',
    naam: 'Bijzondere bijstand',
    processtappen: {
      aanvraag: {
        datum: '2020-05-12T00:00:00+02:00',
        document: [],
      },
      beslissing: null,
      bezwaar: null,
      herstelTermijn: null,
      inBehandeling: null,
    },
    soortProduct: 'Bijzondere Bijstand',
  },
];

const tozoDocumenten: FocusTozoDocument[] = [
  {
    datePublished: '2020-03-31T18:59:46+02:00',
    type: 'E-AANVR-TOZO',
    description: 'Tegemoetkoming Ondernemers en Zelfstandigen',
    id: '4400000031',
    url: 'focus/document?id=4400000031&isBulk=true&isDms=false',
  },
  {
    datePublished: '2020-03-26T15:18:44+01:00',
    type: 'E-AANVR-KBBZ',
    description: 'Verkorte Aanvraag BBZ',
    id: '4400000024',
    url: 'focus/document?id=4400000024&isBulk=true&isDms=false',
  },
];

describe('FOCUS_AANVRAGEN service', () => {
  it('formats the focus aanvragen STADSPAS/BIJSTAND items correctly ', () => {
    expect(
      transformFOCUSAanvragenData(
        testData,
        new Date('2018-01-01'),
        contentLabels,
        contentDocumentTitles
      )
    ).toMatchSnapshot();
  });
  it('leaves out BIJZONDER BIJSTAND items ', () => {
    const data = transformFOCUSAanvragenData(
      testData,
      new Date('2018-01-01'),
      contentLabels,
      contentDocumentTitles
    );
    expect(
      // Filter out allowed items
      data.filter(
        ({ item }) => !['Stadspas', 'Bijstandsuitkering'].includes(item.title)
      )
    ).toStrictEqual([]);
  });
  it('formats the focus aanvragen TOZO items correctly ', () => {
    expect(
      transformFocusTozo({
        documenten: tozoDocumenten,
        aanvragen: testData,
        contentLabels,
        contentDocumentTitles,
        compareDate: new Date('2020-04-01'),
      })
    ).toMatchSnapshot();
  });

  it('isRecentItem should be different', () => {
    const steps = {
      beslissing: {
        datum: '2020-05-07',
      },
    } as FocusProduct['processtappen'];

    const compareToDate = new Date('2020-05-12');
    expect(isRecentItem('afwijzing', steps, compareToDate)).toBe(true);

    steps.beslissing!.datum = '2019-04-01';
    expect(isRecentItem('afwijzing', steps, compareToDate)).toBe(false);
  });

  it('calculates deadline correctly', () => {
    expect(calculateUserActionDeadline('2020-05-07', 5)).toBe('12 mei 2020');
  });

  it('calculates user action deadline correctly', () => {
    expect(calculateDecisionDeadline('2020-05-07', 5, 5, 5)).toBe(
      '22 mei 2020'
    );
    expect(calculateDecisionDeadline('2020-05-07', 5, 5)).toBe('17 mei 2020');
  });

  it('transforms decision correctly', () => {
    expect(getDecision('Buiten Behandeling')).toBe('buitenbehandeling');
  });

  it('get the correct step', () => {
    const steps = {
      beslissing: {
        datum: '2020-05-07',
      },
    } as FocusProduct['processtappen'];
    expect(getLatestStep(steps)).toBe('beslissing');
  });
  it('get the correct step', () => {
    const steps = {
      bliep: {},
    } as any;
    expect(getLatestStep(steps)).toBe('aanvraag');
  });
});
