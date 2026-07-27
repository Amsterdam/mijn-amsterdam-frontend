/**
 * Script to fetch, transform and save testdata for every account.

 * This is used for quickly looking up what user has, which thema's/data -
 * without needing to separately login to every account.
 *
 * When debugging locally
 * ======================
 * To connect to our test environment fill
 BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL with
 * `https://{azure_default_domain}/api/v1` where azure_default_domain is found -
 * on our test Appservice in Azure Portal.
 * Or keep the default that connects to our local server. Start up our local
 environment in that case.
 *
 * How to use
 * ==========
 * pnpx tsx src/scripts/generate-user-data-overview.ts [options]
 *
 * Command options
 * ---------------
 *
 * --out-file-digid-test-accounts=<filepath> (-f) to decide where to -
 * save the test account json overview this will overwrite the local file by default.
 *
 * --out-excel-dir (-e) Decide in which directory the excel will be placed for e.q 'artifact'.
 *
 * Tips
 * =========
 * - Use a tool like watchexec for rerunning the script when debugging
 * ```sh
 * watchexec -c -e ts pnpx tsx src/scripts/generate-user-data-overview.ts
 * ```
 */

/* eslint-disable */
import '../server/helpers/load-env.ts';

import { differenceInYears, parseISO } from 'date-fns';
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import * as XLSX from 'xlsx';

import { themaConfig as themaAfis } from '../client/pages/Thema/Afis/Afis-thema-config.ts';
import { themaConfig as themaAfval } from '../client/pages/Thema/Afval/Afval-thema-config.ts';
import { themaConfig as themaAVG } from '../client/pages/Thema/AVG/AVG-thema-config.ts';
import { themaConfig as themaBelastingen } from '../client/pages/Thema/Belastingen/Belastingen-thema-config.ts';
import { themaConfig as themaBezwaren } from '../client/pages/Thema/Bezwaren/Bezwaren-thema-config.ts';
import { themaConfig as themaBodem } from '../client/pages/Thema/Bodem/Bodem-thema-config.ts';
import { themaConfig as themaErfpacht } from '../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import { themaConfig as themaHLI } from '../client/pages/Thema/HLI/HLI-thema-config.ts';
import { themaConfig as themaHoreca } from '../client/pages/Thema/Horeca/Horeca-thema-config.ts';
import { themaConfig as themaInkomen } from '../client/pages/Thema/Inkomen/Inkomen-thema-config.ts';
import { themaConfig as themaJeugd } from '../client/pages/Thema/Jeugd/Jeugd-thema-config.ts';
import { themaConfig as themaKlachten } from '../client/pages/Thema/Klachten/Klachten-thema-config.ts';
import { themaConfig as themaKrefia } from '../client/pages/Thema/Krefia/Krefia-thema-config.ts';
import { themaConfig as themaMilieuzone } from '../client/pages/Thema/Milieuzone/Milieuzone-thema-config.ts';
import { themaConfig as themaOvertredingen } from '../client/pages/Thema/Overtredingen/Overtredingen-thema-config.ts';
import { themaConfig as themaParkeren } from '../client/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import { themaConfig as themaProfiles } from '../client/pages/Thema/Profile/Profile-thema-config.ts';
import { themaConfig as themaSubsidies } from '../client/pages/Thema/Subsidies/Subsidies-thema-config.ts';
import { themaConfig as themaKlantContact } from '../client/pages/Thema/KlantContact/KlantContact-thema-config.ts';
import {
  themaId as themaIdSvwi,
  themaTitle as themaTitleSvwi,
} from '../client/pages/Thema/Svwi/Svwi-thema-config.ts';
import { themaConfig as themaToeristischeVerhuur } from '../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import { themaConfig as themaVaren } from '../client/pages/Thema/Varen/Varen-thema-config.ts';
import { themaConfig as themaVergunningen } from '../client/pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import { themaConfig as themaZorg } from '../client/pages/Thema/Zorg/Zorg-thema-config.ts';
import {
  getTestAccountsBaseFromEnvMap,
  type OptionalTestUserAccountProperties,
  mergeWithDynamicTableHeaders,
} from '../server/helpers/test-accounts.ts';
import type {
  Adres,
  BrpFrontend,
  Kind,
  Persoon,
} from '../server/services/brp/brp-types.ts';
import type { ServiceResults } from '../server/services/content-tips/tip-types.ts';
import { IS_PRODUCTION } from '../universal/config/env.ts';
import { getFullAddress, isMokum } from '../universal/helpers/brp.ts';
import { defaultDateFormat } from '../universal/helpers/date.ts';
import type { AppState, MyNotification } from '../universal/types/App.types.ts';
import path from 'node:path';
import { parseValueMapString } from '../server/helpers/env.ts';

/**
 * Extra hardcoded additions are to display certain services as if they were
 * their own thema.
 */
const themas = [
  { id: themaProfiles.BRP.id, title: themaProfiles.BRP.title },
  { id: themaProfiles.KVK.id, title: themaProfiles.KVK.title },
  { id: themaKlantContact.id, title: themaKlantContact.title },
  { id: themaInkomen.id, title: themaInkomen.title },
  { id: themaZorg.id, title: themaZorg.title },
  { id: themaAfval.id, title: themaAfval.title },
  { id: themaVergunningen.id, title: themaVergunningen.title },
  { id: themaErfpacht.id, title: themaErfpacht.title },
  { id: themaBezwaren.id, title: themaBezwaren.title },
  { id: themaHoreca.id, title: themaHoreca.title },
  {
    id: themaToeristischeVerhuur.id,
    title: themaToeristischeVerhuur.title,
  },
  { id: themaAVG.id, title: themaAVG.title },
  { id: themaIdSvwi, title: themaTitleSvwi },
  { id: themaKlachten.id, title: themaKlachten.title },
  { id: themaKrefia.id, title: themaKrefia.title },
  { id: themaAfis.id, title: themaAfis.title },
  { id: themaOvertredingen.id, title: themaOvertredingen.title },
  { id: themaParkeren.id, title: themaParkeren.title },
  { id: themaVaren.id, title: themaVaren.title },
  { id: themaBodem.id, title: themaBodem.title },
  { id: themaHLI.id, title: themaHLI.title },
  { id: themaJeugd.id, title: themaJeugd.title },
  { id: themaBelastingen.id, title: themaBelastingen.title },
  { id: themaMilieuzone.id, title: themaMilieuzone.title },
  { id: themaSubsidies.id, title: themaSubsidies.title },
];

const themaIDtoTitle: Record<string, string> = themas.reduce(
  (acc, { id, title }) => {
    acc[id] = title;
    return acc;
  },
  {} as Record<string, string>
);

const now = new Date();
const [day, month, year] = [
  now.getDate(),
  now.getMonth() + 1,
  now.getFullYear(),
].map((d) => d.toString());

const { values: args } = parseArgs({
  options: {
    'out-file-name-digid-test-accounts-json': {
      type: 'string',
      default: `digid-test-accounts-overview_${day}-${month}-${year}.json`,
    },
    'out-file-name-user-data-excel': {
      type: 'string',
      default: `userdata-overview_${day}-${month}-${year}.xlsx`,
    },
    'out-artifact-dir': {
      type: 'string',
      default: '.',
    },
    'base-url': {
      type: 'string',
      default: process.env.BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL ?? '',
    },
  },
});

if (!args['base-url']) {
  throw new Error(
    'base-url is required. Please set BFF_TESTDATA_EXPORT_SCRIPT_API_BASE_URL in your environment or pass it as an argument.'
  );
}

const themaIDs = themas.map((menuItem) => menuItem.id);

let accountsMap: Map<string, string> = new Map();
let testAccountsDigid: [string, string][] = [];

XLSX.set_fs(fs);

// Configuration for row/columns.
const HPX_DEFAULT = 22;
const WCH_DEFAULT = 25;

/**
 * Fetches the test accounts defined in the ENV.
 */
async function fetchTestAccounts(): Promise<Map<string, string>> {
  const url = `${args['base-url']}/test-accounts/digid`;
  console.log(`Fetching test accounts from ${url}...`);
  const commaSeperatedTestAccounts = await fetch(url, {
    method: 'GET',
  });
  return parseValueMapString(await commaSeperatedTestAccounts.text());
}

function createDigidTestAccountsExcelFile(resultsByUser: ResultsByUser) {
  const fileName = path.join(
    args['out-artifact-dir'],
    args['out-file-name-user-data-excel']
  );
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
}

function createDigidTestAccountsOverviewFile(resultsByUser: ResultsByUser) {
  const testAccountsBase = getTestAccountsBaseFromEnvMap(
    accountsMap,
    'private'
  );
  let tableHeaders = testAccountsBase.tableHeaders;
  const accounts = testAccountsBase.accounts.map((account) => {
    const { username, profileId } = account;
    const accountSelectionProps = getDigidTestAccountSelectionProps(
      resultsByUser[username]
    );
    return {
      ...accountSelectionProps,
      // Make sure we always have the username and profileId from the testaccounts base.
      username,
      profileId,
    };
  });

  tableHeaders = mergeWithDynamicTableHeaders({ tableHeaders, accounts });

  const fileName = path.join(
    args['out-artifact-dir'],
    args['out-file-name-digid-test-accounts-json']
  );

  try {
    fs.writeFileSync(
      fileName,
      JSON.stringify({ tableHeaders, accounts }, null, 2)
    );
  } catch (error) {
    console.error('Error writing digid test accounts overview file:', error);
  }

  return fileName;
}

async function generateOverview() {
  return getServiceResults().then((resultsByUser) => {
    return {
      excelFile: createDigidTestAccountsExcelFile(resultsByUser),
      overviewFile: createDigidTestAccountsOverviewFile(resultsByUser),
    };
  });
}

function getDigidTestAccountSelectionProps(serviceResults: ServiceResults) {
  const brpBasedProperties = getBRPBasedProperties(serviceResults);
  return {
    ...brpBasedProperties,
    heeftStadspas:
      (serviceResults.HLI?.content?.stadspas?.stadspassen?.length ?? 0) > 0,
    availableThemas: Object.values(getAvailableUserThemas(serviceResults))
      .filter(Boolean)
      .join(', '),
  };
}

function getBRPBasedProperties(
  serviceResults: ServiceResults
): OptionalTestUserAccountProperties | null {
  const brpContent = serviceResults.BRP?.content as AppState['BRP']['content'];

  if (!brpContent) {
    return null;
  }

  const profileId = brpContent.persoon?.bsn ?? '';
  const geboortedatum = brpContent.persoon?.geboortedatum;

  return {
    brpBsn: profileId,
    mokum: !isMokum(brpContent) ? 'Nee' : '',
    hasChildren: brpContent.kinderen.length > 0 ? 'Ja' : '',
    partnerName: brpContent.verbintenis?.persoon.voornamen ?? '',
    isOlderThan18:
      geboortedatum && differenceInYears(new Date(), geboortedatum) >= 18
        ? ''
        : 'Nee',
    hasParents: brpContent.ouders.length > 0 ? '' : 'Nee',
    hasVertrokkenOnbekendWaarheen: brpContent.persoon
      ?.vertrokkenOnbekendWaarheen
      ? 'Ja'
      : '',
    isAdresInOnderzoek: brpContent.persoon?.adresInOnderzoek ? 'Ja' : '',
  };
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
      const cont = data[serviceName]?.content || {};
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

type WithIdentifier = {
  identifier: string;
};

function unpackZaken(
  content: WithIdentifier[] | Record<string, WithIdentifier[] | unknown>
): WithIdentifier[] {
  if (Array.isArray(content) && content.some((v) => !!v.identifier)) {
    return content;
  }
  return Object.values(content)
    .filter((v) => Array.isArray(v))
    .map((v) => unpackZaken(v))
    .flat();
}

async function getServiceResults(): Promise<ResultsByUser> {
  const allResults: ResultsByUser = {};

  for (const [username] of testAccountsDigid) {
    const loginURL = `${args['base-url']}/auth/digid/login?username=${encodeURIComponent(
      username
    )}&redirectUrl=noredirect`;
    try {
      const loginResponse = await fetch(loginURL);
      const cookie = loginResponse.headers.get('set-cookie');
      if (!cookie) {
        throw Error(`No Set-Cookie header found for request to ${loginURL}`);
      }
      console.time(`Fetched data for ${username}`);
      const servicesAllResponse = await fetch(
        `${args['base-url']}/services/all`,
        {
          headers: {
            cookie,
          },
        }
      );
      console.timeEnd(`Fetched data for ${username}`);
      allResults[username] = await servicesAllResponse.json();
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
  const relatedUsername = testAccountsDigid.find(
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
  const rowInfo = createInfoArray(testAccountsDigid.length, {
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
    (acc, { label, transform }) => {
      if (!serviceResults.BRP.content) {
        acc[label] = 'No content';
        return acc;
      }
      let value: string;
      try {
        value = transform(serviceResults.BRP.content, serviceResults) ?? '';
      } catch (err) {
        value = '';
        console.error(
          `Error while getting data for label: ${
            label
          }, with error message: ${err}`
        );
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
  transform: (
    brpContent: BrpFrontend,
    serviceResults: ServiceResults
  ) => string | undefined | null;
  wch?: number;
  hpx?: number;
};

const brpSheetLayout: BrpSheetLayout[] = [
  {
    label: 'BSN',
    wch: WCH_DEFAULT / 2,
    transform: (brpContent: BrpFrontend) => brpContent?.persoon.bsn,
  },
  {
    label: 'Adres',
    wch: WCH_DEFAULT,
    transform: (brpContent: BrpFrontend) => {
      return getFullAddress(brpContent?.adres);
    },
  },
  {
    label: 'In onderzoek',
    wch: WCH_DEFAULT / 2,
    transform: (brpContent: BrpFrontend) => {
      return brpContent?.persoon.adresInOnderzoek ? 'In onderzoek' : '';
    },
  },
  {
    label: 'VOW',
    wch: WCH_DEFAULT / 3,
    transform: (brpContent: BrpFrontend) => {
      return brpContent?.persoon?.vertrokkenOnbekendWaarheen ? 'VOW' : '';
    },
  },
  {
    label: 'Geheim',
    wch: WCH_DEFAULT / 2,
    transform: (brpContent: BrpFrontend) => {
      const indicatieGeheim = brpContent?.persoon.indicatieGeheim;
      return indicatieGeheim ? 'Geheim' : '';
    },
  },
  {
    label: 'Voornamen',
    transform: (brpContent: BrpFrontend) => brpContent.persoon.voornamen,
    wch: 40,
  },
  {
    label: 'Achternaam (Titel)',
    transform: (brpContent: BrpFrontend) => {
      const persoon = brpContent.persoon;
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
    transform: (brpContent: BrpFrontend) => {
      const woonplaatsnaam = brpContent.adres?.woonplaatsNaam;
      if (!woonplaatsnaam) {
        return 'Onbekend';
      }
      return woonplaatsnaam;
    },
  },
  {
    label: 'Geboortedatum (Geboorteland)',
    transform: (brpContent: BrpFrontend) => {
      const persoon = brpContent.persoon;
      if (!persoon) {
        return 'Onbekend';
      }
      const { geboortedatum, geboortelandnaam } = persoon;
      return `${
        geboortedatum !== null ? defaultDateFormat(geboortedatum) : 'Onbekend'
      } ${
        geboortelandnaam !== 'Nederland'
          ? `(${geboortelandnaam ?? 'Onbekend'})`
          : ''
      }`;
    },
  },
  {
    label: 'Leeftijd',
    transform: (brpContent: BrpFrontend) => {
      const geboortedatum = brpContent.persoon.geboortedatum;
      const age =
        geboortedatum !== null
          ? differenceInYears(new Date(), parseISO(geboortedatum)) + ''
          : 'onbekend';
      return age;
    },
  },
  {
    label: 'Geslacht',
    transform: (brpContent: BrpFrontend) => {
      const persoon = brpContent.persoon;
      if (!persoon.omschrijvingGeslachtsaanduiding) {
        return 'Onbekend';
      }
      return persoon.omschrijvingGeslachtsaanduiding;
    },
  },
  {
    label: 'Nationaliteit',
    transform: (brpContent: BrpFrontend) => {
      const persoon = brpContent.persoon;
      if (!persoon.nationaliteiten) {
        return 'Onbekend';
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
    transform: (brpContent: BrpFrontend, serviceResults: ServiceResults) => {
      const postcode = brpContent.adres?.postcode;
      return `${postcode ? postcode : ''} ${woonplaatsNaamBuitenAmsterdam(
        serviceResults.BRP.content?.adres
      )}`;
    },
  },
  {
    label: 'Verbintenis (Partner)',
    wch: 50,
    transform: (brpContent: BrpFrontend) => {
      const verbintenis = brpContent.verbintenis;
      if (!verbintenis) {
        return '';
      }
      return verbintenis.persoon
        ? `${verbintenis.soortVerbintenis ?? ''} met ${relatedUser(
            verbintenis.persoon as Persoon
          )}`
        : Object.keys(verbintenis).length
          ? JSON.stringify(verbintenis)
          : '';
    },
    hpx: 30,
  },
  {
    label: 'Kinderen',
    transform: (brpContent: BrpFrontend, serviceResults: ServiceResults) =>
      oudersOfKinderen(brpContent.kinderen, serviceResults),
    wch: 60,
  },
  {
    label: 'Ouders',
    transform: (brpContent: BrpFrontend, serviceResults: ServiceResults) =>
      oudersOfKinderen(brpContent.ouders, serviceResults),
    wch: 60,
  },
  {
    label: 'Voormalige adressen',
    transform: (brpContent: BrpFrontend) => {
      const adressen = brpContent.adresHistorisch;
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
  const rowInfo = createInfoArray(testAccountsDigid.length, {
    hpx: HPX_DEFAULT,
  });

  // A undefined field means an unavailable thema.
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
    ...testAccountsDigid.map(([username]) => username),
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

function sheetServiceErrors(
  resultsByUser: ResultsByUser,
  serviceKeys: string[]
): SheetData {
  const rowInfo = createInfoArray(testAccountsDigid.length, {
    hpx: HPX_DEFAULT,
  });

  const serviceStatusResults = Object.entries(resultsByUser).map(
    ([_user, results]) => {
      return Object.fromEntries(
        Object.entries(results).map(([appStateKey, response]) => {
          return [
            appStateKey,
            `${response.status}${
              response.status === 'ERROR' ? ` - ${response.message}` : ''
            }`,
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
    columnHeaders: ['', ...testAccountsDigid.map(([username]) => username)],
    colInfo: [
      { wch: WCH_DEFAULT },
      ...createInfoArray(testAccountsDigid.length, { wch: WCH_DEFAULT }),
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
      ? Object.keys(rows[0]).map((_x, index) => ({
          wch: columnWidths[index],
        }))
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
        // Add the count of all the different kinds of vergunningen.
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

function getAvailableUserThemas(
  serviceResults: ServiceResults
): Record<string, string> {
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
      const KEY = 'isKnown';
      if (KEY in sResult.content) {
        return sResult.content[KEY];
      }
      const entries = Object.entries(sResult.content);
      for (const [, val] of entries) {
        if (
          val &&
          ((Array.isArray(val) && val.length > 0) || Object.keys(val).length)
        ) {
          if ((val as any)?.stadspassen?.length === 0) {
            return false;
          }
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

async function main() {
  if (IS_PRODUCTION) {
    throw Error('This script cannot be run inside of production.');
  }

  accountsMap = await fetchTestAccounts();
  testAccountsDigid = Array.from(accountsMap);

  const result = await generateOverview();

  process.stdout.write(
    `Generated files:\n${result.excelFile}\n${result.overviewFile}\n`
  );
}

if (import.meta.main) {
  await main();
}

export const forTesting = {
  getAvailableUserThemas,
};
