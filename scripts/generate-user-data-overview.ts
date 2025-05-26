/* eslint-disable */
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const ENV_FILE = '.env.local';
console.debug(`[UserDataOverview] trying env file ${ENV_FILE}`);
const envConfig = dotenv.config({ path: ENV_FILE });
dotenvExpand.expand(envConfig);

import * as XLSX from 'xlsx';

import * as fs from 'node:fs';
import { dateFormat, defaultDateFormat } from '../src/universal/helpers/date';
import { getFullAddress } from '../src/universal/helpers/brp';

import { MyNotification } from '../src/universal/types/App.types';
import {
  Adres,
  Kind,
  Persoon,
  Verbintenis,
} from '../src/server/services/profile/brp.types';
import { differenceInYears, parseISO } from 'date-fns';

import { ServiceResults } from '../src/server/services/content-tips/tip-types';
import { IS_PRODUCTION } from '../src/universal/config/env';

import {
  themaId as themaIdInkomen,
  themaTitle as themaTitleInkomen,
} from '../src/client/pages/Thema/Inkomen/Inkomen-thema-config.ts';
import {
  themaIdBRP,
  themaIdKVK,
  themaTitle as profileThemaTitles,
} from '../src/client/pages/Thema/Profile/Profile-thema-config.ts';
import {
  themaId as themaIdZorg,
  themaTitle as themaTitleZorg,
} from '../src/client/pages/Thema/Zorg/Zorg-thema-config.ts';
import {
  themaId as themaIdAfval,
  themaTitle as themaTitleAfval,
} from '../src/client/pages/Thema/Afval/Afval-thema-config.ts';
import {
  themaId as themaIdVergunningen,
  themaTitle as themaTitleVergunningen,
} from '../src/client/pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import {
  themaId as themaIdErfpacht,
  themaTitle as themaTitleErfpacht,
} from '../src/client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  themaId as themaIdBezwaren,
  themaTitle as themaTitleBezwaren,
} from '../src/client/pages/Thema/Bezwaren/Bezwaren-thema-config.ts';
import {
  themaId as themaIdHoreca,
  themaTitle as themaTitleHoreca,
} from '../src/client/pages/Thema/Horeca/Horeca-thema-config.ts';
import {
  themaId as themaIdToeristischeVerhuur,
  themaTitle as themaTitleToeristischeVerhuur,
} from '../src/client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import {
  themaId as themaIdAVG,
  themaTitle as themaTitleAVG,
} from '../src/client/pages/Thema/AVG/AVG-thema-config.ts';
import {
  themaId as themaIdSvwi,
  themaTitle as themaTitleSvwi,
} from '../src/client/pages/Thema/Svwi/Svwi-thema-config.ts';
import {
  themaId as themaIdKlachten,
  themaTitle as themaTitleKlachten,
} from '../src/client/pages/Thema/Klachten/Klachten-thema-config.ts';
import {
  themaId as themaIdKrefia,
  themaTitle as themaTitleKrefia,
} from '../src/client/pages/Thema/Krefia/Krefia-thema-config.ts';
import {
  themaId as themaIdBurgerzaken,
  themaTitle as themaTitleBurgerzaken,
} from '../src/client/pages/Thema/Burgerzaken/Burgerzaken-thema-config.ts';
import {
  themaId as themaIdAfis,
  themaTitle as themaTitleAfis,
} from '../src/client/pages/Thema/Afis/Afis-thema-config.ts';
import {
  themaId as themaIdOvertredingen,
  themaTitle as themaTitleOvertredingen,
} from '../src/client/pages/Thema/Overtredingen/Overtredingen-thema-config.ts';
import {
  themaId as themaIdVaren,
  themaTitle as themaTitleVaren,
} from '../src/client/pages/Thema/Varen/Varen-thema-config.ts';
import {
  themaId as themaIdBodem,
  themaTitle as themaTitleBodem,
} from '../src/client/pages/Thema/Bodem/Bodem-thema-config.ts';
import {
  themaId as themaIdHLI,
  themaTitle as themaTitleHLI,
} from '../src/client/pages/Thema/HLI/HLI-thema-config.ts';
import {
  themaId as themaIdJeugd,
  themaTitle as themaTitleJeugd,
} from '../src/client/pages/Thema/Jeugd/Jeugd-thema-config.ts';
import {
  themaId as themaIdParkeren,
  themaTitle as themaTitleParkeren,
} from '../src/client/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import {
  themaId as themaIdBelastingen,
  themaTitle as themaTitleBelastingen,
} from '../src/client/pages/Thema/Belastingen/Belastingen-thema-config.ts';
import {
  themaId as themaIdMilieuzone,
  themaTitle as themaTitleMilieuzone,
} from '../src/client/pages/Thema/Milieuzone/Milieuzone-thema-config.ts';
import {
  themaId as themaIdSubsidies,
  themaTitle as themaTitleSubsidies,
} from '../src/client/pages/Thema/Subsidies/Subsidies-thema-config.ts';

const { BRP, KVK } = profileThemaTitles;
const themas = [
  { id: themaIdBRP, title: BRP },
  { id: themaIdKVK, title: KVK },
  { id: themaIdInkomen, title: themaTitleInkomen },
  { id: themaIdZorg, title: themaTitleZorg },
  { id: themaIdAfval, title: themaTitleAfval },
  { id: themaIdVergunningen, title: themaTitleVergunningen },
  { id: themaIdErfpacht, title: themaTitleErfpacht },
  { id: themaIdBezwaren, title: themaTitleBezwaren },
  { id: themaIdHoreca, title: themaTitleHoreca },
  { id: themaIdToeristischeVerhuur, title: themaTitleToeristischeVerhuur },
  { id: themaIdAVG, title: themaTitleAVG },
  { id: themaIdSvwi, title: themaTitleSvwi },
  { id: themaIdKlachten, title: themaTitleKlachten },
  { id: themaIdKrefia, title: themaTitleKrefia },
  { id: themaIdBurgerzaken, title: themaTitleBurgerzaken },
  { id: themaIdAfis, title: themaTitleAfis },
  { id: themaIdOvertredingen, title: themaTitleOvertredingen },
  { id: themaIdVaren, title: themaTitleVaren },
  { id: themaIdBodem, title: themaTitleBodem },
  { id: themaIdHLI, title: themaTitleHLI },
  { id: themaIdJeugd, title: themaTitleJeugd },
  { id: themaIdParkeren, title: themaTitleParkeren },
  { id: themaIdBelastingen, title: themaTitleBelastingen },
  { id: themaIdMilieuzone, title: themaTitleMilieuzone },
  { id: themaIdSubsidies, title: themaTitleSubsidies },
];

if (IS_PRODUCTION) {
  throw Error('This script cannot be run inside of production.');
}

if (!process.env.MA_TEST_ACCOUNTS) {
  throw new Error('MA_TEST_ACCOUNTS env var is empty.');
}
let testAccounts: any = process.env.MA_TEST_ACCOUNTS.split(',');

const themaToTitle = themas.reduce((acc, { id, title }) => {
  acc[id] = title;
  return acc;
}, {});
const themasAvailable = themas.map((menuItem) => menuItem.id);
const testAccountEntries = getTestAccountEntries();

XLSX.set_fs(fs);
// If true then get data extracted out of services from disk.
// This greatly speeds up this script and is therefore nice for debugging.
const FROM_DISK: boolean = false;

// In which directory do we save the data coming from our services?
const TARGET_DIRECTORY: string = '.';

const BASE_URL = process.env.BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL;

// Configuartion for row/columns.
const HPX_DEFAULT = 22;
const WCH_DEFAULT = 25;

generateOverview();

function getTestAccountEntries() {
  testAccounts = testAccounts.map((accountData: any) => {
    const keyVal = accountData.split('=');
    return [keyVal[0], keyVal[1]];
  });
  return testAccounts;
}

async function generateOverview() {
  return getServiceResults().then((resultsByUser) => {
    if (!FROM_DISK) {
      fs.writeFileSync(
        TARGET_DIRECTORY + '/user-data.json',
        JSON.stringify(resultsByUser)
      );
    }

    const fileName = `${TARGET_DIRECTORY}/userdata-overview.xlsx`;
    const workbook = XLSX.utils.book_new();

    const serviceNames = getAllServiceNames(resultsByUser);
    const serviceKeys = Object.keys(serviceNames);

    addSheets(workbook, [
      sheetBrpBase(resultsByUser),
      sheetServiceErrors(resultsByUser, serviceKeys),
      sheetThemas(resultsByUser),
      sheetNotifications(resultsByUser),
      sheetThemaContent(resultsByUser),
    ]);

    XLSX.writeFile(workbook, fileName, { compression: true });

    return fileName;
  });
}

async function getServiceResults(): Promise<Record<string, ServiceResults>> {
  if (FROM_DISK) {
    const data = JSON.parse(
      fs.readFileSync(TARGET_DIRECTORY + '/user-data.json', 'utf8').toString()
    );
    return data;
  }

  const allResults: Record<string, ServiceResults> = {};

  for (const [username, userId] of testAccountEntries) {
    const loginURL = `${BASE_URL}/auth/digid/login/${username}?redirectUrl=noredirect`;
    try {
      const serviceResults = await fetch(loginURL).then(async (res) => {
        const Cookie = res.headers.get('Set-Cookie');
        if (!Cookie) {
          throw Error(`No Set-Cookie header found for request to ${loginURL}`);
        }

        console.time(`Fetched data for ${username}/${userId}`);
        return fetch(`${BASE_URL}/services/all`, {
          headers: {
            Cookie,
          },
        }).then((res) => {
          console.timeEnd(`Fetched data for ${username}/${userId}`);
          return res.json();
        });
      });
      allResults[username] = serviceResults;
    } catch (error) {
      console.error(error);
    }
  }

  return allResults;
}

function naam(persoon: Persoon) {
  const voornamen = persoon.voornamen
    ?.split(' ')
    .map((naam, index) => {
      return index === 0 ? naam : naam.charAt(0) + '.';
    })
    .join(' ');
  const adellijkeTitel = persoon.omschrijvingAdellijkeTitel
    ? ` (${persoon.omschrijvingAdellijkeTitel})`
    : '';
  const voorvoegsel = persoon.voorvoegselGeslachtsnaam
    ? `${persoon.voorvoegselGeslachtsnaam} `
    : '';
  return `${voornamen} ${voorvoegsel}${persoon.geslachtsnaam}${adellijkeTitel}`;
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

function getThemaRows(resultsByUser: Record<string, ServiceResults>) {
  const rows = Object.entries(resultsByUser)
    .map(([_username, serviceResults]) => {
      const userThemas = getAvailableUserThemas(serviceResults);
      return userThemas;
    })
    .filter((userThemas) => !!Object.keys(userThemas).length);
  return getRows(themasAvailable, rows, false);
}

function getAvailableUserThemas(serviceResults: ServiceResults) {
  const availableThemas = Object.entries(serviceResults)
    .filter(([, sResult]) => {
      if (sResult.status === 'ERROR' || sResult.status === 'POSTPONE') {
        return false;
      }
      return isThemaAvailableForUser(sResult.content);
    })
    .map(([themaName]) => themaName);

  for (const themaID of availableThemas) {
    availableThemas[themaID] = themaToTitle[themaID];
  }

  return availableThemas;
}

type PartialContentObject = {
  isKnown?: boolean;
} & object;

function isThemaAvailableForUser(
  content: any[] | PartialContentObject
): boolean {
  if (!content) {
    return false;
  }
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  if (content.isKnown) {
    return true;
  }
  const entries = Object.entries(content);
  for (const [, val] of entries) {
    if (
      val &&
      ((Array.isArray(val) && val.length > 0) || Object.keys(val).length)
    ) {
      return true;
    }
  }
  return false;
}

function getNotificationRows(resultsByUser: Record<string, ServiceResults>) {
  const rows = Object.entries(resultsByUser).flatMap(
    ([Username, serviceResults]) => {
      return serviceResults.NOTIFICATIONS.content.map(
        (notification: MyNotification) => {
          return {
            Username: Username,
            Thema: themaToTitle[notification.thema],
            Titel: notification.title,
            Datum: defaultDateFormat(notification.datePublished),
          };
        }
      );
    }
  );
  return rows;
}

function getServiceErrors(
  resultsByUser: Record<string, ServiceResults>,
  serviceKeys: string[]
) {
  const serviceStatusResults = Object.entries(resultsByUser).map(
    ([_user, results]) => {
      return Object.fromEntries(
        Object.entries(results).map(([appStateKey, response]) => {
          return [
            appStateKey,
            `${response.status}${response.status === 'ERROR' ? ` - ${response.message}` : ''}`,
          ];
        })
      );
    }
  );
  const rows = getRows(serviceKeys, serviceStatusResults, true);
  return rows;
}

function getAllServiceNames(resultsByUser: Record<string, ServiceResults>) {
  const entries = Object.entries(resultsByUser);
  const serviceNames = entries
    .map(([_, serviceResults]) => serviceResults)
    .reduce(addAvailableThemas, {});
  return serviceNames;
}

function addAvailableThemas(
  serviceLabelAcc: object,
  serviceResults: ServiceResults
): object {
  Object.keys(serviceResults).forEach((serviceName) => {
    serviceLabelAcc[serviceName] = serviceName;
  });
  return serviceLabelAcc;
}

function getRows(
  labels: string[],
  results: Array<Record<string, string | number | Function>>,
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
      if (!rowsMap[label]) {
        // console.warn(`[WARN]: No rowsMap with label: ${label}`);
      } else {
        rowsMap[label][index + 1] = value;
      }
    }
  });

  return Object.values(rowsMap);
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

function createInfoArray(elementAmount: number, info: object): object[] {
  const items: object[] = [];
  for (let i = 0; i < elementAmount; i++) {
    items.push(info);
  }
  return items;
}

function sheetBrpBase(resultsByUser: Record<string, ServiceResults>) {
  const rows = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      return {
        Username,
        ...getBRPRows(serviceResults, brpSheetLayout),
      };
    }
  );
  const rowInfo = createInfoArray(testAccountEntries.length, {
    hpx: HPX_DEFAULT,
  });
  const colInfo = [
    { wch: WCH_DEFAULT }, // Username
    ...brpSheetLayout.map((pathObj) => ({ wch: pathObj.wch ?? WCH_DEFAULT })),
  ];
  const brpBaseSheet = {
    title: 'BRP gegevens (beknopt)',
    rows,
    colInfo,
    rowInfo,
  };
  return brpBaseSheet;
}

function getBRPRows(
  serviceResults: ServiceResults,
  paths: any[]
): Record<string, string | number> {
  const user = paths.reduce(
    (acc, { extractContentValue, label, transform }) => {
      if (!serviceResults.BRP.content) {
        acc[label] = 'No content';
        return acc;
      }
      let value = null;
      if (extractContentValue) {
        value = extractContentValue(serviceResults.BRP.content);
      }
      if (transform) {
        value = transform(value, serviceResults);
      }
      acc[label] = value;
      return acc;
    },
    {} as Record<string, string | number>
  );

  return user;
}

type BrpSheetLayout = {
  label: string;
  extractContentValue: string;
  transform?: (value: any, serviceResults: ServiceResults) => string | null;
  wch?: number;
  hpx?: number;
};

const brpSheetLayout: BrpSheetLayout[] = [
  {
    label: 'BSN',
    extractContentValue: (brpContent: any) => brpContent.persoon.bsn,
  },
  {
    label: 'Voornamen',
    extractContentValue: (brpContent: any) => brpContent.persoon.voornamen,
    wch: 40,
  },
  {
    label: 'Achternaam (Titel)',
    extractContentValue: (brpContent: any) => brpContent.persoon,
    transform: (persoon: Persoon) => {
      if (!persoon) {
        return 'onbekend';
      }
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
    label: 'Woonplaats',
    extractContentValue: (brpContent: any) => brpContent.adres.woonplaatsNaam,
    transform: (woonplaatsnaam: string) => {
      if (!woonplaatsnaam) {
        return 'Onbekend';
      }
      return woonplaatsnaam;
    },
  },
  {
    label: 'Geboortedatum (Geboorteland)',
    extractContentValue: (brpContent: any) => brpContent.persoon,
    transform: (persoon: Persoon) => {
      if (!persoon) {
        return 'onbekend';
      }
      const { geboortedatum, geboortelandnaam } = persoon;
      return `${
        geboortedatum !== null ? defaultDateFormat(geboortedatum) : 'onbekend'
      } ${geboortelandnaam !== 'Nederland' ? `(${geboortelandnaam ?? 'onbekend'})` : ''}`;
    },
  },
  {
    label: 'Leeftijd',
    extractContentValue: (brpContent: any) => brpContent.persoon.geboortedatum,
    transform: (value: string | null, serviceResults: ServiceResults) => {
      const age =
        value !== null
          ? differenceInYears(new Date(), parseISO(value)) + ''
          : 'onbekend';
      return age;
    },
  },
  {
    label: 'Geslacht (Nationaliteit)',
    extractContentValue: (brpContent: any) => brpContent.persoon,
    transform: (persoon: Persoon) => {
      if (!persoon) {
        return 'onbekend';
      }
      const nationaleiten = persoon.nationaliteiten
        ?.map(({ omschrijving }) => omschrijving)
        .join(', ');
      return `${persoon.omschrijvingGeslachtsaanduiding} ${
        nationaleiten !== 'Nederlandse' && nationaleiten
          ? `(${nationaleiten})`
          : ''
      }`;
    },
  },
  {
    label: 'Adres (In onderzoek / VOW / Geheim)',
    extractContentValue: (brpContent: any) => brpContent.adres,
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
          serviceResults.BRP.content?.persoon?.indicatieGeheim
            ? ' (Geheim)'
            : ''
        }`
      );
    },
  },
  {
    label: 'Postcode (Woonplaats)',
    extractContentValue: (brpContent: any) => brpContent.adres.postcode,
    transform: (postcode: string, serviceResults: ServiceResults) => {
      return `${postcode ? postcode : ''} ${woonplaatsNaamBuitenAmsterdam(
        serviceResults.BRP.content?.adres
      )}`;
    },
  },
  {
    label: 'Verbintenis (Partner)',
    extractContentValue: (brpContent: any) => brpContent.verbintenis,
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
    extractContentValue: (brpContent: any) => brpContent.kinderen,
    wch: 60,
    transform: oudersOfKinderen,
  },
  {
    label: 'Ouders',
    extractContentValue: (brpContent: any) => brpContent.ouders,
    wch: 60,
    transform: oudersOfKinderen,
  },
  {
    label: 'Voormalige verbintenis',
    extractContentValue: (brpContent: any) => brpContent.verbintenisHistorisch,
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
    extractContentValue: (brpContent: any) => brpContent.adresHistorisch,
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
].map((p) => {
  if (!p.hpx) {
    p.hpx = HPX_DEFAULT;
  }
  return p;
});

function sheetThemas(resultsByUser: Record<string, ServiceResults>) {
  const rowInfo = createInfoArray(testAccountEntries.length, {
    hpx: HPX_DEFAULT,
  });
  return {
    title: 'Themas',
    rows: getThemaRows(resultsByUser),
    columnHeaders: getUsernameColumnHeaders(),
    colInfo: [
      { wch: WCH_DEFAULT },
      ...Object.keys(testAccounts).map(() => ({ wch: WCH_DEFAULT })),
    ],
    rowInfo,
  };
}

function sheetServiceErrors(
  resultsByUser: Record<string, ServiceResults>,
  serviceKeys: string[]
) {
  const rowInfo = createInfoArray(testAccountEntries.length, {
    hpx: HPX_DEFAULT,
  });

  return {
    title: 'Service Errors',
    rows: getServiceErrors(resultsByUser, serviceKeys),
    columnHeaders: ['', getUsernameColumnHeaders()],
    colInfo: [
      { wch: WCH_DEFAULT },
      ...createInfoArray(testAccountEntries.length, { wch: WCH_DEFAULT }),
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

function sheetThemaContent(resultsByUser: Record<string, ServiceResults>) {
  function count(themaId: string) {
    return (serviceResults: ServiceResults) =>
      serviceResults[themaId]?.content?.length || '';
  }

  const themaContentGetters: Record<
    string,
    (serviceResults: ServiceResults) => string | number
  > = {
    Burgerzaken: (serviceResults: ServiceResults) => {
      return serviceResults.BRP.content?.identiteitsbewijzen?.length || '';
    },
    Bezwaren: count('BEZWAREN'),
    Bijstandaanvragen: count('WPI_AANVRAGEN'),
    Jaaropgaves: (serviceResults: ServiceResults) => {
      return (
        serviceResults.WPI_SPECIFICATIES.content?.jaaropgaven?.length || ''
      );
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
      if (!serviceResults.HLI.content?.stadspas) {
        return '';
      }
      return serviceResults.HLI.content.stadspas?.length;
    },
    Stadspasregelingen: (serviceResults: ServiceResults) => {
      if (!serviceResults.HLI.content?.regelingen) {
        return '';
      }
      return serviceResults.HLI.content.regelingen?.length;
    },
    'Zorg en ondersteuning': count('WMO'),
    Vergunningen: count('VERGUNNINGEN'),
    KVK: (serviceResults: ServiceResults) => {
      return serviceResults.KVK?.content ? 'Ja' : '';
    },
    'ToerVerh LLV Registraties': (serviceResults: ServiceResults) => {
      return (
        serviceResults.TOERISTISCHE_VERHUUR.content?.lvvRegistraties?.length ||
        ''
      );
    },
    'ToerVerh Vakantie Vergunningen': (serviceResults: ServiceResults) => {
      return (
        serviceResults.TOERISTISCHE_VERHUUR.content?.vakantieverhuurVergunningen
          ?.length || ''
      );
    },
    'ToerVerh Bed and Breakfast Vergunningen': (
      serviceResults: ServiceResults
    ) => {
      return (
        serviceResults.TOERISTISCHE_VERHUUR.content?.bbVergunningen.length || ''
      );
    },
    // KREFIA: (serviceResults: ServiceResults) => { return},
    Klachten: (serviceResults: ServiceResults) => {
      return serviceResults.KLACHTEN.content?.aantal || '';
    },
    Horeca: count('HORECA'),
    AVG: (serviceResults: ServiceResults) => {
      return serviceResults.AVG.content?.verzoeken?.length || '';
    },
    'Bodem (Loodmeting)': (serviceResults: ServiceResults) => {
      return serviceResults.BODEM.content?.metingen?.length || '';
    },
  };

  const results = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      const base: Record<string, string | number> = {
        Username,
      };
      return Object.keys(themaContentGetters).reduce((acc, thema) => {
        acc[thema] = themaContentGetters[thema](serviceResults);
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

function getUsernameColumnHeaders() {
  return testAccounts.map(([username]) => username);
}
