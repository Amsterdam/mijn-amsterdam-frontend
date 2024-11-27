import { Link } from '@amsterdam/design-system-react';
import { Button } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { parse } from 'html-to-ast';

import styles from './GarbageInformation.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { getFullAddress, isMokum } from '../../../universal/helpers/brp';
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
  DetailPage,
  ErrorAlert,
  InfoDetail,
  InnerHtml,
  LoadingContent,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { ButtonBody, buttonStyle } from '../../components/Button/Button';
import { InfoDetailProps } from '../../components/InfoDetail/InfoDetail';
import { MaLink } from '../../components/MaLink/MaLink';
import { ExternalUrls } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { transformAstToReact } from '../../helpers/ast-to-react';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';

function GarbageInfoDetail({ ...props }: InfoDetailProps) {
  return <InfoDetail {...props} className={styles.GarbageInfoDetail} />;
}

interface InstructionCTAProps {
  fraction: GarbageFractionInformationTransformed;
}

function ButtonLink({
  children,
  href,
  external,
}: {
  children: React.ReactNode;
  href: string;
  external: boolean;
}) {
  const relProp = external ? { rel: 'external noopener noreferrer' } : null;
  return (
    <a
      className={buttonStyle({
        variant: 'secondary',
        className: classNames(styles.ProfileLink, styles.LogoutLink),
      })}
      href={href}
      {...relProp}
    >
      <ButtonBody>{children}</ButtonBody>
    </a>
  );
}

function InstructionCTA({ fraction }: InstructionCTAProps) {
  if (fraction.instructieCTA) {
    return (
      <>
        <p>
          <ButtonLink
            href={fraction.instructieCTA.to}
            external={!fraction.instructieCTA.to.startsWith(AppRoutes.BUURT)}
          >
            {fraction.instructieCTA.title}
          </ButtonLink>
        </p>
        {fraction.instructie ? (
          <>
            <InnerHtml el="p">{fraction.instructie}</InnerHtml>
          </>
        ) : null}
      </>
    );
  }
  return fraction.instructie ? (
    <InnerHtml el="p">{fraction.instructie}</InnerHtml>
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
  const astOpmerking = parse(fraction.opmerking ?? '');

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
            {typeof fraction.waar === 'object' && (
              <MaLink
                href={fraction.waar.to}
                isExternal={!fraction.waar.to.startsWith(AppRoutes.BUURT)}
              >
                {fraction.waar.title}
              </MaLink>
            )}
          </dd>
        </dl>
      )}
      {!!fraction.opmerking && (
        <div className={styles.GarbageFractionPanelOpmerking}>
          {transformAstToReact('opmerking', astOpmerking)}
        </div>
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
  const { AFVAL, AFVALPUNTEN, MY_LOCATION, BRP, KVK } = useAppStateGetter();
  const profileType = useProfileTypeValue();
  const termReplace = useTermReplacement();
  const address = MY_LOCATION.content?.[0]?.address;
  const inMokum =
    profileType === 'private' ? isMokum(BRP.content) : isMokum(KVK.content);
  const isWeesp = address?.woonplaatsNaam === 'Weesp';
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
    <DetailPage>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ThemaIcon />}
      >
        {termReplace(ThemaTitles.AFVAL)}
      </PageHeading>
      <PageContent>
        {profileType === 'private' && (
          <>
            <p>Dit zijn de afvalregels voor uw adres.</p>
            {!!commercialLocation && !privateIsCommercial && (
              <ErrorAlert title="Bedrijfsafval informatie" severity="info">
                Let op deze regels gaan over uw woonadres. Lees hier{' '}
                <Link variant="inline" href={ExternalUrls.AFVAL_COMMERCIAL}>
                  regels over bedrijfsafval in Amsterdam
                </Link>
                .
              </ErrorAlert>
            )}
            <p>
              <Link href={ExternalUrls.AFVAL}>
                Meer informatie over regels voor afval en hergebruik
              </Link>
              <br />
              <Link href={ExternalUrls.AFVAL_MELDING}>
                Doe een melding als afval is blijven liggen
              </Link>
            </p>
          </>
        )}
        {profileType !== 'private' && (
          <>
            <p>
              De afvalregels hieronder gelden alleen als u maximaal 9
              vuilniszakken afval per week heeft en reinigingsrecht betaalt. Of
              als u ondernemer bent in de 9 straatjes of Sluisbuurt en
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
            </p>
            <p>
              <Link href={ExternalUrls.AFVAL_COMMERCIAL}>
                Regels bedrijfsafval in Amsterdam
              </Link>
              <br />
              <Link href={ExternalUrls.AFVAL_MELDING}>
                Doe een melding als afval is blijven liggen
              </Link>
            </p>
          </>
        )}
        <MaintenanceNotifications page="afval" />
        {isError(AFVAL) && (
          <ErrorAlert>
            We kunnen op dit moment niet alle gegevens tonen
          </ErrorAlert>
        )}

        <GarbageInfoDetail
          label="Uw adres"
          valueWrapperElement="div"
          value={
            <>
              <p className={styles.AdresWeergave}>
                {MY_LOCATION.content?.[0]?.address ? (
                  getFullAddress(MY_LOCATION.content?.[0].address)
                ) : isLoading(MY_LOCATION) ? (
                  <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
                ) : (
                  'Onbekend adres'
                )}
              </p>
              {/* NOTE: Edge case: Een (niet zakelijke) burger kan ingeschreven zijn op een pand zonder woonfunctie. */}
              {heeftGeenWoonfunctie && (
                <p className={styles.WoonFunctieWaarschuwing}>
                  <strong>Dit is geen woonadres.</strong> Klopt dit niet?{' '}
                  <Link
                    variant="inline"
                    href="https://formulier.amsterdam.nl/thema/afval-grondstoffen/klopt-afvalwijzer/Reactie"
                  >
                    Geef het door
                  </Link>
                  .
                </p>
              )}
            </>
          }
        />
        {isApiReady && isWeesp && (
          <p className={styles.WeespWarning}>
            In Weesp haalt de GAD het afval op. Kijk op de{' '}
            <a href="https://www.gad.nl/">website van de GAD</a> hoe dat werkt.
          </p>
        )}
        {isApiReady && inMokum && (
          <>
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
              <Link
                href={`${AppRoutes.BUURT}?datasetIds=["afvalcontainers"]&zoom=14`}
              >
                Kaart met containers in de buurt
              </Link>
            </p>
            <h3>Adressen recyclepunten</h3>
            <ul className={styles.UnstyledList}>
              {AFVALPUNTEN.content?.centers.map((item) => (
                <li key={item.title}>
                  <Link href={item.website}>
                    {item.title}
                    {item.distance !== 0 && (
                      <span className={styles.DistanceToHome}>
                        +/-{item.distance}KM
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </PageContent>
    </DetailPage>
  );
}
