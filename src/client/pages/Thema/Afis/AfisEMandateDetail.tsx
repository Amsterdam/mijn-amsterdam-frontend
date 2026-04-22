import {
  Alert,
  Button,
  Heading,
  Paragraph,
} from '@amsterdam/design-system-react';

import { EMANDATE_STATUS_ACTIVE, themaConfig } from './Afis-thema-config.ts';
import { eMandateHistoryDisplayProps } from './Afis-thema-config.ts';
import { AfisEMandateActionButtons } from './AfisEmandateActionButtons.tsx';
import { DateAdjust } from './AfisEmandateDateAdjust.tsx';
import styles from './AfisEMandateDetail.module.scss';
import { AfisEmandateRefetchInterval } from './AfisEmandateFetchInterval.tsx';
import { useEmandateApis } from './useAfisEmandateActionsApi.tsx';
import { useAfisEMandatesApi } from './useAfisEmandatesApi.tsx';
import {
  useSignRequestPayloadStorage,
  useSignRequestStatusCheck,
} from './useAfisEMandatesSignRequest.tsx';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { Spinner } from '../../../components/Spinner/Spinner.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useWidescreen } from '../../../hooks/media.hook.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

function EmandateHistorySection({
  eMandateHistory,
}: {
  eMandateHistory: AfisEMandateFrontend['history'];
}) {
  return (
    <section>
      <Heading id="eerdere-emandaten" level={3} className="ams-mb-m">
        Eerdere E-Mandaten
      </Heading>
      {eMandateHistory.map((historyItem) => {
        return (
          <article key={historyItem.eMandateIdSource} className="ams-mb-xl">
            <table className={styles.EmandateHistoryItem}>
              <tr>
                <th>Referentie</th>
                <td>{historyItem.eMandateIdSource}</td>
              </tr>
              <tr>
                <th>Van</th>
                <td>{historyItem.dateValidFromFormatted}</td>
              </tr>
              <tr>
                <th>Tot</th>
                <td>{historyItem.dateValidToFormatted}</td>
              </tr>
              <tr>
                <th>Rekeninghouder</th>
                <td>{historyItem.senderName}</td>
              </tr>
              <tr>
                <th>IBAN</th>
                <td>{historyItem.senderIBAN}</td>
              </tr>
            </table>
          </article>
        );
      })}
    </section>
  );
}

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
  const isWideScreen = useWidescreen();
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
          ...(eMandate.status === EMANDATE_STATUS_ACTIVE
            ? [
                {
                  label: 'Referentie',
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
          ...(!signRequestStatusCheckApi.isPendingActivation
            ? [
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
              ]
            : []),
          ...(eMandate.status === EMANDATE_STATUS_ACTIVE &&
          !signRequestStatusCheckApi.isPendingActivation
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
      <div className="ams-mb-xl">
        {signRequestStatusCheckApi.isRequestingStatusCheck ? (
          <Paragraph>
            <Spinner /> Mijn Amsterdam controleert de status van het
            E-Mandaat...
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
            {signRequestStatusCheckApi.isTakingLong && (
              <Paragraph>
                <Button
                  variant="secondary"
                  onClick={() => signRequestStatusCheckApi.cancel()}
                >
                  Duurt het erg lang? Probeer het opnieuw.
                </Button>
              </Paragraph>
            )}
          </Alert>
        ) : (
          <AfisEMandateActionButtons
            redirectUrlApi={redirectUrlApi}
            deactivateApi={deactivateApi}
            eMandate={eMandate}
          />
        )}
      </div>
      {!!eMandate.history.length &&
        (isWideScreen ? (
          <ThemaPaginaTable
            zaken={eMandate.history}
            title="Eerdere E-Mandaten"
            displayProps={eMandateHistoryDisplayProps}
          />
        ) : (
          <EmandateHistorySection eMandateHistory={eMandate.history} />
        ))}
    </PageContentCell>
  );
}

export function AfisEMandateDetail() {
  useHTMLDocumentTitle(themaConfig.detailEMandatePage.route);

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
      breadcrumbs={breadcrumbs}
      pageContentMain={
        <>
          {!!eMandate && (
            <>
              {payloadStorage.hasPayloads() && (
                <AfisEmandateRefetchInterval fetch={fetchEMandates} />
              )}
              <EMandate eMandate={eMandate} />
            </>
          )}
        </>
      }
    />
  );
}
