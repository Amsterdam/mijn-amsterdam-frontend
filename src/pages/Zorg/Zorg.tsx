import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
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

  const hasActiveRequests = !!itemsRequested.length;
  const hasActualItems = !!itemsActual.length;
  const hasPreviousItems = !!itemsPrevious.length;

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        Zorg
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {/* <p>Zorg body</p> */}
        {hasActiveRequests && (
          <DataLinkTable
            id="datalinktable-healthcare-requested"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsRequested}
            title="Mijn lopende aanvragen"
            startCollapsed={false}
          />
        )}
        {hasActualItems && (
          <DataLinkTable
            id="datalinktable-healthcare-granted"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsActual}
            title="Mijn huidige voorziengen"
            startCollapsed={hasActiveRequests}
            className={styles.DataLinkTableCurrent}
          />
        )}
      </PageContentMainBody>
      {hasPreviousItems && (
        <div className={styles.HistoricDataLinkTable}>
          <PageContentMainBody variant="boxed">
            <DataLinkTable
              id="datalinktable-healthcare-previous"
              rowHeight="6rem"
              displayProps={DISPLAY_PROPS}
              items={itemsPrevious}
              title="Mijn eerdere voorziengen"
              startCollapsed={hasActiveRequests || hasActualItems}
            />
          </PageContentMainBody>
        </div>
      )}
    </PageContentMain>
  );
};
