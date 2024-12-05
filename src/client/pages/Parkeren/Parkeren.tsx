import { Alert, Button, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import { generatePath } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { Vergunning } from '../../../server/services';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LoadingContent } from '../../components';
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
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VergunningFrontendV2 | Vergunning>
          key={kind}
          title={title}
          zaken={parkeervergunningen.filter(filter).sort(sort)}
          listPageRoute={generatePath(AppRoutes['PARKEREN/LIST'], {
            kind,
          })}
          displayProps={displayProps}
        />
      );
    }
  );

  const pageContentTop = (
    <>
      <Alert severity="info" heading="Parkeervergunning voor bewoners">
        <Paragraph>
          Het inzien, aanvragen of wijzigen van een parkeervergunning voor
          bewoners kan via Mijn Parkeren.
        </Paragraph>
        <Paragraph>
          {isLoadingParkerenUrl && (
            <LoadingContent barConfig={[['210px', '40px', '0']]} />
          )}
          {!isLoadingParkerenUrl && parkerenUrlSSO && (
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = parkerenUrlSSO;
              }}
            >
              Log in op Mijn Parkeren
              <Icon svg={ExternalLinkIcon} size="level-5" />
            </Button>
          )}
        </Paragraph>
      </Alert>
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
