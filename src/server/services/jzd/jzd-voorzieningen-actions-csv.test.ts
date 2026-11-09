import { readFileSync, writeFileSync } from 'node:fs';

import * as XLSX from 'xlsx';

import type {
  LeveringsVormTransformed,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types.ts';
import type { JzdApiConfig, maActie } from './jzd-types.ts';
import { jzdVoorzieningenApiConfig } from './jzd-voorzieningen-api-config.ts';
import { forTesting } from './jzd-voorzieningen-api-service.ts';

const OUTPUT_CSV = false;

const actions = [
  'stopzetten',
  'stopzetten-niet-via-formulier',
] as const satisfies readonly maActie[];

const baseVoorziening: ZorgnedAanvraagTransformed = {
  betrokkenen: [],
  datumAanvraag: '2000-01-01',
  datumBeginLevering: '2000-01-01',
  datumBesluit: '2000-01-01',
  datumEindeGeldigheid: null,
  datumEindeLevering: null,
  datumIngangGeldigheid: '2000-01-01',
  datumOpdrachtLevering: null,
  datumToewijzing: null,
  procesAanvraagOmschrijving: null,
  documenten: [],
  id: 'csv-matrix',
  prettyID: 'csv-matrix',
  procesIdentificatie: 'csv-matrix',
  procesMeldingIdentificatie: null,
  isActueel: true,
  leverancier: null,
  leverancierIdentificatie: null,
  leveringsVorm: 'ZIN',
  productsoortCode: 'WMH',
  productIdentificatie: '01A01',
  beschiktProductIdentificatie: null,
  beschikkingNummer: null,
  regelingIdentificatie: null,
  resultaat: null,
  titel: 'CSV matrix',
};

function parseVoorzieningenInput(input: string) {
  const workbook = XLSX.read(input, { type: 'string', FS: '\t', raw: true });
  const [header, ...rows] = XLSX.utils.sheet_to_json<string[]>(
    workbook.Sheets[workbook.SheetNames[0]],
    { header: 1, defval: '', blankrows: false }
  );

  if (!header) {
    throw new Error('The input must contain a header row.');
  }

  const columns = {
    productIdentificatie: header.findIndex(
      (name) => name.trim().toLowerCase() === 'identificatie'
    ),
    productsoortCode: header.findIndex(
      (name) => name.trim().toLowerCase() === 'voorzieningsoortcode'
    ),
    leveringsVorm: header.findIndex(
      (name) => name.trim().toLowerCase() === 'leveringsvorm'
    ),
  };

  if (Object.values(columns).some((index) => index < 0)) {
    throw new Error(
      'The input requires Identificatie, Voorzieningsoortcode and Leveringsvorm columns.'
    );
  }

  return {
    header,
    columns,
    rows: rows.map((row) => header.map((_, index) => row[index] ?? '')),
  };
}

function evaluateVoorzieningenInput(
  input: string,
  apiConfig: JzdApiConfig[] = jzdVoorzieningenApiConfig
) {
  const { header, columns, rows } = parseVoorzieningenInput(input);
  const routeIndex = header.findIndex(
    (name) => name.trim().toLowerCase() === 'route'
  );

  const outputRows = rows.flatMap((row) => {
    const gewenst =
      row[routeIndex] === 'tripleforms naar zorgned'
        ? 'stopzetten'
        : 'stopzetten-niet-via-formulier';
    const evaluate = (leveringsVorm: LeveringsVormTransformed) => {
      const result = forTesting.addMaApiPropsToVoorziening(apiConfig, {
        ...baseVoorziening,
        productIdentificatie: row[columns.productIdentificatie] || undefined,
        productsoortCode: row[columns.productsoortCode] || null,
        leveringsVorm,
      });

      return {
        actions: actions.map((action) =>
          result.maActies?.includes(action) ? action : ''
        ),
        categories: result.maCategorie ?? [],
      };
    };

    const createRow = (
      leveringsVorm: string,
      evaluations: ReturnType<typeof evaluate>[]
    ) => {
      const values = [...row];
      values[columns.leveringsVorm] = leveringsVorm;

      return [
        ...values,
        gewenst,
        evaluations[0].actions.find(Boolean) ?? '',
        [
          ...new Set(
            evaluations.flatMap((evaluation) => evaluation.categories)
          ),
        ].join(', '),
      ];
    };

    const originalLeveringsVorm = row[columns.leveringsVorm];
    const leveringsVorm = originalLeveringsVorm.trim();
    const emptyEvaluation = evaluate('');
    let evaluatedRows: string[][];

    if (leveringsVorm === 'ZIN of PGB') {
      const zin = evaluate('ZIN');
      const pgb = evaluate('PGB');
      const hasDifferentActions = actions.some(
        (_, index) => zin.actions[index] !== pgb.actions[index]
      );

      evaluatedRows = hasDifferentActions
        ? [createRow('ZIN', [zin]), createRow('PGB', [pgb])]
        : [createRow(originalLeveringsVorm, [zin, pgb])];
    } else if (
      leveringsVorm === 'ZIN' ||
      leveringsVorm === 'PGB' ||
      leveringsVorm === ''
    ) {
      evaluatedRows = [
        createRow(originalLeveringsVorm, [
          leveringsVorm === '' ? emptyEvaluation : evaluate(leveringsVorm),
        ]),
      ];
    } else {
      throw new Error('Leveringsvorm must be ZIN, PGB, ZIN of PGB or empty.');
    }

    if (leveringsVorm !== '' && emptyEvaluation.actions.some(Boolean)) {
      evaluatedRows.push(createRow('', [emptyEvaluation]));
    }

    return evaluatedRows;
  });

  return {
    header: [...header, 'gewenst', 'geimplementeerd', 'maCategorie'],
    rows: outputRows,
  };
}

function toDelimitedText(rows: string[][], delimiter: string): string {
  return XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(rows), {
    FS: delimiter,
    RS: '\r\n',
    forceQuotes: true,
  });
}

const testHeader = [
  'Num',
  'Identificatie',
  'Voorzieningsoortcode',
  'Leveringsvorm',
  'Omschrijving',
];

function evaluateTestRows(rows: string[][], apiConfig?: JzdApiConfig[]) {
  return evaluateVoorzieningenInput(
    toDelimitedText([testHeader, ...rows], '\t'),
    apiConfig
  );
}

describe('voorzieningen action CSV', () => {
  test.each([
    ['tripleforms naar zorgned', 'stopzetten'],
    ['andere route', 'stopzetten-niet-via-formulier'],
    ['', 'stopzetten-niet-via-formulier'],
    ['Tripleforms naar zorgned', 'stopzetten-niet-via-formulier'],
  ])('derives gewenst from the exact route value %s', (route, gewenst) => {
    const original = ['355', 'LLVAVG', 'LLV', 'ZIN', 'Vervoer', route];
    const inputHeader = [...testHeader, 'route'];
    const input = toDelimitedText([inputHeader, original], '\t');

    expect(evaluateVoorzieningenInput(input)).toEqual({
      header: [...inputHeader, 'gewenst', 'geimplementeerd', 'maCategorie'],
      rows: [
        [...original, gewenst, 'stopzetten', 'A-LLV'],
        [
          '355',
          'LLVAVG',
          'LLV',
          '',
          'Vervoer',
          route,
          gewenst,
          'stopzetten',
          'A-LLV',
        ],
      ],
    });
  });

  test('preserves the desired action across split and empty delivery-form rows', () => {
    const input = toDelimitedText(
      [
        ['route', ...testHeader],
        [
          'tripleforms naar zorgned',
          '755',
          '01A01',
          'WMH',
          'ZIN of PGB',
          'Hulp',
        ],
      ],
      '\t'
    );
    const { rows } = evaluateVoorzieningenInput(input);

    expect(rows.map((row) => row.slice(-3))).toEqual([
      ['stopzetten', 'stopzetten-niet-via-formulier', 'B-WMO'],
      ['stopzetten', 'stopzetten', 'C-01'],
      ['stopzetten', 'stopzetten-niet-via-formulier', 'B-WMO'],
    ]);
    expect(rows.map((row) => row[0])).toEqual([
      'tripleforms naar zorgned',
      'tripleforms naar zorgned',
      'tripleforms naar zorgned',
    ]);
  });

  test('splits combined delivery forms with different actions and adds an applicable empty form', () => {
    expect(
      evaluateTestRows([['755', '01A01', 'WMH', 'ZIN of PGB', 'Hulp']])
    ).toEqual({
      header: [...testHeader, 'gewenst', 'geimplementeerd', 'maCategorie'],
      rows: [
        [
          '755',
          '01A01',
          'WMH',
          'ZIN',
          'Hulp',
          'stopzetten-niet-via-formulier',
          'stopzetten-niet-via-formulier',
          'B-WMO',
        ],
        [
          '755',
          '01A01',
          'WMH',
          'PGB',
          'Hulp',
          'stopzetten-niet-via-formulier',
          'stopzetten',
          'C-01',
        ],
        [
          '755',
          '01A01',
          'WMH',
          '',
          'Hulp',
          'stopzetten-niet-via-formulier',
          'stopzetten-niet-via-formulier',
          'B-WMO',
        ],
      ],
    });
  });

  test('keeps combined delivery forms with identical actions and combines their categories', () => {
    expect(
      evaluateTestRows([['290', '12H13', 'FIE', 'ZIN of PGB', 'Fiets']]).rows
    ).toEqual([
      [
        '290',
        '12H13',
        'FIE',
        'ZIN of PGB',
        'Fiets',
        'stopzetten-niet-via-formulier',
        'stopzetten',
        'D-01, D-02',
      ],
    ]);
  });

  test('ignores temporary stopping actions and keeps delivery-form-independent rows combined', () => {
    expect(
      evaluateTestRows([['355', 'LLVAVG', 'LLV', 'ZIN of PGB', 'Vervoer']]).rows
    ).toEqual([
      [
        '355',
        'LLVAVG',
        'LLV',
        'ZIN of PGB',
        'Vervoer',
        'stopzetten-niet-via-formulier',
        'stopzetten',
        'A-LLV',
      ],
      [
        '355',
        'LLVAVG',
        'LLV',
        '',
        'Vervoer',
        'stopzetten-niet-via-formulier',
        'stopzetten',
        'A-LLV',
      ],
    ]);
  });

  test('does not split when only an ignored action differs', () => {
    const config: JzdApiConfig[] = [
      {
        'include.every': { leveringsVorm: 'ZIN' },
        assign: { maActies: ['stopzetten'], maCategorie: ['same'] },
      },
      {
        'include.every': { leveringsVorm: 'PGB' },
        assign: {
          maActies: ['stopzetten', 'stopzetten-tijdelijk'],
          maCategorie: ['same'],
        },
      },
    ];

    expect(
      evaluateTestRows([['1', '010', 'AUT', 'ZIN of PGB', 'Auto']], config).rows
    ).toEqual([
      [
        '1',
        '010',
        'AUT',
        'ZIN of PGB',
        'Auto',
        'stopzetten-niet-via-formulier',
        'stopzetten',
        'same',
      ],
    ]);
  });

  test.each([
    ['ZIN', '010', 'AUT', 'D-01'],
    ['PGB', '08705', 'VVD', 'C-03'],
  ])(
    'evaluates a single %s delivery form without adding an inapplicable empty form',
    (leveringsVorm, productIdentificatie, productsoortCode, category) => {
      expect(
        evaluateTestRows([
          [
            '1',
            productIdentificatie,
            productsoortCode,
            leveringsVorm,
            'Original',
          ],
        ]).rows
      ).toEqual([
        [
          '1',
          productIdentificatie,
          productsoortCode,
          leveringsVorm,
          'Original',
          'stopzetten-niet-via-formulier',
          'stopzetten',
          category,
        ],
      ]);
    }
  );

  test('does not duplicate an input row with an empty delivery form', () => {
    expect(
      evaluateTestRows([['277', '', 'DBS', '', 'Dagbesteding']]).rows
    ).toEqual([
      [
        '277',
        '',
        'DBS',
        '',
        'Dagbesteding',
        'stopzetten-niet-via-formulier',
        'stopzetten-niet-via-formulier',
        'B-WMO',
      ],
    ]);
  });

  test('keeps original rows without applicable stopping actions', () => {
    expect(
      evaluateTestRows([['1', '', 'unknown', 'ZIN of PGB', 'Original']]).rows
    ).toEqual([
      [
        '1',
        '',
        'unknown',
        'ZIN of PGB',
        'Original',
        'stopzetten-niet-via-formulier',
        '',
        '',
      ],
    ]);
  });

  test('retains repeated input rows and every original value when expanding', () => {
    const originalRows = [
      ['771', '', 'WRA2', 'ZIN of PGB', 'Eerste'],
      ['776', '', 'WRA2', 'ZIN of PGB', 'Tweede'],
    ];

    expect(evaluateTestRows(originalRows).rows).toEqual(
      originalRows.map((row) => [
        ...row,
        'stopzetten-niet-via-formulier',
        'stopzetten',
        'D-03, D-04',
      ])
    );
  });

  test('does not add empty delivery-form rows for temporary actions alone', () => {
    const config: JzdApiConfig[] = [
      { assign: { maActies: ['stopzetten-tijdelijk'] } },
    ];

    expect(
      evaluateTestRows([['1', '010', 'AUT', 'ZIN', 'Auto']], config).rows
    ).toEqual([
      [
        '1',
        '010',
        'AUT',
        'ZIN',
        'Auto',
        'stopzetten-niet-via-formulier',
        '',
        '',
      ],
    ]);
  });

  test('rejects unsupported delivery forms', () => {
    expect(() =>
      evaluateTestRows([['1', '010', 'AUT', 'invalid', 'Auto']])
    ).toThrow('Leveringsvorm must be ZIN, PGB, ZIN of PGB or empty.');
  });

  test('writes CSV that preserves quoted tabs, newlines and leading zeroes', () => {
    const output = evaluateTestRows([
      ['001', '010', 'AUT', 'ZIN', 'Fiets\t"a,b"\nExtra'],
    ]);
    const csv = toDelimitedText([output.header, ...output.rows], ',');
    const workbook = XLSX.read(csv, { type: 'string', FS: ',', raw: true });

    expect(
      XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
        defval: '',
      })
    ).toEqual([output.header, ...output.rows]);
  });

  test('parses tab-separated input while preserving original columns and values', () => {
    const input =
      'Num\tIdentificatie\tVoorzieningsoortcode\tLeveringsvorm\tOmschrijving\r\n' +
      '001\t010\tAUT\tZIN\t"Fiets\t""a,b""\nExtra"\r\n' +
      '277\t\tDBS\tZIN of PGB\t\r\n';

    expect(parseVoorzieningenInput(input)).toEqual({
      header: [
        'Num',
        'Identificatie',
        'Voorzieningsoortcode',
        'Leveringsvorm',
        'Omschrijving',
      ],
      columns: {
        productIdentificatie: 1,
        productsoortCode: 2,
        leveringsVorm: 3,
      },
      rows: [
        ['001', '010', 'AUT', 'ZIN', 'Fiets\t"a,b"\nExtra'],
        ['277', '', 'DBS', 'ZIN of PGB', ''],
      ],
    });
  });

  test('parses reordered input columns without losing empty delivery forms', () => {
    const input =
      'Leveringsvorm\tVoorzieningsoortcode\tIdentificatie\tNum\r\n' +
      '\tDBS\t\t277\r\n';

    expect(parseVoorzieningenInput(input)).toMatchObject({
      columns: {
        productIdentificatie: 2,
        productsoortCode: 1,
        leveringsVorm: 0,
      },
      rows: [['', 'DBS', '', '277']],
    });
  });

  test('parses input only when the required columns are present', () => {
    expect(() => parseVoorzieningenInput('Num\tIdentificatie\n1\t010')).toThrow(
      'The input requires Identificatie, Voorzieningsoortcode and Leveringsvorm columns.'
    );
  });

  test.each([
    ['include.every', 'WMH', 'different-id', false],
    ['include.every', 'WMH', '01A01', true],
    ['include.some', 'different-code', '01A01', true],
    ['include.some', 'different-code', 'different-id', false],
    ['exclude.every', 'WMH', 'different-id', true],
    ['exclude.every', 'WMH', '01A01', false],
    ['exclude.some', 'different-code', '01A01', false],
    ['exclude.some', 'different-code', 'different-id', true],
  ] as const)(
    '%s for code %s and identification %s allows stopzetten: %s',
    (matchType, productsoortCode, productIdentificatie, expected) => {
      const config: JzdApiConfig = {
        [matchType]: {
          productsoortCode: ['WMH'],
          productIdentificatie: ['01A01'],
        },
        assign: { maActies: ['stopzetten'] },
      };

      const result = forTesting.addMaApiPropsToVoorziening([config], {
        ...baseVoorziening,
        productsoortCode,
        productIdentificatie,
      });

      expect(result.maActies?.includes('stopzetten') ?? false).toBe(expected);
    }
  );

  test('matches the desired action for every evaluated input row', () => {
    const input = readFileSync(
      new URL('./test-fixtures/jzd-voorzieningen-input.csv', import.meta.url),
      'utf8'
    );
    const original = parseVoorzieningenInput(input);
    const { header, rows } = evaluateVoorzieningenInput(input);

    expect(original.rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeGreaterThanOrEqual(original.rows.length);
    expect(rows.every((row) => row.length === header.length)).toBe(true);
    expect(header.slice(-3)).toEqual([
      'gewenst',
      'geimplementeerd',
      'maCategorie',
    ]);

    if (OUTPUT_CSV) {
      const csv = toDelimitedText([header, ...rows], ',');
      writeFileSync('jzd-voorzieningen-actions.csv', `${csv}\r\n`, 'utf8');
    }

    const gewenstIndex = header.indexOf('gewenst');
    const geimplementeerdIndex = header.indexOf('geimplementeerd');

    for (const row of rows) {
      const gewenst = row[gewenstIndex];
      const geimplementeerd = row[geimplementeerdIndex];

      expect
        .soft(
          geimplementeerd,
          `Row with leveringsform "${row[original.columns.leveringsVorm]}", productsoortcode "${row[original.columns.productsoortCode]}", productIdentificatie "${row[original.columns.productIdentificatie]}" is expected to have actie "${gewenst}" but evaluated to "${geimplementeerd}"`
        )
        .toBe(gewenst);
    }
  });
});
