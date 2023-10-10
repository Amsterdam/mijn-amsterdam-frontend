import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const ENV_FILE = '.env.local';
console.debug(`trying env file ${ENV_FILE}`);
const envConfig = dotenv.config({ path: ENV_FILE });
dotenvExpand.expand(envConfig);

import jsonpath from 'jsonpath';
import * as XLSX from 'xlsx';

/* load 'fs' for readFile and writeFile support */
import * as fs from 'fs';
import {
  dateFormat,
  defaultDateFormat,
  getFullAddress,
} from '../universal/helpers';
import {
  Adres,
  Kind,
  MyNotification,
  Persoon,
  Verbintenis,
} from '../universal/types';

import { differenceInYears, parseISO } from 'date-fns';

import type { AppState } from '../client/AppState';
import { isChapterActive } from '../universal/helpers/chapters';
import { ServiceResults } from './services/tips/tip-types';
import { Chapter, myChaptersMenuItems } from '../universal/config';
import { testAccounts } from '../universal/config/auth.development';

XLSX.set_fs(fs);

const testAccountEntries = Object.entries(testAccounts);

async function getServiceResults(
  fromDisk: boolean = false,
  targetDirectory: string
): Promise<Record<string, ServiceResults>> {
  if (fromDisk) {
    const data = JSON.parse(
      fs.readFileSync(targetDirectory + '/user-data.json', 'utf8').toString()
    );
    return data;
  }

  const allResults: Record<string, ServiceResults> = {};

  for (const [Username, userId] of testAccountEntries) {
    const url = `${process.env.BFF_API_BASE_URL}/api/v1/auth/digid/login/${Username}?redirectUrl=noredirect`;
    try {
      const serviceResults = await fetch(url).then((r) => {
        const Cookie = r.headers.get('Set-Cookie') ?? '';
        console.time(`Fetch data for ${Username}/${userId}`);
        return fetch(`${process.env.BFF_API_BASE_URL}/api/v1/services/all`, {
          headers: {
            Cookie,
          },
        }).then((r) => {
          console.timeEnd(`Fetch data for ${Username}/${userId}`);
          return r.json();
        });
      });
      allResults[Username] = serviceResults;
    } catch (error) {
      console.error(error);
    }
  }

  return allResults;
}

function naam(persoon: Persoon) {
  return persoon.voornamen
    ?.split(' ')
    .map((naam, index) => {
      return index === 0 ? naam : naam.charAt(0) + '.';
    })
    .join(' ');
}

function oudersOfKinderen(
  oudersOfKinderen: Array<Persoon | Kind> | null,
  serviceResults: ServiceResults
) {
  return oudersOfKinderen?.length
    ? oudersOfKinderen
        .map((persoon) => relatedUser(persoon as Persoon))
        .join(', ')
    : '';
}

function relatedUser(persoon: Persoon) {
  const relatedUsername = testAccountEntries.find(
    ([, bsn]) => bsn === persoon.bsn
  )?.[0];
  const age = `${
    persoon.overlijdensdatum
      ? 'overleden'
      : persoon.geboortedatum
      ? differenceInYears(new Date(), parseISO(persoon.geboortedatum))
      : '??'
  }`;
  const nom = naam(persoon);
  const user = persoon?.bsn
    ? `[${persoon?.bsn}${relatedUsername ? '/' + relatedUsername : ''}]`
    : '';

  return `${nom} (${age}) ${user}`;
}

function woonplaatsNaamBuitenAmsterdam(adres: Adres) {
  const woonplaatsNaam = adres?.woonplaatsNaam;
  return woonplaatsNaam === 'Amsterdam' || !woonplaatsNaam
    ? ''
    : `(${woonplaatsNaam})`;
}

const HPX_DEFAULT = 22;
const WCH_DEFAULT = 25;

interface PathObj {
  label: string;
  path: string;
  transform?: (value: any, serviceResults: ServiceResults) => string | null;
  wch?: number;
  hpx?: number;
}

const paths: PathObj[] = [
  {
    label: 'BSN',
    path: '$.BRP.content.persoon.bsn',
  },
  {
    label: 'Voornamen',
    path: '$.BRP.content.persoon.voornamen',
    wch: 40,
  },
  {
    label: 'Achternaam (Titel)',
    path: '$.BRP.content.persoon',
    transform: (persoon: Persoon) => {
      return (
        `${
          persoon?.voorvoegselGeslachtsnaam
            ? persoon.voorvoegselGeslachtsnaam + ' '
            : ''
        }${persoon?.geslachtsnaam}` +
        (persoon?.omschrijvingAdellijkeTitel
          ? ` (${persoon.omschrijvingAdellijkeTitel})`
          : '')
      );
    },
    wch: 40,
  },
  {
    label: 'Geboortedatum',
    path: '$.BRP.content.persoon.geboortedatum',
    transform: (value: string | null) => {
      return value !== null ? defaultDateFormat(value) : 'onbekend';
    },
  },
  {
    label: 'Leeftijd',
    path: '$.BRP.content.persoon.geboortedatum',
    transform: (value: string | null, serviceResults: ServiceResults) => {
      const age =
        value !== null
          ? differenceInYears(new Date(), parseISO(value)) + ''
          : 'onbekend';
      return age;
    },
  },
  {
    label: 'Adres (In onderzoek / VOW / Geheim)',
    path: '$.BRP.content.adres',
    wch: WCH_DEFAULT * 2,
    transform: (value: Adres, serviceResults: ServiceResults) => {
      return (
        getFullAddress(value) +
        `${
          serviceResults.BRP.content?.persoon?.adresInOnderzoek
            ? ' (In onderzoek)'
            : ''
        }` +
        `${
          serviceResults.BRP.content?.persoon?.vertrokkenOnbekendWaarheen
            ? ' (VOW)'
            : ''
        }` +
        `${
          serviceResults.BRP.content?.persoon?.indicateGeheim ? ' (Geheim)' : ''
        }`
      );
    },
  },
  {
    label: 'Postcode (Woonplaats)',
    path: '$.BRP.content.adres.postcode',
    transform: (postcode: string, serviceResults: ServiceResults) => {
      return `${postcode ? postcode : ''} ${woonplaatsNaamBuitenAmsterdam(
        serviceResults.BRP.content?.adres
      )}`;
    },
  },
  {
    label: 'Verbintenis',
    path: '$.BRP.content.verbintenis',
    wch: 50,
    transform: (verbintenis: Verbintenis) => {
      if (!verbintenis) {
        return '';
      }
      return verbintenis.persoon
        ? `${
            (verbintenis.soortVerbintenisOmschrijving ||
              verbintenis.soortVerbintenis) ??
            ''
          } met ${relatedUser(verbintenis.persoon as Persoon)}`
        : Object.keys(verbintenis).length
        ? JSON.stringify(verbintenis)
        : '';
    },
    hpx: 30,
  },
  {
    label: 'Kinderen',
    path: '$.BRP.content.kinderen',
    wch: 60,
    transform: oudersOfKinderen,
  },
  {
    label: 'Ouders',
    path: '$.BRP.content.ouders',
    wch: 60,
    transform: oudersOfKinderen,
  },
  {
    label: 'Voormalige verbintenis',
    path: '$.BRP.content.verbintenisHistorisch',
    wch: 50,
    transform: (verbintenisHistorisch: Verbintenis[]) => {
      if (!verbintenisHistorisch) {
        return '';
      }
      return verbintenisHistorisch
        .map((verbintenis) => {
          return verbintenis.persoon
            ? `${
                verbintenis.soortVerbintenisOmschrijving ?? ''
              } met ${relatedUser(verbintenis.persoon as Persoon)}`
            : Object.keys(verbintenis).length
            ? JSON.stringify(verbintenis)
            : '';
        })
        .join(', ');
    },
    hpx: 30,
  },
  {
    label: 'Voormalige adressen',
    path: '$.BRP.content.adresHistorisch',
    transform: (adressen: Adres[], serviceResults: ServiceResults) => {
      return adressen
        ?.map((adres) => {
          return `${getFullAddress(adres)} ${woonplaatsNaamBuitenAmsterdam(
            adres
          )}`;
        })
        .join(', ');
    },
    wch: 80,
  },
  {
    label: 'Geboorteland',
    path: '$.BRP.content.persoon.geboortelandnaam',
  },
  {
    label: 'Nationaliteiten',
    path: '$.BRP.content.persoon.nationaliteiten',
    transform: (value: Array<{ omschrijving: string }>) => {
      return value?.map(({ omschrijving }) => omschrijving).join(', ');
    },
  },
].map((p) => {
  if (!p.hpx) {
    p.hpx = HPX_DEFAULT;
  }
  return p;
});

const chapterMenuItems = myChaptersMenuItems.filter((item) =>
  item.profileTypes.includes('private')
);

const chaptersAvailable = chapterMenuItems.map((menuItem) => menuItem.id);

function getUserChapters(serviceResults: ServiceResults) {
  const chapterItems = chapterMenuItems;
  const items = chapterItems.filter((item) => {
    // Check to see if Chapter has been loaded or if it is directly available
    return (
      item.isAlwaysVisible || isChapterActive(item, serviceResults as AppState)
    );
  });

  return Object.fromEntries(
    items.map((menuItem) => [menuItem.id, menuItem.title])
  );
}

function getChapterRows(resultsByUser: Record<string, ServiceResults>) {
  const rows = Object.entries(resultsByUser)
    .map(([Username, serviceResults]) => {
      const userChapters = getUserChapters(serviceResults);
      return userChapters;
    })
    .filter((userChapters) => !!Object.keys(userChapters).length);
  return getRows(chaptersAvailable, rows, false);
}

function getNotificationRows(resultsByUser: Record<string, ServiceResults>) {
  const rows = Object.entries(resultsByUser).flatMap(
    ([Username, serviceResults]) => {
      return serviceResults.NOTIFICATIONS.content.map(
        (notification: MyNotification) => {
          return {
            Username: Username,
            thema: notification.chapter,
            titel: notification.title,
            datum: defaultDateFormat(notification.datePublished),
          };
        }
      );
    }
  );
  return rows;
}

function getRows(
  labels: string[],
  results: Array<Record<string, string | number>>,
  addRowLabel: boolean = true
) {
  const rowsMap: any = {};

  for (const label of labels) {
    rowsMap[label] = {};
    if (addRowLabel) {
      rowsMap[label]['0'] = label;
    }
  }

  results.forEach((user, index) => {
    for (const [label, value] of Object.entries(user)) {
      rowsMap[label][index + 1] = value;
    }
  });

  return Object.values(rowsMap);
}

function getRowValues(
  serviceResults: ServiceResults,
  paths: any[]
): Record<string, string | number> {
  const user = paths.reduce((acc, { path, label, transform }) => {
    let value = null;
    if (path) {
      [value] = jsonpath.query(serviceResults, path);
    }
    if (transform) {
      value = transform(value, serviceResults);
    }
    acc[label] = value;
    return acc;
  }, {} as Record<string, string | number>);

  return user;
}

interface SheetData {
  title: string;
  rows: any[];
  columnHeaders?: string[];
  colInfo?: XLSX.ColInfo[];
  rowInfo?: XLSX.RowInfo[];
}

function addSheets(workbook: XLSX.WorkBook, sheets: SheetData[]) {
  for (const sheet of sheets) {
    const { colInfo, rowInfo, rows, columnHeaders, title } = sheet;
    const worksheet = XLSX.utils.json_to_sheet(rows);

    if (colInfo) {
      worksheet['!cols'] = colInfo;
    }

    if (rowInfo) {
      worksheet['!rows'] = rowInfo;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, title);

    if (columnHeaders?.length) {
      XLSX.utils.sheet_add_aoa(worksheet, [columnHeaders], {
        origin: 'A1',
      });
    }
  }
}

function sheetBrpBase(resultsByUser: Record<string, ServiceResults>) {
  // BRP gegevens
  const rowValues = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      const add = {
        Username: Username,
      };
      const rowObject = getRowValues(serviceResults, paths);

      return Object.assign(add, rowObject);
    }
  );

  const rowInfo = Object.keys(testAccounts).map(() => ({ hpx: HPX_DEFAULT }));

  const colInfo = [
    { wch: WCH_DEFAULT }, // Username
    ...paths.map((pathObj) => ({ wch: pathObj.wch ?? WCH_DEFAULT })),
  ];

  return {
    title: 'BRP gegevens (beknopt)',
    rows: rowValues,
    columnHeaders: [],
    colInfo,
    rowInfo,
  };
}

function sheetChapters(resultsByUser: Record<string, ServiceResults>) {
  const rowInfo = Object.keys(testAccounts).map(() => ({ hpx: HPX_DEFAULT }));
  return {
    title: 'Themas',
    rows: getChapterRows(resultsByUser),
    columnHeaders: Object.keys(testAccounts),
    colInfo: [
      { wch: WCH_DEFAULT },
      ...Object.keys(testAccounts).map(() => ({ wch: WCH_DEFAULT })),
    ],
    rowInfo,
  };
}

function sheetNotifications(resultsByUser: Record<string, ServiceResults>) {
  const rows = getNotificationRows(resultsByUser);
  const rowInfo = rows.map(() => ({ hpx: HPX_DEFAULT }));
  const columnWidths = [WCH_DEFAULT, WCH_DEFAULT, WCH_DEFAULT * 3, WCH_DEFAULT];
  return {
    title: 'Actueel',
    rows,
    colInfo: rows[0]
      ? Object.keys(rows[0]).map((_x, index) => ({ wch: columnWidths[index] }))
      : undefined,
    rowInfo,
  };
}

function sheetChapterContent(resultsByUser: Record<string, ServiceResults>) {
  function count(chapter: Chapter) {
    return (serviceResults: ServiceResults) =>
      serviceResults[chapter]?.content?.length || '';
  }
  const chapterContents: Record<
    string,
    (serviceResults: ServiceResults) => string | number
  > = {
    Burgerzaken: (serviceResults: ServiceResults) => {
      return serviceResults.BRP.content?.identiteitsbewijzen.length || '';
    },
    Bezwaren: count('BEZWAREN'),
    Bijstandaanvragen: count('WPI_AANVRAGEN'),
    Jaaropgaves: (serviceResults: ServiceResults) => {
      return serviceResults.WPI_SPECIFICATIES.content?.jaaropgaven.length || '';
    },
    Uitkeringsspecificaties: (serviceResults: ServiceResults) => {
      return (
        serviceResults.WPI_SPECIFICATIES.content?.uitkeringsspecificaties
          .length || ''
      );
    },
    Tozo: count('WPI_TOZO'),
    Tonk: count('WPI_TONK'),
    BBZ: count('WPI_BBZ'),
    'Stadspassen (Gpass)': (serviceResults: ServiceResults) => {
      return serviceResults.WPI_STADSPAS.content?.stadspassen.length || '';
    },
    Stadspasaanvragen: (serviceResults: ServiceResults) => {
      return serviceResults.WPI_STADSPAS.content?.aanvragen.length || '';
    },
    'Zorg en ondersteuning': count('WMO'),
    Vergunningen: count('VERGUNNINGEN'),
    KVK: (serviceResults: ServiceResults) => {
      return !!serviceResults.KVK.content ? 'Ja' : '';
    },
    'ToerVerh Registraties': (serviceResults: ServiceResults) => {
      return (
        serviceResults.TOERISTISCHE_VERHUUR.content?.registraties.length || ''
      );
    },
    'ToerVerh Vergunningen': (serviceResults: ServiceResults) => {
      return (
        serviceResults.TOERISTISCHE_VERHUUR.content?.vergunningen.length || ''
      );
    },
    // KREFIA: (serviceResults: ServiceResults) => { return},
    Klachten: (serviceResults: ServiceResults) => {
      return serviceResults.KLACHTEN.content?.aantal || '';
    },
    Horeca: count('HORECA'),
    AVG: (serviceResults: ServiceResults) => {
      return serviceResults.AVG.content?.verzoeken.length || '';
    },
    'Bodem (Loodmeting)': (serviceResults: ServiceResults) => {
      return serviceResults.BODEM.content?.metingen.length || '';
    },
  };

  const results = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      const base: Record<string, string | number> = {
        Username,
      };
      return Object.keys(chapterContents).reduce((acc, chapter) => {
        acc[chapter] = chapterContents[chapter](serviceResults);
        return acc;
      }, base);
    }
  );

  const rowInfo = results.map(() => ({ hpx: HPX_DEFAULT }));
  return {
    title: 'Content',
    rows: results,
    colInfo: results[0]
      ? Object.keys(results[0]).map((_x, index) => ({
          wch: 15,
        }))
      : undefined,
    rowInfo,
  };
}

export async function generateOverview(
  fromDisk: boolean,
  targetDirectory: string
) {
  return getServiceResults(fromDisk, targetDirectory).then((resultsByUser) => {
    if (!fromDisk) {
      fs.writeFileSync(
        targetDirectory + '/user-data.json',
        JSON.stringify(resultsByUser)
      );
    }

    const fileName =
      targetDirectory +
      `/Test-Data-ACC-${dateFormat(new Date(), 'yyyy-MM-dd')}.xlsx`;
    const workbook = XLSX.utils.book_new();

    addSheets(workbook, [
      sheetBrpBase(resultsByUser),
      sheetChapters(resultsByUser),
      sheetNotifications(resultsByUser),
      sheetChapterContent(resultsByUser),
    ]);

    XLSX.writeFile(workbook, fileName, { compression: true });

    return fileName;
  });
}
