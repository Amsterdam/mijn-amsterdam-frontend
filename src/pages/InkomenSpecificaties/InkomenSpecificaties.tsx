import React from 'react';
import { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './InkomenSpecificaties.module.scss';
import { OverviewPage } from '../../components/Page/Page';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';

export default () => {
  const items: any[] = [];
  const isLoading = false;
  return (
    <OverviewPage className={styles.InkomenSpecificaties}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        Bijstandsuitkering
      </PageHeading>
      <DataLinkTable
        id="datalinktable-income-specifications"
        items={items}
        // title="Mijn lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoading}
        track={{
          category: 'Werk en inkomen / Inkomen specificaties',
          name: 'Datatabel',
        }}
        noItemsMessage="Er zijn op dit moment nog geen inkomenspecificaties beschikbaar."
      />
    </OverviewPage>
  );
};
