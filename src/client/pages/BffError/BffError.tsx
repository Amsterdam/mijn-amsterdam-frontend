import {
  LinkdInline,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';

export default function Bff500Error() {
  return (
    <TextPage>
      <PageHeading>500 - Api Error</PageHeading>
      <PageContent id="skip-to-id-AppContent">
        <p>
          Er is een fout opgetreden in de communicatie met de server.{' '}
          <LinkdInline href="/">Ga verder naar home.</LinkdInline>
        </p>
      </PageContent>
    </TextPage>
  );
}
