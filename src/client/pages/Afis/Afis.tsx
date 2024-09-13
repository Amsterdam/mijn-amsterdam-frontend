import ThemaPagina from '../ThemaPagina/ThemaPagina';
import { Button, Paragraph } from '@amsterdam/design-system-react';
import { AppRoutes } from '../../../universal/config/routes';
import { useHistory } from 'react-router-dom';

export default function Afis() {
  const history = useHistory();

  const pageContentTop = (
    <>
      <Paragraph className="ams-mb--sm">
        Hieronder kunt u uw facturatiegegevens inzien en een automatische
        incasso instellen per afdeling van de gemeente.
      </Paragraph>
      <Button
        variant="secondary"
        onClick={() => history.push(AppRoutes.AFIS_BETAALVOORKEUREN)}
      >
        Betaalvoorkeuren
      </Button>
    </>
  );

  return (
    <ThemaPagina
      title="AFIS"
      isError={false}
      isPartialError={false}
      isLoading={false}
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
