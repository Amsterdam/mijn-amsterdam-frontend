import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  ErrorAlert,
  ChapterIcon,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import styles from './Horeca.module.scss';

const DISPLAY_PROPS_HORECA = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequest: 'Aangevraagd',
};

const DISPLAY_PROPS_HORECA_EERDER = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  decision: 'Resultaat',
};

export const HORECA_PAGE_SIZE = 20;

export default function Horeca() {
  const { HORECA } = useAppStateGetter();

  const vergunningen =
    HORECA.content?.map((v) => {
      return {
        ...v,
        dateRequest: defaultDateFormat(v.dateRequest),
      };
    }) || [];

  const items = addTitleLinkComponent(vergunningen, 'identifier');

  const lopendeVergunningen = items.filter((v) => !v.processed);
  const afgerondeVergunningen = items.filter((v) => v.processed);

  return (
    <OverviewPage className={styles.Horeca}>
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
          Hier ziet u een overzicht van uw aanvragen voor Horeca en ontheffingen
          bij gemeente Amsterdam.
        </p>
        {isError(HORECA) && (
          <ErrorAlert>
            We kunnen op dit moment geen vergunningen tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Lopende aanvragen"
        noItemsMessage="U heeft geen horeca vergunningen in aanvraag."
        startCollapsed={false}
        hasItems={!!lopendeVergunningen?.length}
        isLoading={isLoading(HORECA)}
        className=""
      >
        <Table
          items={lopendeVergunningen}
          displayProps={DISPLAY_PROPS_HORECA}
          titleKey="identifier"
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Eerdere aanvragen"
        noItemsMessage="U heeft nog geen toegekende horeca vergunningen."
        startCollapsed={false}
        hasItems={!!afgerondeVergunningen?.length}
        isLoading={isLoading(HORECA)}
        className=""
      >
        <Table
          items={afgerondeVergunningen}
          displayProps={DISPLAY_PROPS_HORECA_EERDER}
          titleKey="identifier"
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
