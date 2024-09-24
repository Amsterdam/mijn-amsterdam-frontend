import {
  Grid,
  Link,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LoadingContent } from '../../components';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import { Datalist } from '../../components/Datalist/Datalist';
import { DisplayProps } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisEmandateStub } from './Afis-thema-config';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook';

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed | null;
  labels: DisplayProps<AfisBusinessPartnerDetailsTransformed>;
  isLoading: boolean;
};

function AfisBusinessPartnerDetails({
  businesspartner,
  labels,
  isLoading,
}: AfisBusinessPartnerProps) {
  const rows = !!businesspartner
    ? Object.entries(labels).map(([key, label]) => {
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
      <CollapsiblePanel title="Betaalgegevens">
        {isLoading && <LoadingContent />}
        {!isLoading && !!rows.length && (
          <Grid>
            <Grid.Cell span={6}>
              <Datalist rows={rows} rowVariant="horizontal" />
            </Grid.Cell>
            <Grid.Cell start={7} span={3}>
              <LinkList>
                <LinkList.Link rel="noreferrer" href="#">
                  Wijzigingen
                </LinkList.Link>
              </LinkList>
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
    isThemaPaginaLoading,
    isThemaPaginaError,
  } = useAfisThemaData();
  const {
    businesspartnerDetails,
    businessPartnerDetailsLabels,
    hasBusinessPartnerDetailsError,
    hasEmandatesError,
    hasFailedEmailDependency,
    hasFailedPhoneDependency,
    isLoadingBusinessPartnerDetails,
    eMandateTableConfig,
    eMandates,
    isLoadingEmandates,
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

  const isLoadingAllAPis =
    isThemaPaginaLoading &&
    isLoadingBusinessPartnerDetails &&
    isLoadingEmandates;

  const eMandateTables = Object.entries(eMandateTableConfig).map(
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

  const pageContentTop = (
    <>
      <Paragraph>
        Hier kunt u uw betaal gegevens inzien en automatische incasso gegevens
        instellen.
      </Paragraph>
    </>
  );

  const pageContentTables = (
    <>
      <AfisBusinessPartnerDetails
        businesspartner={businesspartnerDetails}
        labels={businessPartnerDetailsLabels}
        isLoading={isLoadingBusinessPartnerDetails || isThemaPaginaLoading}
      />
      {eMandateTables}
    </>
  );

  const errorAlertContent = (
    <>
      {!hasBusinessPartnerDetailsError &&
        (hasFailedEmailDependency || hasFailedPhoneDependency) && (
          <>
            De volgende gegevens konden niet worden opgehaald:
            {hasFailedEmailDependency && (
              <>
                <br />- Email
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
        <>Wij kunnen nu geen automatische incasso's laten zien.</>
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
        hasFailedEmailDependency ||
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
      pageContentTables={pageContentTables}
    />
  );
}
