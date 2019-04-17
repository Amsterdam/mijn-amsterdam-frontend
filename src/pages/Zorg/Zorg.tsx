import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from '../../AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import styles from './Zorg.module.scss';

const DISPLAY_PROPS = {
  dateStart: 'start',
  dateFinish: 'einde',
};

export default () => {
  const {
    WMO: {
      data: { items },
    },
  } = useContext(AppContext);

  const itemsRequested = items.filter(
    item => item.isActual && !item.dateFinish
  );
  const itemsActual = items.filter(item => item.isActual && !!item.dateFinish);
  const itemsPrevious = items.filter(item => !item.isActual);

  return (
    <PageContentMain className={styles.Page}>
      <PageContentMainHeading variant="withIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        Zorg
      </PageContentMainHeading>
      <PageContentMainBody>
        <p>Zorg body</p>
        <DataLinkTable
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsRequested}
          title="Mijn lopende aanvragen"
        />
        <DataLinkTable
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsActual}
          title="Mijn huidige voorziengen"
        />
        <DataLinkTable
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsPrevious}
          title="Mijn eerdere voorziengen"
          className={styles.DataLinkTable__history}
        />
      </PageContentMainBody>
    </PageContentMain>
  );
};
