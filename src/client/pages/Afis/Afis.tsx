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
    <>
      <Paragraph className="ams-mb--sm">
        Hieronder ziet u een overzicht van uw facturen. U ziet hier niet de
        facturen van belastingen. U kunt deze bij belastingen vinden.
      </Paragraph>
      <Button
        variant="secondary"
        onClick={() => history.push(routes.betaalVoorkeuren)}
      >
        Betaalvoorkeuren
      </Button>
    </>
  );

  const pageContentTables = Object.entries(facturenTableConfig).map(
    ([state, { title, displayProps, maxItems }]) => {
      return (
        <ThemaPaginaTable<AfisFactuurFrontend>
          key={state}
          title={title}
          zaken={facturenByState[state as AfisFactuurState] ?? []}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
          listPageRoute={generatePath(AppRoutes['AFIS/FACTUREN'], {
            state,
          })}
          className={styles.FacturenTable}
        />
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
          <Grid.Cell span="all">
            <Alert title="Let op!">
              <UnorderedList>
                <UnorderedList.Item>
                  De betaalstatus kan 3 werkdagen achterlopen op de doorgevoerde
                  wijzigingen.
                </UnorderedList.Item>
                <UnorderedList.Item>
                  Facturen waarvoor een betalingsregeling is getroffen, worden
                  niet getoond.
                </UnorderedList.Item>
              </UnorderedList>
            </Alert>
          </Grid.Cell>
          {pageContentTables}
        </>
      }
    />
  );
}
