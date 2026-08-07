import { generatePath, Navigate, useParams } from 'react-router';
import slug from 'slugme';

import { useHliThemaData } from './useHliThemaData.ts';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types.ts';
import { NotFound } from '../../NotFound/NotFound.tsx';

export function HLIRegelingenDetailRedirect() {
  const { regelingen, themaConfig } = useHliThemaData();
  const { id } = useParams<{
    id: HLIRegelingFrontend['id'];
  }>();
  const regeling = regelingen.find((item) => item.id === id);

  if (!regeling) {
    return <NotFound />;
  }

  const path = generatePath(themaConfig.detailPageRegeling.route.path, {
    regeling: slug(regeling.title),
    id: regeling.id,
  });

  return <Navigate to={path} />;
}
