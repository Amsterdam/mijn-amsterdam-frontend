import { ReactNode } from 'react';

import { LinkList, Grid } from '@amsterdam/design-system-react';

import styles from './ProfileSectionPanel.module.scss';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import { Datalist } from '../../components/Datalist/Datalist';
import { PageContentCell } from '../../components/Page/Page';
import { usePhoneScreen } from '../../hooks/media.hook';

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

export type PanelConfigFormatter<T> = (panelData: T) => PanelProps;
export type PanelConfig<K extends string, T> = {
  [key in K]: PanelConfigFormatter<T>;
};

interface ProfileSectionActionLinksProps {
  actionLinks: ActionLink[];
}

function ProfileSectionActionLinks({
  actionLinks,
}: ProfileSectionActionLinksProps) {
  return (
    <LinkList className="ams-mb--sm">
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
      classNameContent: styles.Content,
    };
  });
}

type ProfilePanelProps = {
  actionLinks?: ActionLink[];
  sectionData: ProfileSectionData | ProfileSectionData[];
  startCollapsed?: boolean;
  title?: string;
};

export function ProfileSectionPanel({
  sectionData,
  title,
  actionLinks,
  startCollapsed = true,
}: ProfilePanelProps) {
  const sections = Array.isArray(sectionData) ? sectionData : [sectionData];
  const isPhoneScreen = usePhoneScreen();
  return (
    <PageContentCell>
      <CollapsiblePanel title={title ?? ''} startCollapsed={startCollapsed}>
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
