import { PageContent, DetailPage } from 'components/Page/Page';
import React, { useContext, ReactNode } from 'react';
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
        <span className={styles.DistanceToHome}>+/-{item.distance}KM</span>
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

  const garbageContainersMapUrl = centroid
    ? `${MAP_URL}&center=${centroid[1]}%2C${centroid[0]}&zoom=12&marker=${
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
          voorzieningen.
        </p>
        <p>
          <Linkd href={ExternalUrls.HUISVUIL_VEELGEVRAAGD} external={true}>
            Veelgevraagd huisvuil
          </Linkd>
          <br />
          <Linkd href={ExternalUrls.AFVAL} external={true}>
            Regels voor grofvuil en hergebruik
          </Linkd>
        </p>
        {!!BRP.data.adres && (
          <GarbagePanel className={styles.AddressPanel}>
            <Heading size="tiny">Uw adres</Heading>
            <p>{getFullAddress(BRP.data.adres)}</p>
          </GarbagePanel>
        )}
      </PageContent>

      {ophalen.map((item, index) => (
        <SectionCollapsible
          key={item.title}
          className={styles.InfoSection}
          id={`garbage-information-${item.title}`}
          isLoading={isLoading}
          title={item.title}
          hasItems={!!ophalen.length}
          noItemsMessage="Informatie over afval in uw buurt kan niet worden getoond"
          startCollapsed={true}
        >
          {!!item.aanbiedwijze && (
            <GarbagePanel>
              <Heading size="tiny">Aanbiedwijze</Heading>
              <p>{item.aanbiedwijze}</p>
            </GarbagePanel>
          )}
          {!!item.ophaaldag && (
            <GarbagePanel>
              <Heading size="tiny">Ophaaldag</Heading>
              <p>{item.ophaaldag}</p>
            </GarbagePanel>
          )}
          {!!item.buitenZetten && (
            <GarbagePanel>
              <Heading size="tiny">Buiten zetten</Heading>
              <p>{item.buitenZetten}</p>
            </GarbagePanel>
          )}
          {index === 0 && (
            <div className={styles.GarbageContainerMap}>
              <MyAreaMap url={garbageContainersMapUrl} />
            </div>
          )}
        </SectionCollapsible>
      ))}

      <SectionCollapsible
        className={styles.InfoSection}
        id="diy-garbage-information"
        title="Grofvuil wegbrengen"
        startCollapsed={true}
      >
        <GarbagePointItem item={wegbrengen[0]} />
        <SectionCollapsible
          className={styles.InfoSection}
          id="diy-garbage-information-2"
          title="Overige afvalpunten"
          startCollapsed={true}
        >
          {wegbrengen.slice(1).map(item => (
            <GarbagePointItem key={item.naam} item={item} />
          ))}
        </SectionCollapsible>
      </SectionCollapsible>
    </DetailPage>
  );
};
