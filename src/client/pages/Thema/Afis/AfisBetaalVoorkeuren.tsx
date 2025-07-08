import { Grid, Heading, Link, Paragraph } from '@amsterdam/design-system-react';

import { AfisEmandateStub } from './Afis-thema-config.ts';
import styles from './AfisBetaalVoorkeuren.module.scss';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook.tsx';
import { AfisBusinessPartnerDetailsTransformed } from '../../../../server/services/afis/afis-types.ts';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';
import { entries } from '../../../../universal/helpers/utils.ts';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import LoadingContent from '../../../components/LoadingContent/LoadingContent.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed | null;
  labels: Omit<
    DisplayProps<AfisBusinessPartnerDetailsTransformed>,
    'smallscreen'
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
  } = useAfisThemaData();

  const {
    title,
    businesspartnerDetails,
    businessPartnerDetailsLabels,
    eMandates,
    eMandateTableConfig,
    hasBusinessPartnerDetailsError,
    hasEmandatesError,
    hasFailedEmailDependency,
    hasFailedPhoneDependency,
    hasFailedFullNameDependency,
    isLoadingBusinessPartnerDetails,
    isLoadingEmandates,
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

  useHTMLDocumentTitle(routeConfig.detailPage);

  const isLoadingAllAPis =
    isThemaPaginaLoading &&
    isLoadingBusinessPartnerDetails &&
    isLoadingEmandates;

  const eMandateTables =
    FeatureToggle.afisEmandatesActive &&
    entries(eMandateTableConfig).map(
      ([kind, { title, displayProps, filter }]) => {
        return (
          <ThemaPaginaTable<AfisEmandateStub>
            key={kind}
            title={title}
            zaken={eMandates.filter(filter)}
            displayProps={displayProps}
            maxItems={-1}
          />
        );
      }
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
      {!FeatureToggle.afisEmandatesActive && (
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
        startCollapsed={FeatureToggle.afisEmandatesActive}
      />
      {eMandateTables}
    </>
  );

  const errorAlertContent = isThemaPaginaError ? (
    <>Wij kunnen nu niet alle gegevens laten zien.</>
  ) : (
    <>
      {!hasBusinessPartnerDetailsError &&
        (hasFailedEmailDependency ||
          hasFailedPhoneDependency ||
          hasFailedFullNameDependency) && (
          <>
            De volgende gegevens konden niet worden opgehaald:
            {hasFailedFullNameDependency && (
              <>
                <br />- Debiteurnaam
              </>
            )}
            {hasFailedEmailDependency && (
              <>
                <br />- E-mailadres
              </>
            )}
            {hasFailedPhoneDependency && (
              <>
                <br />- Telefoonnummer
              </>
            )}
          </>
        )}
      {hasBusinessPartnerDetailsError && (
        <>
          Wij kunnen nu geen facturatiegegevens laten zien.
          <br />
        </>
      )}
      {hasEmandatesError && (
        <>Wij kunnen nu geen automatische incasso&apos;s laten zien.</>
      )}
    </>
  );

  return (
    <ThemaPagina
      title={title}
      isError={
        isThemaPaginaError ||
        (hasBusinessPartnerDetailsError && hasEmandatesError)
      }
      isPartialError={
        hasFailedFullNameDependency ||
        hasFailedPhoneDependency ||
        hasFailedPhoneDependency ||
        hasBusinessPartnerDetailsError ||
        hasEmandatesError
      }
      errorAlertContent={errorAlertContent}
      isLoading={isLoadingAllAPis}
      breadcrumbs={breadcrumbs}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={pageContentMain}
    />
  );
}
