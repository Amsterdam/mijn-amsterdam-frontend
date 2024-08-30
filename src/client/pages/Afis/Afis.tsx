import { Button, Paragraph } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { useAfisThemaData } from './useAfisThemaData.hook';

export function AfisThemaPagina() {
  const history = useHistory();
  const {
    routes,
    isThemaPaginaError,
    isThemaPaginaLoading,
    isThemaPaginaPartialError,
    facturenTableConfig,
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

  return (
    <ThemaPagina
      title="AFIS"
      isError={isThemaPaginaError}
      isPartialError={isThemaPaginaPartialError}
      isLoading={isThemaPaginaLoading}
      linkListItems={
        [
          // {
          //   to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
          //   title: 'Meer over facturen van de gemeente',
          // },
          // Deze pagina moet nog gemaakt worden
        ]
      }
      pageContentTop={pageContentTop}
      pageContentTables={null}
    />
  );
}
