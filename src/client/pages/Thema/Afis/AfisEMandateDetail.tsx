import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { EMANDATE_STATUS_ACTIVE, routeConfig } from './Afis-thema-config';
import { AfisEMandateActionUrls } from './AfisEmandateActionButtons';
import { DateAdjust } from './AfisEmandateDateAdjust';
import { useAfisEMandatesData, useEmandateApis } from './useAfisEmandatesData';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useInterval } from '../../../hooks/timer.hook';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type EMandateProps = {
  eMandate: AfisEMandateFrontend;
};

function EMandate({ eMandate }: EMandateProps) {
  const {
    redirectUrlApi,
    statusChangeApi,
    lifetimeUpdateApi,
    isErrorVisible,
    hideError,
    lastActiveApi,
    statusNotification: { removePendingActivation, isPendingActivation },
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
            {lastActiveApi === 'lifetimeUpdateApi' &&
              !!lifetimeUpdateApi.isError && (
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
                    <div className="ams-mb-s">{eMandate.creditorName}</div>
                    {eMandate.creditorDescription && (
                      <Paragraph size="small">
                        {eMandate.creditorDescription}
                      </Paragraph>
                    )}
                  </>
                ),
              },
              {
                label: 'IBAN gemeente',
                content: eMandate.creditorIBAN,
              },
            ],
          },
          {
            rows: [
              {
                label: 'Status',
                content: eMandate.displayStatus,
                isVisible: !isPendingActivation(eMandate.creditorIBAN),
              },
              {
                label: 'Einddatum',
                isVisible: eMandate.status === EMANDATE_STATUS_ACTIVE,
                content: (
                  <DateAdjust
                    lifetimeUpdateApi={lifetimeUpdateApi}
                    eMandate={eMandate}
                  />
                ),
              },
            ],
          },
          ...(eMandate.status === EMANDATE_STATUS_ACTIVE
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
      {isPendingActivation(eMandate.creditorIBAN) ? (
        <Alert
          headingLevel={4}
          heading="Status"
          closeable
          onClose={() => {
            removePendingActivation(eMandate.creditorIBAN);
          }}
        >
          <Paragraph>
            Wachten op bevestiging van het E-Mandaat voor{' '}
            {eMandate.creditorName}.{' '}
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

// This component is used to refetch the eMandate data at a regular interval,
const POLLING_INTERVAL_MS = 4000; // 4 seconds

export function EmandateRefetchInterval({ fetch }: { fetch: () => void }) {
  useInterval(fetch, POLLING_INTERVAL_MS);
  return null;
}

export function AfisEMandateDetail() {
  useHTMLDocumentTitle(routeConfig.detailPageEMandate);

  const {
    title,
    themaId,
    eMandate,
    breadcrumbs,
    hasEMandatesError,
    isLoadingEMandates,
    fetchEMandates,
    statusNotification: { isPendingActivation },
  } = useAfisEMandatesData();

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaId}
      zaak={eMandate}
      isError={hasEMandatesError}
      isLoading={isLoadingEMandates}
      pageContentMain={
        !!eMandate && (
          <>
            {isPendingActivation(eMandate.creditorIBAN) && (
              <EmandateRefetchInterval fetch={fetchEMandates} />
            )}
            <EMandate eMandate={eMandate} />
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
