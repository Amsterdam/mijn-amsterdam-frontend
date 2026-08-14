import { TableMobileView } from './TableMobileView.tsx';
import { TableV2 } from './TableV2.tsx';
import type { TableV2Props } from './TableV2.types.ts';
import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';

export function ResponsiveTable<
  T extends { title?: string; link?: LinkProps; themaId?: string } =
    ZaakAanvraagDetail,
>({
  displayProps,
  items,
  contentAfterTheCaption,
  caption,
  className,
}: TableV2Props<T>) {
  const isSmallScreen = useSmallScreen();
  const isMobileListEnabledInTheme =
    'enableMobileListView' in displayProps
      ? displayProps.enableMobileListView
      : false;

  return (
    <>
      {isSmallScreen && isMobileListEnabledInTheme ? (
        <TableMobileView<T>
          displayProps={displayProps}
          items={items}
          caption={caption}
          contentAfterTheCaption={contentAfterTheCaption}
          className={className}
        />
      ) : (
        <TableV2
          showTHead={!!items.length}
          caption={caption}
          contentAfterTheCaption={contentAfterTheCaption}
          items={items}
          displayProps={displayProps}
          className={className}
        />
      )}
    </>
  );
}
