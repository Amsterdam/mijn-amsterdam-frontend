import type { ReactNode } from 'react';

import { LinkList, Grid, Paragraph } from '@amsterdam/design-system-react';

import { themaConfig } from './Profile-thema-config.ts';
import styles from './ProfileSectionPanel.module.scss';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { getRedactedClass } from '../../../helpers/cobrowse.ts';
import { useSmallScreen } from '../../../hooks/media.hook.ts';

export interface ActionLink {
  title: string;
  url: string;
  external?: boolean;
  className?: string;
}

export type Value = ReactNode;
export interface ProfileSectionData {
  [key: string]: Value;
}

type PanelProps = object;

export type PanelConfigFormatter<T, P> = (
  panelData: T,
  profileData: P
) => PanelProps;
export type PanelConfig<K extends string, T, P> = {
  [key in K]: PanelConfigFormatter<T, P>;
};

interface ProfileSectionActionLinksProps {
  actionLinks: ActionLink[];
}

function ProfileSectionActionLinks({
  actionLinks,
}: ProfileSectionActionLinksProps) {
  return (
    <LinkList className="ams-mb-m">
      {actionLinks.map((actionLink) => (
        <LinkList.Link
          key={actionLink.title}
          className={actionLink.className || ''}
          href={actionLink.url}
          rel="noopener noreferrer"
        >
          {actionLink.title}
        </LinkList.Link>
      ))}
    </LinkList>
  );
}

function getRows(sectionData: ProfileSectionData) {
  return Object.entries(sectionData).map(([key, value]) => {
    return {
      label: key,
      content: value,
      isVisible: !!value,
      classNameLabel: styles.Label,
      classNameContent: `${styles.Content} ${getRedactedClass(themaConfig.BRP.id, 'content')}`,
    };
  });
}

type ProfilePanelProps = {
  actionLinks?: ActionLink[];
  sectionData: ProfileSectionData | ProfileSectionData[];
  startCollapsed?: boolean;
  title?: string;
  contentAfterTheTitle?: string;
};

export function ProfileSectionPanel({
  sectionData,
  title,
  contentAfterTheTitle,
  actionLinks,
  startCollapsed = true,
}: ProfilePanelProps) {
  const sections = Array.isArray(sectionData) ? sectionData : [sectionData];
  const isPhoneScreen = useSmallScreen();
  return (
    <PageContentCell>
      <CollapsiblePanel title={title ?? ''} startCollapsed={startCollapsed}>
        {contentAfterTheTitle && (
          <Paragraph className="ams-mb-m">{contentAfterTheTitle}</Paragraph>
        )}
        <Grid className={styles.ProfileSectionPanelGrid}>
          <Grid.Cell start={1} span={{ narrow: 4, medium: 5, wide: 7 }}>
            {sections.map((sectionData, index) => (
              <Datalist
                key={index}
                rowVariant={isPhoneScreen ? 'vertical' : 'horizontal'}
                rows={getRows(sectionData)}
                className={styles.ProfileSection}
              />
            ))}
          </Grid.Cell>
          {!!actionLinks?.length && (
            <Grid.Cell
              start={{ narrow: 1, medium: 6, wide: 8 }}
              span={{ narrow: 4, medium: 3, wide: 5 }}
            >
              <ProfileSectionActionLinks actionLinks={actionLinks} />
            </Grid.Cell>
          )}
        </Grid>
      </CollapsiblePanel>
    </PageContentCell>
  );
}
