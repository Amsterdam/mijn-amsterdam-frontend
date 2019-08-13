import { FocusProduct, formatFocusProduct } from './focus';
const inputData: FocusProduct = {
  _id: '0-20',
  dienstverleningstermijn: 21,
  inspanningsperiode: 28,
  naam: 'Levensonderhoud',
  processtappen: {
    aanvraag: {
      datum: '2015-12-29T00:00:00+01:00',
      document: [
        {
          $ref: '/focus/document?id=3428561&isBulk=false&isDms=false',
          id: 3428561,
          isBulk: false,
          isDms: false,
          omschrijving: 'Documentje!',
        },
        {
          $ref: '/focus/document?id=6043736&isBulk=true&isDms=false',
          id: 6043736,
          isBulk: true,
          isDms: false,
          omschrijving: 'Documentje!',
        },
      ],
    },
    beslissing: {
      datum: '2016-02-02T00:00:00+01:00',
      document: [
        {
          $ref: '/focus/document?id=3428561&isBulk=false&isDms=false',
          id: 3428561,
          isBulk: false,
          isDms: false,
          omschrijving: 'Documentje!',
        },
        {
          $ref: '/focus/document?id=6043736&isBulk=true&isDms=false',
          id: 6043736,
          isBulk: true,
          isDms: false,
          omschrijving: 'Documentje!',
        },
      ],
    },
    bezwaar: null,
    herstelTermijn: null,
    inBehandeling: {
      datum: '2015-12-29T00:00:00+01:00',
      document: [
        {
          $ref: '/focus/document?id=3428561&isBulk=false&isDms=false',
          id: 3428561,
          isBulk: false,
          isDms: false,
          omschrijving: 'Documentje!',
        },
        {
          $ref: '/focus/document?id=6043736&isBulk=true&isDms=false',
          id: 6043736,
          isBulk: true,
          isDms: false,
          omschrijving: 'Documentje!',
        },
      ],
    },
  },
  soortProduct: 'Participatiewet',
  typeBesluit: 'Toekenning',
};

const formattedFocusProduct = {
  id: '0-20',
  chapter: 'INKOMEN',
  datePublished: '02 februari 2016',
  title: 'Bijstandsuitkering',
  description:
    'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.\n          [Bekijk hier de betaaldata van de uitkering](https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D)',
  latestStep: 'beslissing',
  inProgress: false,
  isGranted: true,
  isDenied: false,
  link: {
    title: 'Meer informatie',
    to: '/werk-en-inkomen/bijstandsuitkering/0-20',
  },
  productTitle: 'Levensonderhoud',
  process: [
    {
      id: '0-20-aanvraag',
      title: 'Bijstandsuitkering',
      datePublished: '2015-12-29T00:00:00+01:00',
      description:
        'U hebt op 29 december 2015 een bijstandsuitkering aangevraagd.\n\n        [Wat kunt u van ons verwachten?](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7BEC85F0ED-0D9E-46F3-8B2E-E80403D3D5EA%7D#case_%7BB7EF73CD-8A99-4F60-AB6D-02CB9A6BAF6F%7D)',
      documents: [
        {
          id: '3428561',
          title: 'Documentje!',
          url: '/api/focus/document?id=3428561&isBulk=false&isDms=false',
          datePublished: '2015-12-29T00:00:00+01:00',
          type: 'aanvraag',
        },
        {
          id: '6043736',
          title: 'Documentje!',
          url: '/api/focus/document?id=6043736&isBulk=true&isDms=false',
          datePublished: '2015-12-29T00:00:00+01:00',
          type: 'aanvraag',
        },
      ],
      isActual: false,
      status: 'Aanvraag',
      aboutStep: 'aanvraag',
    },
    {
      id: '0-20-inBehandeling',
      title: 'Bijstandsuitkering',
      datePublished: '2015-12-29T00:00:00+01:00',
      description:
        'Wij gaan nu bekijken of u recht hebt op bijstand. Het kan zijn dat u nog extra informatie moet opsturen.\n        U ontvangt vóór 16 februari 2016 ons besluit.\n\n        \n        Lees meer over uw \n        [rechten](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?caseid=%7bF00E2134-0317-4981-BAE6-A4802403C2C5%7d) en [plichten](https://www.amsterdam.nl/veelgevraagd/hoe-vraag-ik-een-bijstandsuitkering-aan/?productid=%7b42A997C5-4FCA-4BC2-BF8A-95DFF6BE7121%7d)\n        ',
      documents: [
        {
          id: '3428561',
          title: 'Documentje!',
          url: '/api/focus/document?id=3428561&isBulk=false&isDms=false',
          datePublished: '2015-12-29T00:00:00+01:00',
          type: 'inBehandeling',
        },
        {
          id: '6043736',
          title: 'Documentje!',
          url: '/api/focus/document?id=6043736&isBulk=true&isDms=false',
          datePublished: '2015-12-29T00:00:00+01:00',
          type: 'inBehandeling',
        },
      ],
      isActual: false,
      status: 'In behandeling',
      aboutStep: 'inBehandeling',
    },
    {
      id: '0-20-beslissing',
      title: 'Bijstandsuitkering',
      datePublished: '2016-02-02T00:00:00+01:00',
      description:
        'U heeft recht op een bijstandsuitkering. Bekijk de brief voor meer details.\n          [Bekijk hier de betaaldata van de uitkering](https://www.amsterdam.nl/veelgevraagd/?caseid=%7BEB3CC77D-89D3-40B9-8A28-779FE8E48ACE%7D)',
      documents: [
        {
          id: '3428561',
          title: 'Documentje!',
          url: '/api/focus/document?id=3428561&isBulk=false&isDms=false',
          datePublished: '2016-02-02T00:00:00+01:00',
          type: 'beslissing',
        },
        {
          id: '6043736',
          title: 'Documentje!',
          url: '/api/focus/document?id=6043736&isBulk=true&isDms=false',
          datePublished: '2016-02-02T00:00:00+01:00',
          type: 'beslissing',
        },
      ],
      isActual: true,
      status: 'Beslissing',
      aboutStep: 'beslissing',
    },
  ],
  update: {
    id: '0-20-beslissing',
    datePublished: '2016-02-02T00:00:00+01:00',
    chapter: 'INKOMEN',
    title: 'Bijstandsuitkering: Uw aanvraag is toegekend',
    description:
      'U heeft recht op een bijstandsuitkering (besluit: 02 februari 2016).',
    isActual: false,
    link: {
      to: '/werk-en-inkomen/bijstandsuitkering/0-20#0-20-beslissing',
      title: 'Meer informatie',
    },
  },
};

describe('Focus data formatting', () => {
  it('format correctly', () => {
    expect(formatFocusProduct(inputData)).toEqual(formattedFocusProduct);
  });
});
