import { hash } from '../../../../universal/helpers/utils';
import type { ZorgnedAanvraagWithRelatedPersonsTransformed } from '../../zorgned/zorgned-types';

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
  bsnLoggedinUser: string;
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
  otherProps?: Partial<ZorgnedAanvraagWithRelatedPersonsTransformed>
) {
  const aanvraag = {
    titel: 'Regeling tegemoetkoming meerkosten',
    productIdentificatie,
    betrokkenen,
    resultaat,
    ...otherProps,
  };
  if (aanvraag.id) {
    aanvraag.prettyID = hash(aanvraag.id);
  }
  return aanvraag;
}

export const aanvragenTestsetInput = [
  {
    title: 'Mix of RTM and RTM1, multiple betrokkenen',
    bsnLoggedinUser: 'A',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['A', 'B']),
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['B']),
      aanvraag(RTM1, TOE, ['B']),
    ],
    expected: [
      {
        id: 214558390,
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
        id: 3825269075,
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
    bsnLoggedinUser: 'A3',
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
        id: 538352114,
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
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, TOE, ['C', 'D']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['C', 'D']),
    ],
    expected: [
      {
        id: 1334817865,
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
    bsnLoggedinUser: 'F',
    aanvragen: [
      aanvraag(RTM1, TOE, ['F']),
      aanvraag(RTM1, TOE, ['G']),
      aanvraag(RTM2, TOE, ['F']),
      aanvraag(RTM2, AFW),
      aanvraag(RTM1, AFW),
    ],
    expected: [
      {
        id: 826691057,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Afgewezen',
      },
      {
        id: 1497696404,
        persoon: 'Persoon F',
        steps: [
          'Aanvraag',
          'In behandeling genomen',
          'Besluit',
          'Besluit wijziging',
          'Einde recht',
        ],
        displayStatus: 'Besluit wijziging',
      },
      {
        id: 1702236116,
        persoon: 'Persoon G',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title: 'Single betrokkene, only ontvanger.',
    bsnLoggedinUser: 'H',
    aanvragen: [
      aanvraag(RTM2, AFW),
      aanvraag(RTM2, AFW),
      aanvraag(RTM2, TOE, ['H']),
      aanvraag(RTM2, AFW),
    ],
    expected: [
      {
        id: 1334817865,
        persoon: 'Persoon H',
        steps: ['Besluit', 'Besluit', 'Besluit', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
  {
    title: 'Ontvanger turns 18 and needs to request RTM1 for self.',
    bsnLoggedinUser: 'I',
    aanvragen: [
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I'], { datumEindeGeldigheid: '2024-12-31' }),
      aanvraag(RTM1, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
    ],
    expected: [
      {
        id: 214558390,
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
        id: 2860460942,
        persoon: 'Persoon I',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
  {
    title:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    bsnLoggedinUser: 'J',
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
        id: 1334817865,
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
        id: 2616346664,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },

      {
        id: 3189131112,
        persoon: 'Persoon J',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    bsnLoggedinUser: 'K',
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
        id: 247651891,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Afgewezen',
      },
      {
        id: 1545565778,
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
        id: 3438209512,
        persoon: 'Persoon K',
        steps: ['Aanvraag', 'In behandeling genomen', 'Besluit', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
      {
        id: 3817870519,
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
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, TOE, ['Z', 'Y']),
      aanvraag(RTM1, TOE, ['Z']),
      aanvraag(RTM1, TOE, ['Y', 'N']),
    ],
    expected: [
      {
        id: 2290932555,
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
        id: 3438209512,
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
        id: 3709075639,
        persoon: 'Persoon N',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title: 'Aanvraag mixed 3 - Alleen ontvangers',
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, TOE, ['O', 'P']),
      aanvraag(RTM1, TOE, ['O']),
      aanvraag(RTM1, TOE, ['P', 'Q']),
      aanvraag(RTM1, TOE, ['P']),
    ],
    expected: [
      {
        id: 1497696404,
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
        id: 3438209512,
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
        id: 3709075639,
        persoon: 'Persoon Q',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title:
      "We assume these aanvragen belong to the same person, but we cannot know for sure. - Eventough there are no betrokkenen in the afgewezen aanvragen, we assume it's the same person as the toegewezen aanvraag.",
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['C1']),
    ],
    expected: [
      {
        id: 4116186673,
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
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['A1']),
      aanvraag(RTM1, TOE, ['B1']),
      aanvraag(RTM1, AFW),
    ],
    expected: [
      {
        id: 1123196950,
        persoon: 'Persoon B1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
      {
        id: 1930458096,
        persoon: '',
        steps: ['Besluit', 'Besluit', 'Besluit'],
        displayStatus: 'Afgewezen',
      },
      {
        id: 3709075639,
        persoon: 'Persoon A1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title: 'Some other exotic combinations',
    bsnLoggedinUser: 'D1',
    aanvragen: [
      aanvraag(RTM1, AFW),
      aanvraag(RTM1, TOE, ['D1']),
      aanvraag(RTM1, AFW),
      aanvraag(RTM2, TOE, ['D1']),
      aanvraag(RTM1, TOE, ['D1']),
    ],
    expected: [
      {
        id: 4116186673,
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
    bsnLoggedinUser: 'X',
    aanvragen: [
      aanvraag(RTM1, TOE, ['E1'], { datumEindeGeldigheid: '2024-12-31' }),
    ],
    expected: [
      {
        id: 4288114805,
        persoon: 'Persoon E1',
        steps: ['Aanvraag', 'In behandeling genomen'],
        displayStatus: 'In behandeling genomen',
      },
    ],
  },
  {
    title:
      'Multiple aanvragen in weird combination, leading to single statstrein for single betrokkene',
    bsnLoggedinUser: 'A4',
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
        id: 538352114,
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
    bsnLoggedinUser: 'A5',
    aanvragen: [
      aanvraag(RTM1, TOE, ['A5']),
      aanvraag(RTM2, TOE, ['A5']),
      aanvraag(RTM1, TOE, ['A5']),
      aanvraag(RTM2, TOE, ['A5']),
    ],
    expected: [
      {
        displayStatus: 'Besluit wijziging',
        id: 1334817865,
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
    bsnLoggedinUser: 'X',
    aanvragen: [aanvraag(RTM1, AFW)],
    // only: true,
    expected: [
      {
        id: 4288114805,
        persoon: '',
        steps: ['Besluit'],
        displayStatus: 'Afgewezen',
      },
    ],
  },
  {
    title: 'Ontvanger aanvraag, wijziging, beïndiging',
    bsnLoggedinUser: 'A6',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A6'], {
        beschiktProductIdentificatie: 'A6-1',
        datumIngangGeldigheid: '2024-11-01',
        datumEindeGeldigheid: '2024-11-30',
        procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
      }),
      aanvraag(RTM2, TOE, ['A6'], {
        beschiktProductIdentificatie: 'A6-1',
        datumIngangGeldigheid: '2024-11-01',
        datumEindeGeldigheid: '2024-11-30',
        procesAanvraagOmschrijving: 'RTM Herkeuring',
      }),
      aanvraag(RTM2, TOE, ['A6'], {
        beschiktProductIdentificatie: 'A6-1',
        datumIngangGeldigheid: '2024-11-01',
        datumEindeGeldigheid: '2024-11-30',
        procesAanvraagOmschrijving: 'Beëindigen RTM',
      }),
    ],
    // only: true,
    expected: [
      {
        id: 4288114805,
        persoon: 'Persoon A6',
        steps: ['Besluit', 'Besluit wijziging', 'Einde recht'],
        displayStatus: 'Einde recht',
      },
    ],
  },
  {
    title: 'Ontvanger aanvraag, wijziging',
    bsnLoggedinUser: 'A7',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A7'], {
        beschiktProductIdentificatie: 'A7-1',
        datumIngangGeldigheid: '2024-11-01',
        datumEindeGeldigheid: null,
        procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
      }),
      aanvraag(RTM2, TOE, ['A7'], {
        beschiktProductIdentificatie: 'A7-1',
        datumIngangGeldigheid: '2024-11-01',
        datumEindeGeldigheid: null,
        procesAanvraagOmschrijving: 'RTM Herkeuring',
      }),
    ],
    // only: true,
    expected: [
      {
        id: 4288114805,
        persoon: 'Persoon A7',
        steps: ['Besluit', 'Besluit wijziging', 'Einde recht'],
        displayStatus: 'Besluit wijziging',
      },
    ],
  },
  {
    title: 'RTM voor één jaar, mét einde recht, zonder beëindigingsproces',
    bsnLoggedinUser: 'A8',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A8'], {
        beschiktProductIdentificatie: 'A8-1',
        datumIngangGeldigheid: '2024-12-01',
        datumEindeGeldigheid: '2025-11-30',
        procesAanvraagOmschrijving: 'Aanvraag RTM fase 2',
      }),
    ],
    // only: true,
    expected: [
      {
        id: 4288114805,
        persoon: 'Persoon A8',
        steps: ['Besluit', 'Einde recht'],
        displayStatus: 'Besluit',
      },
    ],
  },
];
