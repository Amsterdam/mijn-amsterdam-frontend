import { useEffect } from 'react';

import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';

import { routeConfig } from './Afis-thema-config';
import { AfisEMandateActionUrls } from './AfisEmandateActionButtons';
import { DateAdjust } from './AfisEmandateDateAdjust';
import { useAfisEMandatesData, useEmandateApis } from './useAfisEmandateApi';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useInterval } from '../../../hooks/timer.hook';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
      if (isPendingActivation && window.location.search.includes('iban=')) {
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
    statusNotification: { isPendingActivation },
  } = useAfisEMandatesData();

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
              isPendingActivation={isPendingActivation(eMandate.acceptantIBAN)}
            />
            <EMandate
              isPendingActivation={isPendingActivation(eMandate.acceptantIBAN)}
              eMandate={eMandate}
            />
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
