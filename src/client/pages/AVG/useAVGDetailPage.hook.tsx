import { generatePath, useParams } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { LinkProps } from '../../../universal/types';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useAVGDetailPage() {
  const { AVG } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const verzoek =
    AVG.content?.verzoeken?.find((verzoek) => verzoek.id === id) ?? null;

  const backLink: LinkProps = {
    to: generatePath(AppRoutes.AVG, {
      page: 1,
    }),
    title: ThemaTitles.AVG,
  };

  return {
    verzoek,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    backLink,
  };
}
