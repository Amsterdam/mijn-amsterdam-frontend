import axios from 'axios';
import { parseISO } from 'date-fns';
import { generatePath } from 'react-router-dom';
import { StatusLineItem } from '../../../client/components/StatusLine/StatusLine.types';
import { AppRoutes } from '../../../universal/config';
import {
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { GenericDocument, LinkProps } from '../../../universal/types/App.types';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';

// zaak detail: record/GFO_ZAKEN/$id
// gelinkte dingen, bv documenten: link/GFO_ZAKEN/$id
// links: /record/GFO_ZAKEN/-999742/Links

function fetchPowerBrowserToken(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const dataRequestConfig = getApiConfig('POWERBROWSER');
  return requestData<string>(
    {
      ...dataRequestConfig,
      url: `${dataRequestConfig.url}/Token`,
      data: {
        apiKey: process.env.BFF_POWERBROWSER_TOKEN_API_KEY,
      },
    },
    requestID,
    authProfileAndToken
  );
}

interface PowerBrowserZaak {
  id: string;
  zaaktype: 'Vergunningaanvraag behandelen';
  product: 'Bed & Breakfast';
  zaaK_IDENTIFICATIE: string;
  startdatum: string; // datumAanvraag
  einddatum: string; // datumAfgehandeld
  datumingang: string; // dateStart
  besluitdatumvervallen: string; // verval datum
  status:
    | string
    | 'Gereed'
    | 'Intake'
    | 'In behandeling'
    | 'Geaccepteerd'
    | 'Afgehandeld'
    | 'Toetsen volledigheid'
    | 'Controle bezoek';
  resultaat:
    | null
    // | 'Niet van toepassing'
    // | 'Buiten behandeling'
    | 'Geweigerd'
    | 'Geweigerd op basis van Quotum'
    | 'Verleend met overgangsrecht'
    | 'Verleend zonder overgangsrecht'
    | 'Verleend'
    | 'Ingetrokken';
  initator: string;
  adres: string;
}

type PowerBrowserZakenResponse = PowerBrowserZaak[];

export interface BBVergunning {
  datumAfhandeling?: string | null;
  datumAanvraag: string;
  datumVan: string;
  datumTot: string;
  resultaat: 'Verleend' | 'Niet verleend' | 'Ingetrokken' | null;
  heeftOvergangsRecht: boolean;
  id: string;
  zaakId: string;
  zaaknummer: string;
  link: LinkProps;
  eigenaar: string | null;
  aanvrager: string | null;
  titel: 'Vergunning bed & breakfast';
  statussen: StatusLineItem[];
  isActief: boolean;
  adres: string;
  status: string;
  documents: GenericDocument[];
}

function transformResultaat(resultaat: PowerBrowserZaak['resultaat']) {
  if (resultaat === null) {
    return null;
  }

  let resultaatTransformed: BBVergunning['resultaat'] = null;

  const resultatenVerleend = [
    'Verleend met overgangsrecht',
    'Verleend zonder overgangsrecht',
    'Verleend',
  ];

  if (resultatenVerleend.includes(resultaat)) {
    resultaatTransformed = 'Verleend';
  }

  const resultatenNietVerleend = ['Geweigerd op basis van Quotum', 'Geweigerd'];

  if (resultatenNietVerleend.includes(resultaat)) {
    resultaatTransformed = 'Niet verleend';
  }

  const resultatenOverig = ['Ingetrokken'];

  if (resultatenOverig.includes(resultaat)) {
    resultaatTransformed = 'Ingetrokken';
  }

  return resultaatTransformed;
}

function transformStatus(status: PowerBrowserZaak['status']) {
  switch (status) {
    case 'Afgehandeld':
    case 'Gereed':
    case 'Controle bezoek':
      return 'Afgehandeld';
    default:
    case 'Ontvangen':
    case 'Intake':
      return 'Ontvangen';
  }
}

export function transformBenBZakenResponse(zaken: PowerBrowserZakenResponse) {
  const bbVergunnigen: BBVergunning[] = [];

  for (const zaak of zaken) {
    // From Z/AB/123 to z-ab-123
    const idTransformed = zaak.zaaK_IDENTIFICATIE
      .replace(/\//g, '-')
      .toUpperCase();

    const isIngetrokken = !!zaak.resultaat
      ?.toLowerCase()
      .includes('ingetrokken');

    const datumTot = zaak.besluitdatumvervallen
      ? defaultDateFormat(zaak.besluitdatumvervallen)
      : '';
    const isGeweigerd = !!zaak.resultaat?.toLowerCase().includes('geweigerd');
    const isVerlopen =
      datumTot && parseISO(datumTot) < new Date() ? true : false;
    const isVerleend = !!zaak.resultaat?.toLowerCase().includes('verleend');

    const bbVergunnig: BBVergunning = {
      datumAfhandeling: defaultDateFormat(zaak.einddatum),
      datumAanvraag: defaultDateFormat(zaak.startdatum),
      datumVan: zaak.datumingang ? defaultDateFormat(zaak.datumingang) : '',
      datumTot,
      resultaat: transformResultaat(zaak.resultaat),
      heeftOvergangsRecht: !!zaak.resultaat?.includes(
        'Verleend met overgangsrecht'
      ),
      id: idTransformed,
      zaakId: zaak.id,
      zaaknummer: zaak.zaaK_IDENTIFICATIE,
      link: {
        to: generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'], {
          id: idTransformed,
        }),
        title: 'Vergunning bed & breakfast',
      },
      adres: zaak.adres,
      eigenaar: '', // ??
      aanvrager: '', // ??
      titel: 'Vergunning bed & breakfast',
      statussen: [],
      status: transformStatus(zaak.status),
      isActief:
        (!isIngetrokken && !isGeweigerd && isVerleend && !isVerlopen) ||
        !zaak.resultaat,
      documents: [],
    };

    bbVergunnigen.push(bbVergunnig);
  }

  return bbVergunnigen;
}

function fetchPowerBrowserZaken(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  bearerToken: string
) {
  const dataRequestConfig = getApiConfig('POWERBROWSER', {
    transformResponse: transformBenBZakenResponse,
  });

  return requestData<BBVergunning[]>(
    {
      ...dataRequestConfig,
      url: `${dataRequestConfig.url}/Report/RunSavedReport`,
      data: {
        reportFileName:
          'D:\\Genetics\\PowerForms\\Overzichten\\Wonen\\MijnAmsterdamZaak.gov',
        Parameters: [
          {
            Name: 'BSN',
            Type: 'String',
            Value: {
              StringValue: authProfileAndToken.profile.id,
            },
            BeforeText: "'",
            AfterText: "'",
          },
        ],
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        ...dataRequestConfig.headers,
      },
    },
    requestID,
    authProfileAndToken
  );
}

interface PowerBrowserStatus {
  omschrijving: string | 'Ontvangen';
  datum: string;
}

type PowerBrowserStatusResponse = PowerBrowserStatus[];

function transformPowerBrowserStatusResponse(
  zaak: BBVergunning,
  statusResponse: PowerBrowserStatusResponse
) {
  function getStatusDate(status: string[]) {
    const datum =
      statusResponse?.find(({ omschrijving }) => status.includes(omschrijving))
        ?.datum ?? '';
    return datum ? defaultDateFormat(datum) : '';
  }

  const hasInBehandelingStep = statusResponse?.find(
    ({ omschrijving }) => 'In behandeling' === omschrijving
  );

  // Nieuwe zaken hebben wel statussen
  let datumOntvangen = getStatusDate(['Intake', 'Ontvangen']);
  let datumInBehandeling = getStatusDate(['In behandeling']);
  let datumAfgehandeld: string = getStatusDate(['Afgehandeld', 'Gereed']);

  // NOTE: Gemigreerde zaken (van Decos naar Powerbrowser) hebben een negatief nummer als id gekregen.
  if (parseInt(zaak.zaakId, 10) < 0) {
    datumOntvangen = zaak.datumAanvraag;
    datumAfgehandeld = zaak.datumAfhandeling ?? '';
  }

  if (!datumOntvangen && zaak.datumAanvraag) {
    datumOntvangen = zaak.datumAanvraag;
  }

  if (!datumAfgehandeld && zaak.datumAfhandeling) {
    datumAfgehandeld = zaak.datumAfhandeling;
  }

  // Gemigreerde zaken hebben geen statussen
  const statusOntvangen: StatusLineItem = {
    status: 'Ontvangen',
    datePublished: datumOntvangen,
    isActive: false,
    isChecked: true,
  };

  const statusInBehandeling: StatusLineItem = {
    status: 'In behandeling',
    datePublished: hasInBehandelingStep ? datumInBehandeling : '',
    isActive: !datumAfgehandeld,
    isChecked: !!(datumInBehandeling || datumAfgehandeld),
  };

  const statusAfgehandeld: StatusLineItem = {
    status: 'Afgehandeld',
    datePublished: datumAfgehandeld,
    isActive: !!datumAfgehandeld,
    isChecked: !!datumAfgehandeld,
  };

  return [statusOntvangen, statusInBehandeling, statusAfgehandeld];
}

async function fetchPowerBrowserZaakStatus(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  bearerToken: string,
  zaak: BBVergunning
) {
  const dataRequestConfig = getApiConfig('POWERBROWSER', {
    transformResponse: (responseData) =>
      transformPowerBrowserStatusResponse(zaak, responseData),
  });

  return requestData<StatusLineItem[]>(
    {
      ...dataRequestConfig,
      url: `${dataRequestConfig.url}/Report/RunSavedReport`,
      data: {
        reportFileName:
          'D:\\Genetics\\PowerForms\\Overzichten\\Wonen\\MijnAmsterdamStatus.gov',
        Parameters: [
          {
            Name: 'GFO_ZAKEN_ID',
            Type: 'String',
            Value: {
              StringValue: `${zaak.zaakId}`,
            },
          },
        ],
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        ...dataRequestConfig.headers,
      },
    },
    requestID,
    authProfileAndToken
  );
}

const documentNamenMA_PB = {
  'Besluit toekenning': [
    'Anoniem Besluit BB (brief)',
    'Anoniem Besluit BB met overgangsrecht (brief)',
    'Besluit B&B',
    'Besluit B&B met overgangsrecht',
    'Besluit BB vergunningvrij (brief)',
    'Besluit verlening beslistermijn B&B (Brief)',
  ],
  'Besluit Buiten behandeling': ['Besluit aanvraag B&B niet in behandeling '],
  'Besluit weigering': ['Besluit B&B weigering zonder overgangsrecht'],
  'Besluit instrekking': ['Intrekken vergunning BB (brief)'],
};

interface PowerbrowserLink {
  mainTable: string | 'DOCLINK';
  mainId: number;
  caption: string;
  linkID: number;
  note: string | 'Bijlage';
}

function transformPowerbrowserLinksResponse(responseData: PowerbrowserLink[]) {
  return (
    responseData
      ?.filter(
        (link) =>
          link.mainTable === 'DOCLINK' &&
          link.note === 'Bijlage' &&
          !!link.caption?.toLowerCase().includes('.pdf')
      )
      .map((link) => {
        const [docIdEncrypted] = encrypt(
          String(link.mainId),
          process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
        );

        const [docTitleTranslated] =
          Object.entries(documentNamenMA_PB).find(
            ([docTitleMa, docTitlesPB]) => {
              return docTitlesPB.some((docTitlePb) =>
                link.caption.includes(docTitlePb)
              );
            }
          ) ?? [];

        return {
          id: docIdEncrypted,
          title: docTitleTranslated ?? link.caption,
          url: generateFullApiUrlBFF(
            BffEndpoints.TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD,
            { docIdEncrypted }
          ),
          download: link.caption,
          external: true,
          datePublished: '',
        };
      }) ?? []
  );
}

export async function fetchPowerBrowserDocuments(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  bearerToken: string,
  zaakId: PowerBrowserZaak['id']
) {
  const dataRequestConfig = getApiConfig('POWERBROWSER', { method: 'GET' });

  return requestData<GenericDocument[]>(
    {
      ...dataRequestConfig,
      transformResponse: transformPowerbrowserLinksResponse,
      url: `${dataRequestConfig.url}/Link/GFO_ZAKEN/${zaakId}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        ...dataRequestConfig.headers,
      },
    },
    requestID,
    authProfileAndToken
  );
}

export async function fetchBBVergunning(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const tokenResponse = await fetchPowerBrowserToken(
    requestID,
    authProfileAndToken
  );

  if (tokenResponse.status === 'OK' && authProfileAndToken.profile.id) {
    const bearerToken = tokenResponse.content;
    const zakenResponse = await fetchPowerBrowserZaken(
      requestID,
      authProfileAndToken,
      bearerToken
    );

    if (zakenResponse.status === 'OK') {
      const statusRequests = zakenResponse.content.map((zaak) =>
        fetchPowerBrowserZaakStatus(
          requestID,
          authProfileAndToken,
          bearerToken,
          zaak
        )
      );
      const documentRequests = zakenResponse.content.map((zaak) =>
        fetchPowerBrowserDocuments(
          requestID,
          authProfileAndToken,
          bearerToken,
          zaak.zaakId
        )
      );
      const statusResponses = await Promise.all(statusRequests);
      const documentResponses = await Promise.all(documentRequests);

      const zaken = zakenResponse.content.map((zaak, index) => {
        const statussen = statusResponses[index].content;
        const documents = documentResponses[index].content;

        return Object.assign(zaak, {
          statussen,
          documents,
        });
      });

      return apiSuccessResult(zaken);
    }
  }

  return apiErrorResult('Kan geen Bed & Breakfast vergunningen ophalen', null);
}

export async function fetchBBDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrypted: string
) {
  const tokenResponse = await fetchPowerBrowserToken(
    requestID,
    authProfileAndToken
  );

  const documentId = decrypt(
    documentIdEncrypted,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );

  const url = `${process.env.BFF_POWERBROWSER_API_URL}/Dms/${documentId}/Pdf`;

  console.log(url);

  return axios({
    url,
    headers: {
      Authorization: `Bearer ${tokenResponse.content}`,
    },
    responseType: 'stream',
  });
}
