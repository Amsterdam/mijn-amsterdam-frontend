import { useEffect, useState } from 'react';

import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';

import { routeConfig } from './Afis-thema-config';
import { AfisEMandateActionUrls } from './AfisEmandateActionButtons';
import { DateAdjust } from './AfisEmandateDateAdjust';
import {
  optimisticEmandatesUpdate,
  useAfisEMandatesData,
  useAfisEmandateUpdate,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
} from '../../../../server/services/afis/afis-types';
import { entries } from '../../../../universal/helpers/utils';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useDataApiV2, sendGetRequest } from '../../../hooks/api/useDataApi';
import { useSessionStorage } from '../../../hooks/storage.hook';
import { useInterval } from '../../../hooks/timer.hook';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

function useEmandateApis(eMandate: AfisEMandateFrontend) {
  const { mutate } = useAfisEMandatesData();

  const redirectUrlApi = useDataApiV2<AfisEMandateSignRequestResponse>(
    eMandate.signRequestUrl,
    {
      postpone: true,
      fetcher: (url: string) => {
        return sendGetRequest<AfisEMandateSignRequestResponse>(url).then(
          (content) => {
            window.location.href = content.redirectUrl;
            return content;
          }
        );
      },
    }
  );
  const statusChangeApi = useDataApiV2<AfisEMandateStatusChangeResponse>(
    eMandate.statusChangeUrl,
    {
      postpone: true,
      fetcher: (url) => {
        return sendGetRequest<AfisEMandateStatusChangeResponse>(url).then(
          (eMandateUpdatePayload) => {
            if (eMandate && eMandateUpdatePayload) {
              mutate(
                optimisticEmandatesUpdate(eMandate, eMandateUpdatePayload),
                {
                  revalidate: false,
                }
              );
            }
            return eMandateUpdatePayload;
          }
        );
      },
    }
  );

  const { businessPartnerIdEncrypted } = useAfisThemaData();

  const eMandateUpdateApi = useAfisEmandateUpdate(
    businessPartnerIdEncrypted,
    eMandate
  );

  type ApiName = 'redirectUrlApi' | 'statusChangeApi' | 'updateApi';

  const [showError, setShowError] = useState(false);
  const [lastActiveApi, setLastActiveApi] = useState<ApiName | null>(null);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isLoading,
      statusChangeApi: statusChangeApi.isLoading,
      updateApi: eMandateUpdateApi.isMutating,
    }).forEach(([apiName, isLoading]) => {
      if (isLoading) {
        setLastActiveApi(apiName);
      }
    });
  }, [
    redirectUrlApi.isLoading,
    statusChangeApi.isLoading,
    eMandateUpdateApi.isMutating,
  ]);

  const isErrorVisible =
    showError &&
    !redirectUrlApi.isLoading &&
    !statusChangeApi.isLoading &&
    !eMandateUpdateApi.isMutating &&
    (redirectUrlApi.isError ||
      statusChangeApi.isError ||
      !!eMandateUpdateApi.error);

  useEffect(() => {
    entries({
      redirectUrlApi: redirectUrlApi.isError,
      statusChangeApi: statusChangeApi.isError,
      updateApi: !!eMandateUpdateApi.error,
    }).forEach(([apiName, isError]) => {
      if (apiName === lastActiveApi && isError) {
        setShowError(true);
      }
    });
  }, [
    redirectUrlApi.isError,
    statusChangeApi.isError,
    !!eMandateUpdateApi.error,
    lastActiveApi,
  ]);

  return {
    redirectUrlApi,
    statusChangeApi,
    eMandateUpdateApi,
    isErrorVisible,
    lastActiveApi,
    hideError: () => {
      setShowError(false);
    },
  };
}

type EMandateProps = {
  eMandate: AfisEMandateFrontend;
  isPendingActivation: boolean;
};

function EMandate({ eMandate, isPendingActivation }: EMandateProps) {
  const {
    redirectUrlApi,
    statusChangeApi,
    eMandateUpdateApi,
    isErrorVisible,
    hideError,
    lastActiveApi,
  } = useEmandateApis(eMandate);

  return (
    <PageContentCell>
      {isErrorVisible && (
        <Alert
          heading="Foutmelding"
          headingLevel={4}
          severity="error"
          closeable
          onClose={hideError}
          className="ams-mb-m"
        >
          <Paragraph>
            {lastActiveApi === 'redirectUrlApi' && redirectUrlApi.isError && (
              <>
                Er is iets misgegaan bij het ophalen van de link naar de
                handtekening.
              </>
            )}
            {lastActiveApi === 'statusChangeApi' && statusChangeApi.isError && (
              <>Er is iets misgegaan bij het stopzetten.</>
            )}
            {lastActiveApi === 'updateApi' && !!eMandateUpdateApi.error && (
              <>Er is iets misgegaan bij het aanpassen van einddatum.</>
            )}
          </Paragraph>
        </Alert>
      )}
      <Datalist
        rows={[
          {
            rows: [
              {
                label: 'Afdeling gemeente',
                content: (
                  <>
                    <div className="ams-mb-s">{eMandate.acceptant}</div>
                    {eMandate.acceptantDescription && (
                      <Paragraph size="small">
                        {eMandate.acceptantDescription}
                      </Paragraph>
                    )}
                  </>
                ),
              },
              {
                label: 'IBAN gemeente',
                content: eMandate.acceptantIBAN,
              },
            ],
          },
          {
            rows: [
              {
                label: 'Status',
                content: eMandate.displayStatus,
                isVisible: !isPendingActivation,
              },
              {
                label: 'Einddatum',
                isVisible: eMandate.status === '1',
                content: (
                  <DateAdjust
                    eMandateUpdateApi={eMandateUpdateApi}
                    eMandate={eMandate}
                  />
                ),
              },
            ],
          },
          ...(eMandate.status === '1'
            ? [
                {
                  rows: [
                    {
                      label: 'Naam rekeninghouder',
                      content: eMandate.senderName || 'Onbekend',
                    },
                    {
                      label: 'IBAN rekeninghouder',
                      content: eMandate.senderIBAN || 'Onbekend',
                    },
                  ],
                },
              ]
            : []),
        ]}
      />
      {isPendingActivation ? (
        <Alert headingLevel={4} heading="Status">
          <Paragraph>
            Wachten op bevestiging van het E-Mandaat voor {eMandate.acceptant}.
          </Paragraph>
        </Alert>
      ) : (
        <AfisEMandateActionUrls
          redirectUrlApi={redirectUrlApi}
          statusChangeApi={statusChangeApi}
          eMandate={eMandate}
        />
      )}
    </PageContentCell>
  );
}

function EmandateFetchInterval({ fetch }: { fetch: () => void }) {
  useInterval(fetch, POLLING_INTERVAL_MS);
  return null;
}

function EmandatePoller({
  fetch,
  isPendingActivation,
}: {
  fetch: () => void;
  isPendingActivation: boolean;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (isPendingActivation) {
        // Removes the query argument that initiated the polling
        navigate(window.location.pathname, {
          replace: true,
        });
      }
    };
  }, [isPendingActivation]);

  return isPendingActivation ? <EmandateFetchInterval fetch={fetch} /> : null;
}

const POLLING_INTERVAL_MS = 4000;

export function AfisEMandateDetail() {
  useHTMLDocumentTitle(routeConfig.detailPageEMandate);

  const {
    title,
    eMandate,
    breadcrumbs,
    hasEMandatesError,
    isLoadingEMandates,
    refetchEMandates,
  } = useAfisEMandatesData();

  const queryParams = new URLSearchParams(window.location.search);
  const iban = queryParams.get('iban');

  const [ibansPendingActivation, setIsPendingActivation] = useSessionStorage(
    'afis-emandate-pending-activation',
    ''
  );

  useEffect(() => {
    let updatedIbans: string = ibansPendingActivation || '';
    if (eMandate?.status === '0' && iban && !updatedIbans.includes(iban)) {
      updatedIbans = [...updatedIbans.split(','), iban]
        .filter(Boolean)
        .join(',');
    }
    if (
      eMandate?.status === '1' &&
      eMandate?.acceptantIBAN &&
      updatedIbans.includes(eMandate?.acceptantIBAN)
    ) {
      updatedIbans = updatedIbans
        .split(',')
        .filter((i) => i !== eMandate.acceptantIBAN)
        .join(',');
    }
    if (ibansPendingActivation !== updatedIbans) {
      setIsPendingActivation(updatedIbans);
    }
  }, [iban, eMandate?.status, eMandate?.acceptantIBAN]);

  const isPendingActivation = ibansPendingActivation?.includes(
    eMandate?.acceptantIBAN
  );

  return (
    <ThemaDetailPagina
      title={title}
      zaak={eMandate}
      isError={hasEMandatesError}
      isLoading={isLoadingEMandates}
      pageContentMain={
        !!eMandate && (
          <>
            <EmandatePoller
              fetch={refetchEMandates}
              isPendingActivation={isPendingActivation}
            />
            <EMandate
              isPendingActivation={isPendingActivation}
              eMandate={eMandate}
            />
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
