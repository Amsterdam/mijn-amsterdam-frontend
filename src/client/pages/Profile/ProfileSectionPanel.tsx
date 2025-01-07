import { LinkList, Grid } from '@amsterdam/design-system-react';

import { ProfileSection } from './formatDataPrivate';
import styles from './Profile.module.scss';
import { PanelConfigFormatter } from './profilePanelConfig';
import { AppState } from '../../../universal/types';
import { CollapsiblePanel } from '../../components/CollapsiblePanel/CollapsiblePanel';
import { Datalist } from '../../components/Datalist/Datalist';
import { ActionLink } from '../../components/InfoPanel/InfoPanel';

export function formatInfoPanelConfig(
  panelConfig: PanelConfigFormatter,
  BRP: AppState['BRP']
) {
  if (typeof panelConfig === 'function') {
    return panelConfig(BRP);
  }
  return panelConfig;
}

interface InfoPanelActionLinksProps {
  actionLinks: ActionLink[];
}

function InfoPanelActionLinks({ actionLinks }: InfoPanelActionLinksProps) {
  return (
    <LinkList>
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

function getRows(sectionData: ProfileSection) {
  return Object.entries(sectionData).map(([key, value]) => {
    return {
      label: key,
      content: value,
      isVisible: !!value,
    };
  });
}

type ProfilePanelProps = {
  actionLinks?: ActionLink[];
  sectionData: ProfileSection | ProfileSection[];
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

  return (
    <Grid.Cell span="all">
      <CollapsiblePanel title={title ?? ''} startCollapsed={startCollapsed}>
        <Grid className={styles.ProfileSectionPanelGrid}>
          <Grid.Cell start={1} span={{ narrow: 4, medium: 5, wide: 7 }}>
            {sections.map((sectionData, index) => (
              <Datalist
                key={index}
                rowVariant="horizontal"
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
              <InfoPanelActionLinks actionLinks={actionLinks} />
            </Grid.Cell>
          )}
        </Grid>
      </CollapsiblePanel>
    </Grid.Cell>
  );
}
