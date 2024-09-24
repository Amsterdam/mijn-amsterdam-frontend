import {
  Alert,
  Button,
  Grid,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { generatePath, useHistory } from 'react-router-dom';
import { AfisFactuurState } from '../../../server/services/afis/afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisFactuurFrontend } from './Afis-thema-config';
import styles from './Afis.module.scss';
import { useAfisThemaData } from './useAfisThemaData.hook';

export function AfisThemaPagina() {
  const history = useHistory();
  const {
    facturenByState,
    facturenTableConfig,
    isFacturenError,
    isFacturenLoading,
    isThemaPaginaError,
    isThemaPaginaLoading,
    routes,
    hasFailedFacturenOpenDependency,
    hasFailedFacturenClosedDependency,
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

  const pageContentTables = Object.entries(facturenTableConfig).map(
    ([
      state,
      { title, subTitle, displayProps, maxItems, listPageLinkLabel },
    ]) => {
      return (
        <>
          <ThemaPaginaTable<AfisFactuurFrontend>
            key={state}
            title={title}
            subTitle={subTitle}
            zaken={facturenByState[state as AfisFactuurState] ?? []}
            displayProps={displayProps}
            textNoContent={`U heeft geen ${title.toLowerCase()}`}
            maxItems={maxItems}
            listPageLinkLabel={listPageLinkLabel}
            listPageRoute={generatePath(AppRoutes['AFIS/FACTUREN'], {
              state,
            })}
            className={styles.FacturenTable}
          />
        </>
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AFIS}
      isError={isFacturenError && isThemaPaginaError}
      isPartialError={
        isFacturenError ||
        hasFailedFacturenOpenDependency ||
        hasFailedFacturenClosedDependency
      }
      isLoading={isThemaPaginaLoading || isFacturenLoading}
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
