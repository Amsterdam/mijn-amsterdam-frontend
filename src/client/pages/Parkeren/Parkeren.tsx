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
          Het aanvragen of wijzigen van een parkeervergunning kan in{' '}
          <a
            href="https://parkeervergunningen.amsterdam.nl/landing"
            rel="external noopener noreferrer"
          >
            Mijn Parkeren
          </a>{' '}
          U moet wel opnieuw inloggen.
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
          Log voor uw vergunning in op Mijn Parkeren
        </Linkd>
      </PageContent>
    </OverviewPage>
  );
}
