import { useBffApi } from '../../../../hooks/api/useBffApi.ts';

export function useIngeschrevenPersonenOpAdres(url: string | null) {
  const { data } = useBffApi<string>(url);
  const aantalIngeschrevenPersonen = data?.content;
  return aantalIngeschrevenPersonen;
}
