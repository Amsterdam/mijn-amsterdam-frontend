import { Alert, Paragraph } from '@amsterdam/design-system-react';

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
};

function EMandate({ eMandate }: EMandateProps) {
  const {
    redirectUrlApi,
    statusChangeApi,
    eMandateUpdateApi,
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
                    <div className="ams-mb-s">{eMandate.creditor}</div>
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
            Wachten op bevestiging van het E-Mandaat voor {eMandate.creditor}
            .{' '}
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
            {isPendingActivation(eMandate.creditorIBAN) && (
              <EmandateRefetchInterval fetch={refetchEMandates} />
            )}
            <EMandate eMandate={eMandate} />
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
