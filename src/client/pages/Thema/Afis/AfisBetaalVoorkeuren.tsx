import {
  Alert,
  Grid,
  Heading,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';

import { featureToggle } from './Afis-thema-config';
import styles from './AfisBetaalVoorkeuren.module.scss';
import { EmandateRefetchInterval } from './AfisEMandateDetail';
import { useAfisBetaalVoorkeurenData } from './useAfisBetaalVoorkeurenData';
import { useAfisEMandatesData } from './useAfisEmandatesData';
import { useAfisThemaData } from './useAfisThemaData.hook';
import {
  type AfisBusinessPartnerDetailsTransformed,
  type AfisEMandateFrontend,
} from '../../../../server/services/afis/afis-types';
import { entries } from '../../../../universal/helpers/utils';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { Datalist } from '../../../components/Datalist/Datalist';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { PageContentCell } from '../../../components/Page/Page';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type AfisBusinessPartnerProps = {
  businesspartner: Omit<
    AfisBusinessPartnerDetailsTransformed,
    'address'
  > | null;
  labels: DisplayProps<
    Omit<
      AfisBusinessPartnerDetailsTransformed,
      'address' | 'firstName' | 'lastName'
    >
  >;
  isLoading: boolean;
  startCollapsed: boolean;
};

function AfisBusinessPartnerDetails({
  businesspartner,
  labels,
  isLoading,
  startCollapsed = true,
}: AfisBusinessPartnerProps) {
  const rows = businesspartner
    ? entries(labels)
        .filter(
          ([key]) => !!businesspartner[key as keyof typeof businesspartner]
        )
        .map(([key, label]) => {
          const value = businesspartner[key as keyof typeof businesspartner];
          return {
            label,
            content: value,
          };
        })
    : [];

  return (
    <PageContentCell>
      <CollapsiblePanel
        title="Facturatiegegevens"
        startCollapsed={startCollapsed}
      >
        {isLoading && <LoadingContent />}
        {!isLoading && !!rows.length && (
          <Grid>
            <Grid.Cell span={6}>
              <Datalist
                className={styles['Datalist--businesspartnerdetails']}
                rows={rows}
                rowVariant="horizontal"
              />
            </Grid.Cell>
          </Grid>
        )}
      </CollapsiblePanel>
    </PageContentCell>
  );
}

export function AfisBetaalVoorkeuren() {
  const {
    businessPartnerIdEncrypted,
    isThemaPaginaError,
    isThemaPaginaLoading,
    linkListItems,
    breadcrumbs,
    routeConfig,
    themaId,
  } = useAfisThemaData();

  useHTMLDocumentTitle(routeConfig.betaalVoorkeuren);

  const {
    title,
    businesspartnerDetails,
    businessPartnerDetailsLabels,
    hasBusinessPartnerDetailsError,
    hasFailedFullNameDependency,
    hasFailedPhoneDependency,
    isLoadingBusinessPartnerDetails,
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

  const {
    eMandates,
    eMandateTableConfig,
    hasEMandatesError,
    isLoadingEMandates,
    statusNotification: { ibansPendingActivation },
    fetchEMandates,
  } = useAfisEMandatesData();

  const isLoadingAllAPis =
    isThemaPaginaLoading ||
    isLoadingBusinessPartnerDetails ||
    isLoadingEMandates;

  const eMandatesTable = featureToggle.afisEMandatesActive && (
    <ThemaPaginaTable<AfisEMandateFrontend>
      displayProps={eMandateTableConfig.displayProps}
      maxItems={-1}
      title={eMandateTableConfig.title}
      zaken={eMandates}
      contentAfterTheTitle={
        <Alert
          severity="warning"
          heading="Let op uitzonderingen"
          headingLevel={3}
          className="ams-mb-m"
        >
          <Paragraph className="ams-mb-s">
            Een automatische incasso instellen voor de directie Belastingen gaat
            via
            <br />
            <Link href="https://belastingbalie.amsterdam.nl/digid.info.php">
              Mijn Belastingen - gemeente Amsterdam
            </Link>
          </Paragraph>
          <Paragraph>
            Voor parkeervergunningen ga je naar
            <br />
            <Link href="https://www.amsterdam.nl/parkeren/parkeervergunning/wijzigen-opzeggen/parkeervergunning-betaalgegevens/">
              Parkeervergunning: betaalgegevens wijzigen - Gemeente Amsterdam
            </Link>
          </Paragraph>
        </Alert>
      }
    />
  );

  const mailBody = `Debiteurnaam: ${businesspartnerDetails?.fullName ?? '-'}%0D%0ADebiteurnummer: ${businesspartnerDetails?.businessPartnerId ?? '-'}`;

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hieronder kunt u uw facturatiegegevens bekijken en een automatische
        incasso instellen per afdeling van de gemeente. Wil u uw
        facturatiegegevens wijzigen, stuur dan een email naar{' '}
        <Link
          href={`mailto:debiteurenadministratie@amsterdam.nl?subject=Facturatiegegevens wijzigen&body=${mailBody}`}
        >
          debiteurenadministratie@amsterdam.nl
        </Link>
        .
      </Paragraph>
      {!featureToggle.afisEMandatesActive && (
        <>
          <Heading level={3} size="level-5">
            Via automatische incasso betalen
          </Heading>
          <Paragraph className="ams-mb-m">
            Download{' '}
            <Link
              rel="noreferrer noopener"
              href="https://omnichanneliv.cdn.salesforce-experience.com/cms/delivery/media/MCJM5EH46HYNAZXFYHPNR4WUIMBA?oid=00D68000000aIuV&channelId=0ap68000000g3EBAAY"
            >
              het machtigingsformulier.
            </Link>{' '}
            Kies een of meerdere producten waarvoor de gemeente automatisch mag
            incasseren en vul uw gegevens in. Het debiteurennummer is niet
            verplicht. Onderteken het formulier en stuur het naar:
          </Paragraph>
          <Paragraph className="ams-mb-m">
            Gemeente Amsterdam
            <br />
            Debiteurenadministratie
            <br />
            Antwoordnummer 47389
            <br />
            1070 WC Amsterdam
          </Paragraph>
          <Paragraph>Een postzegel is niet nodig.</Paragraph>
        </>
      )}
    </PageContentCell>
  );

  const pageContentMain = (
    <>
      <AfisBusinessPartnerDetails
        businesspartner={businesspartnerDetails}
        labels={businessPartnerDetailsLabels}
        isLoading={!!(isLoadingBusinessPartnerDetails || isThemaPaginaLoading)}
        startCollapsed={featureToggle.afisEMandatesActive}
      />
      {!!ibansPendingActivation.length && (
        <EmandateRefetchInterval fetch={fetchEMandates} />
      )}
      {eMandatesTable}
    </>
  );

  const errorAlertContent = isThemaPaginaError ? (
    <>Wij kunnen nu niet alle gegevens laten zien.</>
  ) : (
    <>
      {hasBusinessPartnerDetailsError && (
        <>
          Wij kunnen nu geen facturatiegegevens laten zien.
          <br />
        </>
      )}
      {hasEMandatesError && (
        <>Wij kunnen nu geen automatische incasso&apos;s laten zien.</>
      )}
    </>
  );

  return (
    <ThemaPagina
      id={themaId}
      title={title}
      isError={
        isThemaPaginaError ||
        (hasBusinessPartnerDetailsError && hasEMandatesError)
      }
      isPartialError={
        hasFailedFullNameDependency ||
        hasFailedPhoneDependency ||
        hasFailedPhoneDependency ||
        hasBusinessPartnerDetailsError ||
        hasEMandatesError
      }
      errorAlertContent={errorAlertContent}
      isLoading={isLoadingAllAPis}
      breadcrumbs={breadcrumbs}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={pageContentMain}
      maintenanceNotificationsPageSlug="afis"
    />
  );
}
