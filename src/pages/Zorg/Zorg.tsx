import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { AppContext } from 'AppState';
import DataLinkTable from 'components/DataLinkTable/DataLinkTable';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import styles from './Zorg.module.scss';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';

const DISPLAY_PROPS = {
  dateStart: 'start',
  dateFinish: 'einde',
};

export default () => {
  const {
    WMO: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const itemsRequested = items.filter(
    item => item.isActual && !item.dateFinish
  );
  const itemsActual = items.filter(item => item.isActual && !!item.dateFinish);
  const itemsPrevious = items.filter(item => !item.isActual);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActualItems = !!itemsActual.length;

  return (
    <PageContentMain variant="full" className={styles.Page}>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        Zorg
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {isError && (
          <Alert type="warning">
            Uw gegevens kunnen op dit moment niet worden getoond.
          </Alert>
        )}
        <DataLinkTable
          id="datalinktable-healthcare-requested"
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsRequested}
          title="Mijn lopende aanvragen"
          noItemsMessage="U hebt op dit moment geen lopende aanvragen"
          startCollapsed={false}
          isLoading={isLoading}
        />
        <DataLinkTable
          id="datalinktable-healthcare-granted"
          rowHeight="6rem"
          displayProps={DISPLAY_PROPS}
          items={itemsActual}
          title="Mijn huidige voorziengen"
          noItemsMessage="U hebt nog geen huidige voorzieningen"
          startCollapsed={hasActiveRequests}
          className={styles.DataLinkTableCurrent}
          isLoading={isLoading}
        />
      </PageContentMainBody>
      <div className={styles.HistoricDataLinkTable}>
        <PageContentMainBody variant="boxed">
          <DataLinkTable
            id="datalinktable-healthcare-previous"
            rowHeight="6rem"
            displayProps={DISPLAY_PROPS}
            items={itemsPrevious}
            title="Mijn eerdere voorziengen"
            noItemsMessage="U hebt geen eerdere voorzieningen"
            startCollapsed={hasActiveRequests || hasActualItems}
            isLoading={isLoading}
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
