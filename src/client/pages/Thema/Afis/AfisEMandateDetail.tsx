import { useEffect } from 'react';

import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useNavigate } from 'react-router';
import { useThrottledCallback } from 'use-debounce';

import { routeConfig, type WithActionButtons } from './Afis-thema-config';
import { DateAdjust } from './AfisEmandateDateAdjust';
import { useAfisEMandatesData } from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { ONE_SECOND_MS } from '../../../hooks/api/useSessionApi';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type EMandateProps = {
  eMandate: WithActionButtons<AfisEMandateFrontend>;
  isPendingActivation: boolean;
};

function EMandate({ eMandate, isPendingActivation }: EMandateProps) {
  return (
    <PageContentCell>
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
                content: <DateAdjust eMandate={eMandate} />,
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
        <Paragraph>{eMandate.action}</Paragraph>
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

const POLLING_INTERVAL_MS = 4 * ONE_SECOND_MS;

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
