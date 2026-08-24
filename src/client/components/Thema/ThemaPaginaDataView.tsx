import type { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app.ts';
import { DataView } from '../DataView/DataView.tsx';
import { LinkToListPage } from '../LinkToListPage/LinkToListPage.tsx';
import { PageContentCell } from '../Page/Page.tsx';
import type { DisplayProps } from '../Table/TableV2.tsx';

const DISPLAY_PROPS_DEFAULT: DisplayProps<{ title: string }> = {
  title: 'Titel',
};
const TEXT_NO_CONTENT_DEFAULT = 'Er zijn (nog) geen zaken gevonden.';

interface ThemaPaginaDataViewProps<T> {
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

export function ThemaPaginaDataView<
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
}: ThemaPaginaDataViewProps<T>) {
  const textNoContentDefault = title
    ? `U heeft (nog) geen ${title.toLowerCase()}`
    : TEXT_NO_CONTENT_DEFAULT;

  const hasListPage = !!listPageRoute && maxItems !== -1;

  const zaken_ = hasListPage ? zaken.slice(0, maxItems) : zaken;

  return (
    <PageContentCell>
      <DataView
        items={zaken_}
        caption={title}
        contentAfterTheCaption={contentAfterTheTitle}
        displayProps={displayProps}
        className={className}
      />
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
