import {
  Grid,
  Heading,
  LinkList,
  PageFooter,
} from '@amsterdam/design-system-react';

import {
  CobrowseFooter,
  LABEL_HULP_SCHERMDELEN,
} from './CobrowseFooter/CobrowseFooter';
import styles from './MainFooter.module.scss';
import type {
  CMSFooter,
  CMSFooterSection,
} from '../../../server/services/cms/cms-content';
import { BFF_API_BASE_URL } from '../../config/api';
import { useBffApi } from '../../hooks/api/useBffApi';
import { useCanonmatigingFooterLink } from '../../pages/Thema/Erfpacht/Erfpacht-render-config';
import { themaConfig } from '../../pages/Thema/Erfpacht/Erfpacht-thema-config';

function useCustomFooterSections(
  sections: CMSFooterSection[],
  sectionFinder: (section: CMSFooterSection, index: number) => boolean,
  customLinks: CMSFooterSection['links']
) {
  return sections.map((section, index) => {
    return {
      ...section,
      links: sectionFinder(section, index)
        ? [...section.links, ...customLinks]
        : section.links,
    };
  });
}

function FooterBlock({ title, links }: CMSFooterSection) {
  return (
    <Grid.Cell key={title} span={4}>
      <Heading color="inverse" level={3} className="ams-mb-s">
        {title}
      </Heading>
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
  const { data } = useBffApi<CMSFooter>(
    `${BFF_API_BASE_URL}/services/cms/footer`
  );

  const canonmatigingLink = useCanonmatigingFooterLink();

  const customLinks =
    themaConfig.featureToggle.canonmatigingLinkActive && canonmatigingLink
      ? [canonmatigingLink]
      : [];

  const customSections = useCustomFooterSections(
    data?.content?.sections || [],
    (_section, index) => index === 0,
    customLinks
  );

  return (
    <PageFooter id={id} className={styles.MainFooter}>
      <PageFooter.Spotlight>
        <Grid gapVertical="large" paddingVertical="large">
          {customSections.map((footerItem) => (
            <FooterBlock key={footerItem.title} {...footerItem} />
          ))}
        </Grid>
      </PageFooter.Spotlight>

      <PageFooter.Menu>
        {data?.content?.bottomLinks
          .filter(
            (link) =>
              typeof link.label === 'string' &&
              link.label.toLowerCase() !== LABEL_HULP_SCHERMDELEN.toLowerCase()
          )
          .map((link) => {
            return (
              <PageFooter.MenuLink key={link.label} href={link.url}>
                {link.label}
              </PageFooter.MenuLink>
            );
          })}
        <CobrowseFooter />
      </PageFooter.Menu>
    </PageFooter>
  );
}
