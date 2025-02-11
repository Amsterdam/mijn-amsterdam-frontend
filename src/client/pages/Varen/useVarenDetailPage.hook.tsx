import { useParams } from 'react-router-dom';

import {
  exploitatieVergunningWijzigen,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useVarenDetailPage() {
  const { VAREN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const vergunning = VAREN.content?.find((item) => item.id === id) ?? null;

  const buttons = [
    vergunning ? exploitatieVergunningWijzigen(vergunning.key) : [],
    ligplaatsVergunningLink,
  ].flat();

  return {
    vergunning,
    buttons,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
  };
}
