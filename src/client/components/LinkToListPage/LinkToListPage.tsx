import { generatePath } from 'react-router-dom';

import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { MaRouterLink } from '../MaLink/MaLink';

interface LinkToListPageProps {
  count: number;
  route: string;
  label?: string;
  params?: Record<string, any>;
  threshold?: number;
  translateX?: string;
}

export function LinkToListPage({
  label = 'Toon meer',
  threshold = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  count,
  route,
  params,
}: LinkToListPageProps) {
  const routeGenerated = generatePath(route, params);
  return count > threshold ? (
    <MaRouterLink maVariant="noDefaultUnderline" href={routeGenerated}>
      {label}
    </MaRouterLink>
  ) : null;
}
