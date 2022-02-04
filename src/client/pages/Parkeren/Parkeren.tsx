import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
} from '../../components';

export default function Parkeren() {
  return (
    <OverviewPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.PARKEREN}
      </PageHeading>
      <PageContent>
        <p>
          Alle informatie over parkeren in Amsterdam vind u op{' '}
          <a
            href="https://www.amsterdam.nl/parkeren-verkeer/"
            rel="external noopener noreferrer"
          >
            Parkeren en verkeer
          </a>
          . Daar kunt u ook terecht voor informatie over fietskelders, laadpalen
          voor elektrisch auto's en andere vragen die je hebt over parkeren of
          vervoer.
        </p>
        <p>
          Het aanvragen of wijzigen van een parkeervergunning voor bewoners kan
          via{' '}
          <a
            href="https://parkeervergunningen.amsterdam.nl/landing"
            rel="external noopener noreferrer"
          >
            Mijn Parkeren
          </a>
          . U moet wel opnieuw inloggen.
        </p>
        <p>
          Op{' '}
          <a
            href="https://www.amsterdam.nl/parkeren-verkeer/parkeervergunning/"
            rel="external noopener noreferrer"
          >
            Parkeervergunning
          </a>{' '}
          vindt u alles over parkeervergunningen in Amsterdam.
        </p>
        <Linkd
          external={true}
          href="https://www.amsterdam.nl/parkeren-verkeer/"
        >
          Lees hier meer over parkeren
        </Linkd>
        <br />
        <Linkd
          external={true}
          href="https://parkeervergunningen.amsterdam.nl/landing"
        >
          Log in op Mijn Parkeren voor uw parkeervergunnning voor bewoners
        </Linkd>
        <Linkd
          external={true}
          href="https://www.amsterdam.nl/parkeren-verkeer/parkeervergunning/"
        >
          Lees hier meer over alle parkeervergunningen in Amsterdam
          Parkeervergunning
        </Linkd>
      </PageContent>
    </OverviewPage>
  );
}
