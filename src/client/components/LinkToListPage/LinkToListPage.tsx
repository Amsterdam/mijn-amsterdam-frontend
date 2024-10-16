import { Button } from '@amsterdam/design-system-react';
import { generatePath, useHistory } from 'react-router-dom';

import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

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
  translateX = '-1.4rem',
}: LinkToListPageProps) {
  const history = useHistory();
  const routeGenerated = generatePath(route, params);
  return count > threshold ? (
    <Button
      variant="tertiary"
      style={
        translateX ? { transform: `translateX(${translateX})` } : undefined
      }
      onClick={(e) => {
        e.preventDefault();
        history.push(routeGenerated);
      }}
    >
      {label}
    </Button>
  ) : null;
}
