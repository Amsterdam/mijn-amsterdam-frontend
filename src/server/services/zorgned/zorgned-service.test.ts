import Mockdate from 'mockdate';

import {
  fetchAanvragen,
  fetchAanvragenWithRelatedPersons,
  fetchDocument,
  fetchRelatedPersons,
  forTesting,
} from './zorgned-service.ts';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedPerson,
  ZorgnedPersoonsgegevensNAWResponse,
  ZorgnedResponseDataSource,
} from './zorgned-types.ts';
import ZORGNED_JZD_AANVRAGEN from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { remoteApiHost } from '../../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';
import {
  apiErrorResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api.ts';
import * as request from '../../helpers/source-api-request.ts';
import process from "node:process";
import { Buffer } from "node:buffer";

const mocks = vi.hoisted(() => {
  return {
    mockDocumentIdEncrypted: 'mock-encrypted-document-id',
    mockDocumentId: 'mock-document-id',
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  decrypt: vi.fn().mockReturnValue(`session-id:${mocks.mockDocumentId}`),
  encrypt: vi.fn().mockReturnValue([mocks.mockDocumentIdEncrypted, 'xx']),
}));

describe('zorgned-service', () => {
  const requestData = vi.spyOn(request, 'requestData');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('transformDocumenten', () => {
    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          omschrijvingclientportaal: 'WRA beschikking Definitief',
          datumDefinitief: '2013-05-17T00:00:00',
          zaakidentificatie: null,
        },
      ])
    ).toStrictEqual([
      {
        datePublished: '2013-05-17T00:00:00',
        id: 'B73199',
        title: 'WRA beschikking Definitief',
        url: '',
      },
    ]);

    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          omschrijvingclientportaal: 'WRA beschikking Definitief',
          datumDefinitief: null,
          zaakidentificatie: null,
        },
      ])
    ).toStrictEqual([]);
  });

  test('transformZorgnedAanvragen', () => {
    expect(
      forTesting.transformZorgnedAanvragen(
        ZORGNED_JZD_AANVRAGEN as ZorgnedResponseDataSource
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-03-12",
          "datumBeginLevering": "2020-03-09",
          "datumBesluit": "2020-03-12",
          "datumEindeGeldigheid": "2020-06-14",
          "datumEindeLevering": "2020-06-14",
          "datumIngangGeldigheid": "2020-03-09",
          "datumOpdrachtLevering": "2020-03-12T00:00:00",
          "datumToewijzing": "2020-03-12T00:00:00",
          "documenten": [
            {
              "datePublished": "2020-03-12T16:12:23",
              "id": "B628498",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "927438493",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-02-16",
          "datumBeginLevering": "2022-06-07",
          "datumBesluit": "2022-04-15",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-03-24",
          "datumOpdrachtLevering": "2022-04-19T13:16:57",
          "datumToewijzing": "2022-04-19T13:16:57",
          "documenten": [
            {
              "datePublished": "2022-04-19T13:16:44",
              "id": "B2268406",
              "title": "Besluit: Opstellen beschikking grote WRA",
              "url": "",
            },
          ],
          "id": "912287677",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W84",
          "productsoortCode": "WRA3",
          "resultaat": "toegewezen",
          "titel": "niet standaard opdracht natte cel en toilet",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-04-30",
          "datumBeginLevering": null,
          "datumBesluit": "2024-04-30",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-04-30T16:40:11.41",
          "datumToewijzing": "2024-04-30T16:40:11.41",
          "documenten": [
            {
              "datePublished": "2024-04-30T17:00:09.63",
              "id": "B2802133",
              "title": "Besluit: toekenning hulpmiddel voor uw kind",
              "url": "",
            },
          ],
          "id": "892238168",
          "isActueel": false,
          "leverancier": "Medipoint",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12280",
          "productsoortCode": "FIE",
          "resultaat": "toegewezen",
          "titel": "rolstoelfiets",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-03-11",
          "datumBeginLevering": "2021-03-10",
          "datumBesluit": "2021-03-11",
          "datumEindeGeldigheid": "2022-03-10",
          "datumEindeLevering": "2022-03-10",
          "datumIngangGeldigheid": "2021-03-10",
          "datumOpdrachtLevering": "2021-03-11T00:00:00",
          "datumToewijzing": "2021-03-11T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-03-11T15:26:28",
              "id": "B739256",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "890052085",
          "isActueel": false,
          "leverancier": "Ons Tweede Thuis NA (vh Nieuw Amstelraede)",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-05-13",
          "datumBeginLevering": "2020-09-10",
          "datumBesluit": "2020-06-18",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2020-06-10",
          "datumOpdrachtLevering": "2020-06-18T14:21:01",
          "datumToewijzing": "2020-06-18T14:21:01",
          "documenten": [
            {
              "datePublished": "2020-06-18T14:20:12",
              "id": "B650917",
              "title": "Besluit: New Toekenning hulpmiddel zonder keuze",
              "url": "",
            },
          ],
          "id": "831271059",
          "isActueel": true,
          "leverancier": "Medipoint",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13928",
          "productsoortCode": "RWD",
          "resultaat": "toegewezen",
          "titel": "douche-/toiletstoel zelfrijder  (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-03-27",
          "datumBeginLevering": "2024-01-01",
          "datumBesluit": "2024-03-27",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-03-27T15:01:06.3633333",
          "datumToewijzing": "2024-03-27T15:01:06.3633333",
          "documenten": [
            {
              "datePublished": "2024-04-10T14:27:29.267",
              "id": "B2800426",
              "title": "Besluit: toekenning Hulp bij huishouden",
              "url": "",
            },
            {
              "datePublished": "2024-03-27T14:59:54.633",
              "id": "B2799339",
              "title": "Besluit: toekenning Hulp bij huishouden",
              "url": "",
            },
          ],
          "id": "723065564",
          "isActueel": true,
          "leverancier": "Adonai Zorg B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-03-27",
          "datumBeginLevering": "2024-01-01",
          "datumBesluit": "2024-03-27",
          "datumEindeGeldigheid": "2024-12-21",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-03-27T15:01:06.44",
          "datumToewijzing": "2024-03-27T15:01:06.44",
          "documenten": [
            {
              "datePublished": "2024-04-10T14:27:29.267",
              "id": "B2800426",
              "title": "Besluit: toekenning Hulp bij huishouden",
              "url": "",
            },
            {
              "datePublished": "2024-03-27T14:59:54.633",
              "id": "B2799339",
              "title": "Besluit: toekenning Hulp bij huishouden",
              "url": "",
            },
          ],
          "id": "723065564",
          "isActueel": true,
          "leverancier": "Cordaan",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01012",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden kind",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2014-07-25",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2014-09-09",
          "datumEindeGeldigheid": "2022-12-20",
          "datumEindeLevering": "2023-03-30",
          "datumIngangGeldigheid": "2014-09-08",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [
            {
              "datePublished": "2014-09-10T00:00:00",
              "id": "B195848",
              "title": "Besluit: New Toekenning hulpmiddel zonder keuze",
              "url": "",
            },
          ],
          "id": "657635190",
          "isActueel": false,
          "leverancier": "Harting-Bank",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12545",
          "productsoortCode": "OVE",
          "resultaat": "toegewezen",
          "titel": "elektrische hulpaandrijving voor rolstoel (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2023-06-08",
          "datumBeginLevering": "2023-06-14",
          "datumBesluit": "2023-06-08",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2023-06-08",
          "datumOpdrachtLevering": "2023-06-08T15:10:49.42",
          "datumToewijzing": "2023-06-08T15:10:49.42",
          "documenten": [],
          "id": "537813531",
          "isActueel": true,
          "leverancier": "Van der Leij Bouwbedrijven B.V",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W32",
          "productsoortCode": "WRA2",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht toegang",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2018-04-05",
          "datumBeginLevering": "2018-05-09",
          "datumBesluit": "2018-04-25",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2018-04-06",
          "datumOpdrachtLevering": "2018-04-26T08:24:32",
          "datumToewijzing": "2018-04-26T08:24:32",
          "documenten": [
            {
              "datePublished": "2018-04-25T00:00:00",
              "id": "B502452",
              "title": "Besluit: toekenning WRA",
              "url": "",
            },
          ],
          "id": "468475673",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2017-06-01",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2017-06-01",
          "datumEindeGeldigheid": "2018-04-13",
          "datumEindeLevering": "2018-04-13",
          "datumIngangGeldigheid": "2017-06-01",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [],
          "id": "45303257",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-07-13",
          "datumBeginLevering": null,
          "datumBesluit": "2022-08-06",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-08-11",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2022-08-12T10:26:54.133",
              "id": "B2366113",
              "title": "Besluit: toekenning Aanvullend openbaar vervoer",
              "url": "",
            },
          ],
          "id": "4289150898",
          "isActueel": true,
          "leverancier": "RMC Amsterdam",
          "leveringsVorm": "",
          "productIdentificatie": "720",
          "productsoortCode": "AOV",
          "resultaat": "toegewezen",
          "titel": "deur tot deur, samenreizend vervoer",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2018-11-28",
          "datumBeginLevering": "2018-11-28",
          "datumBesluit": "2018-11-29",
          "datumEindeGeldigheid": "2019-03-08",
          "datumEindeLevering": "2019-03-08",
          "datumIngangGeldigheid": "2018-11-28",
          "datumOpdrachtLevering": "2018-11-29T00:00:00",
          "datumToewijzing": "2018-11-29T00:00:00",
          "documenten": [],
          "id": "4101803263",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2014-06-27",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2015-02-16",
          "datumEindeGeldigheid": "2021-08-23",
          "datumEindeLevering": "2021-09-27",
          "datumIngangGeldigheid": "2015-02-16",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [],
          "id": "4080554936",
          "isActueel": false,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12346",
          "productsoortCode": "FIE",
          "resultaat": "toegewezen",
          "titel": "driewielfiets 5-9 jr",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-08-29",
          "datumBeginLevering": null,
          "datumBesluit": "2024-08-29",
          "datumEindeGeldigheid": "2026-08-01",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-08-01",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-08-29T16:48:11.997",
              "id": "B2814508",
              "title": "Besluit: Naam in Inkijk-API",
              "url": "",
            },
          ],
          "id": "401665597",
          "isActueel": false,
          "leverancier": "Carehouse - Leveo Care",
          "leveringsVorm": "PGB",
          "productIdentificatie": "07A09",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "PGB: dagbestedingaccumulatievergoeding meewerken (toegewezen)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-01-09",
          "datumBeginLevering": "2021-01-01",
          "datumBesluit": "2021-01-09",
          "datumEindeGeldigheid": "2021-03-09",
          "datumEindeLevering": "2021-03-09",
          "datumIngangGeldigheid": "2021-01-01",
          "datumOpdrachtLevering": "2021-01-09T00:00:00",
          "datumToewijzing": "2021-01-09T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-01-10T01:50:21",
              "id": "B700836",
              "title": "Besluit: Opstellen beschikking wijkzorg Hbh",
              "url": "",
            },
          ],
          "id": "39837719",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-03-14",
          "datumBeginLevering": "2022-03-11",
          "datumBesluit": "2022-03-14",
          "datumEindeGeldigheid": "2023-03-11",
          "datumEindeLevering": "2023-03-11",
          "datumIngangGeldigheid": "2022-03-11",
          "datumOpdrachtLevering": "2022-03-14T15:42:25",
          "datumToewijzing": "2022-03-14T15:42:25",
          "documenten": [
            {
              "datePublished": "2022-03-14T16:12:12",
              "id": "B2258816",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "3894957080",
          "isActueel": false,
          "leverancier": "Ons Tweede Thuis NA (vh Nieuw Amstelraede)",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-12-06",
          "datumBeginLevering": "2021-12-17",
          "datumBesluit": "2021-12-06",
          "datumEindeGeldigheid": "2022-02-06",
          "datumEindeLevering": "2022-02-06",
          "datumIngangGeldigheid": "2021-12-06",
          "datumOpdrachtLevering": "2021-12-06T16:01:09",
          "datumToewijzing": "2021-12-06T16:01:09",
          "documenten": [],
          "id": "3818107089",
          "isActueel": false,
          "leverancier": "Van der Leij Bouwbedrijven B.V",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W32",
          "productsoortCode": "WRA2",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht toegang (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2023-03-16",
          "datumBeginLevering": "2023-03-12",
          "datumBesluit": "2023-03-16",
          "datumEindeGeldigheid": "2024-03-11",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2023-03-12",
          "datumOpdrachtLevering": "2023-03-16T15:50:50.4233333",
          "datumToewijzing": "2023-03-16T15:50:50.4233333",
          "documenten": [
            {
              "datePublished": "2023-03-16T15:56:11.41",
              "id": "B2516440",
              "title": "Besluit: Opstellen beschikking wijkzorg Hbh",
              "url": "",
            },
          ],
          "id": "3703707636",
          "isActueel": true,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-01-09",
          "datumBeginLevering": "2021-01-01",
          "datumBesluit": "2021-01-09",
          "datumEindeGeldigheid": "2021-03-09",
          "datumEindeLevering": "2021-03-09",
          "datumIngangGeldigheid": "2021-01-01",
          "datumOpdrachtLevering": "2021-01-09T00:00:00",
          "datumToewijzing": "2021-01-09T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-01-09T17:26:23",
              "id": "B700835",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "3700518004",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-12-21",
          "datumBeginLevering": "2023-05-15",
          "datumBesluit": "2023-03-01",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-12-21",
          "datumOpdrachtLevering": "2023-03-02T11:17:35.4",
          "datumToewijzing": "2023-03-02T11:17:35.4",
          "documenten": [
            {
              "datePublished": "2023-03-02T11:17:08.293",
              "id": "B2510020",
              "title": "Besluit: New Toekenning hulpmiddel zonder keuze",
              "url": "",
            },
          ],
          "id": "3698550335",
          "isActueel": true,
          "leverancier": "Medipoint",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "11436",
          "productsoortCode": "ROL",
          "resultaat": "toegewezen",
          "titel": "elektrische rolstoel voor binnen en buiten",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-01-25",
          "datumBeginLevering": "2024-03-14",
          "datumBesluit": "2024-01-25",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-01-25T17:10:55.2733333",
          "datumToewijzing": "2024-01-25T17:10:55.2733333",
          "documenten": [
            {
              "datePublished": "2024-01-25T17:08:09.837",
              "id": "B2791921",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "3619352025",
          "isActueel": true,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A08",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding meedoen",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-03-11",
          "datumBeginLevering": "2021-03-10",
          "datumBesluit": "2021-03-11",
          "datumEindeGeldigheid": "2022-03-10",
          "datumEindeLevering": "2021-04-01",
          "datumIngangGeldigheid": "2021-03-10",
          "datumOpdrachtLevering": "2021-03-11T00:00:00",
          "datumToewijzing": "2021-03-11T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-03-11T15:29:20",
              "id": "B739257",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "358217242",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-05-13",
          "datumBeginLevering": null,
          "datumBesluit": "2024-05-13",
          "datumEindeGeldigheid": "2024-01-01",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-05-13T21:36:08.1",
          "datumToewijzing": "2024-05-13T21:36:08.1",
          "documenten": [
            {
              "datePublished": "2024-09-02T16:20:24.343",
              "id": "B2814517",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "3416852977",
          "isActueel": false,
          "leverancier": "HVO Querido",
          "leveringsVorm": "",
          "productIdentificatie": "04A00",
          "productsoortCode": "KVB",
          "resultaat": "toegewezen",
          "titel": "logeeropvang Respijt",
        },
        {
          "betrokkenen": [
            "123123123",
          ],
          "datumAanvraag": "2024-09-30",
          "datumBeginLevering": "2024-09-30",
          "datumBesluit": "2024-09-30",
          "datumEindeGeldigheid": "2024-10-01",
          "datumEindeLevering": "2024-10-01",
          "datumIngangGeldigheid": "2024-09-30",
          "datumOpdrachtLevering": "2024-09-30T18:58:05.6966667",
          "datumToewijzing": "2024-09-30T18:58:05.6966667",
          "documenten": [],
          "id": "3373733082",
          "isActueel": false,
          "leverancier": "Otolift",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W15",
          "productsoortCode": "WRA1",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht   trapliften",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2012-08-07",
          "datumBeginLevering": null,
          "datumBesluit": "2012-08-07",
          "datumEindeGeldigheid": "2022-07-31",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2012-08-07",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [],
          "id": "3372983803",
          "isActueel": false,
          "leverancier": "Transvision",
          "leveringsVorm": "",
          "productIdentificatie": "740",
          "productsoortCode": "AOV",
          "resultaat": "afgewezen",
          "titel": "kamer tot kamer vervoer (nog iets) (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2024-07-08",
          "datumBeginLevering": null,
          "datumBesluit": "2024-07-08",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": null,
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-07-08T16:03:07.623",
              "id": "B2810025",
              "title": "Besluit: afwijzing dagbesteding",
              "url": "",
            },
          ],
          "id": "3317065651",
          "isActueel": false,
          "leverancier": "",
          "leveringsVorm": "",
          "productIdentificatie": "07A09",
          "productsoortCode": "DBS",
          "resultaat": "afgewezen",
          "titel": "dagbesteding meewerken",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-06-05",
          "datumBeginLevering": null,
          "datumBesluit": "2020-06-05",
          "datumEindeGeldigheid": "2020-08-05",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2020-06-05",
          "datumOpdrachtLevering": "2020-06-05T09:22:46",
          "datumToewijzing": "2020-06-05T09:22:46",
          "documenten": [],
          "id": "3288878706",
          "isActueel": false,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W82",
          "productsoortCode": "WRA3",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht natte cel en toile  (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2018-03-09",
          "datumBeginLevering": "2018-03-09",
          "datumBesluit": "2018-04-19",
          "datumEindeGeldigheid": "2019-03-08",
          "datumEindeLevering": "2019-03-08",
          "datumIngangGeldigheid": "2018-03-09",
          "datumOpdrachtLevering": "2018-04-19T00:00:00",
          "datumToewijzing": "2018-04-19T00:00:00",
          "documenten": [],
          "id": "3265952791",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2017-11-24",
          "datumBeginLevering": "2017-11-24",
          "datumBesluit": "2017-11-24",
          "datumEindeGeldigheid": "2018-11-23",
          "datumEindeLevering": "2018-11-23",
          "datumIngangGeldigheid": "2017-11-24",
          "datumOpdrachtLevering": "2017-11-24T00:00:00",
          "datumToewijzing": "2017-11-24T00:00:00",
          "documenten": [],
          "id": "3237286012",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2019-04-14",
          "datumBeginLevering": "2019-04-14",
          "datumBesluit": "2019-04-15",
          "datumEindeGeldigheid": "2020-03-08",
          "datumEindeLevering": "2020-03-08",
          "datumIngangGeldigheid": "2019-04-14",
          "datumOpdrachtLevering": "2019-04-15T00:00:00",
          "datumToewijzing": "2019-04-15T00:00:00",
          "documenten": [],
          "id": "3215870010",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2023-04-25",
          "datumBeginLevering": "2013-06-17",
          "datumBesluit": "2023-05-17",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2023-05-06",
          "datumOpdrachtLevering": "2023-05-17T00:00:00",
          "datumToewijzing": "2023-05-17T00:00:00",
          "documenten": [
            {
              "datePublished": "2023-05-17T00:00:00",
              "id": "ABCDEF",
              "title": "Verzoek: om meer informatie",
              "url": "",
            },
            {
              "datePublished": "2023-05-17T00:00:00",
              "id": "B73199",
              "title": "Besluit: WRA beschikking Definitief",
              "url": "",
            },
          ],
          "id": "3197977558",
          "isActueel": true,
          "leverancier": "Gebr Koenen B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing met doc 2 / meer info",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-03-11",
          "datumBeginLevering": "2021-03-10",
          "datumBesluit": "2021-03-11",
          "datumEindeGeldigheid": "2022-03-10",
          "datumEindeLevering": "2022-03-10",
          "datumIngangGeldigheid": "2021-03-10",
          "datumOpdrachtLevering": "2021-03-11T00:00:00",
          "datumToewijzing": "2021-03-11T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-03-11T15:24:06",
              "id": "B739258",
              "title": "Besluit: Opstellen beschikking wijkzorg Hbh",
              "url": "",
            },
          ],
          "id": "3149000507",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-08-26",
          "datumBeginLevering": null,
          "datumBesluit": "2024-08-26",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-08-01",
          "datumOpdrachtLevering": "2024-08-26T11:42:09.2433333",
          "datumToewijzing": "2024-08-26T11:42:09.2433333",
          "documenten": [
            {
              "datePublished": "2024-08-26T11:40:46.087",
              "id": "B2814016",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "3110284821",
          "isActueel": false,
          "leverancier": "Cordaan",
          "leveringsVorm": "",
          "productIdentificatie": "16902",
          "productsoortCode": "MAO",
          "resultaat": "toegewezen",
          "titel": "begeleid thuis individueel",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-01-09",
          "datumBeginLevering": "2021-01-01",
          "datumBesluit": "2021-01-09",
          "datumEindeGeldigheid": "2021-03-09",
          "datumEindeLevering": "2021-03-09",
          "datumIngangGeldigheid": "2021-01-01",
          "datumOpdrachtLevering": "2021-01-09T00:00:00",
          "datumToewijzing": "2021-01-09T00:00:00",
          "documenten": [
            {
              "datePublished": "2021-01-09T23:06:12",
              "id": "B700837",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "3099434934",
          "isActueel": false,
          "leverancier": "Ons Tweede Thuis NA (vh Nieuw Amstelraede)",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2018-10-10",
          "datumBeginLevering": "2019-03-25",
          "datumBesluit": "2018-12-27",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2018-10-24",
          "datumOpdrachtLevering": "2019-02-15T13:45:36",
          "datumToewijzing": "2019-02-15T13:45:36",
          "documenten": [
            {
              "datePublished": "2018-12-27T00:00:00",
              "id": "B538689",
              "title": "Besluit: WRA beschikking Definitief",
              "url": "",
            },
          ],
          "id": "3072863934",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing met doc 4 (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-03-26",
          "datumBeginLevering": null,
          "datumBesluit": "2024-03-26",
          "datumEindeGeldigheid": "2024-12-31",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-03-26T14:40:31.7",
          "datumToewijzing": "2024-03-26T14:40:31.7",
          "documenten": [
            {
              "datePublished": "2024-03-26T14:38:54.703",
              "id": "B2799268",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "2961476340",
          "isActueel": false,
          "leverancier": "De Regenbooggroep",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "04A01",
          "productsoortCode": "LGO",
          "resultaat": "toegewezen",
          "titel": "logeeropvang Mantelzorg",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2014-07-25",
          "datumBeginLevering": "2014-11-07",
          "datumBesluit": "2014-09-11",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2014-09-08",
          "datumOpdrachtLevering": "2014-09-11T00:00:00",
          "datumToewijzing": "2014-09-11T00:00:00",
          "documenten": [
            {
              "datePublished": "2014-09-11T00:00:00",
              "id": "B196206",
              "title": "Besluit: WRA beschikking Definitief",
              "url": "",
            },
          ],
          "id": "2932747289",
          "isActueel": true,
          "leverancier": "Gebr Koenen B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing 3 (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-10-13",
          "datumBeginLevering": "2021-10-13",
          "datumBesluit": "2021-10-22",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2021-10-13",
          "datumOpdrachtLevering": "2021-10-22T16:51:15",
          "datumToewijzing": "2021-10-22T16:51:15",
          "documenten": [
            {
              "datePublished": "2021-10-22T16:50:57",
              "id": "B792435",
              "title": "Besluit: Opstellen beschikking grote WRA",
              "url": "",
            },
          ],
          "id": "2907063537",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W84",
          "productsoortCode": "WRA3",
          "resultaat": "toegewezen",
          "titel": "niet standaard opdracht natte cel en toilet (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2019-03-09",
          "datumBeginLevering": "2019-03-09",
          "datumBesluit": "2019-03-11",
          "datumEindeGeldigheid": "2020-03-08",
          "datumEindeLevering": "2020-03-08",
          "datumIngangGeldigheid": "2019-03-09",
          "datumOpdrachtLevering": "2019-03-11T00:00:00",
          "datumToewijzing": "2019-03-11T00:00:00",
          "documenten": [],
          "id": "2794983610",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2023-04-25",
          "datumBeginLevering": null,
          "datumBesluit": "2023-05-17",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2023-05-06",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2023-05-17T00:00:00",
              "id": "ABCDEF",
              "title": "Verzoek: om meer informatie",
              "url": "",
            },
          ],
          "id": "2704977640",
          "isActueel": true,
          "leverancier": "Gebr Koenen B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing (meer info)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-04-18",
          "datumBeginLevering": null,
          "datumBesluit": "2024-04-18",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-07-09T16:44:10.89",
          "datumToewijzing": "2024-07-09T16:44:10.89",
          "documenten": [
            {
              "datePublished": "2024-08-20T16:02:09.277",
              "id": "B2813755",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
            {
              "datePublished": "2024-07-09T16:45:28.253",
              "id": "B2810215",
              "title": "Naam in Inkijk-API",
              "url": "",
            },
            {
              "datePublished": "2024-07-09T16:43:58.217",
              "id": "B2810214",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "2643873151",
          "isActueel": false,
          "leverancier": "Cordaan",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01214",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden bijzondere schoonmaak",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-12-22",
          "datumBeginLevering": "2023-01-06",
          "datumBesluit": "2022-12-22",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-12-22",
          "datumOpdrachtLevering": "2022-12-22T14:41:00.9833333",
          "datumToewijzing": "2022-12-22T14:41:00.9833333",
          "documenten": [],
          "id": "2631443891",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W98",
          "productsoortCode": "WRA5",
          "resultaat": "toegewezen",
          "titel": "Adviesconsult",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-07-12",
          "datumBeginLevering": "2021-11-19",
          "datumBesluit": "2021-08-26",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2021-08-24",
          "datumOpdrachtLevering": "2021-08-30T13:51:35",
          "datumToewijzing": "2021-08-30T13:51:35",
          "documenten": [
            {
              "datePublished": "2021-08-30T13:51:22",
              "id": "B779673",
              "title": "Besluit: toekenning hulpmiddel voor uw kind",
              "url": "",
            },
          ],
          "id": "2504153009",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "11326",
          "productsoortCode": "ROL",
          "resultaat": "toegewezen",
          "titel": "handbewogen kinderrolstoel",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-08-29",
          "datumBeginLevering": null,
          "datumBesluit": "2024-08-29",
          "datumEindeGeldigheid": "2024-10-31",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": null,
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-08-29T16:48:11.997",
              "id": "B2814508",
              "title": "Besluit: Naam in Inkijk-API",
              "url": "",
            },
          ],
          "id": "2443511774",
          "isActueel": false,
          "leverancier": "Carehouse - Leveo Care (afgewezen)",
          "leveringsVorm": "PGB",
          "productIdentificatie": "07A09",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen1",
          "titel": "PGB: dagbesteding samenwerken",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2013-11-12",
          "datumBeginLevering": "2014-01-28",
          "datumBesluit": "2013-12-09",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2013-12-05",
          "datumOpdrachtLevering": "2013-12-09T00:00:00",
          "datumToewijzing": "2013-12-09T00:00:00",
          "documenten": [
            {
              "datePublished": "2013-12-09T00:00:00",
              "id": "B137364",
              "title": "Besluit: WRA beschikking Definitief",
              "url": "",
            },
          ],
          "id": "23510330",
          "isActueel": true,
          "leverancier": "Gebr Koenen B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "afgewezen",
          "titel": "woonruimteaanpassing met doc 2 (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2019-03-09",
          "datumBeginLevering": "2019-03-09",
          "datumBesluit": "2019-03-11",
          "datumEindeGeldigheid": "2020-03-08",
          "datumEindeLevering": "2020-03-08",
          "datumIngangGeldigheid": "2019-03-09",
          "datumOpdrachtLevering": "2019-03-11T00:00:00",
          "datumToewijzing": "2019-03-11T00:00:00",
          "documenten": [],
          "id": "2286703411",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-07-08",
          "datumBeginLevering": null,
          "datumBesluit": "2024-07-08",
          "datumEindeGeldigheid": "2026-03-22",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-07-05",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-07-08T16:07:42.397",
              "id": "B2810026",
              "title": "Besluit: einde pgb Hbh/AIO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "2246026495",
          "isActueel": true,
          "leverancier": "",
          "leveringsVorm": "PGB",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-12-08",
          "datumBeginLevering": null,
          "datumBesluit": "2021-12-08",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2021-12-08",
          "datumOpdrachtLevering": "2021-12-08T10:54:18",
          "datumToewijzing": "2021-12-08T10:54:18",
          "documenten": [
            {
              "datePublished": "2021-12-20T14:08:20",
              "id": "B809511",
              "title": "Opstellen brief handzender",
              "url": "",
            },
          ],
          "id": "2199549273",
          "isActueel": false,
          "leverancier": "Van der Leij Bouwbedrijven B.V",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W32",
          "productsoortCode": "WRA2",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht toegang",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2019-10-09",
          "datumBeginLevering": "2019-10-17",
          "datumBesluit": "2019-10-09",
          "datumEindeGeldigheid": "2019-12-09",
          "datumEindeLevering": "2019-12-09",
          "datumIngangGeldigheid": "2019-10-09",
          "datumOpdrachtLevering": "2019-10-09T11:19:30",
          "datumToewijzing": "2019-10-09T11:19:30",
          "documenten": [],
          "id": "2171797593",
          "isActueel": false,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W82",
          "productsoortCode": "WRA3",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht natte cel en toilet (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2023-04-25",
          "datumBeginLevering": null,
          "datumBesluit": "2023-05-17",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2023-05-06",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [],
          "id": "2168365256",
          "isActueel": true,
          "leverancier": "Gebr Koenen B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "WRA",
          "productsoortCode": "WRA",
          "resultaat": "toegewezen",
          "titel": "woonruimteaanpassing (in behandeling)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-06-16",
          "datumBeginLevering": "2020-06-15",
          "datumBesluit": "2020-06-16",
          "datumEindeGeldigheid": "2020-12-31",
          "datumEindeLevering": "2020-12-31",
          "datumIngangGeldigheid": "2020-06-15",
          "datumOpdrachtLevering": "2020-06-16T00:00:00",
          "datumToewijzing": "2020-06-16T00:00:00",
          "documenten": [
            {
              "datePublished": "2020-06-16T15:20:47",
              "id": "B648401",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "2076895256",
          "isActueel": false,
          "leverancier": "Ons Tweede Thuis NA (vh Nieuw Amstelraede)",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding  (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2013-01-14",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2013-06-17",
          "datumEindeGeldigheid": "2021-08-23",
          "datumEindeLevering": "2021-09-27",
          "datumIngangGeldigheid": "2013-02-07",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [
            {
              "datePublished": "2013-06-17T00:00:00",
              "id": "B82188",
              "title": "Besluit: toekenning hulpmiddel",
              "url": "",
            },
            {
              "datePublished": "2013-02-12T00:00:00",
              "id": "B49704",
              "title": "Informatie: uitstel van besluit over uw aanvraag",
              "url": "",
            },
          ],
          "id": "2063762802",
          "isActueel": false,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12315",
          "productsoortCode": "OVE",
          "resultaat": "toegewezen",
          "titel": "buggy",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-04-30",
          "datumBeginLevering": null,
          "datumBesluit": "2024-04-30",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-04-30T14:56:51.363",
              "id": "B2802129",
              "title": "Besluit: toekenning hulpmiddel voor uw kind",
              "url": "",
            },
          ],
          "id": "1956543728",
          "isActueel": true,
          "leverancier": "",
          "leveringsVorm": "",
          "productIdentificatie": "12503",
          "productsoortCode": "AAN",
          "resultaat": "toegewezen",
          "titel": "aanpassing aan een eigen (brom)fiets",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-03-14",
          "datumBeginLevering": "2022-03-11",
          "datumBesluit": "2022-03-14",
          "datumEindeGeldigheid": "2023-03-11",
          "datumEindeLevering": "2023-03-11",
          "datumIngangGeldigheid": "2022-03-11",
          "datumOpdrachtLevering": "2022-03-14T15:42:25",
          "datumToewijzing": "2022-03-14T15:42:25",
          "documenten": [
            {
              "datePublished": "2022-03-14T16:11:29",
              "id": "B2258817",
              "title": "Besluit: Opstellen beschikking wijkzorg Hbh",
              "url": "",
            },
          ],
          "id": "1934491259",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2021-12-08",
          "datumBeginLevering": "2021-12-20",
          "datumBesluit": "2021-12-08",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2021-12-20",
          "datumOpdrachtLevering": "2021-12-20T14:05:02",
          "datumToewijzing": "2021-12-20T14:05:02",
          "documenten": [
            {
              "datePublished": "2021-12-20T14:08:20",
              "id": "B809511",
              "title": "Opstellen brief handzender",
              "url": "",
            },
          ],
          "id": "1890693715",
          "isActueel": true,
          "leverancier": "Van der Leij Bouwbedrijven B.V",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W20",
          "productsoortCode": "WRA2",
          "resultaat": "toegewezen",
          "titel": "handzender(s) voor deurautomaat (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-08-29",
          "datumBeginLevering": null,
          "datumBesluit": "2024-08-29",
          "datumEindeGeldigheid": "2025-10-31",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-11-01",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-08-29T16:48:11.997",
              "id": "B2814508",
              "title": "Besluit: Naam in Inkijk-API",
              "url": "",
            },
          ],
          "id": "1774183903",
          "isActueel": true,
          "leverancier": "Carehouse - Leveo Care (huidig)",
          "leveringsVorm": "PGB",
          "productIdentificatie": "07A09",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "PGB: dagbesteding samenwerken",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2012-11-30",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2012-11-30",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2012-11-30",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [
            {
              "datePublished": "2012-12-04T00:00:00",
              "id": "B31242",
              "title": "Besluit: toekenning hulpmiddel",
              "url": "",
            },
          ],
          "id": "17397626",
          "isActueel": true,
          "leverancier": "Welzorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12320",
          "productsoortCode": "OVE",
          "resultaat": "toegewezen",
          "titel": "autozitje",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-04-22",
          "datumBeginLevering": null,
          "datumBesluit": "2024-04-22",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-04-22",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2024-04-22T13:55:05.28",
              "id": "B2801376",
              "title": "Besluit: toekenning scootmobiel",
              "url": "",
            },
          ],
          "id": "1711948639",
          "isActueel": false,
          "leverancier": "Kersten Hulpmiddelen",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "12136",
          "productsoortCode": "SCO",
          "resultaat": "toegewezen",
          "titel": "scootmobiel voor buitengebruik",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2012-08-08",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2012-10-05",
          "datumEindeGeldigheid": "2020-06-09",
          "datumEindeLevering": "2020-09-09",
          "datumIngangGeldigheid": "2012-10-05",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [],
          "id": "1693403896",
          "isActueel": false,
          "leverancier": "Harting-Bank",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13929",
          "productsoortCode": "RWD",
          "resultaat": "toegewezen",
          "titel": "douche-/toiletstoel (verrijdb/kantelb/ind aangep.) (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2018-04-14",
          "datumBeginLevering": "2018-04-14",
          "datumBesluit": "2018-04-25",
          "datumEindeGeldigheid": "2019-04-13",
          "datumEindeLevering": "2019-04-13",
          "datumIngangGeldigheid": "2018-04-14",
          "datumOpdrachtLevering": "2018-04-25T00:00:00",
          "datumToewijzing": "2018-04-25T00:00:00",
          "documenten": [],
          "id": "1548556124",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-07-09",
          "datumBeginLevering": null,
          "datumBesluit": "2022-08-01",
          "datumEindeGeldigheid": "2022-10-18",
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-08-01",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [],
          "id": "1478843551",
          "isActueel": false,
          "leverancier": "RMC Amsterdam",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "740",
          "productsoortCode": "AOV",
          "resultaat": "toegewezen",
          "titel": "kamer tot kamer vervoer (iets?)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-03-12",
          "datumBeginLevering": "2020-03-09",
          "datumBesluit": "2020-03-12",
          "datumEindeGeldigheid": "2020-12-31",
          "datumEindeLevering": "2020-12-31",
          "datumIngangGeldigheid": "2020-03-09",
          "datumOpdrachtLevering": "2020-03-12T00:00:00",
          "datumToewijzing": "2020-03-12T00:00:00",
          "documenten": [
            {
              "datePublished": "2020-03-12T16:16:35",
              "id": "B628500",
              "title": "Besluit: Opstellen beschikking wijkzorg Hbh",
              "url": "",
            },
          ],
          "id": "1391777243",
          "isActueel": false,
          "leverancier": "Emile Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01A01",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden  (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-07-13",
          "datumBeginLevering": null,
          "datumBesluit": "2022-08-16",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": null,
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2022-08-16T09:30:39.58",
              "id": "B2366765",
              "title": "Besluit: afwijzing vervoer",
              "url": "",
            },
          ],
          "id": "1329789556",
          "isActueel": false,
          "leverancier": "",
          "leveringsVorm": "",
          "productIdentificatie": "12280",
          "productsoortCode": "FIE",
          "resultaat": "afgewezen",
          "titel": "rolstoelfiets",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-03-12",
          "datumBeginLevering": "2020-03-09",
          "datumBesluit": "2020-03-12",
          "datumEindeGeldigheid": "2020-12-31",
          "datumEindeLevering": "2020-12-31",
          "datumIngangGeldigheid": "2020-03-09",
          "datumOpdrachtLevering": "2020-03-12T00:00:00",
          "datumToewijzing": "2020-03-12T00:00:00",
          "documenten": [
            {
              "datePublished": "2020-03-12T16:17:07",
              "id": "B628499",
              "title": "Besluit: Opstellen beschikking wijkzorg AO/DB/LO",
              "url": "",
            },
          ],
          "id": "1281413052",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-01-29",
          "datumBeginLevering": "2023-01-12",
          "datumBesluit": "2024-01-29",
          "datumEindeGeldigheid": "2023-05-31",
          "datumEindeLevering": "2023-05-31",
          "datumIngangGeldigheid": "2023-01-01",
          "datumOpdrachtLevering": "2024-01-29T19:40:57.5166667",
          "datumToewijzing": "2024-01-29T19:40:57.5166667",
          "documenten": [
            {
              "datePublished": "2024-01-29T19:40:04.393",
              "id": "B2792161",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "1214425943",
          "isActueel": false,
          "leverancier": "Aya Thuiszorg",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "02A02",
          "productsoortCode": "AWBG",
          "resultaat": "toegewezen",
          "titel": "aanvullende individuele ondersteuning",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2022-09-07",
          "datumBeginLevering": null,
          "datumBesluit": "2022-10-20",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2022-10-19",
          "datumOpdrachtLevering": null,
          "datumToewijzing": null,
          "documenten": [
            {
              "datePublished": "2022-10-19T14:27:42.643",
              "id": "B2391009",
              "title": "Besluit: AOV Beschikking positief",
              "url": "",
            },
          ],
          "id": "1100936248",
          "isActueel": true,
          "leverancier": "RMC Amsterdam",
          "leveringsVorm": "",
          "productIdentificatie": "740",
          "productsoortCode": "AOV",
          "resultaat": "toegewezen",
          "titel": "kamer tot kamer vervoer (ook iets?)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2020-08-10",
          "datumBeginLevering": "2021-01-13",
          "datumBesluit": "2020-12-04",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2020-11-13",
          "datumOpdrachtLevering": "2020-12-07T07:01:20",
          "datumToewijzing": "2020-12-07T07:01:20",
          "documenten": [
            {
              "datePublished": "2020-12-07T07:01:05",
              "id": "B691905",
              "title": "Besluit: Opstellen beschikking grote WRA",
              "url": "",
            },
          ],
          "id": "1056587582",
          "isActueel": true,
          "leverancier": "Meyra Wooncare B.V.",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W71",
          "productsoortCode": "WRA3",
          "resultaat": "toegewezen",
          "titel": "antislipvloer/behandeling badkamer  (vóór 01-01-2022)",
        },
        {
          "betrokkenen": [],
          "datumAanvraag": "2017-06-01",
          "datumBeginLevering": "2017-06-01",
          "datumBesluit": "2017-06-01",
          "datumEindeGeldigheid": "2018-03-08",
          "datumEindeLevering": "2018-03-08",
          "datumIngangGeldigheid": "2017-06-01",
          "datumOpdrachtLevering": "2017-06-01T00:00:00",
          "datumToewijzing": "2017-06-01T00:00:00",
          "documenten": [],
          "id": "1051469525",
          "isActueel": false,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A02",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding (vóór 01-01-2022)",
        },
      ]
    `);

    expect(
      forTesting.transformZorgnedAanvragen(
        null as unknown as ZorgnedResponseDataSource
      )
    ).toStrictEqual([]);
  });

  it('should fetch aanvragen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);

    const BSN = '123456789';
    const result = await fetchAanvragen(BSN, {
      zorgnedApiConfigKey: 'ZORGNED_JZD',
      requestBodyParams: {
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
      },
    });

    expect(requestData).toHaveBeenCalledWith({
      url: `${remoteApiHost}/zorgned/aanvragen`,
      data: {
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
        burgerservicenummer: BSN,
        gemeentecode: ZORGNED_GEMEENTE_CODE,
      },
      transformResponse: expect.any(Function),
      method: 'post',
      headers: {
        Token: process.env.BFF_ZORGNED_API_TOKEN,
        'Content-type': 'application/json; charset=utf-8',
        'x-cache-key-supplement': 'JZD',
      },
      httpsAgent: expect.any(Object),
    });

    expect(result).toStrictEqual({
      content: [],
      status: 'OK',
    });
  });

  it.each([
    null,
    {
      omschrijving: 'test',
      mimetype: 'application/pdf',
    },
    '"xxx"',
  ])('should return error for response %s', async (payload: any) => {
    remoteApi.post('/zorgned/document').reply(200, payload);

    const BSN = '567890';
    const result = await fetchDocument(
      BSN,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(result).toStrictEqual({
      content: null,
      message: 'Zorgned document download - no valid response data provided',
      status: 'ERROR',
    });
  });

  it('should fetch document successfully', async () => {
    const filename = 'Naam documentje';
    const mimetype = 'foo/bar';
    const base64Data = 'Zm9vLWJhcg==';

    const BSN = '8906789';

    remoteApi.post('/zorgned/document').reply(200, {
      inhoud: base64Data,
      omschrijving: filename,
      mimetype,
    });

    const result = await fetchDocument(
      BSN,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(requestData).toHaveBeenCalledWith({
      httpsAgent: expect.any(Object),
      url: `${remoteApiHost}/zorgned/document`,
      data: {
        burgerservicenummer: BSN,
        gemeentecode: ZORGNED_GEMEENTE_CODE,
        documentidentificatie: mocks.mockDocumentId,
      },
      transformResponse: expect.any(Function),
      method: 'post',
      headers: {
        Token: process.env.BFF_ZORGNED_API_TOKEN,
        'Content-type': 'application/json; charset=utf-8',
        'x-cache-key-supplement': 'JZD',
      },
    });

    expect(result).toEqual({
      status: 'OK',
      content: {
        filename,
        mimetype,
        data: Buffer.from(base64Data, 'base64'),
      },
    });
  });

  test('transformZorgnedPersonResponse', () => {
    const naam = forTesting.transformZorgnedPersonResponse({
      persoon: {
        voorvoegsel: null,
        geboortenaam: 'Alex',
        voornamen: 'Flex',
        geboortedatum: '2016-07-09',
        bsn: 'x123z',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam).toStrictEqual({
      bsn: 'x123z',
      dateOfBirth: '2016-07-09',
      dateOfBirthFormatted: '09 juli 2016',
      name: 'Flex',
      partnernaam: null,
      partnervoorvoegsel: null,
    });

    const naam2 = forTesting.transformZorgnedPersonResponse({
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
        geboortedatum: '2016-07-09',
        bsn: 'x123z',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam2).toStrictEqual({
      bsn: 'x123z',
      dateOfBirth: '2016-07-09',
      dateOfBirthFormatted: '09 juli 2016',
      name: 'Baron',
      partnernaam: null,
      partnervoorvoegsel: null,
    });

    const naam3 = forTesting.transformZorgnedPersonResponse({
      persoon: null,
    } as unknown as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam3).toBe(null);
  });

  describe('fetchAndMergeRelatedPersons', () => {
    const ZORGNED_RESPONSE_CONTENT = {
      _links: null,
      _embedded: {
        aanvraag: [
          {
            datumAanvraag: '2023-04-25',
            beschikking: {
              datumAfgifte: '2023-05-17',
              beschikteProducten: [
                {
                  product: {
                    identificatie: 'WRA',
                    productCode: null,
                    productsoortCode: 'WRA',
                    omschrijving: 'woonruimteaanpassing (in behandeling)',
                  },
                  resultaat: 'toegewezen',
                  toegewezenProduct: {
                    datumIngangGeldigheid: '2023-05-06',
                    datumEindeGeldigheid: null,
                    actueel: true,
                    leveringsvorm: 'zin',
                    leverancier: {
                      omschrijving: 'Gebr Koenen B.V.',
                    },
                    toewijzingen: [
                      {
                        toewijzingsDatumTijd: '2024-01-25T17:10:55.2733333',
                        ingangsdatum: '2024-01-01',
                        datumOpdracht: '2024-01-25T17:10:55.2733333',
                        leveringen: [
                          {
                            begindatum: '2024-03-14',
                          },
                        ],
                      },
                    ],
                    betrokkenen: ['9999999999'],
                  },
                },
              ],
            },
            documenten: [],
          },
        ],
      },
    };

    test('happy', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          bsn: '9999999999',
          voorletters: 'E',
          voorvoegsel: null,
          geboortenaam: 'Alex',
          voornamen: 'Flex',
          geboortedatum: '2010-06-12',
        },
      } as ZorgnedPersoonsgegevensNAWResponse);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken().profile.id,
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result).toStrictEqual({
        content: [
          {
            betrokkenPersonen: [],
            betrokkenen: ['9999999999'],
            datumAanvraag: '2023-04-25',
            datumBeginLevering: '2024-03-14',
            datumBesluit: '2023-05-17',
            datumEindeGeldigheid: null,
            datumEindeLevering: null,
            datumIngangGeldigheid: '2023-05-06',
            datumOpdrachtLevering: '2024-01-25T17:10:55.2733333',
            datumToewijzing: '2024-01-25T17:10:55.2733333',
            documenten: [],
            id: '1126685618',
            isActueel: true,
            leverancier: 'Gebr Koenen B.V.',
            leveringsVorm: 'ZIN',
            productIdentificatie: 'WRA',
            productsoortCode: 'WRA',
            resultaat: 'toegewezen',
            titel: 'woonruimteaanpassing (in behandeling)',
          },
        ],
        failedDependencies: {
          relatedPersons: {
            content: null,
            message: 'Something went wrong when retrieving related persons.',
            status: 'ERROR',
          },
        },
        status: 'OK',
      });
    });

    test('NAW request error', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken().profile.id,
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result.content?.[0]?.betrokkenPersonen).toStrictEqual([]);
      expect('failedDependencies' in result).toBe(true);
      expect(
        'failedDependencies' in result &&
          'relatedPersons' in result.failedDependencies!
      ).toBe(true);
    });

    test('NAW relation not found', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, null!);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken().profile.id,
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result.content?.[0]?.betrokkenPersonen).toStrictEqual([]);
      expect('failedDependencies' in result).toBe(true);
      expect(
        'failedDependencies' in result &&
          'relatedPersons' in result.failedDependencies!
      ).toBe(true);
    });
  });
});

describe('fetchRelatedPersons', async () => {
  type Person = ZorgnedPersoonsgegevensNAWResponse['persoon'];

  function createPerson(person: Partial<Person>): Person {
    if (person.voornamen) {
      person.roepnaam = person.voornamen;
      person.voorletters = person.voornamen[0];
    }

    return {
      voornamen: 'Jay',
      roepnaam: 'Jay',
      voorletters: 'J',
      voorvoegsel: 'De',
      geboortenaam: 'Jay',
      geboortedatum: '20-20-2020',
      bsn: `bsn-${person.voornamen}`,
      clientidentificatie: null,
      ...person,
    };
  }

  function setupEndpointForFetchRelatedPersons({
    statusCode,
    persoongegevensNAWResponse,
  }: {
    statusCode: number;
    persoongegevensNAWResponse?: ZorgnedPersoonsgegevensNAWResponse | null;
  }): void {
    remoteApi
      .post('/zorgned/persoonsgegevensNAW')
      .reply(statusCode || 200, persoongegevensNAWResponse || {});
  }

  test('Did not return a person', async () => {
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: null,
    });
    setupEndpointForFetchRelatedPersons({
      statusCode: 404,
      persoongegevensNAWResponse: null,
    });

    const userIDs = ['1', '2'];

    const response = await fetchRelatedPersons(userIDs, 'ZORGNED_AV');
    expect(response).toStrictEqual(
      apiErrorResult(
        'Something went wrong when retrieving related persons.',
        null
      )
    );
  });

  test('Returns a person', async () => {
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: {
        persoon: createPerson({
          voorvoegsel: 'de',
          geboortenaam: 'Jarvis',
          voornamen: 'Baron',
          geboortedatum: '2016-07-09',
          bsn: 'x123z',
          partnernaam: null,
          partnervoorvoegsel: null,
        }),
      },
    });
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: {
        persoon: createPerson({
          voorvoegsel: null,
          geboortenaam: 'Alex',
          voornamen: 'Flex',
          geboortedatum: '2016-07-09',
          bsn: 'x123z',
          clientidentificatie: null,
          roepnaam: 'Alex',
          voorletters: 'A',
          partnernaam: 'hey ho',
          partnervoorvoegsel: null,
        }),
      },
    });

    const userIDs = ['1', '2'];

    const response = await fetchRelatedPersons(userIDs, 'ZORGNED_AV');
    const expected: ApiSuccessResponse<ZorgnedPerson[]> = {
      content: [
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Baron',
          partnernaam: null,
          partnervoorvoegsel: null,
        },
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Flex',
          partnernaam: 'hey ho',
          partnervoorvoegsel: null,
        },
      ],
      status: 'OK',
    };

    expect(response).toStrictEqual(expected);
  });
});
