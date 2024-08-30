import { Button, Paragraph } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { AfisFactuurStub } from './Afis-thema-config';
import { useAfisThemaData } from './useAfisThemaData.hook';

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
    ([kind, { title, displayProps, filter }]) => {
      return (
        <ThemaPaginaTable<AfisFactuurStub>
          key={kind}
          title={title}
          zaken={facturen.filter(filter)}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={-1}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AFIS}
      isError={isFacturenError && isThemaPaginaError}
      isPartialError={isFacturenError}
      isLoading={isThemaPaginaLoading || isFacturenLoading}
      linkListItems={[
        {
          // TODO: Deze pagina moet nog gemaakt worden
          to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
          title: 'Meer over facturen van de gemeente',
        },
      ]}
      pageContentTop={pageContentTop}
      pageContentTables={pageContentTables}
    />
  );
}
