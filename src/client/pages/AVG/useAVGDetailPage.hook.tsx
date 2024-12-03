import { useParams } from 'react-router-dom';

import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useAVGDetailPage() {
  const { AVG } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const verzoek =
    AVG.content?.verzoeken?.find((verzoek) => verzoek.id === id) ?? null;

  return {
    verzoek,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
  };
}
