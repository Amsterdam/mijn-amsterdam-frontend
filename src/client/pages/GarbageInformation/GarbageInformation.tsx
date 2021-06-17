import classnames from 'classnames';
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
  InfoDetail,
  InnerHtml,
  Linkd,
  LoadingContent,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  SectionCollapsible,
} from '../../components';
import { InfoDetailProps } from '../../components/InfoDetail/InfoDetail';
import { SectionCollapsibleProps } from '../../components/SectionCollapsible/SectionCollapsible';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import styles from './GarbageInformation.module.scss';

function GarbageInfoDetail({ ...props }: InfoDetailProps) {
  return <InfoDetail {...props} className={styles.GarbageInfoDetail} />;
}

function GarbageCenterInfoDetail({ ...props }: InfoDetailProps) {
  return <GarbageInfoDetail {...props} labelElement="h4" />;
}

function GarbageSectionCollapsible({
  className,
  ...props
}: SectionCollapsibleProps) {
  return (
    <SectionCollapsible
      {...props}
      className={classnames(styles.GarbageSectionCollapsible, className)}
    />
  );
}

function GarbageCenterItem({ item }: { item: GarbageCenter }) {
  return (
    <>
      <Heading size="medium" className={styles.AfvalpuntContentHeading}>
        {item.title}{' '}
        {item.distance !== 0 && (
          <span className={styles.DistanceToHome}>+/-{item.distance}KM</span>
        )}
      </Heading>
      <GarbageCenterInfoDetail
        label="Adres"
        valueWrapperElement="div"
        value={
          <InnerHtml el="p" className={styles.NoMargin}>
            {item.address}
          </InnerHtml>
        }
      />
      <GarbageCenterInfoDetail
        label="Telefoon"
        value={<a href={`tel:${item.phone}`}>{item.phone}</a>}
      />
      <GarbageCenterInfoDetail
        label="E-mail"
        value={<a href={`mailto:${item.email}`}>{item.email}</a>}
      />
      <GarbageCenterInfoDetail
        label="Meer informatie"
        value={
          <Linkd href={item.website} external={true}>
            Spullen wegbrengen naar een Afvalpunt
          </Linkd>
        }
      />
    </>
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
    <GarbageSectionCollapsible
      id={id}
      isLoading={isLoading(AFVAL)}
      title={item.title}
      hasItems={!!AFVAL.content?.length}
      noItemsMessage="Informatie over afval in uw buurt kan niet worden getoond"
    >
      {!!item.aanbiedwijze && (
        <GarbageInfoDetail label="Hoe" value={item.aanbiedwijze} />
      )}
      {!!item.buitenZetten && (
        <GarbageInfoDetail label="Buiten zetten" value={item.buitenZetten} />
      )}
      {!!item.ophaaldag && (
        <GarbageInfoDetail label="Ophaaldag" value={item.ophaaldag} />
      )}
      {!!item.opmerking && (
        <GarbageInfoDetail
          label="Opmerking"
          value={<InnerHtml>{item.opmerking}</InnerHtml>}
        />
      )}
    </GarbageSectionCollapsible>
  );

  return (
    <DetailPage className={styles.GarbageInformation}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
      >
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
              <br />
              <Linkd href={ExternalUrls.AFVAL_MELDING} external={true}>
                Doe een melding als afval is blijven liggen
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
              <br />
              <Linkd href={ExternalUrls.AFVAL_MELDING} external={true}>
                Doe een melding als afval is blijven liggen
              </Linkd>
            </p>
          </>
        )}
        <MaintenanceNotifications page="afval" />
        {isError(AFVAL) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
        <GarbageInfoDetail
          label="Uw adres"
          value={
            <>
              {HOME.content?.address ? (
                getFullAddress(HOME.content.address)
              ) : isLoading(HOME) ? (
                <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
              ) : (
                'Onbekend adres'
              )}
            </>
          }
        />
      </PageContent>
      {!!grofvuil && garbagePointCollapsible('grofvuil', grofvuil)}
      {!!restafval && garbagePointCollapsible('restafval', restafval)}
      <GarbageSectionCollapsible
        id="garbageContainersOnMap"
        title="Afvalcontainers in de buurt"
      >
        <GarbageInfoDetail
          label="Overzicht in uw buurt"
          value={
            <Linkd href={`${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]`}>
              Bekijk de afvalcontainer locaties.
            </Linkd>
          }
        />
      </GarbageSectionCollapsible>
      <GarbageSectionCollapsible
        id="wegbrengen"
        title="Afvalpunten"
        isLoading={isLoading(AFVALPUNTEN)}
        className={styles.Afvalpunten}
      >
        {AFVALPUNTEN.content?.centers.map((item, index) => (
          <GarbageCenterItem key={item.title} item={item} />
        ))}
      </GarbageSectionCollapsible>
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
