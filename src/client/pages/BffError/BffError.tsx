import { IS_PRODUCTION } from '../../../universal/config/env';
import { PageContent, PageHeading, TextPage } from '../../components';
import { MaRouterLink } from '../../components/MaLink/MaLink';

export default function Bff500Error() {
  const queryParams = new URL(location.href).searchParams;
  let stack = '';
  try {
    stack = !IS_PRODUCTION && JSON.parse(queryParams.get('stack') as string);
  } catch (error) {
    stack = queryParams.get('stack') as string;
    console.error(error);
  }

  return (
    <TextPage>
      <PageHeading>500 - Api Error</PageHeading>
      <PageContent id="skip-to-id-AppContent">
        <p>
          Er is een fout opgetreden in de communicatie met de server.{' '}
          <MaRouterLink variant="inline" href="/">
            Ga verder naar home.
          </MaRouterLink>
          {!IS_PRODUCTION && (
            <pre style={{ whiteSpace: 'break-spaces' }}>{stack}</pre>
          )}
        </p>
      </PageContent>
    </TextPage>
  );
}
