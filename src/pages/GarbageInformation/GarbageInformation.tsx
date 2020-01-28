import { PageContent, DetailPage } from 'components/Page/Page';
import React, { useContext, ReactNode } from 'react';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './GarbageInformation.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { ExternalUrls } from 'config/App.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import Linkd from 'components/Button/Button';
import { AppContext } from 'AppState';
import Heading from 'components/Heading/Heading';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { getFullAddress } from 'data-formatting/brp';
import classnames from 'classnames';
import { GarbagePoint } from 'hooks/api/api.garbage';
import { MyAreaMapIFrame } from 'components/MyArea/MyArea';
import Panel from 'components/Panel/Panel';
import { useSessionStorage } from 'hooks/storage.hook';
import { GarbageMoment } from 'hooks/api/api.garbage';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

function GarbagePanel({ children, className }: PanelProps) {
  return (
    <Panel className={classnames(styles.Panel, className)}>{children}</Panel>
  );
}

function GarbagePointItem({ item }: { item: GarbagePoint }) {
  return (
    <GarbagePanel className={styles.AfvalPunten}>
      <Heading size="small">
        {item.naam}{' '}
        {item.distance !== 0 && (
          <span className={styles.DistanceToHome}>+/-{item.distance}KM</span>
        )}
      </Heading>
      <Heading size="tiny">Adres</Heading>
      <p dangerouslySetInnerHTML={{ __html: item.adres }} />
      <Heading size="tiny">Telefoon</Heading>
      <p>
        <a href={`tel:${item.telefoon}`}>{item.telefoon}</a>
      </p>
      <Heading size="tiny">E-mail</Heading>
      <p>
        <a href={`mailto:${item.email}`}>{item.email}</a>
      </p>
      <Heading size="tiny">Openingstijden</Heading>
      <p className={styles.OpeningHours}>{item.openingstijden}</p>
    </GarbagePanel>
  );
}

export default () => {
  const {
    BRP,
    GARBAGE: {
      isLoading,
      data: { wegbrengen, ophalen, centroid },
    },
  } = useContext(AppContext);

  const collapsedIndex = {
    otherGarbagePoints: true,
    wegbrengen: true,
    grofvuil: true,
    restafval: true,
    garbageContainersOnMap: true,
  };

  const [isCollapsedIndex, setIsCollapsed] = useSessionStorage(
    'garbagePoints',
    collapsedIndex
  );

  function isCollapsed(key: string) {
    return isCollapsedIndex && isCollapsedIndex[key];
  }

  function toggleCollapsed(key: string) {
    setIsCollapsed({
      ...isCollapsedIndex,
      [key]: !isCollapsed(key),
    });
  }

  const garbageContainersMapUrl = centroid
    ? `https://kaart.amsterdam.nl/afvalcontainers#17/${centroid[1]}/${centroid[0]}/topo/9749,9750,9751,9752,9753,9754/9748/`
    : '';

  const garbagePointCollapisble = (
    id: string,
    item: GarbageMoment,
    isCollapsed: boolean
  ) => (
    <SectionCollapsible
      key={item.title}
      className={styles.InfoSection}
      isLoading={isLoading}
      isCollapsed={isCollapsed}
      onToggleCollapsed={toggleCollapsed.bind(null, id)}
      title={item.title}
      hasItems={!!ophalen.length}
      noItemsMessage="Informatie over afval in uw buurt kan niet worden getoond"
    >
      {!!item.aanbiedwijze && (
        <GarbagePanel>
          <Heading size="tiny">Hoe</Heading>
          <p>{item.aanbiedwijze}</p>
        </GarbagePanel>
      )}
      {!!item.buitenZetten && (
        <GarbagePanel>
          <Heading size="tiny">Buiten zetten</Heading>
          <p>{item.buitenZetten}</p>
        </GarbagePanel>
      )}
      {!!item.ophaaldag && (
        <GarbagePanel>
          <Heading size="tiny">Ophaaldag</Heading>
          <p>{item.ophaaldag}</p>
        </GarbagePanel>
      )}
      {!!item.opmerking && (
        <GarbagePanel>
          <Heading size="tiny">Opmerking</Heading>
          <p dangerouslySetInnerHTML={{ __html: item.opmerking }} />
        </GarbagePanel>
      )}
    </SectionCollapsible>
  );

  const [restafval, grofvuil] = ophalen;

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.AFVAL}</PageHeading>
      <PageContent>
        <p>
          Hieronder vindt u een overzicht van alle huis- en grofvuil
          voorzieningen rond uw adres.
        </p>
        <p>
          <Linkd href={ExternalUrls.AFVAL} external={true}>
            Meer informatie over regels voor afval en hergebruik
          </Linkd>
        </p>
      </PageContent>

      {!!BRP.data?.adres && (
        <GarbagePanel className={styles.AddressPanel}>
          <Heading size="tiny">Uw adres</Heading>
          <p>{getFullAddress(BRP.data.adres)}</p>
        </GarbagePanel>
      )}

      {!!grofvuil &&
        garbagePointCollapisble('grofvuil', grofvuil, isCollapsed('grofvuil'))}

      {!!restafval &&
        garbagePointCollapisble(
          'restafval',
          restafval,
          isCollapsed('restafval')
        )}

      <SectionCollapsible
        className={classnames(
          styles.InfoSection,
          styles.InfoSection__fullWidth
        )}
        title="Afvalcontainers in de buurt"
        isCollapsed={isCollapsed('garbageContainersOnMap')}
        onToggleCollapsed={toggleCollapsed.bind(null, 'garbageContainersOnMap')}
      >
        <div className={styles.GarbageContainerMap}>
          <MyAreaMapIFrame url={garbageContainersMapUrl} />
        </div>
      </SectionCollapsible>

      <SectionCollapsible
        className={classnames(
          styles.InfoSection,
          styles.InfoSectionGarbagePoints
        )}
        title="Afvalpunten"
        isCollapsed={isCollapsed('wegbrengen')}
        onToggleCollapsed={toggleCollapsed.bind(null, 'wegbrengen')}
      >
        <GarbagePointItem item={wegbrengen[0]} />
        <div className={styles.ToggleOtherGarbagePointsButton}>
          <Linkd
            onClick={() => {
              toggleCollapsed('otherGarbagePoints');
            }}
            className={
              !isCollapsed('otherGarbagePoints')
                ? styles.otherGarbagePointsExpanded
                : ''
            }
          >
            {isCollapsed('otherGarbagePoints')
              ? 'Toon overige afvalpunten'
              : 'Verberg overige afvalpunten'}
          </Linkd>
        </div>
      </SectionCollapsible>
      <SectionCollapsible
        className={classnames(
          styles.InfoSection,
          styles.InfoSectionOtherGarbagePoints
        )}
        isCollapsed={
          isCollapsed('wegbrengen') || isCollapsed('otherGarbagePoints')
        }
        onToggleCollapsed={toggleCollapsed.bind(null, 'otherGarbagePoints')}
      >
        {wegbrengen.slice(1).map(item => (
          <GarbagePointItem key={item.naam} item={item} />
        ))}
      </SectionCollapsible>
      <PageContent>
        <p>
          <Linkd
            // variant="inline"
            external={true}
            href={ExternalUrls.AFVAL_MELDING_FORMULIER}
            // icon=""
          >
            Klopt er iets niet? Geef het aan ons door.
          </Linkd>
        </p>
      </PageContent>
    </DetailPage>
  );
};
