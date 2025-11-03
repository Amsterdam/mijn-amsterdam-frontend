export type RTMAanvraagTestResult = {
  id: number;
  persoon: string;
  steps: string[];
  displayStatus: string;
  testTitle?: string;
};

export const aanvragenTestsetResults = [
  {
    testTitle: 'Mix of RMT and RTM1, multiple betrokkenen',
    id: 1,
    persoon: 'Persoon A',
    steps: [
      'Besluit',
      'Aanvraag wijziging',
      'Besluit wijziging',
      'Einde recht',
    ],
    displayStatus: 'Besluit wijziging',
  },
  {
    testTitle: 'Mix of RMT and RTM1, multiple betrokkenen',
    id: 2,
    persoon: 'Persoon B',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple afgewezen aanvragen with single betrokkene',
    id: 3,
    persoon: 'Persoon A3',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Besluit',
      'Aanvraag wijziging',
      'Aanvraag wijziging',
      'Besluit wijziging',
      'Aanvraag wijziging',
      'Besluit wijziging',
      'Einde recht',
    ],
    displayStatus: 'Besluit wijziging',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple afgewezen aanvragen with multiple betrokkenen, only aanvragen voor betrokkenen.',
    id: 4,
    persoon: 'Persoon C, Persoon D',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'Aanvraag',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, aanvraag voor Aanvrager/Ontvanger en aanvraag voor betrokkene. - Afgewezen aanvraag results in orphan.',
    id: 5,
    persoon: 'Persoon F',
    steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
    displayStatus: 'Besluit',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, aanvraag voor Aanvrager/Ontvanger en aanvraag voor betrokkene. - Afgewezen aanvraag results in orphan.',
    id: 6,
    persoon: 'Persoon G',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Single betrokkene, only ontvanger.',
    id: 7,
    persoon: 'Persoon H',
    steps: ['Besluit', 'Besluit', 'Besluit', 'Besluit', 'Einde recht'],
    displayStatus: 'Besluit',
  },
  {
    testTitle: 'Ontvanger turns 18 and needs to request RTM1 for self.',
    id: 8,
    persoon: 'Persoon I',
    steps: ['Besluit', 'Besluit wijziging', 'Besluit wijziging', 'Einde recht'],
    displayStatus: 'Einde recht',
  },
  {
    testTitle: 'Ontvanger turns 18 and needs to request RTM1 for self.',
    id: 9,
    persoon: 'Persoon I',
    steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
    displayStatus: 'Besluit',
  },
  {
    testTitle:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    id: 10,
    persoon: 'Persoon J',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Besluit',
      'Aanvraag wijziging',
      'Besluit wijziging',
      'Einde recht',
    ],
    displayStatus: 'Einde recht',
  },
  {
    testTitle:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    id: 11,
    persoon: 'Persoon J',
    steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
    displayStatus: 'Einde recht',
  },
  {
    testTitle:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    id: 12,
    persoon: 'Persoon J',
    steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
    displayStatus: 'Besluit',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    id: 13,
    persoon: 'Persoon K',
    steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
    displayStatus: 'Einde recht',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    id: 14,
    persoon: 'Persoon L',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    id: 15,
    persoon: 'Persoon K',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Besluit',
      'Aanvraag wijziging',
      'Einde recht',
    ],
    displayStatus: 'Aanvraag wijziging',
  },
  {
    testTitle: 'Aanvraag mixed 2 - Alleen ontvangers',
    id: 16,
    persoon: 'Persoon Y',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Aanvraag mixed 2 - Alleen ontvangers',
    id: 17,
    persoon: 'Persoon Z',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Aanvraag mixed 2 - Alleen ontvangers',
    id: 18,
    persoon: 'Persoon N',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Aanvraag mixed 3 - Alleen ontvangers',
    id: 19,
    persoon: 'Persoon O',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Aanvraag mixed 3 - Alleen ontvangers',
    id: 20,
    persoon: 'Persoon P',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Aanvraag mixed 3 - Alleen ontvangers',
    id: 21,
    persoon: 'Persoon Q',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      "We assume these aanvragen belong to the same person, but we cannot know for sure. - Eventough there are no betrokkenen in the afgewezen aanvragen, we assume it's the same person as the toegewezen aanvraag.",
    id: 22,
    persoon: 'Persoon C1',
    steps: [
      'Aanvraag',
      'Aanvraag',
      'Aanvraag',
      'Aanvraag',
      'Aanvraag',
      'In behandeling genomen',
    ],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.',
    id: 23,
    persoon: 'Persoon A1',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.',
    id: 24,
    persoon: 'Persoon B1',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle: 'Some other exotic combinations',
    id: 25,
    persoon: 'Persoon D1',
    steps: [
      'Aanvraag',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'Besluit',
      'Aanvraag wijziging',
      'Einde recht',
    ],
    displayStatus: 'Aanvraag wijziging',
  },
  {
    testTitle: 'Single toegewezen aanvraag with end date / Verlopen aanvraag',
    id: 26,
    persoon: 'Persoon E1',
    steps: ['Aanvraag', 'In behandeling genomen'],
    displayStatus: 'In behandeling genomen',
  },
  {
    testTitle:
      'Multiple aanvragen in weird combination, leading to single statstrein for single betrokkene',
    id: 27,
    persoon: 'Persoon A4',
    steps: [
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'In behandeling genomen',
      'Aanvraag',
      'Besluit',
      'Besluit wijziging',
      'Besluit wijziging',
      'Einde recht',
    ],
    displayStatus: 'Besluit wijziging',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, aanvraag voor Aanvrager/Ontvanger en aanvraag voor betrokkene. - Afgewezen aanvraag results in orphan.',
    id: 60,
    persoon: '',
    steps: ['Aanvraag'],
    displayStatus: 'Aanvraag',
  },
  {
    testTitle:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    id: 61,
    persoon: '',
    steps: ['Aanvraag'],
    displayStatus: 'Aanvraag',
  },
  {
    testTitle:
      'Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.',
    id: 62,
    persoon: '',
    steps: ['Aanvraag', 'Aanvraag', 'Aanvraag'],
    displayStatus: 'Aanvraag',
  },
];
