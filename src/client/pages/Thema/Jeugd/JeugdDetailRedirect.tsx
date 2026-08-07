import { generatePath, Navigate, useParams } from 'react-router';
import slug from 'slugme';

import { useJeugdThemaData } from './useJeugdThemaData.ts';
import type { LeerlingenvervoerVoorzieningFrontend } from '../../../../server/services/jzd/jeugd/jeugd.ts';
import { NotFound } from '../../NotFound/NotFound.tsx';

export function JeugdDetailRedirect() {
  const { voorzieningen, themaConfig } = useJeugdThemaData();
  const { id } = useParams<{
    id: LeerlingenvervoerVoorzieningFrontend['id'];
  }>();
  const voorziening = voorzieningen.find((item) => item.id === id);

  if (!voorziening) {
    return <NotFound />;
  }

  const path = generatePath(themaConfig.detailPage.route.path, {
    voorziening: slug(voorziening.title),
    id: voorziening.id,
  });

  return <Navigate to={path} />;
}
