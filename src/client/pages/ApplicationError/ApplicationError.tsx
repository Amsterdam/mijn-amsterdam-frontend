import { ReactNode } from 'react';

import {
  Footer,
  Grid,
  Header,
  Heading,
  Link,
  Screen,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';
import type { FallbackProps } from 'react-error-boundary';

import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { useUsabilla } from '../../hooks/useUsabilla';

function ApplicationErrorContent({ error }: { error?: Error }) {
  return (
    <>
      <PageContentCell startWide={1} spanWide={12}>
        <Heading level={1}>Kritieke applicatie fout</Heading>
      </PageContentCell>
      <PageContentCell>
        <Paragraph className="ams-mb--sm">
          Excuses, er gaat iets mis. Probeer om de pagina opnieuw te laden. Lukt
          het dan nog niet? Probeer het dan later nog eens.
        </Paragraph>
        <Paragraph className="ams-mb--sm">
          Gebruikt u Google Translate?
          <br />
          Deze browser extensie veroorzaakt soms problemen, mogelijk werkt de
          pagina beter wanneer u deze extensie niet gebruikt.
        </Paragraph>
        <Paragraph className="ams-mb--sm">
          Als het probleem zich blijft voordoen maak melding bij “Uw mening” aan
          de rechter zijkant van deze pagina.
        </Paragraph>
        {error && (
          <Paragraph className="ams-mb--sm">
            <strong>Fout:</strong> {error.toString()}
          </Paragraph>
        )}
        <Heading size="level-4" level={4}>
          Vragen over Mijn Amsterdam?
        </Heading>
        <Paragraph className="ams-mb--xl">
          Kijk bij{' '}
          <Link
            href="https://www.amsterdam.nl/veelgevraagd/mijn-amsterdam-b5077"
            rel="noopener noreferrer"
          >
            veelgestelde vragen over Mijn Amsterdam
          </Link>
        </Paragraph>
      </PageContentCell>
    </>
  );
}

export function ApplicationError({
  error,
  children,
}: FallbackProps & { children?: ReactNode }) {
  useUsabilla();
  return (
    <>
      <Screen>
        <TextPageV2>
          <PageContentV2>
            <PageContentCell startWide={1} spanWide={12}>
              <Header
                brandName={
                  (
                    <a
                      href="/"
                      style={{ color: '#000', textDecoration: 'none' }}
                    >
                      Mijn Amsterdam
                    </a>
                  ) as ReactNode as string
                }
                logoLink="https://www.amsterdam.nl"
              />
            </PageContentCell>
            <ApplicationErrorContent error={error} />
          </PageContentV2>
        </TextPageV2>
      </Screen>
      <Footer>
        <Footer.Top>
          <Grid gapVertical="large" paddingVertical="medium">
            <Grid.Cell span="all">
              <Heading level={3} inverseColor>
                Contact
              </Heading>
              <Paragraph inverseColor className="ams-mb--sm">
                Hebt u een vraag en kunt u het antwoord niet vinden op deze
                website? Neem dan contact met ons op.
              </Paragraph>
              <LinkList>
                <LinkList.Link
                  inverseColor
                  href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx"
                >
                  Contactformulier
                </LinkList.Link>
                <li>
                  <Paragraph inverseColor>
                    <strong>
                      Bel het telefoonnummer{' '}
                      <Link inverseColor href="tel:14020">
                        14 020
                      </Link>
                    </strong>{' '}
                    maandag tot en met vrijdag van 08.00 tot 18.00 uur
                  </Paragraph>
                </li>
                <LinkList.Link
                  inverseColor
                  href="https://www.amsterdam.nl/contact/"
                >
                  Contactgegevens en openingstijden
                </LinkList.Link>
              </LinkList>
            </Grid.Cell>
          </Grid>
        </Footer.Top>
        <Footer.Bottom>
          <Grid paddingVertical="small">
            <Grid.Cell span="all"></Grid.Cell>
          </Grid>
        </Footer.Bottom>
      </Footer>
    </>
  );
}
