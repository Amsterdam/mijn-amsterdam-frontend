import classnames from 'classnames';
import { ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
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
  LoadingContent,
  PageContent,
  PageHeading,
  Panel,
  SectionCollapsible,
} from '../../components';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
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
      <Heading size="tiny">Meer informatie</Heading>
      <p>
        <a href={item.website} rel="noopener noreferrer">
          Spullen wegbrengen naar een Afvalpunt
        </a>
      </p>
    </GarbagePanel>
  );
}

export default function GarbageInformation() {
  const { AFVAL, AFVALPUNTEN, HOME } = useAppStateGetter();
  const [restafval, grofvuil] = AFVAL.content || [];
  const profileType = useProfileTypeValue();
  const termReplace = useTermReplacement();

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

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading isLoading={false} icon={<ChapterIcon />}>
        {termReplace(ChapterTitles.AFVAL)}
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

      <GarbagePanel className={styles.AddressPanel}>
        <Heading size="tiny">Uw adres</Heading>
        <p>
          {HOME.content?.address ? (
            getFullAddress(HOME.content.address)
          ) : isLoading(HOME) ? (
            <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
          ) : (
            'Onbekend adres'
          )}
        </p>
      </GarbagePanel>
      {!!grofvuil && garbagePointCollapsible('grofvuil', grofvuil)}
      {!!restafval && garbagePointCollapsible('restafval', restafval)}
      <SectionCollapsible
        id="garbageContainersOnMap"
        className={classnames(styles.InfoSection, styles.InfoSectionMap)}
        title="Afvalcontainers in de buurt"
      >
        <GarbagePanel>
          <p>
            <Linkd href={`${AppRoutes.BUURT}?datasetIds=afvalcontainers`}>
              Klik hier voor een overzicht van alle afvalcontainers in de buurt.
            </Linkd>
          </p>
        </GarbagePanel>
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
}
