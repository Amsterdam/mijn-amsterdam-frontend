import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppStateGetter, useAppStateReady } from '../../hooks';
import { PageContent, PageHeading, TextPage } from '../../components';
import LoadingContent from '../../components/LoadingContent/LoadingContent';

export default function ZaakStatus() {
  const location = useLocation();
  const history = useHistory();
  const isAppStateReady = useAppStateReady();
  const { VERGUNNINGEN } = useAppStateGetter();

  const queryParams = queryString.parse(location.search);
  const { thema, id } = queryParams;

  const payment = queryParams['payment'] ? queryParams['payment'] : null;

  useEffect(() => {
    if (VERGUNNINGEN.content?.length) {
      const foundVergunning = VERGUNNINGEN.content.find(
        (vergunning) => vergunning.identifier === id
      );
      if (foundVergunning) {
        history.push(foundVergunning.link.to);
      }
    }
  }, [isAppStateReady]);

  return (
    <div>
      <TextPage>
        {!isAppStateReady ? (
          <>
            {' '}
            <PageHeading>Ophalen van thema {thema}...</PageHeading>
            <PageContent>
              <p>
                <LoadingContent
                  barConfig={[
                    ['auto', '2rem', '1rem'],
                    ['auto', '2rem', '0'],
                  ]}
                />
              </p>
            </PageContent>
          </>
        ) : (
          <>
            <PageHeading>
              De pagina voor thema {thema} kan niet weergeven worden
            </PageHeading>
            <PageContent id="skip-to-id-AppContent">
              <p>
                Het is momenteel niet mogelijk om de detailpagina via deze link
                te openen.
                {payment
                  ? 'Mogelijk moet U wachten op de voltooiing van een betaling.'
                  : ''}
              </p>
            </PageContent>
          </>
        )}
      </TextPage>
    </div>
  );
}
