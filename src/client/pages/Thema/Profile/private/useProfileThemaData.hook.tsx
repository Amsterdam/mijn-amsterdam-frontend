import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useProfileThemaData() {
  const { BRP } = useAppStateGetter();

  return {
    id: themaConfig.BRP.id,
    title: themaConfig.BRP.title,
    brpContent: BRP.content,
    isErrorBrp: isError(BRP),
    isLoadingBrp: isLoading(BRP),
    pageLinks: themaConfig.BRP.pageLinks,
  };
}
