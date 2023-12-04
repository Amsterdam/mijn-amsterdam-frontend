import { IS_PRODUCTION } from '../../../universal/config';
import {
  LinkdInline,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';

export default function Bff500Error() {
  const queryParams = new URL(location.href).searchParams;
  const stack =
    !IS_PRODUCTION && JSON.parse(queryParams.get('stack') as string);

  return (
    <TextPage>
      <PageHeading>500 - Api Error</PageHeading>
      <PageContent id="skip-to-id-AppContent">
        <p>
          Er is een fout opgetreden in de communicatie met de server.{' '}
          <LinkdInline href="/">Ga verder naar home.</LinkdInline>
          {!IS_PRODUCTION ? <pre>{stack}</pre> : ''}
        </p>
      </PageContent>
    </TextPage>
  );
}
