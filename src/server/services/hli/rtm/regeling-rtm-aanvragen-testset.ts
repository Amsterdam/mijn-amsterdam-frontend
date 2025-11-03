export type RTMAanvraagProps = {
  productIdentificatie: 'AV-RTM1' | 'AV-RTM';
  betrokkenen: string[];
  resultaat: 'toegewezen' | 'afgewezen';
  datumEindeGeldigheid: string | null;
};

export type RTMAanvraagTestResult = {
  id: number;
  persoon: string;
  steps: string[];
  displayStatus: string;
};

export type RTMTestInput = {
  title: string;
  aanvragen: RTMAanvraagProps[];
  expected: RTMAanvraagTestResult[];
};

export const RTM1 = 'AV-RTM1';
export const RTM2 = 'AV-RTM';
export const TOE = 'toegewezen';
export const AFW = 'afgewezen';

// ZorgnedAanvraagTransformed with only the properties needed for the testset
export function aanvraag(
  productIdentificatie: string,
  resultaat: 'toegewezen' | 'afgewezen',
  betrokkenen: string[] = [],
  otherProps?: {
    id?: string;
    titel?: string;
    datumAanvraag?: string;
    datumBesluit?: string;
    datumEindeGeldigheid?: string | null;
    documenten?: unknown[];
    beschiktProductIdentificatie?: string;
    betrokkenPersonen?: unknown[];
    productOmschrijving?: string;
  }
) {
  const aanvraag = {
    titel: 'Regeling tegemoetkoming meerkosten',
    productIdentificatie,
    betrokkenen,
    resultaat,
    ...otherProps,
  };
  return aanvraag;
}

export const aanvragenTestsetInput = [
  {
    title: 'Mix of RTM and RTM1, multiple betrokkenen',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['A', 'B']),
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['B']),
      aanvraag(RTM1, TOE, ['B']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, multiple afgewezen aanvragen with single betrokkene',
    aanvragen: [
      aanvraag(RTM1, TOE, ['A3']),
      aanvraag(RTM2, TOE, ['A3']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['A3']),
      aanvraag(RTM2, AFW),
      aanvraag(RTM1, TOE, ['A3']),
      aanvraag(RTM2, TOE, ['A3']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, multiple afgewezen aanvragen with multiple betrokkenen, only aanvragen voor betrokkenen.',
    aanvragen: [
      aanvraag(RTM1, TOE, ['C', 'D']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['C', 'D']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, aanvraag voor Aanvrager/Ontvanger en aanvraag voor betrokkene. - Afgewezen aanvraag results in orphan.',
    aanvragen: [
      aanvraag(RTM1, TOE, ['F']),
      aanvraag(RTM1, TOE, ['G']),
      aanvraag(RTM2, TOE, ['F']),
      aanvraag(RTM1, AFW),
    ],
    expected: [
      {
        id: 5,
        persoon: 'Persoon F',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
      {
        id: 6,
        persoon: 'Persoon G',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 60,
        persoon: '',
        steps: ['Aanvraag'],
        displayStatus: 'Aanvraag',
      },
    ],
  },
  {
    title: 'Single betrokkene, only ontvanger.',
    aanvragen: [
      aanvraag(RTM2, AFW, ['H']),
      aanvraag(RTM2, AFW, ['H']),
      aanvraag(RTM2, TOE, ['H']),
      aanvraag(RTM2, AFW, ['H']),
    ],
    expected: [
      {
        id: 7,
        persoon: 'Persoon H',
        steps: ['Besluit', 'Besluit', 'Besluit', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
  {
    title: 'Ontvanger turns 18 and needs to request RTM1 for self.',
    aanvragen: [
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I'], { datumEindeGeldigheid: '2024-12-31' }),
      aanvraag(RTM1, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
    ],
    expected: [
      {
        id: 8,
        persoon: 'Persoon I',
        steps: [
          'Besluit',
          'Besluit wijziging',
          'Besluit wijziging',
          'Einde recht',
        ],
        displayStatus: 'Einde recht',
      },
      {
        id: 9,
        persoon: 'Persoon I',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
  {
    title:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    aanvragen: [
      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J']),
      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J'], { datumEindeGeldigheid: '2024-12-31' }),

      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J'], { datumEindeGeldigheid: '2024-12-31' }),

      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J']),
    ],
    expected: [
      {
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
        id: 11,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
      {
        id: 12,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    aanvragen: [
      aanvraag(RTM1, TOE, ['K', 'L']),
      aanvraag(RTM2, TOE, ['K'], { datumEindeGeldigheid: '2024-12-31' }),
      aanvraag(RTM1, TOE, ['L']),
      aanvraag(RTM1, TOE, ['K']),
      aanvraag(RTM2, TOE, ['K']),
      aanvraag(RTM1, TOE, ['L', 'K']),
      aanvraag(RTM1, AFW),
    ],
    expected: [
      {
        id: 13,
        persoon: 'Persoon K',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
      {
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
        id: 61,
        persoon: '',
        steps: ['Aanvraag'],
        displayStatus: 'Aanvraag',
      },
    ],
  },
  {
    title: 'Aanvraag mixed 2 - Alleen ontvangers',
    aanvragen: [
      aanvraag(RTM1, TOE, ['Z', 'Y']),
      aanvraag(RTM1, TOE, ['Z']),
      aanvraag(RTM1, TOE, ['Y', 'N']),
    ],
    expected: [
      {
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
        id: 18,
        persoon: 'Persoon N',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title: 'Aanvraag mixed 3 - Alleen ontvangers',
    aanvragen: [
      aanvraag(RTM1, TOE, ['O', 'P']),
      aanvraag(RTM1, TOE, ['O']),
      aanvraag(RTM1, TOE, ['P', 'Q']),
      aanvraag(RTM1, TOE, ['P']),
    ],
    expected: [
      {
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
        id: 21,
        persoon: 'Persoon Q',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title:
      "We assume these aanvragen belong to the same person, but we cannot know for sure. - Eventough there are no betrokkenen in the afgewezen aanvragen, we assume it's the same person as the toegewezen aanvraag.",
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['C1']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title:
      'Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.',
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['A1']),
      aanvraag(RTM1, TOE, ['B1']),
      aanvraag(RTM1, AFW),
    ],
    expected: [
      {
        id: 23,
        persoon: 'Persoon A1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 24,
        persoon: 'Persoon B1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 62,
        persoon: '',
        steps: ['Aanvraag', 'Aanvraag', 'Aanvraag'],
        displayStatus: 'Aanvraag',
      },
    ],
  },
  {
    title: 'Some other exotic combinations',
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['D1']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM2, TOE, ['D1']),
      aanvraag(RTM1, TOE, ['D1']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title: 'Single toegewezen aanvraag with end date / Verlopen aanvraag',
    aanvragen: [
      aanvraag(RTM1, TOE, ['E1'], { datumEindeGeldigheid: '2024-12-31' }),
    ],
    expected: [
      {
        id: 26,
        persoon: 'Persoon E1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title:
      'Multiple aanvragen in weird combination, leading to single statstrein for single betrokkene',
    aanvragen: [
      aanvraag(RTM1, TOE, ['A4']),
      aanvraag(RTM1, TOE, ['A4']),
      aanvraag(RTM1, TOE, ['A4']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM2, TOE, ['A4']),
      aanvraag(RTM2, AFW, ['A4']),
      aanvraag(RTM2, AFW, ['A4']),
    ],
    expected: [
      {
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
    ],
  },
  {
    title: 'Common testset for Aanvrager/Ontvanger',
    aanvragen: [
      aanvraag(RTM1, TOE, ['A5']),
      aanvraag(RTM2, TOE, ['A5']),
      aanvraag(RTM1, TOE, ['A5']),
      aanvraag(RTM2, TOE, ['A5']),
    ],
    expected: [
      {
        displayStatus: 'Besluit wijziging',
        id: 28,
        persoon: 'Persoon A5',
        steps: [
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
          'Aanvraag wijziging',
          'Besluit wijziging',
          'Einde recht',
        ],
      },
    ],
  },
];
