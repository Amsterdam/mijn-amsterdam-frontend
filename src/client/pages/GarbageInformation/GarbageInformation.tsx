import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
import { getFullAddress, isError, isLoading } from '../../../universal/helpers';
import {
  GarbageFractionCode,
  GarbageFractionInformationFormatted,
} from '../../../universal/types';
import {
  IconAfvalGft,
  IconAfvalGlas,
  IconAfvalGrofAfval,
  IconAfvalPapier,
  IconAfvalRest,
  IconAfvalTextiel,
} from '../../assets/icons/map';
import {
  Alert,
  Button,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  InnerHtml,
  Linkd,
  LinkdInline,
  LoadingContent,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
} from '../../components';
import { InfoDetailProps } from '../../components/InfoDetail/InfoDetail';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import styles from './GarbageInformation.module.scss';

function GarbageInfoDetail({ ...props }: InfoDetailProps) {
  return <InfoDetail {...props} className={styles.GarbageInfoDetail} />;
}

interface InstructionCTAProps {
  fraction: GarbageFractionInformationFormatted;
}

function InstructionCTA({ fraction }: InstructionCTAProps) {
  if (fraction.instructieCTA) {
    return (
      <>
        <Linkd href={fraction.instructieCTA.to}>
          {fraction.instructieCTA.title}
        </Linkd>
        {fraction.instructie ? (
          <>
            <br />
            {fraction.instructie}
          </>
        ) : null}
      </>
    );
  }
  return <>{fraction.instructie}</>;
}

interface GarbageFractionIconProps {
  fractionCode: GarbageFractionCode;
}

function GarbageFractionIcon({ fractionCode }: GarbageFractionIconProps) {
  let icon = <IconAfvalRest />;
  switch (fractionCode.toLowerCase()) {
    case 'ga':
      icon = <IconAfvalGrofAfval />;
      break;
    case 'glas':
      icon = <IconAfvalGlas />;
      break;
    case 'papier':
      icon = <IconAfvalPapier />;
      break;
    case 'textiel':
      icon = <IconAfvalTextiel />;
      break;
    case 'gft':
      icon = <IconAfvalGft />;
      break;
    default:
    case 'rest':
      icon = <IconAfvalRest />;
      break;
  }
  return <span className={styles.GarbageFractionIcon}>{icon}</span>;
}

interface GarbageFractionPanelProps {
  fraction: GarbageFractionInformationFormatted;
}

function GarbageFractionPanel({ fraction }: GarbageFractionPanelProps) {
  return (
    <article className={styles.GarbageFractionPanel}>
      <h3 className={styles.GarbageFractionPanelTitle}>
        <GarbageFractionIcon fractionCode={fraction.fractieCode} />
        {fraction.titel}
      </h3>
      {!!fraction.kalendermelding && (
        <p className={styles.GarbageFractionPanelHighlight}>
          <InnerHtml>{fraction.kalendermelding}</InnerHtml>
        </p>
      )}
      <dl>
        <dt>Hoe</dt>
        <dd>
          <InstructionCTA fraction={fraction} />
        </dd>
      </dl>
      {!!fraction.ophaaldagen && (
        <dl>
          <dt>Ophaaldag</dt>
          <dd>{fraction.ophaaldagen}</dd>
        </dl>
      )}
      {!!fraction.buitenzetten && (
        <dl>
          <dt>Buiten zetten</dt>
          <dd>{fraction.buitenzetten}</dd>
        </dl>
      )}
      {!!fraction.waar && (
        <dl>
          <dt>Waar</dt>
          <dd>
            {typeof fraction.waar === 'object' ? (
              <LinkdInline href={fraction.waar.to}>
                {fraction.waar.title}
              </LinkdInline>
            ) : (
              fraction.waar
            )}
          </dd>
        </dl>
      )}
      {!!fraction.opmerking && (
        <div className={styles.GarbageFractionPanelOpmerking}>
          <InnerHtml>{fraction.opmerking}</InnerHtml>
        </div>
      )}
    </article>
  );
}

interface GarbageFractionPanelsProps {
  fractions: GarbageFractionInformationFormatted[];
}

const fractions1 = ['rest', 'ga', 'papier'];
const fractions2 = ['gft', 'glas', 'textiel'];

function GarbageFractionPanels({ fractions }: GarbageFractionPanelsProps) {
  const fractionsByCode = Object.fromEntries(
    fractions.map((fraction) => [fraction.fractieCode.toLowerCase(), fraction])
  );
  return (
    <div className={styles.GarbageFractionPanels}>
      <div className={styles.GarbageFractionPanelsColumn}>
        {fractions1
          .filter((fractionCode) => fractionCode in fractionsByCode)
          .map((fractionCode) => (
            <GarbageFractionPanel
              key={fractionCode}
              fraction={fractionsByCode[fractionCode]}
            />
          ))}
      </div>
      <div className={styles.GarbageFractionPanelsColumn}>
        {fractions2
          .filter((fractionCode) => fractionCode in fractionsByCode)
          .map((fractionCode) => (
            <GarbageFractionPanel
              key={fractionCode}
              fraction={fractionsByCode[fractionCode]}
            />
          ))}
      </div>
    </div>
  );
}

export default function GarbageInformation() {
  const { AFVAL, AFVALPUNTEN, MY_LOCATION } = useAppStateGetter();
  const profileType = useProfileTypeValue();
  const termReplace = useTermReplacement();

  return (
    <DetailPage>
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
              Hieronder vindt u een overzicht van alle huis- en grofvuil
              voorzieningen rond uw adres.
            </p>
            <p>
              <Linkd href={ExternalUrls.AFVAL} external={true}>
                Meer informatie over regels voor afval en hergebruik
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
              {MY_LOCATION.content?.[0]?.address ? (
                getFullAddress(MY_LOCATION.content?.[0].address)
              ) : isLoading(MY_LOCATION) ? (
                <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
              ) : (
                'Onbekend adres'
              )}
            </>
          }
        />

        {AFVAL.status === 'OK' && !!AFVAL.content?.length && (
          <GarbageFractionPanels fractions={AFVAL.content} />
        )}
        <p>
          <Button
            className={styles.ContactLink}
            onClick={() =>
              (window.location.href = ExternalUrls.AFVAL_MELDING_FORMULIER)
            }
          >
            Klopt de informatie niet? Geef het door
          </Button>
        </p>
        <h3>Afvalcontainers in de buurt</h3>
        <p>
          <Linkd
            href={`${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]&zoom=14`}
          >
            Kaart met containers in de buurt
          </Linkd>
        </p>
        <h3>Adressen afvalpunten</h3>
        <ul className={styles.UnstyledList}>
          {AFVALPUNTEN.content?.centers.map((item, index) => (
            <li key={item.title}>
              <Linkd href={item.website} external={true}>
                {item.title}
                {item.distance !== 0 && (
                  <span className={styles.DistanceToHome}>
                    +/-{item.distance}KM
                  </span>
                )}
              </Linkd>
            </li>
          ))}
        </ul>
      </PageContent>
    </DetailPage>
  );
}
