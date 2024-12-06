// src/client/pages/Burgerzaken/useBurgerZakenDetailData.hook.tsx
import { useParams } from 'react-router-dom';

import { backLinkDetailPage } from './config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useBurgerZakenDetailData() {
  const { BRP } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const document =
    BRP.content?.identiteitsbewijzen?.find((item) => item.id === id) ?? null;

  return {
    document,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    backLink: backLinkDetailPage,
  };
}
