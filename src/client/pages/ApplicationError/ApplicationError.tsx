import { ReactNode, useEffect } from 'react';

import {
  PageFooter,
  Grid,
  Heading,
  Link,
  PageHeader,
  Page,
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
  useEffect(() => {
    document.title = 'Kritieke applicatie fout - Mijn Amsterdam';
  }, []);

  return (
    <>
      <PageContentCell startWide={1} spanWide={12}>
        <Heading level={1}>Kritieke applicatie fout</Heading>
      </PageContentCell>
      <PageContentCell>
        <Paragraph className="ams-mb-m">
          Excuses, er gaat iets mis. Probeer om de pagina opnieuw te laden. Lukt
          het dan nog niet? Probeer het dan later nog eens.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          Gebruikt u Google Translate?
          <br />
          Deze browser extensie veroorzaakt soms problemen, mogelijk werkt de
          pagina beter wanneer u deze extensie niet gebruikt.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          Als het probleem zich blijft voordoen maak melding bij “Uw mening” aan
          de rechter zijkant van deze pagina.
        </Paragraph>
        {error && (
          <Paragraph className="ams-mb-m">
            <strong>Fout:</strong> {error.toString()}
          </Paragraph>
        )}
        <Heading size="level-4" level={4}>
          Vragen over Mijn Amsterdam?
        </Heading>
        <Paragraph className="ams-mb-xl">
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
      <Page>
        <TextPageV2>
          <PageContentV2>
            <PageContentCell startWide={1} spanWide={12}>
              <PageHeader
                brandName="Mijn Amsterdam"
                logoLink="https://www.amsterdam.nl"
              />
            </PageContentCell>
            <ApplicationErrorContent error={error} />
          </PageContentV2>
        </TextPageV2>
      </Page>
      <PageFooter>
        <PageFooter.Spotlight>
          <Grid gapVertical="large" paddingVertical="large">
            <Grid.Cell span="all">
              <Heading level={3} color="inverse">
                Contact
              </Heading>
              <Paragraph color="inverse" className="ams-mb-m">
                Hebt u een vraag en kunt u het antwoord niet vinden op deze
                website? Neem dan contact met ons op.
              </Paragraph>
              <LinkList>
                <LinkList.Link
                  color="inverse"
                  href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Contactformulier.aspx"
                >
                  Contactformulier
                </LinkList.Link>
                <li>
                  <Paragraph color="inverse">
                    <strong>
                      Bel het telefoonnummer{' '}
                      <Link color="inverse" href="tel:14020">
                        14 020
                      </Link>
                    </strong>{' '}
                    maandag tot en met vrijdag van 08.00 tot 18.00 uur
                  </Paragraph>
                </li>
                <LinkList.Link
                  color="inverse"
                  href="https://www.amsterdam.nl/contact/"
                >
                  Contactgegevens en openingstijden
                </LinkList.Link>
              </LinkList>
            </Grid.Cell>
          </Grid>
        </PageFooter.Spotlight>
      </PageFooter>
    </>
  );
}
