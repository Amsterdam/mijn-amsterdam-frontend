import { useParams } from 'react-router-dom';

import { Themas } from '../../../universal/config/thema';
import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useAVGDetailPage() {
  const { AVG } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const themaLink = useThemaMenuItemByThemaID(Themas.AVG);

  const verzoek =
    AVG.content?.verzoeken?.find((verzoek) => verzoek.id === id) ?? null;

  return {
    verzoek,
    title: 'AVG verzoek',
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    themaPaginaBreadcrumb: themaLink,
  };
}
