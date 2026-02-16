import { useBffApi } from '../../../../hooks/api/useBffApi';

export function useAantalBewonersOpAdres(url: string | null) {
  const { data } = useBffApi<string>(url);
  const aantalBewoners = data?.content;
  return aantalBewoners;
}
