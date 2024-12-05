import { useParams } from 'react-router-dom';

import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useBodemDetailData() {
  const { BODEM } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const meting =
    BODEM.content?.metingen?.find((meting) => meting.kenmerk === id) ?? null;

  return {
    meting,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
  };
}
