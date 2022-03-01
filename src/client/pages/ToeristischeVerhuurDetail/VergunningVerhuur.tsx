import { useMemo } from 'react';
import type {
  ToeristischeVerhuur,
  ToeristischeVerhuurBBVergunning,
  ToeristischeVerhuurVergunningaanvraag,
} from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import { PageContent, SectionCollapsible, Table } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import { Location } from '../VergunningDetail/Location';
import styles from './ToeristischeVerhuurDetail.module.scss';
import { useAppStateGetter } from '../../hooks';

const DISPLAY_PROPS_VERHUUR = {
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  dateRequest: 'Ontvangen op',
  duration: 'Aantal nachten',
};

function useStatusLineItems(
  vergunning?:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning
) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!vergunning) {
      return [];
    }
    const isBB = vergunning.caseType === CaseType.BBVergunning;
    const isInBehandeling = vergunning.status === 'In behandeling';
    const isAfgehandeld =
      vergunning.status === 'Afgehandeld' || !!vergunning.decision;
    const isIngetrokken = !isBB && vergunning.decision === 'Ingetrokken';
    const isVerlopen = vergunning.status === 'Verlopen';
    /**
     * Steps for B&B:
     * - Ontvangen
     * - In behandeling
     * - Verleend/Geweigerd/Ingetrokken
     *
     * Steps for Vakantieverhuurvergunning:
     * - Ontvangen
     * -----------
     * - Verleend
     * - Verlopen
     * -- or --
     * - Ingetrokken
     * -----------
     */

    const step1 = {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    };

    if (isBB) {
      step1.isActive = vergunning.status === 'Ontvangen';
    }

    let step2 = {
      id: 'item-2',
      status: '',
      datePublished: '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
    };

    if (vergunning.caseType === CaseType.BBVergunning) {
      // Only BB vergunning can have an "In behandeling" step.
      // NOTE: We can't show a date here yet, it might be possible in the future. For now we don't show a date.
      //step2.datePublished = '';
      step2.status = 'In behandeling';
      step2.isActive = isInBehandeling;
      step2.isChecked = !step1.isActive;
      step2.datePublished = vergunning.dateWorkflowActive || '';
    } else {
      // Vakantieverhuurvergunningn are granted (Verleend) immediately.
      step2.datePublished = vergunning.dateDecision || vergunning.dateRequest;
      step2.status = 'Verleend'; // Override status for clarity
      step2.isActive = !isIngetrokken && !isVerlopen;
      step2.isChecked = true;
    }

    const lineItems = [step1, step2];

    if (isBB) {
      const step3 = {
        id: 'item-3',
        status: isAfgehandeld ? vergunning.decision || '' : 'Afgehandeld',
        datePublished: vergunning.dateDecision || '',
        description: '',
        documents: [],
        isActive: isAfgehandeld,
        isChecked: isAfgehandeld,
      };
      lineItems.push(step3);
    }
    // OPTIONAL Additional step for VakantieVerhuurVergunning. It can be revoked after the initial immediate grant.
    else if (isIngetrokken) {
      const step3 = {
        id: 'item-3',
        status: 'Ingetrokken',
        datePublished: vergunning.dateDecision || '',
        description: '',
        documents: [],
        isActive: true,
        isChecked: true,
      };
      lineItems.push(step3);
    } else if (!isBB) {
      const step3 = {
        id: 'item-3',
        status: 'Verlopen',
        datePublished: vergunning.dateEnd || '',
        description: '',
        documents: [],
        isActive: isVerlopen,
        isChecked: isVerlopen,
      };
      lineItems.push(step3);
    }

    return lineItems;
  }, [vergunning]);

  return statusLineItems;
}

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning:
    | ToeristischeVerhuurVergunningaanvraag
    | ToeristischeVerhuurBBVergunning;
}) {
  const statusLineItems = useStatusLineItems(vergunning);
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;

  const verhuur = (
    content?.vergunningen?.map((v) => {
      if (
        !['Vergunning bed & breakfast', 'Vergunning vakantieverhuur'].includes(
          v.title
        ) &&
        v.location === vergunning.location &&
        new Date(v.dateStart || '') >= new Date(vergunning.dateStart || '') &&
        new Date(v.dateEnd || '') <= new Date(vergunning.dateEnd || '')
      ) {
        return v;
      }

      return undefined;
    }) || []
  ).filter(Boolean) as ToeristischeVerhuur[];

  const cancelledVerhuur = verhuur.filter(
    (v) => v?.title === 'Geannuleerde verhuur'
  );

  const plannedVerhuur = verhuur.filter((v) => v?.title === 'Geplande verhuur');

  const previousVerhuur = verhuur.filter(
    (v) => v?.title === 'Afgelopen verhuur'
  );

  return (
    <>
      <PageContent className={styles.DetailPageContent}>
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
        <SectionCollapsible
          id="SectionCollapsible-cancelled-verhuur"
          title="Geannuleerde verhuur"
          startCollapsed={
            !!plannedVerhuur.length ||
            (!plannedVerhuur.length && !!verhuur.length)
          }
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
          className={styles.SectionNoBorderBottom}
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
        <InfoDetail
          label="Gemeentelijk zaaknummer"
          value={vergunning?.identifier ?? '-'}
        />
        <InfoDetailGroup>
          <InfoDetail
            label="Vanaf"
            value={
              vergunning.dateStart
                ? defaultDateFormat(vergunning.dateStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot"
            value={
              vergunning.dateEnd ? defaultDateFormat(vergunning.dateEnd) : '-'
            }
          />
        </InfoDetailGroup>
        {vergunning.title === 'Vergunning bed & breakfast' && (
          <InfoDetailGroup>
            <InfoDetail
              label="Eigenaar woning"
              value={vergunning.owner ?? '-'}
            />
            <InfoDetail
              label="Aanvrager vergunning"
              value={vergunning.requester ?? '-'}
            />
          </InfoDetailGroup>
        )}
        <Location label="Adres" location={vergunning.location} />
        <DocumentDetails
          vergunning={vergunning}
          trackPath={(document) =>
            `/downloads/toeristische-verhuur/${vergunning.caseType.toLocaleLowerCase()}/${
              document.title
            }`
          }
        />
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory="Toeristisch verhuur detail / status"
          items={statusLineItems}
          showToggleMore={false}
          id={`toeristische-verhuur-detail-${vergunning.id}`}
        />
      )}
    </>
  );
}
