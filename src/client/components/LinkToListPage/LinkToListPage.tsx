import { Button, Link } from '@amsterdam/design-system-react';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { generatePath, useHistory, useLocation } from 'react-router-dom';

interface LinkToListPageProps {
  label?: string;
  threshold?: number;
  count: number;
  route: string;
  params?: Record<string, any>;
}

export function LinkToListPage({
  label = 'Toon meer',
  threshold = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  count,
  route,
  params,
}: LinkToListPageProps) {
  const history = useHistory();
  const routeGenerated = generatePath(route, params);
  return count > threshold ? (
    <Button
      onClick={(e) => {
        e.preventDefault();
        history.push(routeGenerated);
      }}
      // href={routeGenerated}
    >
      {label}
    </Button>
  ) : null;
}
