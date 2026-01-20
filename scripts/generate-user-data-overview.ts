/**
 * Script to fetch, transform and save testdata for every account -
 * in the MA_TEST_ACCOUNTS environment variable to a excel file.
 * This is used for quickly looking up what user has, which thema's/data -
 * without needing to separately login to every account.
 *
 * When debugging locally
 * ======================
 *
 * Make sure MA_TEST_ACCOUNTS is filled with testaccounts like so:
 *   {account_name}={bsn},{account_name}={bsn},...
 * Put that in your .env.local file
 *
 * Also fill BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL with
 * `https://{azure_default_domain}/api/v1` where azure_default_domain is found -
 * on our test environment Appservice in Azure Portal.
 *
 * How to use
 * ==========
 * pnpx tsx generate-user-data-overview.ts
 * add --from-disk or -d to use cached data. To refresh the cache remove this flag.
 *
 * Tips
 * =========
 * - The script can be run from disk see `FROM_DISK` in this file.
 * - Use a tool like watchexec for rerunning the script when debugging
 * ```sh
 * watchexec -c -e ts pnpx tsx ./scripts/generate-user-data-overview.ts
 * ```
 */

/* eslint-disable */
import '../src/server/helpers/load-env.ts';

import * as XLSX from 'xlsx';

import * as fs from 'node:fs';
import { defaultDateFormat } from '../src/universal/helpers/date';
import { getFullAddress } from '../src/universal/helpers/brp';
import { testAccountDataDigid } from '../src/universal/config/auth.development';

import { MyNotification } from '../src/universal/types/App.types';
import {
  Adres,
  Kind,
  Persoon,
  Verbintenis,
} from '../src/server/services/brp/brp-types';
import { differenceInYears, parseISO } from 'date-fns';

import { ServiceResults } from '../src/server/services/content-tips/tip-types';
import { IS_PRODUCTION } from '../src/universal/config/env';

import {
  themaId as themaIdInkomen,
  themaTitle as themaTitleInkomen,
} from '../src/client/pages/Thema/Inkomen/Inkomen-thema-config';
import {
  themaIdBRP,
  themaIdKVK,
  themaTitle as profileThemaTitles,
} from '../src/client/pages/Thema/Profile/Profile-thema-config';
import {
  themaId as themaIdZorg,
  themaTitle as themaTitleZorg,
} from '../src/client/pages/Thema/Zorg/Zorg-thema-config';
import {
  themaId as themaIdAfval,
  themaTitle as themaTitleAfval,
} from '../src/client/pages/Thema/Afval/Afval-thema-config';
import {
  themaId as themaIdVergunningen,
  themaTitle as themaTitleVergunningen,
} from '../src/client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import {
  themaId as themaIdErfpacht,
  themaTitle as themaTitleErfpacht,
} from '../src/client/pages/Thema/Erfpacht/Erfpacht-thema-config';
import {
  themaId as themaIdBezwaren,
  themaTitle as themaTitleBezwaren,
} from '../src/client/pages/Thema/Bezwaren/Bezwaren-thema-config';
import {
  themaId as themaIdHoreca,
  themaTitle as themaTitleHoreca,
} from '../src/client/pages/Thema/Horeca/Horeca-thema-config';
import {
  themaId as themaIdToeristischeVerhuur,
  themaTitle as themaTitleToeristischeVerhuur,
} from '../src/client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import {
  themaId as themaIdAVG,
  themaTitle as themaTitleAVG,
} from '../src/client/pages/Thema/AVG/AVG-thema-config';
import {
  themaId as themaIdSvwi,
  themaTitle as themaTitleSvwi,
} from '../src/client/pages/Thema/Svwi/Svwi-thema-config';
import {
  themaId as themaIdKlachten,
  themaTitle as themaTitleKlachten,
} from '../src/client/pages/Thema/Klachten/Klachten-thema-config';
import {
  themaId as themaIdKrefia,
  themaTitle as themaTitleKrefia,
} from '../src/client/pages/Thema/Krefia/Krefia-thema-config';
import {
  themaId as themaIdAfis,
  themaTitle as themaTitleAfis,
} from '../src/client/pages/Thema/Afis/Afis-thema-config';
import {
  themaId as themaIdOvertredingen,
  themaTitle as themaTitleOvertredingen,
} from '../src/client/pages/Thema/Overtredingen/Overtredingen-thema-config';
import {
  themaId as themaIdVaren,
  themaTitle as themaTitleVaren,
} from '../src/client/pages/Thema/Varen/Varen-thema-config';
import { themaConfig as bodemThemaConfig } from '../src/client/pages/Thema/Bodem/Bodem-thema-config';
import { themaConfig as themaConfigHLI } from '../src/client/pages/Thema/HLI/HLI-thema-config';
import {
  themaId as themaIdJeugd,
  themaTitle as themaTitleJeugd,
} from '../src/client/pages/Thema/Jeugd/Jeugd-thema-config';
import {
  themaId as themaIdParkeren,
  themaTitle as themaTitleParkeren,
} from '../src/client/pages/Thema/Parkeren/Parkeren-thema-config';
import {
  themaId as themaIdBelastingen,
  themaTitle as themaTitleBelastingen,
} from '../src/client/pages/Thema/Belastingen/Belastingen-thema-config';
import {
  themaId as themaIdMilieuzone,
  themaTitle as themaTitleMilieuzone,
} from '../src/client/pages/Thema/Milieuzone/Milieuzone-thema-config';
import {
  themaId as themaIdSubsidies,
  themaTitle as themaTitleSubsidies,
} from '../src/client/pages/Thema/Subsidies/Subsidies-thema-config';

const { BRP, KVK } = profileThemaTitles;

/** Extra hardcoded additions are to display certain services like they're their own thema.
 */
const themas = [
  { id: themaIdBRP, title: BRP },
  { id: themaIdKVK, title: KVK },
  { id: 'KLANT_CONTACT', title: 'Contactmomenten' },
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
  { id: themaIdAfis, title: themaTitleAfis },
  { id: themaIdOvertredingen, title: themaTitleOvertredingen },
  { id: themaIdVaren, title: themaTitleVaren },
  { id: bodemThemaConfig.id, title: bodemThemaConfig.title },
  { id: themaConfigHLI.id, title: themaConfigHLI.title },
  { id: themaIdJeugd, title: themaTitleJeugd },
  { id: themaIdParkeren, title: themaTitleParkeren },
  { id: themaIdBelastingen, title: themaTitleBelastingen },
  { id: themaIdMilieuzone, title: themaTitleMilieuzone },
  { id: themaIdSubsidies, title: themaTitleSubsidies },
];

if (IS_PRODUCTION) {
  throw Error('This script cannot be run inside of production.');
}

if (!testAccountDataDigid) {
  throw new Error(
    'testAccountDataDigid is empty. Check if MA_TEST_ACCOUNTS has data.'
  );
}

const themaIDtoTitle: Record<string, string> = themas.reduce(
  (acc, { id, title }) => {
    acc[id] = title;
    return acc;
  },
  {} as Record<string, string>
);

const themaIDs = themas.map((menuItem) => menuItem.id);
const testAccounts = testAccountDataDigid.accounts.map(
  ({ username, profileId }) => [username, profileId]
);

XLSX.set_fs(fs);
// If true then get data extracted out of services from disk.
// This greatly speeds up this script and is therefore nice for debugging.
const firstArg = process.argv[2];
const FROM_DISK: boolean = firstArg === '--from-disk' || firstArg === '-d';

// Describes where we should save the transformed data from our services.
const TARGET_DIRECTORY: string = '.';
if (!TARGET_DIRECTORY) {
  throw new Error(
    `(TARGET_DIRECTORY = '${TARGET_DIRECTORY}') may not be empty`
  );
}

const CACHE_PATH = `${TARGET_DIRECTORY}/user-data.json`;
const BASE_URL = process.env.BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL;

// Configuartion for row/columns.
const HPX_DEFAULT = 22;
const WCH_DEFAULT = 25;

generateOverview();

async function generateOverview() {
  return getServiceResults().then((resultsByUser) => {
    if (!fs.existsSync(CACHE_PATH) || !FROM_DISK) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(resultsByUser));
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
      sheetZaken(resultsByUser),
    ]);

    XLSX.writeFile(workbook, fileName, { compression: true });

    return fileName;
  });
}

type ResultsByUser = Record<string, ServiceResults>;

interface SheetData {
  title: string;
  rows: any[];
  columnHeaders?: string[];
  colInfo?: XLSX.ColInfo[];
  rowInfo?: XLSX.RowInfo[];
}

function sheetZaken(resultsByUser: ResultsByUser): SheetData {
  const results = Object.entries(resultsByUser);

  const decosZaakServices = [
    'VERGUNNINGEN',
    'HORECA',
    'TOERISTISCHE_VERHUUR',
    'PARKEREN',
  ];

  const rows = results.map(([username, data]) => {
    let zaken: any = [];
    for (const serviceName of decosZaakServices) {
      const cont = data[serviceName].content;
      const unpacked = unpackZaken(cont);
      for (const zaak of unpacked) {
        zaken.push({ ...zaak, serviceName });
      }
    }
    return zaken.map((zaak: any) => ({
      Zaaknummer: zaak.identifier,
      Thema: themaIDtoTitle[zaak.serviceName],
      Username: username,
    }));
  });

  const firstRow = rows[0];

  return {
    title: 'Zaken',
    rows: rows.flat(),
    colInfo:
      firstRow &&
      Object.values(firstRow).map(() => ({
        wch: 30,
      })),
    rowInfo: rows.map(() => ({ hpx: HPX_DEFAULT })),
  };
}

function unpackZaken(content: object): object[] {
  if (Array.isArray(content) && content.some((v) => !!v.identifier)) {
    return content;
  }
  const arrays = Object.values(content).filter((v) => Array.isArray(v));
  if (arrays) {
    return arrays.flat();
  }
  if (!(typeof content !== 'object')) {
    return [];
  }
  return unpackZaken(Object.values(content));
}

async function getServiceResults(): Promise<ResultsByUser> {
  if (fs.existsSync(CACHE_PATH) && FROM_DISK) {
    const data = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8').toString());
    return data;
  }

  const allResults: ResultsByUser = {};

  for (const [username, profileId] of testAccounts) {
    const loginURL = `${BASE_URL}/auth/digid/login/${username}?redirectUrl=noredirect`;
    try {
      const serviceResults = await fetch(loginURL).then(async (res) => {
        const Cookie = res.headers.get('Set-Cookie');
        if (!Cookie) {
          throw Error(`No Set-Cookie header found for request to ${loginURL}`);
        }

        console.time(`Fetched data for ${username}/${profileId}`);
        return fetch(`${BASE_URL}/services/all`, {
          headers: {
            Cookie,
          },
        }).then((res) => {
          console.timeEnd(`Fetched data for ${username}/${profileId}`);
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
  _serviceResults: ServiceResults
) {
  return oudersOfKinderen?.length
    ? oudersOfKinderen
        .map((persoon) => relatedUser(persoon as Persoon))
        .join(', ')
    : '';
}

function relatedUser(persoon: Persoon) {
  const relatedUsername = testAccounts.find(
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

function getAllServiceNames(resultsByUser: ResultsByUser) {
  const entries = Object.entries(resultsByUser);
  const serviceNames = entries
    .map(([_, serviceResults]) => serviceResults)
    .reduce(addAvailableThemas, {});
  return serviceNames;
}

function addAvailableThemas(
  serviceLabelAcc: Record<string, string>,
  serviceResults: ServiceResults
): object {
  Object.keys(serviceResults).forEach((serviceName) => {
    serviceLabelAcc[serviceName] = serviceName;
  });
  return serviceLabelAcc;
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

function sheetBrpBase(resultsByUser: ResultsByUser): SheetData {
  const rows = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      return {
        Username,
        ...getBRPRows(serviceResults, brpSheetLayout),
      };
    }
  );
  const rowInfo = createInfoArray(testAccounts.length, {
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
  extractContentValue: (brpContent: any) => string;
  transform?: (value: any, serviceResults: ServiceResults) => string | null;
  wch?: number;
  hpx?: number;
};

const brpSheetLayout: BrpSheetLayout[] = [
  {
    label: 'BSN',
    wch: WCH_DEFAULT / 2,
    extractContentValue: (brpContent: any) => brpContent?.persoon.bsn,
  },
  {
    label: 'Adres',
    extractContentValue: (brpContent: any) => brpContent?.adres,
    wch: WCH_DEFAULT,
    transform: (value: Adres) => {
      return getFullAddress(value);
    },
  },
  {
    label: 'In onderzoek',
    extractContentValue: (brpContent: any) =>
      brpContent?.persoon.adresInOnderzoek,
    wch: WCH_DEFAULT / 2,
    transform: (inOnderzoek: any) => {
      return inOnderzoek ? 'In onderzoek' : '';
    },
  },
  {
    label: 'VOW',
    extractContentValue: (brpContent: any) =>
      brpContent?.persoon?.vertrokkenOnbekendWaarheen,
    wch: WCH_DEFAULT / 3,
    transform: (vertrokkenOnbekendWaarheen: any) => {
      return vertrokkenOnbekendWaarheen ? 'VOW' : '';
    },
  },
  {
    label: 'Geheim',
    extractContentValue: (brpContent: any) =>
      brpContent?.persoon.indicatieGeheim,
    wch: WCH_DEFAULT / 2,
    transform: (indicatieGeheim: boolean) => {
      return indicatieGeheim ? 'Geheim' : '';
    },
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
    transform: (value: string | null) => {
      const age =
        value !== null
          ? differenceInYears(new Date(), parseISO(value)) + ''
          : 'onbekend';
      return age;
    },
  },
  {
    label: 'Geslacht',
    extractContentValue: (brpContent: any) => brpContent.persoon,
    transform: (persoon: Persoon) => {
      if (!persoon.omschrijvingGeslachtsaanduiding) {
        return 'onbekend';
      }
      return persoon.omschrijvingGeslachtsaanduiding;
    },
  },
  {
    label: 'Nationaliteit',
    extractContentValue: (brpContent: any) => brpContent.persoon,
    transform: (persoon: Persoon) => {
      if (!persoon.nationaliteiten) {
        return 'onbekend';
      }
      const nationaleiten = persoon.nationaliteiten
        ?.map(({ omschrijving }) => omschrijving)
        .join(', ');
      return nationaleiten !== 'Nederlandse' && nationaleiten
        ? `${nationaleiten}`
        : '';
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
            verbintenis.soortVerbintenis ?? ''
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
                verbintenis.soortVerbintenis ?? ''
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
    transform: (adressen: Adres[]) => {
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

function sheetThemas(resultsByUser: ResultsByUser): SheetData {
  const rowInfo = createInfoArray(testAccounts.length, {
    hpx: HPX_DEFAULT,
  });

  // A undefined field equals means an unavailable thema.
  const availableThemaMaps: Record<string, string | undefined>[] =
    Object.entries(resultsByUser)
      .map(([_username, serviceResults]) => {
        const userThemas = getAvailableUserThemas(serviceResults);
        return userThemas;
      })
      .filter((userThemas) => !!Object.keys(userThemas).length);

  const rowsMap: any = {};

  for (const themaID of themaIDs) {
    rowsMap[themaID] = {};
    rowsMap[themaID]['0'] = themaIDtoTitle[themaID];
  }

  availableThemaMaps.forEach((availableThemaMap, index) => {
    for (const [label, value] of Object.entries(availableThemaMap)) {
      if (rowsMap[label]) {
        rowsMap[label][index + 1] = value;
      } else {
        // console.warn(`[WARN]: No rowsMap with label: ${label}`);
      }
    }
  });

  const columnHeaders = [
    'Themas',
    ...testAccounts.map(([username]) => username),
  ];
  return {
    title: 'Themas',
    rows: Object.values(rowsMap),
    columnHeaders,
    colInfo: [
      { wch: WCH_DEFAULT },
      ...createInfoArray(columnHeaders.length, { wch: WCH_DEFAULT }),
    ],
    rowInfo,
  };
}

function getAvailableUserThemas(serviceResults: ServiceResults) {
  const availableThemas = Object.entries(serviceResults)
    .filter(([, sResult]) => {
      if (
        sResult.status === 'ERROR' ||
        sResult.status === 'POSTPONE' ||
        !sResult.content ||
        (Array.isArray(sResult.content) && sResult.content.length <= 0)
      ) {
        return false;
      }
      if (sResult.content.isKnown) {
        return true;
      }
      const entries = Object.entries(sResult.content);
      for (const [, val] of entries) {
        if (
          val &&
          ((Array.isArray(val) && val.length > 0) || Object.keys(val).length)
        ) {
          return true;
        }
      }
      return false;
    })
    .map(([themaName]) => themaName);

  const aThemas: Record<string, string> = {};

  for (let themaID of availableThemas) {
    // Prevent setting a key to undefined if already set.
    if (aThemas[themaID]) {
      continue;
    } else if (themaID.startsWith('WPI')) {
      themaID = 'INKOMEN';
    } else if (themaID === 'WMO') {
      themaID = 'ZORG';
    }
    aThemas[themaID] = themaIDtoTitle[themaID];
  }

  return aThemas;
}

function sheetServiceErrors(
  resultsByUser: ResultsByUser,
  serviceKeys: string[]
): SheetData {
  const rowInfo = createInfoArray(testAccounts.length, {
    hpx: HPX_DEFAULT,
  });

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

  const rowsMap: any = {};

  for (const label of serviceKeys) {
    rowsMap[label] = {};
    rowsMap[label]['0'] = label;
  }

  serviceStatusResults.forEach((res, index) => {
    for (const [label, value] of Object.entries(res)) {
      if (!rowsMap[label]) {
        // console.warn(`[WARN]: No rowsMap with label: ${label}`);
      } else {
        rowsMap[label][index + 1] = value;
      }
    }
  });

  return {
    title: 'Service Errors',
    rows: Object.values(rowsMap),
    columnHeaders: ['', ...testAccounts.map(([username]) => username)],
    colInfo: [
      { wch: WCH_DEFAULT },
      ...createInfoArray(testAccounts.length, { wch: WCH_DEFAULT }),
    ],
    rowInfo,
  };
}

function sheetNotifications(resultsByUser: ResultsByUser): SheetData {
  const rowShape = {
    Username: (data: any) => data.username,
    Thema: (data: any) => themaIDtoTitle[data.themaID],
    Titel: (data: any) => data.title,
    Datum: (data: any) => defaultDateFormat(data.datePublished),
    Description: (data: any) => data.description,
  };

  const rows = Object.entries(resultsByUser).flatMap(
    ([Username, serviceResults]) => {
      return serviceResults.NOTIFICATIONS.content.map(
        (notification: MyNotification) => {
          const data = { ...notification, username: Username };
          const row: Record<string, string> = {};
          for (const [k, fn] of Object.entries(rowShape)) {
            row[k] = fn(data);
          }
          return row;
        }
      );
    }
  );

  const rowInfo = rows.map(() => ({ hpx: HPX_DEFAULT }));
  const columnWidths = [
    WCH_DEFAULT,
    WCH_DEFAULT,
    WCH_DEFAULT * 3,
    WCH_DEFAULT,
    WCH_DEFAULT,
  ];
  if (columnWidths.length !== Object.keys(rowShape).length) {
    throw new Error(
      'Should have the same size, align columnWidths appropriately'
    );
  }

  return {
    title: 'Actueel',
    rows,
    colInfo: rows[0]
      ? Object.keys(rows[0]).map((_x, index) => ({ wch: columnWidths[index] }))
      : undefined,
    rowInfo,
  };
}

function sheetThemaContent(resultsByUser: ResultsByUser): SheetData {
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
      if (!serviceResults.HLI.content?.stadspas?.length) {
        return '';
      }
      return serviceResults.HLI.content.stadspas?.length;
    },
    Stadspasregelingen: (serviceResults: ServiceResults) => {
      if (!serviceResults.HLI.content?.regelingen?.length) {
        return '';
      }
      return serviceResults.HLI.content.regelingen?.length;
    },
    'Zorg en ondersteuning': count('WMO'),
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
    KREFIA: (serviceResults: ServiceResults) => {
      return serviceResults.KREFIA?.content?.deepLinks?.length || '';
    },
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
    // The different types of vergunningen are added dynamicaly later.
    Vergunningen: count('VERGUNNINGEN'),
  };

  const results = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      const base: Record<string, string | number> = {
        Username,
      };

      const resVal = Object.keys(themaContentGetters).reduce((acc, thema) => {
        acc[thema] = themaContentGetters[thema](serviceResults);
        return acc;
      }, base);

      if (Array.isArray(serviceResults.VERGUNNINGEN?.content)) {
        // Add the count of all the different kinds of verguninngen.
        for (const vergunning of serviceResults.VERGUNNINGEN.content) {
          const id = vergunning.caseType;
          if (!resVal[id]) {
            resVal[id] = 1;
          } else {
            (resVal[id] as number)++;
          }
        }
      }

      return resVal;
    }
  );

  const rowInfo = results.map(() => ({ hpx: HPX_DEFAULT }));
  return {
    title: 'Content',
    rows: results,
    // Do it for 50 columns assuming this will be way more then we even need.
    colInfo: Array(50).fill({
      wch: 15,
    }),
    rowInfo,
  };
}
