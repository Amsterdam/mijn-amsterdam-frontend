import { ReactNode, useCallback, useState } from 'react';
import { PageContent, PageHeading, TextPage } from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import { JSONPath } from 'jsonpath-plus';
import { defaultDateFormat } from '../../../universal/helpers';
import { differenceInYears } from 'date-fns';

type FilterKey = Array<string | number | string | ((value: any) => string)>;

interface Filter {
  title: string;
  path: string;
  keys: FilterKey[];
  toRows?: (resultSet: ResultSet) => ReactNode;
}

interface JPNode {
  path: string;
  pointer: string;
  value: any;
}

interface ResultSet {
  results: JPNode[];
  filter: Filter;
}

const filters: Filter[] = [
  {
    title: 'Persoonsgegevens',
    path: '$..content.persoon',
    keys: [
      ['bsn'],
      ['opgemaakteNaam', 'Naam in header'],
      [
        'geboortedatum',
        'Geboortedatum',
        (value) => {
          console.log('va', value);
          return (
            defaultDateFormat(value) +
            ` (${differenceInYears(new Date(), new Date(value))} jaar oud)`
          );
        },
      ],
    ],
  },
  {
    title: 'Afgewezen bijstands aanvragen',
    path: '$..content[?(@.about=="Bijstandsuitkering")]',
    keys: [
      ['dateStart', 'Aanvraagdatum', defaultDateFormat],
      ['dateEnd', 'Datum besluit', defaultDateFormat],
    ],
  },
  {
    title: `Thema's`,
    path: '$.*.*~',
    keys: [['thema', 'Thema', (x) => x]],
    toRows: (resultSet: ResultSet) => {
      const index = new Set();
      const rows = [];
      for (const { value, pointer } of resultSet.results) {
        const [, gebruiker] = pointer.split('/');
        const isInIndex = index.has(gebruiker);
        rows.push(
          <tr>
            <td>{isInIndex ? '' : gebruiker}</td>
            <td>{value}</td>
          </tr>
        );
        if (!isInIndex) {
          index.add(gebruiker);
        }
      }
      return rows;
    },
  },
];

function ResultValue({
  value,
  filterKey,
}: {
  value: any;
  filterKey: FilterKey;
}) {
  const [key, label, format] = filterKey;
  let nValue = typeof key !== 'function' ? value[key] : value;

  if (typeof format === 'function') {
    nValue = format(nValue);
  }

  return <td>{nValue}</td>;
}

function ResultRow({ node, filter }: { node: JPNode; filter: Filter }) {
  console.log('node:', node);
  return (
    <tr>
      <td>
        <strong>{node.pointer.split('/')[1]}</strong>
      </td>
      {filter.keys?.map((key) => {
        return <ResultValue value={node.value} filterKey={key} />;
      })}
      {/* <td>{JSON.stringify(node.value)}</td> */}
    </tr>
  );
}

export default function GeneralInfo() {
  const APPSTATE = useAppStateGetter();
  const [resultSet, setResults] = useState<ResultSet | null>(null);

  const data = {
    you: APPSTATE,
  };

  const filterDataByPath = useCallback(
    (filter: any) => {
      const results = JSONPath({
        json: data,
        path: filter.path,
        resultType: 'all',
      });
      console.log('rs', results);
      setResults({ results, filter });
    },
    [setResults]
  );

  return (
    <TextPage>
      <PageHeading>DataSearch</PageHeading>
      <nav>
        {filters.map((filter) => {
          return (
            <button onClick={() => filterDataByPath(filter)}>
              {filter.title}
            </button>
          );
        })}
      </nav>
      <PageContent>
        {!!resultSet && (
          <table>
            <thead>
              <tr>
                <td>Gebuiker</td>
                {resultSet.filter.keys.map((key) => (
                  <td>
                    {typeof key[1] === 'string' ? key[1] : key[0].toString()}
                  </td>
                ))}
              </tr>
            </thead>
            {resultSet.filter.toRows
              ? resultSet.filter.toRows(resultSet)
              : resultSet.results.map((node) => {
                  return <ResultRow node={node} filter={resultSet.filter} />;
                })}
          </table>
        )}
      </PageContent>
    </TextPage>
  );
}
