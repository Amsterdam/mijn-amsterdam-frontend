'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const dotenv_1 = __importDefault(require('dotenv'));
const dotenv_expand_1 = __importDefault(require('dotenv-expand'));
const ENV_FILE = '.env.local';
console.debug(`trying env file ${ENV_FILE}`);
const envConfig = dotenv_1.default.config({ path: ENV_FILE });
dotenv_expand_1.default.expand(envConfig);
const jsonpath_1 = __importDefault(require('jsonpath'));
const XLSX = __importStar(require('xlsx'));
/* load 'fs' for readFile and writeFile support */
const fs = __importStar(require('fs'));
const helpers_1 = require('./universal/helpers');
const date_fns_1 = require('date-fns');
const menuItems_1 = require('./client/config/menuItems');
const useChapters_helpers_1 = require('./client/hooks/useChapters.helpers');
const auth_development_1 = require('./universal/config/auth.development');
const [targetDirectory = '.', useDisk = ''] = process.argv.slice(2);
XLSX.set_fs(fs);
const fromDisk = !!useDisk;
const testAccountEntries = Object.entries(auth_development_1.testAccounts);
function getServiceResults(fromDisk = false) {
  return __awaiter(this, void 0, void 0, function* () {
    if (fromDisk) {
      const data = JSON.parse(
        fs.readFileSync(targetDirectory + '/user-data.json', 'utf8').toString()
      );
      return data;
    }
    const allResults = {};
    for (const [Username, userId] of testAccountEntries) {
      const url = `${process.env.BFF_API_BASE_URL}/api/v1/auth/digid/login/${Username}?redirectUrl=noredirect`;
      try {
        const serviceResults = yield fetch(url).then((r) => {
          var _a;
          const Cookie =
            (_a = r.headers.get('Set-Cookie')) !== null && _a !== void 0
              ? _a
              : '';
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
  });
}
function naam(persoon) {
  var _a;
  return (_a = persoon.voornamen) === null || _a === void 0
    ? void 0
    : _a
        .split(' ')
        .map((naam, index) => {
          return index === 0 ? naam : naam.charAt(0) + '.';
        })
        .join(' ');
}
function oudersOfKinderen(oudersOfKinderen, serviceResults) {
  return (
    oudersOfKinderen === null || oudersOfKinderen === void 0
      ? void 0
      : oudersOfKinderen.length
  )
    ? oudersOfKinderen.map((persoon) => relatedUser(persoon)).join(', ')
    : '';
}
function relatedUser(persoon) {
  var _a;
  const relatedUsername =
    (_a = testAccountEntries.find(([, bsn]) => bsn === persoon.bsn)) === null ||
    _a === void 0
      ? void 0
      : _a[0];
  const age = `${
    persoon.overlijdensdatum
      ? 'overleden'
      : persoon.geboortedatum
      ? (0, date_fns_1.differenceInYears)(
          new Date(),
          (0, date_fns_1.parseISO)(persoon.geboortedatum)
        )
      : '??'
  }`;
  const nom = naam(persoon);
  const user = (persoon === null || persoon === void 0 ? void 0 : persoon.bsn)
    ? `[${persoon === null || persoon === void 0 ? void 0 : persoon.bsn}${
        relatedUsername ? '/' + relatedUsername : ''
      }]`
    : '';
  return `${nom} (${age}) ${user}`;
}
function woonplaatsNaamBuitenAmsterdam(adres) {
  const woonplaatsNaam =
    adres === null || adres === void 0 ? void 0 : adres.woonplaatsNaam;
  return woonplaatsNaam === 'Amsterdam' || !woonplaatsNaam
    ? ''
    : `(${woonplaatsNaam})`;
}
const HPX_DEFAULT = 22;
const WCH_DEFAULT = 25;
const paths = [
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
    transform: (persoon) => {
      return (
        `${
          (
            persoon === null || persoon === void 0
              ? void 0
              : persoon.voorvoegselGeslachtsnaam
          )
            ? persoon.voorvoegselGeslachtsnaam + ' '
            : ''
        }${
          persoon === null || persoon === void 0
            ? void 0
            : persoon.geslachtsnaam
        }` +
        ((
          persoon === null || persoon === void 0
            ? void 0
            : persoon.omschrijvingAdellijkeTitel
        )
          ? ` (${persoon.omschrijvingAdellijkeTitel})`
          : '')
      );
    },
    wch: 40,
  },
  {
    label: 'Geboortedatum',
    path: '$.BRP.content.persoon.geboortedatum',
    transform: (value) => {
      return value !== null
        ? (0, helpers_1.defaultDateFormat)(value)
        : 'onbekend';
    },
  },
  {
    label: 'Leeftijd',
    path: '$.BRP.content.persoon.geboortedatum',
    transform: (value, serviceResults) => {
      const age =
        value !== null
          ? (0, date_fns_1.differenceInYears)(
              new Date(),
              (0, date_fns_1.parseISO)(value)
            ) + ''
          : 'onbekend';
      return age;
    },
  },
  {
    label: 'Adres (In onderzoek / VOW / Geheim)',
    path: '$.BRP.content.adres',
    wch: WCH_DEFAULT * 2,
    transform: (value, serviceResults) => {
      var _a, _b, _c, _d, _e, _f;
      return (
        (0, helpers_1.getFullAddress)(value) +
        `${
          (
            (_b =
              (_a = serviceResults.BRP.content) === null || _a === void 0
                ? void 0
                : _a.persoon) === null || _b === void 0
              ? void 0
              : _b.adresInOnderzoek
          )
            ? ' (In onderzoek)'
            : ''
        }` +
        `${
          (
            (_d =
              (_c = serviceResults.BRP.content) === null || _c === void 0
                ? void 0
                : _c.persoon) === null || _d === void 0
              ? void 0
              : _d.vertrokkenOnbekendWaarheen
          )
            ? ' (VOW)'
            : ''
        }` +
        `${
          (
            (_f =
              (_e = serviceResults.BRP.content) === null || _e === void 0
                ? void 0
                : _e.persoon) === null || _f === void 0
              ? void 0
              : _f.indicateGeheim
          )
            ? ' (Geheim)'
            : ''
        }`
      );
    },
  },
  {
    label: 'Postcode (Woonplaats)',
    path: '$.BRP.content.adres.postcode',
    transform: (postcode, serviceResults) => {
      var _a;
      return `${postcode ? postcode : ''} ${woonplaatsNaamBuitenAmsterdam(
        (_a = serviceResults.BRP.content) === null || _a === void 0
          ? void 0
          : _a.adres
      )}`;
    },
  },
  {
    label: 'Verbintenis',
    path: '$.BRP.content.verbintenis',
    wch: 50,
    transform: (verbintenis) => {
      var _a;
      if (!verbintenis) {
        return '';
      }
      return verbintenis.persoon
        ? `${
            (_a =
              verbintenis.soortVerbintenisOmschrijving ||
              verbintenis.soortVerbintenis) !== null && _a !== void 0
              ? _a
              : ''
          } met ${relatedUser(verbintenis.persoon)}`
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
    transform: (verbintenisHistorisch) => {
      if (!verbintenisHistorisch) {
        return '';
      }
      return verbintenisHistorisch
        .map((verbintenis) => {
          var _a;
          return verbintenis.persoon
            ? `${
                (_a = verbintenis.soortVerbintenisOmschrijving) !== null &&
                _a !== void 0
                  ? _a
                  : ''
              } met ${relatedUser(verbintenis.persoon)}`
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
    transform: (adressen, serviceResults) => {
      return adressen === null || adressen === void 0
        ? void 0
        : adressen
            .map((adres) => {
              return `${(0, helpers_1.getFullAddress)(
                adres
              )} ${woonplaatsNaamBuitenAmsterdam(adres)}`;
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
    transform: (value) => {
      return value === null || value === void 0
        ? void 0
        : value.map(({ omschrijving }) => omschrijving).join(', ');
    },
  },
].map((p) => {
  if (!p.hpx) {
    p.hpx = HPX_DEFAULT;
  }
  return p;
});
const chaptersAvailable = menuItems_1.chaptersByProfileType.private.map(
  (menuItem) => menuItem.id
);
function getUserChapters(serviceResults) {
  const chapterItems = menuItems_1.chaptersByProfileType.private;
  const items = chapterItems.filter((item) => {
    // Check to see if Chapter has been loaded or if it is directly available
    return (
      item.isAlwaysVisible ||
      (0, useChapters_helpers_1.isChapterActive)(item, serviceResults)
    );
  });
  return Object.fromEntries(
    items.map((menuItem) => [menuItem.id, menuItem.title])
  );
}
function getChapterRows(resultsByUser) {
  const rows = Object.entries(resultsByUser)
    .map(([Username, serviceResults]) => {
      const userChapters = getUserChapters(serviceResults);
      return userChapters;
    })
    .filter((userChapters) => !!Object.keys(userChapters).length);
  return getRows(chaptersAvailable, rows, false);
}
function getNotificationRows(resultsByUser) {
  const rows = Object.entries(resultsByUser).flatMap(
    ([Username, serviceResults]) => {
      return serviceResults.NOTIFICATIONS.content.map((notification) => {
        return {
          Username: Username,
          thema: notification.chapter,
          titel: notification.title,
          datum: (0, helpers_1.defaultDateFormat)(notification.datePublished),
        };
      });
    }
  );
  return rows;
}
function getRows(labels, results, addRowLabel = true) {
  const rowsMap = {};
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
function getRowValues(serviceResults, paths) {
  const user = paths.reduce((acc, { path, label, transform }) => {
    let value = null;
    if (path) {
      [value] = jsonpath_1.default.query(serviceResults, path);
    }
    if (transform) {
      value = transform(value, serviceResults);
    }
    acc[label] = value;
    return acc;
  }, {});
  return user;
}
function addSheets(workbook, sheets) {
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
    if (
      columnHeaders === null || columnHeaders === void 0
        ? void 0
        : columnHeaders.length
    ) {
      XLSX.utils.sheet_add_aoa(worksheet, [columnHeaders], {
        origin: 'A1',
      });
    }
  }
}
function sheetBrpBase(resultsByUser) {
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
  const rowInfo = Object.keys(auth_development_1.testAccounts).map(() => ({
    hpx: HPX_DEFAULT,
  }));
  const colInfo = [
    { wch: WCH_DEFAULT },
    ...paths.map((pathObj) => {
      var _a;
      return {
        wch: (_a = pathObj.wch) !== null && _a !== void 0 ? _a : WCH_DEFAULT,
      };
    }),
  ];
  return {
    title: 'BRP gegevens (beknopt)',
    rows: rowValues,
    columnHeaders: [],
    colInfo,
    rowInfo,
  };
}
function sheetChapters(resultsByUser) {
  const rowInfo = Object.keys(auth_development_1.testAccounts).map(() => ({
    hpx: HPX_DEFAULT,
  }));
  return {
    title: 'Themas',
    rows: getChapterRows(resultsByUser),
    columnHeaders: Object.keys(auth_development_1.testAccounts),
    colInfo: [
      { wch: WCH_DEFAULT },
      ...Object.keys(auth_development_1.testAccounts).map(() => ({
        wch: WCH_DEFAULT,
      })),
    ],
    rowInfo,
  };
}
function sheetNotifications(resultsByUser) {
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
function sheetChapterContent(resultsByUser) {
  function count(chapter) {
    return (serviceResults) => {
      var _a, _b;
      return (
        ((_b =
          (_a = serviceResults[chapter]) === null || _a === void 0
            ? void 0
            : _a.content) === null || _b === void 0
          ? void 0
          : _b.length) || ''
      );
    };
  }
  const chapterContents = {
    Burgerzaken: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.BRP.content) === null || _a === void 0
          ? void 0
          : _a.identiteitsbewijzen.length) || ''
      );
    },
    Bezwaren: count('BEZWAREN'),
    Bijstandaanvragen: count('WPI_AANVRAGEN'),
    Jaaropgaves: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.WPI_SPECIFICATIES.content) === null ||
        _a === void 0
          ? void 0
          : _a.jaaropgaven.length) || ''
      );
    },
    Uitkeringsspecificaties: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.WPI_SPECIFICATIES.content) === null ||
        _a === void 0
          ? void 0
          : _a.uitkeringsspecificaties.length) || ''
      );
    },
    Tozo: count('WPI_TOZO'),
    Tonk: count('WPI_TONK'),
    BBZ: count('WPI_BBZ'),
    'Stadspassen (Gpass)': (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.WPI_STADSPAS.content) === null || _a === void 0
          ? void 0
          : _a.stadspassen.length) || ''
      );
    },
    Stadspasaanvragen: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.WPI_STADSPAS.content) === null || _a === void 0
          ? void 0
          : _a.aanvragen.length) || ''
      );
    },
    'Zorg en ondersteuning': count('WMO'),
    Vergunningen: count('VERGUNNINGEN'),
    KVK: (serviceResults) => {
      return !!serviceResults.KVK.content ? 'Ja' : '';
    },
    'ToerVerh Registraties': (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.TOERISTISCHE_VERHUUR.content) === null ||
        _a === void 0
          ? void 0
          : _a.registraties.length) || ''
      );
    },
    'ToerVerh Vergunningen': (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.TOERISTISCHE_VERHUUR.content) === null ||
        _a === void 0
          ? void 0
          : _a.vergunningen.length) || ''
      );
    },
    // KREFIA: (serviceResults: ServiceResults) => { return},
    Klachten: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.KLACHTEN.content) === null || _a === void 0
          ? void 0
          : _a.aantal) || ''
      );
    },
    Horeca: count('HORECA'),
    AVG: (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.AVG.content) === null || _a === void 0
          ? void 0
          : _a.verzoeken.length) || ''
      );
    },
    'Bodem (Loodmeting)': (serviceResults) => {
      var _a;
      return (
        ((_a = serviceResults.BODEM.content) === null || _a === void 0
          ? void 0
          : _a.metingen.length) || ''
      );
    },
  };
  const results = Object.entries(resultsByUser).map(
    ([Username, serviceResults]) => {
      const base = {
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
getServiceResults(fromDisk).then((resultsByUser) => {
  if (!fromDisk) {
    fs.writeFileSync(
      targetDirectory + '/user-data.json',
      JSON.stringify(resultsByUser)
    );
  }
  const fileName =
    targetDirectory +
    `/Test-Data-ACC-${(0, helpers_1.dateFormat)(
      new Date(),
      'yyyy-MM-dd'
    )}.xlsx`;
  const workbook = XLSX.utils.book_new();
  addSheets(workbook, [
    sheetBrpBase(resultsByUser),
    sheetChapters(resultsByUser),
    sheetNotifications(resultsByUser),
    sheetChapterContent(resultsByUser),
  ]);
  XLSX.writeFile(workbook, fileName, { compression: true });
});
