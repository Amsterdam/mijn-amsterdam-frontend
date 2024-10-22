import { Button, Icon } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { Vergunning } from '../../../server/services';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ErrorAlert, LoadingContent } from '../../components';
import { MaLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export default function Parkeren() {
  const {
    tableConfig,
    parkeervergunningen,
    isLoading,
    isError,
    parkerenUrlSSO,
    isLoadingParkerenUrl,
  } = useParkerenData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      {
        title,
        displayProps,
        filter: vergunningenListFilter,
        sort: vergunningenListSort,
      },
    ]) => {
      return (
        <ThemaPaginaTable<Vergunning>
          key={kind}
          title={title}
          zaken={parkeervergunningen
            .filter(
              vergunningenListFilter as unknown as (
                vergunning: VergunningFrontendV2 | Vergunning
              ) => boolean
            )
            .sort(vergunningenListSort)}
          listPageRoute={generatePath(AppRoutes['PARKEREN/LIST'], {
            kind,
          })}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
        />
      );
    }
  );

  const pageContentTop = (
    <>
      <ErrorAlert severity="info" title="Let op">
        Het inzien, aanvragen of wijzigen van een parkeervergunning voor
        bewoners kan via Mijn Parkeren.
        {isLoadingParkerenUrl && (
          <LoadingContent barConfig={[['210px', '40px', '0']]} />
        )}
        {!isLoadingParkerenUrl && parkerenUrlSSO && (
          <MaLink href={parkerenUrlSSO}>
            <Button>
              Log in op Mijn Parkeren
              <Icon svg={ExternalLinkIcon} size={'level-5'} />
            </Button>
          </MaLink>
        )}
      </ErrorAlert>
    </>
  );

  return (
    <ThemaPagina
      title={ThemaTitles.PARKEREN}
      isError={isError}
      isPartialError={false}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      linkListItems={[
        {
          to: 'https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/',
          title: 'Meer over parkeervergunningen',
        },
      ]}
      pageContentMain={tables}
    />
  );
}
