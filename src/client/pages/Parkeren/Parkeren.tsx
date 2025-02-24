import { Alert, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Parkeren() {
  const {
    tableConfig,
    parkeerVergunningenFromThemaVergunningen,
    hasMijnParkerenVergunningen,
    isLoading,
    isError,
    parkerenUrlSSO,
    linkListItems,
  } = useParkerenData();

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort, className }]) => {
      return (
        <ThemaPaginaTable<VergunningFrontendV2>
          key={kind}
          title={title}
          zaken={parkeerVergunningenFromThemaVergunningen
            .filter(filter)
            .sort(sort)}
          className={className}
          listPageRoute={generatePath(AppRoutes['PARKEREN/LIST'], {
            kind,
          })}
          displayProps={displayProps}
        />
      );
    }
  );

  const pageContentTop = determinePageContentTop(
    hasMijnParkerenVergunningen,
    parkerenUrlSSO
  );

  return (
    <ThemaPagina
      title={ThemaTitles.PARKEREN}
      isError={isError}
      isPartialError={false}
      isLoading={!!isLoading}
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
    const profileType = useProfileTypeValue();

    const profileTypeLabel =
      profileType === 'commercial' ? 'bedrijven' : 'bewoners';

    return (
      <>
        <Alert
          severity="info"
          heading={`Parkeervergunning voor ${profileTypeLabel}`}
        >
          <Paragraph>
            Het inzien, aanvragen of wijzigen van een parkeervergunning voor{' '}
            {profileTypeLabel} kan via Mijn Parkeren.
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
