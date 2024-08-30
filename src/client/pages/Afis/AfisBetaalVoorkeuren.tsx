import {
  Grid,
  Heading,
  Link,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerKnownResponse,
} from '../../../server/services/afis/afis-types';
import { Datalist } from '../../components/Datalist/Datalist';
import { DisplayProps } from '../../components/Table/TableV2';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import styles from './AfisBetaalVoorkeuren.module.scss';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisEmandateStub } from './Afis-thema-config';

export function AfisBetaalVoorkeuren() {
  const { businessPartnerIdEncrypted } = useAfisThemaData();

  return businessPartnerIdEncrypted ? (
    <AfisBetaalVoorkeurenContent
      businessPartnerIdEncrypted={businessPartnerIdEncrypted}
    />
  ) : (
    'No can show?'
  );
}

type AfisBusinessPartnerProps = {
  businesspartner: AfisBusinessPartnerDetailsTransformed;
  labels: DisplayProps<AfisBusinessPartnerDetailsTransformed>;
};

function AfisBusinessPartnerDetails({
  businesspartner,
  labels,
}: AfisBusinessPartnerProps) {
  const rows = Object.entries(labels).map(([key, label]) => {
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
  });

  return (
    <>
      <Grid.Cell span="all">
        <Heading level={3} size="level-2">
          Betaalgegevens
        </Heading>
      </Grid.Cell>
      <Grid.Cell span={6}>
        <Datalist rows={rows} rowVariant="horizontal" />
      </Grid.Cell>
      <Grid.Cell span={6}>
        <LinkList>
          <LinkList.Link rel="noreferrer" href={'#'}>
            Wijzigingen
          </LinkList.Link>
        </LinkList>
      </Grid.Cell>
    </>
  );
}

function AfisBetaalVoorkeurenContent({
  businessPartnerIdEncrypted,
}: {
  businessPartnerIdEncrypted: AfisBusinessPartnerKnownResponse['businessPartnerIdEncrypted'];
}) {
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
  } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

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
      {!!businesspartnerDetails && (
        <AfisBusinessPartnerDetails
          businesspartner={businesspartnerDetails}
          labels={businessPartnerDetailsLabels}
        />
      )}
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
        <>Wij kunnen nu geen betaalgegevens laten zien</>
      )}
    </>
  );

  return (
    <ThemaPagina
      title="Betaalvoorkeuren"
      isError={hasBusinessPartnerDetailsError && hasEmandatesError}
      isPartialError={
        hasFailedEmailDependency ||
        hasFailedPhoneDependency ||
        hasBusinessPartnerDetailsError
      }
      errorAlertContent={errorAlertContent}
      isLoading={isLoadingBusinessPartnerDetails}
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
