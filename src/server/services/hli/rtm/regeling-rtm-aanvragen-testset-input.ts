export type RTMAanvraagProps = {
  productIdentificatie: 'AV-RTM1' | 'AV-RTM';
  betrokkenen: string[];
  resultaat: 'toegewezen' | 'afgewezen';
  datumEindeGeldigheid: string | null;
};

export type RTMTestInput = {
  title: string;
  aanvragen: RTMAanvraagProps[];
};

const RTM1 = 'AV-RTM1';
const RTM2 = 'AV-RTM';
const TOE = 'toegewezen';
const AFW = 'afgewezen';

// ZorgnedAanvraagTransformed with only the properties needed for the testset
function aanvraag(
  productIdentificatie: string,
  resultaat: 'toegewezen' | 'afgewezen',
  betrokkenen: string[] = [],
  datumEindeGeldigheid?: string
) {
  const aanvraag: {
    productIdentificatie: string;
    betrokkenen?: string[];
    resultaat: 'toegewezen' | 'afgewezen';
    datumEindeGeldigheid?: string;
  } = {
    productIdentificatie,
    betrokkenen,
    resultaat,
  };
  if (datumEindeGeldigheid) {
    aanvraag.datumEindeGeldigheid = datumEindeGeldigheid;
  }
  return aanvraag;
}

export const aanvragenTestsetInput = [
  {
    title: 'Mix of RMT and RTM1, multiple betrokkenen',
    aanvragen: [
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['A', 'B']),
      aanvraag(RTM2, TOE, ['A']),
      aanvraag(RTM1, TOE, ['B']),
      aanvraag(RTM1, TOE, ['B']),
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
  },
  {
    title: 'Single betrokkene, only ontvanger.',
    aanvragen: [
      aanvraag(RTM2, AFW, ['H']),
      aanvraag(RTM2, AFW, ['H']),
      aanvraag(RTM2, TOE, ['H']),
      aanvraag(RTM2, AFW, ['H']),
    ],
  },
  {
    title: 'Ontvanger turns 18 and needs to request RTM1 for self.',
    aanvragen: [
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I'], '2024-12-31'),
      aanvraag(RTM1, TOE, ['I']),
      aanvraag(RTM2, TOE, ['I']),
    ],
  },
  {
    title:
      'Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid',
    aanvragen: [
      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J']),
      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J'], '2024-12-31'),

      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J'], '2024-12-31'),

      aanvraag(RTM1, TOE, ['J']),
      aanvraag(RTM2, TOE, ['J']),
    ],
  },
  {
    title:
      'Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan. - Multiple statustrein per betrokkene with aanvraag step that applies to both.',
    aanvragen: [
      aanvraag(RTM1, TOE, ['K', 'L']),
      aanvraag(RTM2, TOE, ['K'], '2024-12-31'),
      aanvraag(RTM1, TOE, ['L']),
      aanvraag(RTM1, TOE, ['K']),
      aanvraag(RTM2, TOE, ['K']),
      aanvraag(RTM1, TOE, ['L', 'K']),
      aanvraag(RTM1, AFW),
    ],
  },
  {
    title: 'Aanvraag mixed 2 - Alleen ontvangers',
    aanvragen: [
      aanvraag(RTM1, TOE, ['Z', 'Y']),
      aanvraag(RTM1, TOE, ['Z']),
      aanvraag(RTM1, TOE, ['Y', 'N']),
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
  },
  {
    title: 'Single toegewezen aanvraag with end date / Verlopen aanvraag',
    aanvragen: [aanvraag(RTM1, TOE, ['E1'], '2024-12-31')],
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
  },
];
