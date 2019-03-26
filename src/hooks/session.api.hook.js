import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

export default function useSessionApi() {
  const { data, ...rest } = useDataApi({ url: ApiUrls.AUTH });
  return { ...data, ...rest };
}
