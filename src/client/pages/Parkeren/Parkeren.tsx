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
          Alle informatie over parkeren in Amsterdam vindt u op amsterdam.nl.
          Daar kunt u ook terecht voor informatie over fietskelders, laadpalen
          voor elektrische auto's en andere vragen die u hebt over parkeren of
          vervoer. Het aanvragen of wijzigen van een parkeervergunning voor
          bewoners kan via Mijn Parkeren. U moet hier wel opnieuw inloggen.
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
          href="https://www.amsterdam.nl/parkeren-verkeer/parkeervergunning/"
        >
          Lees hier meer over alle parkeervergunningen in Amsterdam
        </Linkd>
      </PageContent>
    </OverviewPage>
  );
}
