import { Button, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, useHistory } from 'react-router-dom';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { useAfisThemaData } from './useAfisThemaData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { AfisFactuur } from '../../../server/services/afis/afis-types';
import { ListPageParamKind } from './Afis-thema-config';
import styles from './Afis.module.scss';

export function AfisThemaPagina() {
  const history = useHistory();
  const {
    facturen,
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
        Hieronder kunt u uw facturatiegegevens inzien en een automatische
        incasso instellen per afdeling van de gemeente.
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
    ([kind, { title, displayProps, maxItems }]) => {
      const kindFacturen = (
        facturen as { [K in ListPageParamKind]: AfisFactuur[] }
      )[kind as ListPageParamKind];
      return (
        <ThemaPaginaTable<AfisFactuur>
          key={kind}
          title={title}
          zaken={kindFacturen}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
          listPageRoute={generatePath(AppRoutes['AFIS/FACTUREN'], {
            kind,
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
      pageContentTables={pageContentTables}
    />
  );
}
