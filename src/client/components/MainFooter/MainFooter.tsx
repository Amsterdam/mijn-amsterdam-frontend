import { useEffect } from 'react';

import {
  Grid,
  Heading,
  LinkList,
  PageFooter,
} from '@amsterdam/design-system-react';
import useSWR from 'swr';

import { CobrowseFooter } from './CobrowseFooter/CobrowseFooter';
import styles from './MainFooter.module.scss';
import type {
  CMSFooter,
  CMSFooterSection,
} from '../../../server/services/cms/cms-content';
import type { ApiResponse } from '../../../universal/helpers/api';
import { BFF_API_BASE_URL } from '../../config/api';
import { getFooterItem } from '../../pages/Thema/Erfpacht/Erfpacht-render-config';

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

export function MainFooter({ relatieCode }: { relatieCode?: string }) {
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

  useEffect(() => {
    if (relatieCode) {
      const footerItem = getFooterItem(relatieCode);
      footer?.content?.sections[0].links.push(footerItem);
    }
  }, [footer, relatieCode]);

  return (
    <PageFooter className={styles.MainFooter}>
      <PageFooter.Spotlight>
        <Grid gapVertical="large" paddingVertical="large">
          {footer?.content?.sections.map((footerItem) => (
            <FooterBlock key={footerItem.title} {...footerItem} />
          ))}
        </Grid>
      </PageFooter.Spotlight>

      <PageFooter.Menu>
        {footer?.content?.bottomLinks.map((link) => {
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
