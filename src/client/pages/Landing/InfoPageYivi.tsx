import { AppRoutes } from '../../../universal/config';
import {
  Heading,
  LinkdInline,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import styles from './Landing.module.scss';

export default function InfoPageYivi() {
  return (
    <TextPage>
      <PageHeading className={styles.Heading}>
        Melding openbare ruimte volgen via Mijn Amsterdam
      </PageHeading>
      <PageContent className={styles.LandingContent} id="skip-to-id-AppContent">
        <p>
          Vanaf 1 mei kunt u uw meldingen openbare ruimte ook volgen via Mijn
          Amsterdam, uw persoonlijke online pagina van de gemeente Amsterdam.
          Dit is een proef. Om uw meldingen te zien kunt u{' '}
          <LinkdInline href={AppRoutes.YIVI_LANDING}>
            inloggen met Yivi
          </LinkdInline>
          .
        </p>
        <Heading size="large" el="h2">
          Welke meldingen kan ik volgen?
        </Heading>
        <p>
          Tijdens de proefperiode is het mogelijk om uw meldingen van de
          afgelopen 12 maanden te volgen binnen Mijn Amsterdam. U kunt alleen
          meldingen volgen waarbij u aangeeft dat u op de hoogte wilt blijven en
          uw e-mailadres opgeeft. Het e-mailadres bij uw melding moet hetzelfde
          zijn als het e-mailadres dat u deelt tijdens het inloggen met Yivi.
          Lees hieronder hoe het werkt.
        </p>
        <Heading size="medium" el="h3">
          Hoe werkt het?
        </Heading>
        <p>
          U kunt uw meldingen over de openbare ruimte volgen als u inlogt met
          Yivi. Met Yivi kunt u bewijzen dat u toegang heeft tot het e-mailadres
          dat u heeft opgegeven tijdens het doen van een melding.
        </p>
        <p>Als u nog geen Yivi hebt:</p>
        <ol>
          <li>
            <LinkdInline external href="https://yivi.app">
              Download Yivi
            </LinkdInline>
            .
          </li>
          <li>
            Kies een pincode en vul desgewenst uw e-mailadres in als
            beveiliging.
          </li>
          <li>
            Zodra u bent ingelogd: Voeg uw e-mailadres toe (het e-mailadres dat
            u opgeeft bij het doen van een melding).
          </li>
        </ol>
        <p>Meldingen volgen via Mijn Amsterdam:.</p>
        <ol>
          <li>
            Ga naar{' '}
            <LinkdInline href={AppRoutes.YIVI_LANDING}>
              inloggen met Yivi
            </LinkdInline>
            .
          </li>
          <li>
            Deel uw e-mailadres met de Yivi-app. Deel het e-mailadres dat u bij
            uw melding(en) gebruikt.
          </li>
          <li>
            Als u bent ingelogd, ziet u uw meldingen en de laatste updates.
          </li>
        </ol>
        <Heading size="medium" el="h3">
          Wat is Yivi?
        </Heading>
        <p>
          Yivi is een app waarmee u kunt bewijzen wie u bent, zonder dat u
          onnodige gegevens over u zelf deelt. U ziet altijd wat een organisatie
          van u wil weten. U hebt dus controle over uw gegevens.
          <LinkdInline
            external
            href="https://www.amsterdam.nl/innovatie/digitalisering-technologie/digitalisering/yivi-nieuwe-manier-inloggen/"
          >
            Meer informatie leest u op Yivi: een nieuwe manier van inloggen
          </LinkdInline>
          .
        </p>
        <Heading size="medium" el="h4">
          Na de proefperiode
        </Heading>
        <p>
          De proef loopt tot en met september 2023. Mede op basis van uw mening
          bepaalt de gemeente of we de proefperiode verlengen en/of Yivi op meer
          plekken aanbieden.
        </p>
        <Heading size="medium" el="h4">
          Waarom deze proef
        </Heading>
        <p>
          De gemeente doet deze proef om Amsterdammers kennis te laten maken met
          een digitale identiteit. De gemeente kiest voor Yivi omdat deze app de
          uitgangspunten van de gemeente ondersteunt: Privacy by design, regie
          op eigen gegevens (decentraal opslaan van gegevens), open source,
          dataminimalisatie en alleen data delen die nodig is.
        </p>
        <Heading size="medium" el="h4">
          Geef uw mening
        </Heading>
        <p>
          Geef uw mening via de knop ‘Uw mening’ die u rechts in beeld ziet. Wij
          zijn benieuwd naar uw mening om met Yivi uw meldingen openbare ruimte
          op Mijn Amsterdam te volgen.
        </p>
      </PageContent>
    </TextPage>
  );
}
