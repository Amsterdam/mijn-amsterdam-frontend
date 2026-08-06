import { generatePath } from 'react-router';

import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app.ts';
import { MaRouterLink, type MaClassNameVariant } from '../MaLink/MaLink.tsx';

interface LinkToListPageProps {
  count: number;
  route: string;
  label?: string;
  linkTitle?: string;
  params?: Record<string, string>;
  threshold?: number;
  translateX?: string;
  maVariant?: MaClassNameVariant;
}

export function LinkToListPage({
  label = 'Toon meer',
  linkTitle,
  threshold = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  count,
  route,
  params,
  maVariant = 'noDefaultUnderline',
}: LinkToListPageProps) {
  const routeGenerated = generatePath(route, params);
  return count > threshold ? (
    <MaRouterLink title={linkTitle} maVariant={maVariant} href={routeGenerated}>
      {label}
    </MaRouterLink>
  ) : null;
}
