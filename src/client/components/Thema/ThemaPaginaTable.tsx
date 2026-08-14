import type { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { LinkToListPage } from '../LinkToListPage/LinkToListPage.tsx';
import { PageContentCell } from '../Page/Page.tsx';
import { TableMobileView } from '../Table/TableMobileView.tsx';
import type { DisplayProps } from '../Table/TableV2.tsx';
import { TableV2 } from '../Table/TableV2.tsx';

const DISPLAY_PROPS_DEFAULT: DisplayProps<{ title: string }> = {
  title: 'Titel',
};
const TEXT_NO_CONTENT_DEFAULT = 'Er zijn (nog) geen zaken gevonden.';

interface ThemaPaginaTableProps<T> {
  className?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute?: string;
  maxItems?: number | -1;
  totalItems?: number;
  textNoContent?: string;
  contentAfterTheTitle?: ReactNode;
  title?: string;
  listPageLinkLabel?: string;
  listPageLinkTitle?: string;
  zaken: T[];
}

export function ThemaPaginaTable<
  T extends { title?: string; link?: LinkProps; themaId?: string } =
    ZaakAanvraagDetail,
>({
  title = '',
  contentAfterTheTitle = '',
  zaken,
  className,
  textNoContent,
  displayProps = DISPLAY_PROPS_DEFAULT,
  listPageRoute,
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  totalItems,
  listPageLinkLabel = 'Toon meer',
  listPageLinkTitle,
}: ThemaPaginaTableProps<T>) {
  const textNoContentDefault = title
    ? `U heeft (nog) geen ${title.toLowerCase()}`
    : TEXT_NO_CONTENT_DEFAULT;

  const isSmallScreen = useSmallScreen();
  const isMobileListEnabledInTheme =
    'enableMobileListView' in displayProps
      ? displayProps.enableMobileListView
      : false;

  const hasListPage = !!listPageRoute && maxItems !== -1;

  const zaken_ = hasListPage ? zaken.slice(0, maxItems) : zaken;

  return (
    <PageContentCell>
      {isSmallScreen && isMobileListEnabledInTheme ? (
        <TableMobileView<T>
          displayProps={displayProps}
          items={zaken_}
          caption={title}
          contentAfterTheCaption={contentAfterTheTitle}
          className={className}
        />
      ) : (
        <TableV2
          showTHead={!!zaken.length}
          caption={title}
          contentAfterTheCaption={contentAfterTheTitle}
          items={zaken_}
          displayProps={displayProps}
          className={className}
        />
      )}

      {!zaken.length && (
        <Paragraph>{textNoContent ?? textNoContentDefault}</Paragraph>
      )}

      {hasListPage && (
        <LinkToListPage
          threshold={maxItems}
          linkTitle={listPageLinkTitle ?? `Bekijk meer ${title.toLowerCase()}`}
          label={listPageLinkLabel}
          count={totalItems ?? zaken.length}
          route={listPageRoute}
        />
      )}
    </PageContentCell>
  );
}
