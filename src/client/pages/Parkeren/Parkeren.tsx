import { Button, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { Vergunning } from '../../../server/services';
import { AppRoutes } from '../../../universal/config/routes';
import { LoadingContent } from '../../components';
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
                vergunning: Vergunning
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
      <Paragraph className="ams-mb--sm">
        Alle informatie over parkeren in Amsterdam vindt u op . Daar kunt u ook
        terecht voor informatie over fietskelders, laadpalen voor elektrische
        auto&apos;s en andere vragen die U heeft over parkeren of vervoer. Het
        aanvragen of wijzigen van een parkeervergunning voor bewoners kan via
        Mijn Parkeren. U moet hier wel opnieuw inloggen.
      </Paragraph>
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
