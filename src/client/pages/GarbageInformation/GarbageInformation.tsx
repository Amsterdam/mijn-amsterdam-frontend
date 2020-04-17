import {
  ChapterIcon,
  DetailPage,
  Heading,
  Linkd,
  MyAreaMapIFrame,
  PageContent,
  PageHeading,
  Panel,
  SectionCollapsible,
} from '../../components';
import { ChapterTitles, ExternalUrls } from '../../../universal/config';
import { GarbageMoment, GarbagePoint } from '../../hooks/api/api.garbage';
import React, { ReactNode, useContext } from 'react';

import { AppContext } from '../../AppState';
import classnames from 'classnames';
import { getFullAddress } from '../../data-formatting/brp';
import styles from './GarbageInformation.module.scss';

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

  const garbageContainersMapUrl = centroid
    ? `https://kaart.amsterdam.nl/afvalcontainers#19/${centroid[1]}/${centroid[0]}/topo/9749,9750,9751,9752,9753,9754/9748/`
    : '';

  const garbagePointCollapsible = (id: string, item: GarbageMoment) => (
    <SectionCollapsible
      id={id}
      className={styles.InfoSection}
      isLoading={isLoading}
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

      {!!grofvuil && garbagePointCollapsible('grofvuil', grofvuil)}

      {!!restafval && garbagePointCollapsible('restafval', restafval)}

      <SectionCollapsible
        id="garbageContainersOnMap"
        className={classnames(styles.InfoSection, styles.InfoSectionMap)}
        title="Afvalcontainers in de buurt"
      >
        <MyAreaMapIFrame
          className={styles.GarbageContainerMap}
          url={garbageContainersMapUrl}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="wegbrengen"
        className={classnames(
          styles.InfoSection,
          styles.InfoSectionGarbagePoints
        )}
        title="Afvalpunten"
      >
        {wegbrengen.map(item => (
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
