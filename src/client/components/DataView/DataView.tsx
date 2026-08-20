import { DataViewList } from './DataViewList.tsx';
import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { TableV2 } from '../Table/TableV2.tsx';
import type { TableV2Props } from '../Table/TableV2.types.ts';

export function DataView<
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
        <DataViewList<T>
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
