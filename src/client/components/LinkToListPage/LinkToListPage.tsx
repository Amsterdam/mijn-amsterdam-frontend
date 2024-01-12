import { Button, Link } from '@amsterdam/design-system-react';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { generatePath, useHistory } from 'react-router-dom';

interface LinkToListPageProps {
  count: number;
  route: string;
  label?: string;
  params?: Record<string, any>;
  threshold?: number;
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
      variant="tertiary"
      onClick={(e) => {
        e.preventDefault();
        history.push(routeGenerated);
      }}
    >
      {label}
    </Button>
  ) : null;
}
