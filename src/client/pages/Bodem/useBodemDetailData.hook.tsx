import { useParams } from 'react-router-dom';

import { useBodemStatusLines } from './useBodemStatusLines.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useBodemDetailData() {
  const { BODEM } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const meting = BODEM.content?.metingen?.find(
    (meting) => meting.kenmerk === id
  ) as LoodMetingFrontend;

  const statusLineItems = meting && useBodemStatusLines(meting);

  return {
    meting: {
      ...meting,
      steps: statusLineItems,
    },
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
  };
}
