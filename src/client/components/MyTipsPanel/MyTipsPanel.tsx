import { useState } from 'react';

import { Grid } from '@amsterdam/design-system-react';

import type { MyNotification } from '../../../universal/types/App.types.ts';
import { themaConfig } from '../../apps/bob/pages/MyTips/MyTips-config.ts';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import { TipCard, tipCardColors } from '../TipCard/TipCard.tsx';

export interface MyTipsPanelProps {
  tips: MyNotification[];
}

export function MyTipsPanel({ tips }: MyTipsPanelProps) {
  const hasTips = tips && tips.length > 0;

  const [readTipIds, setReadTipIds] = useState<string[]>([]);

  const visibleTips =
    tips
      ?.map((tip, tipIndex) => ({
        tip,
        colorIndex: tipIndex % tipCardColors.length,
      }))
      .filter(({ tip }) => !readTipIds.includes(tip.id))
      .slice(0, 3) ?? [];

  const markAsRead = (tipId: string) => {
    setReadTipIds((currentIds) =>
      currentIds.includes(tipId) ? currentIds : [...currentIds, tipId]
    );

    // TODO: MIJN-12460: Actually mark the tip as read.
  };

  if (!themaConfig.featureToggle.enableNewTipsDesign || !hasTips) {
    return null;
  }

  return (
    <Grid.Subgrid as="ul" span="all" gapVertical="large">
      {visibleTips?.map(({ colorIndex, tip }) => (
        <Grid.Cell as="li" span={4} key={tip.id}>
          <TipCard
            backgroundColor={tipCardColors[colorIndex]}
            description={tip.description}
            heading={tip.title}
            link={tip.link}
            onRead={() => markAsRead(tip.id)}
            tipReason={tip.tipReason}
          />
        </Grid.Cell>
      ))}
      {visibleTips.length > 0 && (
        <Grid.Cell span="all">
          <MaRouterLink href="/alle-tips">Toon alle tips</MaRouterLink>
        </Grid.Cell>
      )}
    </Grid.Subgrid>
  );
}
