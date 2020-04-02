import { FocusProduct, formatFocusProduct } from './focus';

const testData = [
  {
    _id: '0-0',
    _meest_recent: 'aanvraag',
    dienstverleningstermijn: 42,
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        _id: 0,
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
    _id: '0-1',
    _meest_recent: 'inBehandeling',
    dienstverleningstermijn: 42,
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 1,
        datum: '2019-07-08T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Minimafonds',
  },
  {
    _id: '0-2',
    _meest_recent: 'herstelTermijn',
    dienstverleningstermijn: 42,
    naam: 'Stadspas',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 2,
        aantalDagenHerstelTermijn: '10',
        datum: '2019-07-06T15:05:52+02:00',
        document: [],
      },
      inBehandeling: {
        _id: 1,
        datum: '2019-07-04T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Minimafonds',
  },
  {
    _id: '1-0',
    _meest_recent: 'beslissing',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 3,
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
        _id: 1,
        datum: '2019-07-25T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Toekenning',
  },
  {
    _id: '1-1',
    _meest_recent: 'beslissing',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 3,
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
        _id: 1,
        datum: '2019-04-11T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Afwijzing',
  },
  {
    _id: '1-2',
    _meest_recent: 'beslissing',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 3,
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
        _id: 2,
        aantalDagenHerstelTermijn: '20',
        datum: '2019-05-19T15:05:51+02:00',
        document: [],
      },
      inBehandeling: {
        _id: 1,
        datum: '2019-05-11T15:05:51+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: 'Toekenning',
  },
  {
    _id: '1-3',
    _meest_recent: 'beslissing',
    dienstverleningstermijn: 21,
    inspanningsperiode: 28,
    naam: 'Levensonderhoud',
    processtappen: {
      aanvraag: {
        _id: 0,
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
        _id: 3,
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
        _id: 2,
        aantalDagenHerstelTermijn: '15',
        datum: '2019-06-13T15:05:52+02:00',
        document: [],
      },
      inBehandeling: {
        _id: 1,
        datum: '2019-06-11T15:05:52+02:00',
        document: [],
      },
    },
    soortProduct: 'Participatiewet',
    typeBesluit: '  Buiten   BEHANDELING', // writing of the decision name is being normalized
  },
];

describe('Focus data formatting', () => {
  testData.forEach(item => {
    it('format correctly ' + item.naam + '--' + item._id, () => {
      const d = new Date(2019, 7, 13);
      expect(formatFocusProduct(item as FocusProduct, d)).toMatchSnapshot();
    });
  });
});
