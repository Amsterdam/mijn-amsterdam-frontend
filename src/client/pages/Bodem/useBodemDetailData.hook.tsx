import { useParams } from 'react-router-dom';

import { Themas } from '../../../universal/config/thema';
import { isError } from '../../../universal/helpers/api';
import { isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useBodemDetailData() {
  const { BODEM } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const themaLink = useThemaMenuItemByThemaID(Themas.BODEM);

  const meting =
    BODEM.content?.metingen?.find((meting) => meting.kenmerk === id) ?? null;

  return {
    meting,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    themaPaginaBreadcrumb: themaLink,
  };
}
