const aanvragen_ = [
  [
    {
      productsoortCode: 'RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['A', 'B'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['B'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['B'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['A'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['C', 'D'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['C', 'D'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['F'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['G'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['F'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
  ],
  [
    { productsoortCode: 'RTM', betrokkenen: ['H'], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM', betrokkenen: ['H'], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['H'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM', betrokkenen: ['H'], resultaat: 'afgewezen' },
  ],
  [
    {
      productsoortCode: 'RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['I'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['J'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['K', 'L'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
      datumEindeGeldigheid: '2024-12-31',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['L'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['K'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['L', 'K'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['Z', 'Y'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['Z'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['Y', 'N'],
      resultaat: 'toegewezen',
    },
  ],
  [
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['O', 'P'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['O'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['P', 'Q'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['P'],
      resultaat: 'toegewezen',
    },
  ],
  // We assume these aanvragen belong to the same person, but we cannot know for sure.
  // Eventough there are no betrokkenen in the afgewezen aanvragen, we assume it's the same person as the toegewezen aanvraag.
  [
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['C1'],
      resultaat: 'toegewezen',
    },
  ],
  // // Because we have multiple betrokkenen in multiple aanvragen, we cannot know for sure which afgewezen aanvragen belong to.
  [
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['A1'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['B1'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
  ],
  // Some other exotic combination
  [
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
    { productsoortCode: 'RTM1', betrokkenen: [], resultaat: 'afgewezen' },
    {
      productsoortCode: 'RTM',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
    {
      productsoortCode: 'RTM1',
      betrokkenen: ['D1'],
      resultaat: 'toegewezen',
    },
  ],
];

export const aanvragen = aanvragen_;
