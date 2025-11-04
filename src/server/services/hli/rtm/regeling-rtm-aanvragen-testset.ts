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
  // Set to true to run only this test.
  only?: boolean;
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
    datumIngangGeldigheid?: string | null;
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
        id: 374098486,
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
        id: 3262006676,
        persoon: 'Persoon A',
        steps: [
          'Besluit',
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
        id: 1274761191,
        persoon: 'Persoon A3',
        steps: [
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
          'Besluit wijziging',
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
        id: 612666814,
        persoon: 'Persoon C, Persoon D',
        steps: [
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
          'Besluit',
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
        id: 854079571,
        persoon: 'Persoon F',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
      {
        id: 1711446607,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Besluit',
      },
      {
        id: 2545265331,
        persoon: 'Persoon G',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
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
        id: 1148178397,
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
        id: 2777490332,
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
        id: 3830300675,
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
        id: 300586790,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
      {
        id: 1997833831,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
      {
        id: 3919628639,
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
        id: 1893080281,
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
        id: 2809910954,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Besluit',
      },
      {
        id: 3024935710,
        persoon: 'Persoon K',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
      {
        id: 3671496961,
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
        id: 851920409,
        persoon: 'Persoon N',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 2084034444,
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
        id: 3226172751,
        persoon: 'Persoon Z',
        steps: [
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
    title: 'Aanvraag mixed 3 - Alleen ontvangers',
    aanvragen: [
      aanvraag(RTM1, TOE, ['O', 'P']),
      aanvraag(RTM1, TOE, ['O']),
      aanvraag(RTM1, TOE, ['P', 'Q']),
      aanvraag(RTM1, TOE, ['P']),
    ],
    expected: [
      {
        id: 939238853,
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
        id: 1782876614,
        persoon: 'Persoon Q',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 3769837594,
        persoon: 'Persoon O',
        steps: [
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
        id: 535650343,
        persoon: 'Persoon C1',
        steps: [
          'Besluit',
          'Besluit',
          'Besluit',
          'Besluit',
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
        id: 367981637,
        persoon: 'Persoon B1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 2693027815,
        persoon: 'Persoon A1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 2858723564,
        persoon: '',
        steps: ['Besluit', 'Besluit', 'Besluit'],
        displayStatus: 'Besluit',
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
        id: 648001760,
        persoon: 'Persoon D1',
        steps: [
          'Besluit',
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
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
        id: 4223603873,
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
        id: 526153856,
        persoon: 'Persoon A4',
        steps: [
          'Aanvraag',
          'In behandeling genomen',
          'Aanvraag',
          'In behandeling genomen',
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
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
        id: 1298428961,
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
  {
    title: 'Single afgewezen aanvraag',
    aanvragen: [aanvraag(RTM1, AFW)],
    // only: true,
    expected: [
      {
        id: 4063165682,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Besluit',
      },
    ],
  },
];
