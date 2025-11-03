export const aanvragenTestSets = [
  // Mix of RMT and RTM1, multiple betrokkenen
  [
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A', 'B'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['B'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['B'],
      resultaat: 'toegewezen',
    },
  ],
  // Mix of RTM and RTM1, multiple afgewezen aanvragen with single betrokkene
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A3'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A3'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A3'],
      resultaat: 'toegewezen',
    },
    { productIdentificatie: 'AV-RTM', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A3'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A3'],
      resultaat: 'toegewezen',
    },
  ],
  // Mix of RTM and RTM1, multiple afgewezen aanvragen with multiple betrokkenen, only aanvragen voor betrokkenen.
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['C', 'D'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['C', 'D'],
      resultaat: 'toegewezen',
    },
  ],
  // Mix of RTM and RTM1, aanvraag voor Aanvrager/Ontvanger en aanvraag voor betrokkene.
  // Afgewezen aanvraag results in orphan.
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['F'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['G'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['F'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
  ],
  // Single betrokkene, only ontvanger.
  [
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['H'],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['H'],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['H'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['H'],
      resultaat: 'afgewezen',
    },
  ],
  // Ontvanger turns 18 and needs to request RTM1 for self.
  [
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
  ],
  // Aan/Uit single betrokkene, multiple aanvragen, some with datumEindeGeldigheid
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
  ],
  // Mix of RTM and RTM1, multiple betrokkenen. Afgewezen aanvraag results in orphan.
  // Multiple statustrein per betrokkene with aanvraag step that applies to both.
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['K', 'L'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['L'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['L', 'K'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
  ],
  // Aanvraag mixed 2 - Alleen ontvangers
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['Z', 'Y'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['Z'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['Y', 'N'],
      resultaat: 'toegewezen',
    },
  ],
  // Aanvraag mixed 3 - Alleen ontvangers
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['O', 'P'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['O'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['P', 'Q'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['P'],
      resultaat: 'toegewezen',
    },
  ],
  // We assume these aanvragen belong to the same person, but we cannot know for sure.
  // Eventough there are no betrokkenen in the afgewezen aanvragen, we assume it's the same person as the toegewezen aanvraag.
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['C1'],
      resultaat: 'toegewezen',
    },
  ],
  // Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A1'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['B1'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
  ],
  // Some other exotic combination
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['E1'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
  ],
  [
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A4'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A4'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: ['A4'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM1',
      betrokkenen: [],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A4'],
      resultaat: 'toegewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A4'],
      resultaat: 'afgewezen',
    },
    {
      productIdentificatie: 'AV-RTM',
      betrokkenen: ['A4'],
      resultaat: 'afgewezen',
    },
  ],
];

export const aanvragen = aanvragenTestSets;
