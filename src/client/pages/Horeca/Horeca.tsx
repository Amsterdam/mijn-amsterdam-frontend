import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  Alert,
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
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequest: 'Aangevraagd',
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

  const totalCount = HORECA.content?.length || 0;
  const vergunningen =
    HORECA.content?.map((v) => {
      return {
        ...v,
        dateRequest: defaultDateFormat(v.dateRequest),
      };
    }) || [];

  const items = addTitleLinkComponent(vergunningen, 'identifier');

  return (
    <OverviewPage className="">
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(HORECA)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.HORECA}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van uw aanvragen voor Horeca vergunningen en
          ontheffingen.
        </p>
        {isError(HORECA) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen vergunningen tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Horeca vergunningen"
        noItemsMessage="U heeft nog geen horeca vergunningen."
        startCollapsed={false}
        hasItems={!!items?.length}
        isLoading={isLoading(HORECA)}
        track={{
          category: 'Horecavergunningen overzicht',
          name: 'Datatabel',
        }}
        className=""
      >
        <Table
          items={items}
          displayProps={DISPLAY_PROPS_HORECA}
          titleKey="identifier"
        />
        {totalCount > HORECA_PAGE_SIZE && (
          <Pagination
            className=""
            totalCount={items?.length || 0}
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
