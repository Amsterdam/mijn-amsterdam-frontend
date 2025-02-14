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

  const buttonItems = [
    vergunning ? exploitatieVergunningWijzigen(vergunning.key) : [],
    ligplaatsVergunningLink,
  ].flat();

  return {
    vergunning,
    buttonItems,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
  };
}
