// src/client/pages/Burgerzaken/useBurgerZakenDetailData.hook.tsx
import { useParams } from 'react-router-dom';

import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useBurgerZakenDetailData() {
  const { BRP } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const themaLink = useThemaMenuItemByThemaID(Themas.BURGERZAKEN);

  const document =
    BRP.content?.identiteitsbewijzen?.find((item) => item.id === id) ?? null;

  return {
    document,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    themaPaginaBreadcrumb: themaLink,
  };
}
