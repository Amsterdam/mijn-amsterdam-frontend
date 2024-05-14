import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ThemaIcon,
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
        icon={<ThemaIcon />}
      >
        {ChapterTitles.PARKEREN}
      </PageHeading>
      <PageContent>
        <p>
          Alle informatie over parkeren in Amsterdam vindt u op{' '}
          <a
            title="Informatie over parkeren op Amsterdam.nl"
            rel="noopener noreferrer"
            href="https://www.amsterdam.nl/parkeren-verkeer/"
          >
            amsterdam.nl
          </a>
          . Daar kunt u ook terecht voor informatie over fietskelders, laadpalen
          voor elektrische auto's en andere vragen die u hebt over parkeren of
          vervoer. Het aanvragen of wijzigen van een parkeervergunning voor
          bewoners kan via Mijn Parkeren. U moet hier wel opnieuw inloggen.
        </p>
        <Linkd
          external={true}
          href="https://www.amsterdam.nl/parkeren/parkeervergunning/parkeervergunning-bewoners/"
        >
          Lees hier meer over parkeervergunningen
        </Linkd>{' '}
        <br />
        <Linkd external={true} href="https://parkeervergunningen.amsterdam.nl/">
          Log in op Mijn Parkeren
        </Linkd>
        <br />
      </PageContent>
    </OverviewPage>
  );
}
