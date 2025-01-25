import { LinkList, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import styles from './Klachten.module.scss';
import type { Klacht } from '../../../server/services/klachten/types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  ErrorAlert,
  Pagination,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS_KLACHTEN = {
  idAsLink: 'Nummer van uw klacht',
  ontvangstDatum: 'Ontvangen op',
  onderwerp: 'Onderwerp',
};

export const KLACHTEN_PAGE_SIZE = 20;

export default function Klachten() {
  const { KLACHTEN } = useAppStateGetter();
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

  const totalCount = KLACHTEN.content?.aantal || 0;

  const klachtenPaginated = (() => {
    const startIndex = currentPage - 1;
    const start = startIndex * KLACHTEN_PAGE_SIZE;
    const end = start + KLACHTEN_PAGE_SIZE;
    return KLACHTEN.content?.klachten.slice(start, end) || [];
  })();

  const items = klachtenPaginated.map((k) => ({
    ...k,
    idAsLink: k.id,
    ontvangstDatum: defaultDateFormat(k.ontvangstDatum),
  }));

  const klachten = items
    ? (addTitleLinkComponent(items, 'idAsLink') as Klacht[])
    : [];

  return (
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {ThemaTitles.KLACHTEN}
        </PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb--sm">
            Hier ziet u een overzicht van de klachten die U heeft ingediend bij
            gemeente Amsterdam.
          </Paragraph>
          <LinkList className="ams-mb--xl">
            <LinkList.Link href="https://www.amsterdam.nl/veelgevraagd/klacht-indienen-over-de-gemeente-42fd5#case_%7B9846AD0A-E989-4B5D-A1D3-6D79E34DF1BE%7D">
              Meer informatie over de afhandeling van uw klacht
            </LinkList.Link>
          </LinkList>
        </PageContentCell>
        {isError(KLACHTEN) && (
          <PageContentCell>
            <ErrorAlert>
              We kunnen op dit moment geen klachten tonen.
            </ErrorAlert>
          </PageContentCell>
        )}
      </PageContentV2>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Ingediende klachten"
        noItemsMessage="U heeft nog geen klachten ingediend."
        startCollapsed={false}
        hasItems={!!klachten?.length}
        isLoading={isLoading(KLACHTEN)}
        className={styles.SectionCollapsibleFirst}
      >
        <Table items={klachten} displayProps={DISPLAY_PROPS_KLACHTEN} />
        {totalCount > KLACHTEN_PAGE_SIZE && (
          <Pagination
            className={styles.Pagination}
            totalCount={KLACHTEN.content?.aantal || 0}
            pageSize={KLACHTEN_PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(
                generatePath(AppRoutes.KLACHTEN, {
                  page,
                })
              );
            }}
          />
        )}
      </SectionCollapsible>
    </OverviewPageV2>
  );
}
