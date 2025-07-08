import { useEffect, useState } from 'react';

import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';
import { useThrottledCallback } from 'use-debounce';

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

function EmandatePoller({
  status,
  isPendingActivation,
  fetch,
}: {
  status: AfisEMandateFrontend['status'];
  isPendingActivation: boolean;
  fetch: () => void;
}) {
  const isPendingActivation_ = isPendingActivation && status === '0';

  const doPolling = useThrottledCallback(fetch, POLLING_INTERVAL_MS, {
    trailing: true,
  });

  if (isPendingActivation_) {
    doPolling();
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (!isPendingActivation_) {
      doPolling.cancel();
      navigate(window.location.pathname, {
        replace: true,
      });

      return;
    }
  }, [isPendingActivation_]);

  return null;
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
  const isPendingActivation = !!queryParams.get('iban');

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
              status={eMandate.status}
              isPendingActivation={isPendingActivation}
              fetch={refetchEMandates}
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
