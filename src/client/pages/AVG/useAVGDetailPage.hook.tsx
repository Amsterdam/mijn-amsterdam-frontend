import { generatePath, useParams } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useAVGDetailPage() {
  const { AVG } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const verzoek =
    AVG.content?.verzoeken?.find((verzoek) => verzoek.id === id) ?? null;

  const backLink = generatePath(AppRoutes.AVG, {
    page: 1,
  });

  return {
    verzoek,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    backLink,
  };
}
