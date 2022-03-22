import { ToeristischeVerhuur } from '../../../server/services';
import { SectionCollapsible, Table } from '../../components';
import styles from './ToeristischeVerhuurDetail.module.scss';

const DISPLAY_PROPS_VERHUUR = {
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  dateRequest: 'Ontvangen op',
  duration: 'Aantal nachten',
};

const VakantieVerhuurList = ({
  plannedVerhuur,
  cancelledVerhuur,
  previousVerhuur,
}: {
  plannedVerhuur: ToeristischeVerhuur[];
  cancelledVerhuur: ToeristischeVerhuur[];
  previousVerhuur: ToeristischeVerhuur[];
}) => {
  return (
    <>
      <SectionCollapsible
        id="SectionCollapsible-planned-verhuur"
        title="Geplande verhuur"
        className={styles.SectionNoBorderBottomNoMarginBottom}
        startCollapsed={!plannedVerhuur.length}
        hasItems={!!plannedVerhuur.length}
        noItemsMessage="Er is geen geplande verhuur gevonden"
        track={{
          category: 'Toeristische verhuur / Geplande Verhuur',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="dateStart"
          displayProps={DISPLAY_PROPS_VERHUUR}
          items={plannedVerhuur}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-cancelled-verhuur"
        title="Geannuleerde verhuur"
        startCollapsed={
          !!plannedVerhuur.length ||
          (!plannedVerhuur.length && !!cancelledVerhuur.length)
        }
        className={styles.SectionBorderTop}
        hasItems={!!cancelledVerhuur.length}
        noItemsMessage="Er is geen geannuleerde verhuur gevonden"
        track={{
          category: 'Toeristische verhuur / afgemeld Verhuur',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="dateStart"
          displayProps={DISPLAY_PROPS_VERHUUR}
          items={cancelledVerhuur}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-previous-verhuur"
        title="Afgelopen verhuur"
        noItemsMessage="Er is geen afgelopen verhuur gevonden."
        className={`${styles.SectionNoBorderBottom} ${styles.SectionExtraMarginBottom}`}
        startCollapsed={
          !!plannedVerhuur.length ||
          !!cancelledVerhuur.length ||
          !previousVerhuur.length
        }
        hasItems={!!previousVerhuur.length}
        track={{
          category: 'Toeristische verhuur / afgelopen Verhuur',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="dateStart"
          displayProps={DISPLAY_PROPS_VERHUUR}
          items={previousVerhuur}
        />
      </SectionCollapsible>
    </>
  );
};

export default VakantieVerhuurList;
