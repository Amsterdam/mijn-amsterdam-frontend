import { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import { ZaakDetail } from '../../../universal/types/App.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { LinkToListPage } from '../LinkToListPage/LinkToListPage';
import { PageContentCell } from '../Page/Page';
import { DisplayProps, TableV2 } from '../Table/TableV2';

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
  subTitle?: ReactNode;
  title?: string;
  listPageLinkLabel?: string;
  listPageLinkTitle?: string;
  zaken: T[];
}

export default function ThemaPaginaTable<T extends object = ZaakDetail>({
  title = '',
  subTitle = '',
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

  const hasListPage = !!listPageRoute && maxItems !== -1;

  return (
    <PageContentCell>
      <TableV2
        showTHead={!!zaken.length}
        caption={title}
        subTitle={subTitle}
        items={hasListPage ? zaken.slice(0, maxItems) : zaken}
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
