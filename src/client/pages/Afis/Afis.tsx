import {
  Alert,
  Button,
  Grid,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { entries } from '../../../universal/helpers/utils';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisFactuurFrontend } from './Afis-thema-config';
import styles from './Afis.module.scss';
import { useAfisThemaData } from './useAfisThemaData.hook';

const pageContentTop = (
  <Paragraph>
    Hieronder ziet u een overzicht van uw facturen. U ziet hier niet de facturen
    van belastingen. U kunt deze bij belastingen vinden.
  </Paragraph>
);

export function AfisThemaPagina() {
  const history = useHistory();
  const {
    dependencyErrors,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    isOverviewApiError,
    isOverviewApiLoading,
    listPageTitle,
    routes,
  } = useAfisThemaData();

  const isPartialError = entries(dependencyErrors).some(
    ([, hasError]) => hasError
  );

  const pageContentSecondary = (
    <Grid.Cell span="all">
      <Button
        className="ams-mb--sm"
        variant="secondary"
        onClick={() => history.push(routes.betaalVoorkeuren)}
      >
        Betaalvoorkeuren
      </Button>
      <Alert severity="warning">
        <UnorderedList>
          <UnorderedList.Item>
            De betaalstatus kan 3 werkdagen achterlopen op de doorgevoerde
            wijzigingen.
          </UnorderedList.Item>
          <UnorderedList.Item>
            Betalingsregelingen zijn niet zichtbaar in dit overzicht.
          </UnorderedList.Item>
        </UnorderedList>
      </Alert>
    </Grid.Cell>
  );

  const pageContentErrorAlert = (
    <>
      We kunnen niet alle gegevens tonen.{' '}
      {entries(dependencyErrors)
        .filter(([, hasError]) => hasError)
        .map(([state]) => (
          <React.Fragment key={state}>
            <br />- {listPageTitle[state]} kunnen nu niet getoond worden.
          </React.Fragment>
        ))}
    </>
  );

  const pageContentTables = entries(facturenTableConfig).map(
    ([
      state,
      {
        title,
        subTitle,
        displayProps,
        maxItems,
        listPageLinkLabel,
        listPageRoute,
      },
    ]) => {
      return (
        <ThemaPaginaTable<AfisFactuurFrontend>
          key={state}
          title={title}
          subTitle={subTitle}
          zaken={facturenByState?.[state]?.facturen ?? []}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
          totalItems={facturenByState?.[state]?.count}
          listPageLinkLabel={listPageLinkLabel}
          listPageRoute={listPageRoute}
          className={styles.FacturenTable}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AFIS}
      isError={isOverviewApiError && isThemaPaginaError}
      isPartialError={isPartialError}
      errorAlertContent={pageContentErrorAlert}
      isLoading={isThemaPaginaLoading || isOverviewApiLoading}
      linkListItems={[
        {
          to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
          title: 'Meer over facturen van de gemeente',
        },
        {
          to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN,
          title: 'Belastingen op Mijn Amsterdam',
        },
      ]}
      pageContentTop={pageContentTop}
      pageContentTables={
        <>
          {pageContentSecondary}
          {pageContentTables}
        </>
      }
    />
  );
}
