import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { EMANDATE_STATUS_ACTIVE, routeConfig } from './Afis-thema-config';
import { AfisEMandateActionButtons } from './AfisEmandateActionButtons';
import { DateAdjust } from './AfisEmandateDateAdjust';
import { AfisEmandateRefetchInterval } from './AfisEmandateFetchInterval';
import { useEmandateApis } from './useAfisEmandateActionsApi';
import { useAfisEMandatesApi } from './useAfisEmandatesApi';
import {
  useSignRequestPayloadStorage,
  useSignRequestStatusCheck,
} from './useAfisEMandatesSignRequest';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { Datalist } from '../../../components/Datalist/Datalist';
import { MaButtonLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type EMandateProps = {
  eMandate: AfisEMandateFrontend;
};

function EMandate({ eMandate }: EMandateProps) {
  const {
    redirectUrlApi,
    deactivateApi,
    lifetimeUpdateApi,
    isErrorVisible,
    hideError,
    lastActiveApi,
  } = useEmandateApis(eMandate);

  const signRequestStatusCheckApi = useSignRequestStatusCheck(eMandate);

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
            {lastActiveApi === 'deactivateApi' && deactivateApi.isError && (
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
          ...(!IS_PRODUCTION && eMandate.status === EMANDATE_STATUS_ACTIVE
            ? [
                {
                  label: 'AFIS/SAP - ID',
                  content: eMandate.eMandateIdSource,
                },
              ]
            : []),
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
      {signRequestStatusCheckApi.isRequestingStatusCheck ? (
        <Paragraph>
          Mijn Amsterdam controleert de status van het E-Mandaat...
        </Paragraph>
      ) : signRequestStatusCheckApi.isPendingActivation ? (
        <Alert headingLevel={4} heading="Status">
          <Paragraph>
            Wachten op bevestiging van het E-Mandaat voor{' '}
            {eMandate.creditorName}. Dit kan enkele minuten duren.
          </Paragraph>
          <Paragraph>
            Zodra de bevestiging is ontvangen, zal het E-Mandaat actief
            worden.{' '}
          </Paragraph>
          <Paragraph>
            <MaButtonLink
              variant="secondary"
              onClick={() => signRequestStatusCheckApi.cancel()}
            >
              Duurt het erg lang? Probeer het opnieuw.
            </MaButtonLink>
          </Paragraph>
        </Alert>
      ) : (
        <AfisEMandateActionButtons
          redirectUrlApi={redirectUrlApi}
          deactivateApi={deactivateApi}
          eMandate={eMandate}
        />
      )}
    </PageContentCell>
  );
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
  } = useAfisEMandatesApi();

  const payloadStorage = useSignRequestPayloadStorage();

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
            {payloadStorage.hasPendingStatusChecks() && (
              <AfisEmandateRefetchInterval fetch={fetchEMandates} />
            )}
            <EMandate eMandate={eMandate} />
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
