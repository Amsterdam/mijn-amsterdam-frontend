import { Grid, Heading, Link, Paragraph } from '@amsterdam/design-system-react';

import { AfisEmandateStub } from './Afis-thema-config';
import styles from './AfisBetaalVoorkeuren.module.scss';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandateFrontend,
} from '../../../server/services/afis/afis-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { entries } from '../../../universal/helpers/utils';
import { LoadingContent } from '../../components';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import { Datalist } from '../../components/Datalist/Datalist';
import { DisplayProps } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed | null;
  labels: DisplayProps<AfisBusinessPartnerDetailsTransformed>;
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
    <Grid.Cell span="all">
      <CollapsiblePanel title="Betaalgegevens" startCollapsed={startCollapsed}>
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
    </Grid.Cell>
  );
}

export function AfisBetaalVoorkeuren() {
  const {
    businessPartnerIdEncrypted,
    isThemaPaginaError,
    isThemaPaginaLoading,
  } = useAfisThemaData();

  const {
    businesspartnerDetails,
    businessPartnerDetailsLabels,
    eMandates,
    eMandateTableConfig,
    hasBusinessPartnerDetailsError,
    hasEMandatesError,
    hasFailedEmailDependency,
    hasFailedPhoneDependency,
    hasFailedFullNameDependency,
    isLoadingBusinessPartnerDetails,
    isLoadingEMandates,
    linkListItems,
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

  const isLoadingAllAPis =
    isThemaPaginaLoading &&
    isLoadingBusinessPartnerDetails &&
    isLoadingEMandates;

  const eMandateTables = FeatureToggle.afisEMandatesActive && (
    <ThemaPaginaTable<AfisEMandateFrontend>
      className={eMandateTableConfig.className}
      displayProps={eMandateTableConfig.displayProps}
      maxItems={-1}
      title={eMandateTableConfig.title}
      zaken={eMandates}
    />
  );

  const mailBody = `Debiteurnaam: ${businesspartnerDetails?.fullName ?? '-'}%0D%0ADebiteurnummer: ${businesspartnerDetails?.businessPartnerId ?? '-'}`;

  const pageContentTop = (
    <>
      <Paragraph className="ams-mb--sm">
        Hieronder kunt u uw betaalgegevens bekijken en een automatische incasso
        instellen per afdeling van de gemeente. Wil u uw betaalgegevens
        wijzigen, stuur dan een email naar{' '}
        <Link
          href={`mailto:debiteurenadministratie@amsterdam.nl?subject=Betaalgegevens wijzigen&body=${mailBody}`}
        >
          debiteurenadministratie@amsterdam.nl
        </Link>
        .
      </Paragraph>
      <Heading level={3} size="level-5">
        Via automatische incasso betalen
      </Heading>
      <Paragraph className="ams-mb--sm">
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
      <Paragraph className="ams-mb--sm">
        Gemeente Amsterdam
        <br />
        Debiteurenadministratie
        <br />
        Antwoordnummer 47389
        <br />
        1070 WC
        <br />
        Amsterdam
      </Paragraph>
      <Paragraph>Een postzegel is niet nodig.</Paragraph>
    </>
  );

  const pageContentMain = (
    <>
      <AfisBusinessPartnerDetails
        businesspartner={businesspartnerDetails}
        labels={businessPartnerDetailsLabels}
        isLoading={isLoadingBusinessPartnerDetails || isThemaPaginaLoading}
        startCollapsed={FeatureToggle.afisEMandatesActive}
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
          Wij kunnen nu geen betaalgegevens laten zien.
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
      title="Betaalvoorkeuren"
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
      backLink={{ to: AppRoutes.AFIS, title: ThemaTitles.AFIS }}
      linkListItems={linkListItems}
      pageContentTop={pageContentTop}
      pageContentMain={pageContentMain}
    />
  );
}
