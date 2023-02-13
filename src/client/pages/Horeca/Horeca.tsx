import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ChapterIcon,
  OverviewPage,
  PageContent,
  PageHeading,
} from '../../components';

export default function Horeca() {
  return (
    <OverviewPage className="">
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.HORECA}
      </PageHeading>
      <PageContent>
        Hier ziet u een overzicht van uw aanvragen voor Horeca vergunningen en
        ontheffingen.
      </PageContent>
    </OverviewPage>
  );
}
