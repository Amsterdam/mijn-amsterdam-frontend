import classnames from 'classnames';
import React, { ReactNode } from 'react';
import {
  Chapters,
  profileTypeChapterTitleAdjustment,
} from '../../../universal/config';
import { getFullAddress, isError, isLoading } from '../../../universal/helpers';
import {
  GarbageCenter,
  GarbageRetrievalMoment,
} from '../../../universal/types';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Heading,
  InnerHtml,
  Linkd,
  MyAreaMapIFrame,
  PageContent,
  PageHeading,
  Panel,
  SectionCollapsible,
} from '../../components';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
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

function GarbageCenterItem({ item }: { item: GarbageCenter }) {
  return (
    <GarbagePanel className={styles.AfvalPunten}>
      <Heading size="medium" className={styles.AfvalpuntContentHeading}>
        {item.title}{' '}
        {item.distance !== 0 && (
          <span className={styles.DistanceToHome}>+/-{item.distance}KM</span>
        )}
      </Heading>
      <Heading size="tiny">Adres</Heading>
      <InnerHtml el="p">{item.address}</InnerHtml>
      <Heading size="tiny">Telefoon</Heading>
      <p>
        <a href={`tel:${item.phone}`}>{item.phone}</a>
      </p>
      <Heading size="tiny">E-mail</Heading>
      <p>
        <a href={`mailto:${item.email}`}>{item.email}</a>
      </p>
      <Heading size="tiny">Openingstijden</Heading>
      <InnerHtml
        className={classnames(styles.htmlContent, styles.OpeningHours)}
      >
        {item.openingHours}
      </InnerHtml>
    </GarbagePanel>
  );
}

export default () => {
  const { AFVAL, AFVALPUNTEN, HOME } = useAppStateGetter();
  let garbageContainersMapUrl = '';

  if (HOME && HOME?.content?.latlng?.lng && HOME?.content?.latlng?.lat) {
    garbageContainersMapUrl = `https://kaart.amsterdam.nl/afvalcontainers#19/${HOME.content.latlng.lat}/${HOME.content.latlng.lng}/topo/9749,9750,9751,9752,9753,9754/9748/`;
  }

  const garbagePointCollapsible = (
    id: string,
    item: GarbageRetrievalMoment
  ) => (
    <SectionCollapsible
      id={id}
      className={styles.InfoSection}
      isLoading={isLoading(AFVAL)}
      title={item.title}
      hasItems={!!AFVAL.content?.length}
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
          <InnerHtml el="p">{item.opmerking}</InnerHtml>
        </GarbagePanel>
      )}
    </SectionCollapsible>
  );

  const [restafval, grofvuil] = AFVAL.content || [];
  const profileType = useProfileTypeValue();

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading isLoading={isLoading(AFVAL)} icon={<ChapterIcon />}>
        {profileTypeChapterTitleAdjustment(profileType, Chapters.AFVAL)}
      </PageHeading>
      <PageContent>
        {profileType === 'private' && (
          <>
            <p>
              Bekijk waar u uw afval kwijt kunt en hoe u uw afval kunt scheiden.
            </p>
            <p>
              <Linkd href={ExternalUrls.AFVAL} external={true}>
                De regels voor afval en hergebruik
              </Linkd>
            </p>
          </>
        )}
        {profileType !== 'private' && (
          <>
            <p>
              Deze afvalregels gelden als u per week maxi­maal 9
              vuil­nis­zak­ken met res­taf­val hebt. Hebt u meer afval? Dan moet
              u een contract afsluiten met een erkende afvalinzamelaar of de
              gemeente.
            </p>
            <p>
              <Linkd href={ExternalUrls.AFVAL_COMMERCIAL} external={true}>
                Regels bedrijfsafval in Amsterdam
              </Linkd>
            </p>
          </>
        )}
        {isError(AFVAL) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>

      {!!HOME.content?.address && (
        <GarbagePanel className={styles.AddressPanel}>
          <Heading size="tiny">Uw adres</Heading>
          <p>{getFullAddress(HOME.content?.address)}</p>
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
        isLoading={isLoading(AFVALPUNTEN)}
      >
        {AFVALPUNTEN.content?.centers.map((item, index) => (
          <GarbageCenterItem key={item.title} item={item} />
        ))}
      </SectionCollapsible>
      <PageContent>
        <p>
          <Linkd
            className={styles.ContactLink}
            external={true}
            href={ExternalUrls.AFVAL_MELDING_FORMULIER}
          >
            Kloppen de dagen, tijden of adressen niet? Geef het aan ons door.
          </Linkd>
        </p>
      </PageContent>
    </DetailPage>
  );
};
