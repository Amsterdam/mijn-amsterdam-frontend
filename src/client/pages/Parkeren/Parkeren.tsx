import { Alert, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { Vergunning } from '../../../server/services';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Parkeren() {
  const {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    isLoading,
    isError,
    parkerenUrlSSO,
    linkListItems,
  } = useParkerenData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VergunningFrontendV2 | Vergunning>
          key={kind}
          title={title}
          zaken={parkeerVergunningenFromThemaVergunningen
            .filter(filter)
            .sort(sort)}
          listPageRoute={generatePath(AppRoutes['PARKEREN/LIST'], {
            kind,
          })}
          displayProps={displayProps}
        />
      );
    }
  );

  const pageContentTop = determinePageContentTop(
    !!parkeerVergunningenFromThemaVergunningen.length,
    parkerenUrlSSO
  );

  return (
    <ThemaPagina
      title={ThemaTitles.PARKEREN}
      isError={isError}
      isPartialError={false}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentMain={tables}
    />
  );
}

function determinePageContentTop(
  hasMijnParkerenVergunningen: boolean,
  parkerenUrlSSO: string
) {
  if (hasMijnParkerenVergunningen) {
    return (
      <>
        <Alert severity="info" heading="Parkeervergunning voor bewoners">
          <Paragraph>
            Het inzien, aanvragen of wijzigen van een parkeervergunning voor
            bewoners kan via Mijn Parkeren.
          </Paragraph>
          <Paragraph>
            <MaButtonLink href={parkerenUrlSSO}>
              Ga naar Mijn Parkeren&nbsp;
              <Icon svg={ExternalLinkIcon} size="level-5" />
            </MaButtonLink>
          </Paragraph>
        </Alert>
      </>
    );
  }
  return (
    <Paragraph>Hieronder ziet u een overzicht van uw vergunningen.</Paragraph>
  );
}

export const forTesting = { determinePageContentTop };
