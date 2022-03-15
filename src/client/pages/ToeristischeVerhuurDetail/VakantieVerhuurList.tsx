import {
  ToeristischeVerhuur,
  ToeristischeVerhuurVergunning,
  ToeristischeVerhuurVergunningaanvraag,
} from '../../../server/services';
import {
  addTitleLinkComponent,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import styles from './ToeristischeVerhuurDetail.module.scss';

const DISPLAY_PROPS_VERHUUR = {
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  dateRequest: 'Ontvangen op',
  duration: 'Aantal nachten',
};

const filterVerhuur = (vergunning: ToeristischeVerhuurVergunningaanvraag) => {
  return (v: ToeristischeVerhuurVergunning) => {
    if (
      !['Vergunning bed & breakfast', 'Vergunning vakantieverhuur'].includes(
        v.title
      ) &&
      v.location === vergunning.location &&
      v.dateStart &&
      vergunning.dateStart &&
      new Date(v.dateStart) >= new Date(vergunning.dateStart) &&
      v.dateEnd &&
      vergunning.dateEnd &&
      new Date(v.dateEnd) <= new Date(vergunning.dateEnd)
    ) {
      return v;
    }
    return undefined;
  };
};

const VakantieVerhuurList = ({
  vergunning,
}: {
  vergunning: ToeristischeVerhuurVergunningaanvraag;
}) => {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;

  const verhuur = addTitleLinkComponent(
    (content?.vergunningen?.map(filterVerhuur(vergunning)) || []).filter(
      Boolean
    ),
    'dateStart'
  ) as ToeristischeVerhuur[];

  const cancelledVerhuur = verhuur.filter(
    (v) => v?.title === 'Geannuleerde verhuur'
  );

  const plannedVerhuur = verhuur.filter((v) => v?.title === 'Geplande verhuur');

  const previousVerhuur = verhuur.filter(
    (v) => v?.title === 'Afgelopen verhuur'
  );

  const isVergunningActiveAndValid = (
    vergunning: ToeristischeVerhuurVergunningaanvraag
  ) => {
    return (
      vergunning.isActual &&
      !['Ingetrokken', 'Geweigerd'].includes(vergunning.status)
    );
  };

  if (vergunning.status === 'Geweigerd') {
    return <></>;
  }

  return (
    <>
      {isVergunningActiveAndValid(vergunning) && (
        <SectionCollapsible
          id="SectionCollapsible-planned-verhuur"
          title="Geplande verhuur"
          className={styles.SectionBorderTop}
          startCollapsed={!plannedVerhuur.length && !!verhuur.length}
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
      )}
      <SectionCollapsible
        id="SectionCollapsible-cancelled-verhuur"
        title="Geannuleerde verhuur"
        startCollapsed={
          !!plannedVerhuur.length ||
          (!plannedVerhuur.length && !!verhuur.length)
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
          !verhuur.length
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
