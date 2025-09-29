import {
  Grid,
  Heading,
  LinkList,
  PageFooter,
} from '@amsterdam/design-system-react';
import useSWR from 'swr';

import { CobrowseFooter, hulpLabel } from './CobrowseFooter/CobrowseFooter';
import styles from './MainFooter.module.scss';
import type {
  CMSFooter,
  CMSFooterSection,
} from '../../../server/services/cms/cms-content';
import type { ApiResponse } from '../../../universal/helpers/api';
import { BFF_API_BASE_URL } from '../../config/api';
import { useCanonmatigingFooterLink } from '../../pages/Thema/Erfpacht/Erfpacht-render-config';
import { featureToggle } from '../../pages/Thema/Erfpacht/Erfpacht-thema-config';

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
      <Heading color="inverse" level={4} className="ams-mb-s">
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

export function MainFooter() {
  const { data: footer } = useSWR<ApiResponse<CMSFooter>>(
    `${BFF_API_BASE_URL}/services/cms/footer`,
    async (url) => {
      const response = await fetch(url);
      const responseData: ApiResponse<CMSFooter> = await response.json();
      if (!response.ok || responseData.status !== 'OK') {
        throw new Error('Failed to fetch footer data');
      }
      return responseData;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const canonmatigingLink = useCanonmatigingFooterLink();

  const customLinks =
    featureToggle.canonmatigingLinkActive && canonmatigingLink
      ? [canonmatigingLink]
      : [];

  const customSections = useCustomFooterSections(
    footer?.content?.sections || [],
    (_section, index) => index === 0,
    customLinks
  );

  return (
    <PageFooter className={styles.MainFooter}>
      <PageFooter.Spotlight>
        <Grid gapVertical="large" paddingVertical="large">
          {customSections.map((footerItem) => (
            <FooterBlock key={footerItem.title} {...footerItem} />
          ))}
        </Grid>
      </PageFooter.Spotlight>

      <PageFooter.Menu>
        {footer?.content?.bottomLinks
          .filter(
            (link) =>
              typeof link.label === 'string' &&
              link.label.toLowerCase() !== hulpLabel.toLowerCase()
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
