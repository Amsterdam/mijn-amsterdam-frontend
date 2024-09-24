import { Button, Grid, Paragraph } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';
import { AfisFactuurState } from '../../../server/services/afis/afis-types';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisFactuurFrontend } from './Afis-thema-config';
import styles from './Afis.module.scss';
import { useAfisThemaData } from './useAfisThemaData.hook';
import { hasFailedDependency } from '../../../universal/helpers/api';

export function AfisThemaPagina() {
  const history = useHistory();
  const {
    api,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    routes,
  } = useAfisThemaData();

  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u een overzicht van uw facturen. U ziet hier niet de
      facturen van belastingen. U kunt deze bij belastingen vinden.
    </Paragraph>
  );

  const pageContentSecondary = (
    <Grid.Cell span="all">
      <Button
        variant="secondary"
        onClick={() => history.push(routes.betaalVoorkeuren)}
      >
        Betaalvoorkeuren
      </Button>
    </Grid.Cell>
  );

  const pageContentBottom = (
    <Grid.Cell span="all">
      <Paragraph className={styles.PageContentBottomDisclaimer}>
        Betalingsregelingen worden hier niet getoond.
        <br />
        Gedeeltelijk betaalde facturen kunt u hier niet zien betaal het
        resterende bedrag via bankoverschrijving. Er wordt een herinnering
        verstuurd al uw factuur is vervallen. Bij een vervallen factuur werkt de
        betaal link niet meer.
      </Paragraph>
    </Grid.Cell>
  );

  const pageContentErrorAlert = <>errors!</>;

  const pageContentTables = Object.entries(facturenTableConfig).map(
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
      const facturen = facturenByState[state as AfisFactuurState];
      return (
        <>
          <ThemaPaginaTable<AfisFactuurFrontend>
            key={state}
            title={title}
            subTitle={subTitle}
            zaken={facturen?.facturen ?? []}
            displayProps={displayProps}
            textNoContent={`U heeft geen ${title.toLowerCase()}`}
            maxItems={maxItems}
            totalItems={facturen?.count}
            listPageLinkLabel={listPageLinkLabel}
            listPageRoute={listPageRoute}
            className={styles.FacturenTable}
          />
        </>
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AFIS}
      isError={api.isError && isThemaPaginaError}
      isPartialError={
        hasFailedDependency(api.data, 'open') ||
        hasFailedDependency(api.data, 'afgehandeld') ||
        hasFailedDependency(api.data, 'overgedragen')
      }
      errorAlertContent={pageContentErrorAlert}
      isLoading={isThemaPaginaLoading || api.isLoading}
      linkListItems={[
        {
          to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
          title: 'Meer over facturen van de gemeente',
        },
      ]}
      pageContentTop={pageContentTop}
      pageContentTables={
        <>
          {pageContentSecondary}
          {pageContentTables}
          {pageContentBottom}
        </>
      }
    />
  );
}
