import {
  Heading,
  Link,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';

import { links, themaTitle } from './Afval-thema-config';
import styles from './Afval.module.scss';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { getFullAddress } from '../../../../universal/helpers/brp';
import {
  AfvalFractionCode,
  AfvalFractionInformationTransformed,
} from '../../../../universal/types';
import {
  IconAfvalGft,
  IconAfvalGlas,
  IconAfvalGrofAfval,
  IconAfvalPapier,
  IconAfvalRest,
  IconAfvalTextiel,
} from '../../../assets/icons/map';
import ErrorAlert from '../../../components/Alert/Alert';
import { Datalist } from '../../../components/Datalist/Datalist';
import InnerHtml from '../../../components/InnerHtml/InnerHtml';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { MaintenanceNotifications } from '../../../components/MaintenanceNotifications/MaintenanceNotifications';
import { MaButtonLink } from '../../../components/MaLink/MaLink';
import { routeConfig as buurtRouteConfig } from '../../../components/MyArea/MyArea-thema-config';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../../components/Page/Page';
import { PageHeadingV2 } from '../../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useProfileTypeValue } from '../../../hooks/useProfileType';

interface InstructionCTAProps {
  fraction: AfvalFractionInformationTransformed;
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

interface AfvalFractionIconProps {
  fractionCode: AfvalFractionCode;
}

function AfvalFractionIcon({ fractionCode }: AfvalFractionIconProps) {
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
  return <span className={styles.AfvalFractionIcon}>{icon}</span>;
}

interface AfvalFractionPanelProps {
  fraction: AfvalFractionInformationTransformed;
}

function AfvalFractionPanel({ fraction }: AfvalFractionPanelProps) {
  return (
    <article className={styles.AfvalFractionPanel}>
      <Heading
        level={3}
        size="level-4"
        className={styles.AfvalFractionPanelTitle}
      >
        <AfvalFractionIcon fractionCode={fraction.fractieCode} />
        {fraction.titel}
      </Heading>
      {!!fraction.kalendermelding && (
        <Paragraph className={styles.AfvalFractionPanelHighlight}>
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
        <Paragraph className={styles.AfvalFractionPanelOpmerking}>
          <InnerHtml el="span">{fraction.opmerking}</InnerHtml>
        </Paragraph>
      )}
    </article>
  );
}

interface AfvalFractionPanelsProps {
  fractions: AfvalFractionInformationTransformed[];
}

const fractions1 = ['rest', 'ga', 'papier'];
const fractions2 = ['gft', 'glas', 'textiel'];

function AfvalFractionPanels({ fractions }: AfvalFractionPanelsProps) {
  const fractionsByCode = Object.fromEntries(
    fractions.map((fraction) => [fraction.fractieCode.toLowerCase(), fraction])
  );

  return (
    <>
      <PageContentCell
        start={{ wide: 1, medium: 1, narrow: 1 }}
        span={{ wide: 6, medium: 8, narrow: 4 }}
      >
        {fractions1
          .filter((fractionCode) => fractionCode in fractionsByCode)
          .map((fractionCode) => (
            <AfvalFractionPanel
              key={fractionCode}
              fraction={fractionsByCode[fractionCode]}
            />
          ))}
      </PageContentCell>
      <PageContentCell
        start={{ wide: 7, medium: 1, narrow: 1 }}
        span={{ wide: 6, medium: 1, narrow: 1 }}
      >
        {fractions2
          .filter((fractionCode) => fractionCode in fractionsByCode)
          .map((fractionCode) => (
            <AfvalFractionPanel
              key={fractionCode}
              fraction={fractionsByCode[fractionCode]}
            />
          ))}
      </PageContentCell>
    </>
  );
}

export function AfvalThemaPagina() {
  const { AFVAL, AFVALPUNTEN, MY_LOCATION } = useAppStateGetter();
  const profileType = useProfileTypeValue();

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
        <PageHeadingV2>{themaTitle}</PageHeadingV2>
        <PageContentCell spanWide={8}>
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
                  <Link href={links.AFVAL_COMMERCIAL} rel="noopener noreferrer">
                    regels over bedrijfsafval in Amsterdam
                  </Link>
                  .
                </ErrorAlert>
              )}
              <LinkList>
                <LinkList.Link href={links.AFVAL} rel="noopener noreferrer">
                  Meer informatie over regels voor afval en hergebruik
                </LinkList.Link>
                <LinkList.Link
                  href={links.AFVAL_MELDING}
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
                  href={links.AFVAL_COMMERCIAL}
                  rel="noopener noreferrer"
                >
                  Regels bedrijfsafval in Amsterdam
                </LinkList.Link>
                <LinkList.Link
                  href={links.AFVAL_MELDING}
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
          <Datalist
            rows={[
              {
                label: 'Uw adres',
                content: (
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
                      <Paragraph className="ams-mb--sm">
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
                ),
              },
            ]}
          />
        </PageContentCell>

        {isApiReady && (
          <>
            {AFVAL.status === 'OK' && !!AFVAL.content?.length && (
              <AfvalFractionPanels fractions={AFVAL.content} />
            )}
            <PageContentCell>
              <Paragraph className="ams-mb--xl">
                <MaButtonLink
                  className={styles.ContactLink}
                  href={links.AFVAL_MELDING_FORMULIER}
                >
                  Klopt de informatie niet? Geef het door
                </MaButtonLink>
              </Paragraph>
              <Heading level={3} className="ams-mb--sm">
                Afvalcontainers in de buurt
              </Heading>
              <LinkList className="ams-mb--sm">
                <LinkList.Link
                  href={`${buurtRouteConfig.themaPage.path}?datasetIds=["afvalcontainers"]&zoom=14`}
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
            </PageContentCell>
          </>
        )}
      </PageContentV2>
    </DetailPageV2>
  );
}
