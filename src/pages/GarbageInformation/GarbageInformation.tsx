import { PageContent, DetailPage } from 'components/Page/Page';
import React, { useContext, ReactNode, useState } from 'react';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './GarbageInformation.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { Chapters, ChapterTitles, ExternalUrls } from 'App.constants';
import Linkd from 'components/Button/Button';
import { AppContext } from 'AppState';
import Heading from 'components/Heading/Heading';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import { getFullAddress } from 'data-formatting/brp';
import classnames from 'classnames';
import { GarbagePoint } from 'hooks/api/api.garbage';
import { MAP_URL } from 'hooks/api/api.mymap';
import { MyAreaMap } from 'components/MyArea/MyArea';
import Panel from 'components/Panel/Panel';
import { useSessionStorage } from '../../hooks/storage.hook';
import { Button } from '../../components/Button/Button';

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
        {item.naam} &mdash; {item.stadsdeel}{' '}
        {item.distance !== 0 && (
          <span className={styles.DistanceToHome}>+/-{item.distance}KM</span>
        )}
      </Heading>
      <Heading size="tiny">Adres</Heading>
      <p>{item.adres}</p>
      <Heading size="tiny">Telefoon</Heading>
      <p>
        <a href={`tel:${item.telefoon}`}>{item.telefoon}</a>
      </p>
      <Heading size="tiny">Openingstijden</Heading>
      <p>{item.openingstijden}</p>
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
    ophalen1: true,
    ophalen2: true,
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
    ? `${MAP_URL}&center=${centroid[1]}%2C${centroid[0]}&zoom=15&marker=${
        centroid[1]
      }%2C${
        centroid[0]
      }&marker-icon=home&lagen=wlokca%3A1%7Cwlotxtl%3A1%7Cwlopls%3A1%7Cwlogls%3A1%7Cwloppr%3A1%7Cwlorst%3A1&legenda=false`
    : '';

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.AFVAL} />}>
        {ChapterTitles.AFVAL}
      </PageHeading>
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

      {!!BRP.data.adres && (
        <GarbagePanel className={styles.AddressPanel}>
          <Heading size="tiny">Uw adres</Heading>
          <p>{getFullAddress(BRP.data.adres)}</p>
        </GarbagePanel>
      )}

      {ophalen.map((item, index) => (
        <SectionCollapsible
          key={item.title}
          className={styles.InfoSection}
          isLoading={isLoading}
          isCollapsed={isCollapsed('ophalen' + index)}
          onToggleCollapsed={toggleCollapsed.bind(null, 'ophalen' + index)}
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
          {index === 0 && !item.ophaaldag && (
            /** Put the containers map within the expandable panel. */
            <div className={styles.GarbageContainerMap}>
              <MyAreaMap url={garbageContainersMapUrl} />
            </div>
          )}
        </SectionCollapsible>
      ))}

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
          <Button
            onClick={() => {
              toggleCollapsed('otherGarbagePoints');
            }}
            variant="secondary-inverted"
          >
            {isCollapsed('otherGarbagePoints')
              ? 'Toon overige afvalpunten'
              : 'Verberg overige afvalpunten'}
          </Button>
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
      {ophalen.length && !!ophalen[0].ophaaldag && (
        <SectionCollapsible
          className={styles.InfoSection}
          title="Afvalcontainers in de buurt"
          isCollapsed={isCollapsed('garbageContainersOnMap')}
          onToggleCollapsed={toggleCollapsed.bind(
            null,
            'garbageContainersOnMap'
          )}
        >
          <div className={styles.GarbageContainerMap}>
            <MyAreaMap url={garbageContainersMapUrl} />
          </div>
        </SectionCollapsible>
      )}
    </DetailPage>
  );
};
