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

import { PageContentCell, PageV2 } from '../../components/Page/Page';
import { useUsabilla } from '../../hooks/useUsabilla';

function ApplicationErrorContent({ error }: { error?: Error }) {
  useEffect(() => {
    document.title = 'Kritieke applicatie fout - Mijn Amsterdam';
  }, []);

  return (
    <PageV2 heading="Kritieke applicatie fout" showBreadcrumbs={false}>
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
        <Heading level={4}>Vragen over Mijn Amsterdam?</Heading>
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
    </PageV2>
  );
}

export function ApplicationError({
  error,
}: FallbackProps & { children?: ReactNode }) {
  useUsabilla();
  return (
    <>
      <Page>
        <PageHeader
          brandName="Mijn Amsterdam"
          logoLink="https://mijn.amsterdam.nl"
        />
        <ApplicationErrorContent error={error} />
      </Page>
      <PageFooter>
        <PageFooter.Spotlight>
          <Grid gapVertical="large" paddingVertical="large">
            <Grid.Cell span="all">
              <Heading level={3} color="inverse">
                Contact
              </Heading>
              <Paragraph color="inverse" className="ams-mb-m">
                Heeft u een vraag en kunt u het antwoord niet vinden op deze
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
