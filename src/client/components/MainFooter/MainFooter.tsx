import {
  Grid,
  Heading,
  LinkList,
  PageFooter,
} from '@amsterdam/design-system-react';

import type {
  Footer,
  FooterLink,
  FooterSection,
} from '../../../server/services/footer/footer.ts';
import { useCanonmatigingFooterLink } from '../../apps/bob/pages/Thema/Erfpacht/Erfpacht-render-config.tsx';
import { themaConfig } from '../../apps/bob/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import { BFF_API_BASE_URL } from '../../apps/config.ts';
import { useBffApi } from '../../hooks/api/useBffApi.ts';
import { CobrowseFooter } from './CobrowseFooter/CobrowseFooter.tsx';

type FooterBlockProps = Omit<FooterSection, 'title'> & { title?: string };

function addLinksToFirstSection(
  sections: FooterSection[],
  customLinks: FooterLink[]
): FooterBlockProps[] {
  if (!sections.length) {
    return customLinks.length ? [{ links: customLinks }] : [];
  }
  return sections.map((section, index) =>
    index === 0
      ? { ...section, links: [...section.links, ...customLinks] }
      : section
  );
}

function FooterBlock({ title, links }: FooterBlockProps) {
  return (
    <Grid.Cell span={4} className="ams-prose">
      {title && (
        <Heading color="inverse" level={2} size="level-3">
          {title}
        </Heading>
      )}
      {!!links.length && (
        <LinkList>
          {links.map((link) => (
            <LinkList.Link key={link.url} color="inverse" href={link.url}>
              {link.label}
            </LinkList.Link>
          ))}
        </LinkList>
      )}
    </Grid.Cell>
  );
}

export function MainFooter({ id }: { id?: string }) {
  const { data } = useBffApi<Footer>(`${BFF_API_BASE_URL}/services/footer`);

  const canonmatigingLink = useCanonmatigingFooterLink();

  const customLinks =
    themaConfig.featureToggle.canonmatigingLinkActive && canonmatigingLink
      ? [canonmatigingLink]
      : [];

  const sections = addLinksToFirstSection(
    data?.content?.sections ?? [],
    customLinks
  );
  const bottomLinks = data?.content?.bottomLinks ?? [];

  return (
    <PageFooter id={id}>
      {!!sections.length && (
        <PageFooter.Spotlight>
          <Grid paddingVertical="x-large">
            {sections.map((section, index) => (
              <FooterBlock key={section.title ?? index} {...section} />
            ))}
          </Grid>
        </PageFooter.Spotlight>
      )}

      <PageFooter.Menu>
        {bottomLinks.map((link) => (
          <PageFooter.MenuLink key={link.label} href={link.url}>
            {link.label}
          </PageFooter.MenuLink>
        ))}
        <CobrowseFooter />
      </PageFooter.Menu>
    </PageFooter>
  );
}
