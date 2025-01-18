import {
  Heading,
  Link,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';

import styles from './GarbageInformation.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { getFullAddress } from '../../../universal/helpers/brp';
import {
  GarbageFractionCode,
  GarbageFractionInformationTransformed,
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
  ErrorAlert,
  InfoDetail,
  InnerHtml,
  LoadingContent,
  MaintenanceNotifications,
} from '../../components';
import { InfoDetailProps } from '../../components/InfoDetail/InfoDetail';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { ExternalUrls } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';

function GarbageInfoDetail({ ...props }: InfoDetailProps) {
  return <InfoDetail {...props} className={styles.GarbageInfoDetail} />;
}

interface InstructionCTAProps {
  fraction: GarbageFractionInformationTransformed;
}

function InstructionCTA({ fraction }: InstructionCTAProps) {
  if (fraction.instructieCTA) {
    return (
      <>
        <Paragraph>
          <MaButtonLink
            href={fraction.instructieCTA.to}
            rel="noopener noreferrer"
          >
            {fraction.instructieCTA.title}
          </MaButtonLink>
        </Paragraph>
        {fraction.instructie ? (
          <Paragraph>
            <InnerHtml el="span">{fraction.instructie}</InnerHtml>
          </Paragraph>
        ) : null}
      </>
    );
  }
  return fraction.instructie ? (
    <Paragraph>
      <InnerHtml el="span">{fraction.instructie}</InnerHtml>
    </Paragraph>
  ) : null;
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
  fraction: GarbageFractionInformationTransformed;
}

function GarbageFractionPanel({ fraction }: GarbageFractionPanelProps) {
  return (
    <article className={styles.GarbageFractionPanel}>
      <Heading
        level={3}
        size="level-4"
        className={styles.GarbageFractionPanelTitle}
      >
        <GarbageFractionIcon fractionCode={fraction.fractieCode} />
        {fraction.titel}
      </Heading>
      {!!fraction.kalendermelding && (
        <Paragraph className={styles.GarbageFractionPanelHighlight}>
          <InnerHtml el="span">{fraction.kalendermelding}</InnerHtml>
        </Paragraph>
      )}
      {(fraction.instructieCTA || fraction.instructie) && (
        <dl>
          <dt>Hoe</dt>
          <dd>
            <InstructionCTA fraction={fraction} />
          </dd>
        </dl>
      )}
      {!!fraction.ophaaldagen && (
        <dl>
          <dt>Ophaaldag</dt>
          <dd>{fraction.ophaaldagen}</dd>
        </dl>
      )}
      {!!fraction.buitenzetten && (
        <dl>
          <dt>Buitenzetten</dt>
          <dd>{fraction.buitenzetten}</dd>
        </dl>
      )}
      {!!fraction.waar && (
        <dl>
          <dt>Waar</dt>
          <dd>
            {typeof fraction.waar === 'object' ? (
              <Link href={fraction.waar.to} rel="noopener noreferrer">
                {fraction.waar.title}
              </Link>
            ) : (
              fraction.waar
            )}
          </dd>
        </dl>
      )}
      {!!fraction.opmerking && (
        <Paragraph>
          <InnerHtml el="span">{fraction.opmerking}</InnerHtml>
        </Paragraph>
      )}
    </article>
  );
}

interface GarbageFractionPanelsProps {
  fractions: GarbageFractionInformationTransformed[];
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

  const isApiReady = !isLoading(MY_LOCATION) && !isLoading(AFVAL);

  const heeftGeenWoonfunctie = AFVAL.content?.some(
    (fractionData) => !fractionData.gebruiksdoelWoonfunctie
  );
  const commercialLocation = MY_LOCATION.content?.find(
    (location) => location?.profileType === 'commercial'
  );
  const privateLocation = MY_LOCATION.content?.find(
    (location) => location?.profileType === 'private'
  );

  const privateIsCommercial =
    commercialLocation?.bagNummeraanduidingId ===
    privateLocation?.bagNummeraanduidingId;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {termReplace(ThemaTitles.AFVAL)}
        </PageHeadingV2>
        <PageContentCell spanWide={6}>
          {profileType === 'private' && (
            <>
              <Paragraph className="ams-mb--sm">
                Dit zijn de afvalregels voor uw adres.
              </Paragraph>
              {!!commercialLocation && !privateIsCommercial && (
                <ErrorAlert
                  title="Bedrijfsafval informatie"
                  severity="info"
                  className="ams-mb--sm"
                >
                  Let op deze regels gaan over uw woonadres.
                  <br />
                  Lees hier{' '}
                  <Link
                    href={ExternalUrls.AFVAL_COMMERCIAL}
                    rel="noopener noreferrer"
                  >
                    regels over bedrijfsafval in Amsterdam
                  </Link>
                  .
                </ErrorAlert>
              )}
              <LinkList>
                <LinkList.Link
                  href={ExternalUrls.AFVAL}
                  rel="noopener noreferrer"
                >
                  Meer informatie over regels voor afval en hergebruik
                </LinkList.Link>
                <LinkList.Link
                  href={ExternalUrls.AFVAL_MELDING}
                  rel="noopener noreferrer"
                >
                  Doe een melding als afval is blijven liggen
                </LinkList.Link>
              </LinkList>
            </>
          )}
          {profileType !== 'private' && (
            <>
              <Paragraph className="ams-mb--md">
                De afvalregels hieronder gelden alleen als u maximaal 9
                vuilniszakken afval per week heeft en reinigingsrecht betaalt.
                Of als u ondernemer bent in de 9 straatjes of Sluisbuurt en
                afvalstoffenheffing betaalt. Anders moet u een
                bedrijfsafvalcontract afsluiten bij een{' '}
                <Link
                  rel="noopener noreferrer"
                  href="https://www.afvalgids.nl/afval/inzamelaar/"
                >
                  erkende afvalinzamelaar
                </Link>{' '}
                of met{' '}
                <Link
                  rel="noopener noreferrer"
                  href="https://www.amsterdam.nl/afval-hergebruik/bedrijfsafval/bedrijfsafval-laten-ophalen/"
                >
                  de gemeente
                </Link>
                .
              </Paragraph>
              <LinkList>
                <LinkList.Link
                  href={ExternalUrls.AFVAL_COMMERCIAL}
                  rel="noopener noreferrer"
                >
                  Regels bedrijfsafval in Amsterdam
                </LinkList.Link>
                <LinkList.Link
                  href={ExternalUrls.AFVAL_MELDING}
                  rel="noopener noreferrer"
                >
                  Doe een melding als afval is blijven liggen
                </LinkList.Link>
              </LinkList>
            </>
          )}
          <MaintenanceNotifications page="afval" />
        </PageContentCell>
        {isError(AFVAL) && (
          <PageContentCell>
            <ErrorAlert>
              We kunnen op dit moment niet alle gegevens tonen
            </ErrorAlert>
          </PageContentCell>
        )}
        <PageContentCell>
          <GarbageInfoDetail
            label="Uw adres"
            valueWrapperElement="div"
            value={
              <>
                <Paragraph className="ams-mb--sm">
                  {MY_LOCATION.content?.[0]?.address ? (
                    getFullAddress(MY_LOCATION.content?.[0].address)
                  ) : isLoading(MY_LOCATION) ? (
                    <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
                  ) : (
                    'Onbekend adres'
                  )}
                </Paragraph>
                {/* NOTE: Edge case: Een (niet zakelijke) burger kan ingeschreven zijn op een pand zonder woonfunctie. */}
                {heeftGeenWoonfunctie && profileType === 'private' && (
                  <Paragraph>
                    <strong>Dit is geen woonadres.</strong> Klopt dit niet?{' '}
                    <Link
                      href="https://formulier.amsterdam.nl/thema/afval-grondstoffen/klopt-afvalwijzer/Reactie"
                      rel="noopener noreferrer"
                    >
                      Geef het door
                    </Link>
                    .
                  </Paragraph>
                )}
              </>
            }
          />

          {isApiReady && (
            <>
              {AFVAL.status === 'OK' && !!AFVAL.content?.length && (
                <GarbageFractionPanels fractions={AFVAL.content} />
              )}
              <Paragraph className="ams-mb--xl">
                <MaButtonLink
                  className={styles.ContactLink}
                  href={ExternalUrls.AFVAL_MELDING_FORMULIER}
                >
                  Klopt de informatie niet? Geef het door
                </MaButtonLink>
              </Paragraph>
              <Heading level={3} className="ams-mb--sm">
                Afvalcontainers in de buurt
              </Heading>
              <LinkList className="ams-mb--sm">
                <LinkList.Link
                  href={`${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]&zoom=14`}
                >
                  Kaart met containers in de buurt
                </LinkList.Link>
              </LinkList>
              <Heading level={3} className="ams-mb--sm">
                Adressen recyclepunten
              </Heading>
              <LinkList>
                {AFVALPUNTEN.content?.centers.map((item) => (
                  <LinkList.Link key={item.title} href={item.website}>
                    {item.title}
                    {item.distance !== 0 && (
                      <span className={styles.DistanceToHome}>
                        +/-{item.distance}KM
                      </span>
                    )}
                  </LinkList.Link>
                ))}
              </LinkList>
            </>
          )}
        </PageContentCell>
      </PageContentV2>
    </DetailPageV2>
  );
}
