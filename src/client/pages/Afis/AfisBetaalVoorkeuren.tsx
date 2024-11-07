import { Grid, Link, Paragraph } from '@amsterdam/design-system-react';

import { AfisEmandateStub } from './Afis-thema-config';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
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
            content:
              key === 'email' || key === 'phone' ? (
                <Link href={`${key === 'email' ? 'mailto' : 'tel'}:${value}`}>
                  {value}
                </Link>
              ) : (
                value
              ),
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
              <Datalist rows={rows} rowVariant="horizontal" />
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
    hasEmandatesError,
    hasFailedEmailDependency,
    hasFailedPhoneDependency,
    hasFailedFullNameDependency,
    isLoadingBusinessPartnerDetails,
    isLoadingEmandates,
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

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
            textNoContent={`U heeft geen ${title.toLowerCase()}`}
            maxItems={-1}
          />
        );
      }
    );

  const mailBody = `Debiteurnaam: ${businesspartnerDetails?.fullName ?? '-'}%0D%0ADebiteurnummer: ${businesspartnerDetails?.businessPartnerId ?? '-'}`;

  const pageContentTop = (
    <>
      <Paragraph>
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
    </>
  );

  const pageContentMain = (
    <>
      <AfisBusinessPartnerDetails
        businesspartner={businesspartnerDetails}
        labels={businessPartnerDetailsLabels}
        isLoading={isLoadingBusinessPartnerDetails || isThemaPaginaLoading}
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
          Wij kunnen nu geen betaalgegevens laten zien.
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
      title="Betaalvoorkeuren"
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
      backLink={{ to: AppRoutes.AFIS, title: ThemaTitles.AFIS }}
      linkListItems={[
        {
          to: 'https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa',
          title: 'Meer over betalen aan de gemeente',
        },
      ]}
      pageContentTop={pageContentTop}
      pageContentMain={pageContentMain}
    />
  );
}
