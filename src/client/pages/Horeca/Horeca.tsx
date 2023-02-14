import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isLoading } from '../../../universal/helpers';
import {
  ChapterIcon,
  OverviewPage,
  PageContent,
  PageHeading,
  Pagination,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks';

const DISPLAY_PROPS_HORECA = {
  idAsLink: 'Nummer van uw klacht',
  ontvangstDatum: 'Ontvangen op',
  onderwerp: 'Onderwerp',
};

export const HORECA_PAGE_SIZE = 20;

export default function Horeca() {
  const { HORECA } = useAppStateGetter();

  const history = useHistory();
  const { page = '1' } = useParams<{
    page?: string;
  }>();

  const currentPage = (() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  })();

  const totalCount = HORECA.content?.vergunningen.length || 0;
  const vergunningen = HORECA.content?.vergunningen || [];

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
        <p>
          Hier ziet u een overzicht van uw aanvragen voor Horeca vergunningen en
          ontheffingen.
        </p>
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Horeca vergunningen"
        noItemsMessage="U heeft nog geen vergunningen."
        startCollapsed={false}
        hasItems={!!vergunningen?.length}
        isLoading={isLoading(HORECA)}
        track={{
          category: 'Horecavergunningen overzicht',
          name: 'Datatabel',
        }}
        className=""
      >
        <Table items={vergunningen} displayProps={DISPLAY_PROPS_HORECA} />
        {totalCount > HORECA_PAGE_SIZE && (
          <Pagination
            className=""
            totalCount={vergunningen?.length || 0}
            pageSize={HORECA_PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(
                generatePath(AppRoutes.HORECA, {
                  page,
                })
              );
            }}
          />
        )}
      </SectionCollapsible>
    </OverviewPage>
  );
}
