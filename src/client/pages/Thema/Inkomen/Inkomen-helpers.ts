import { isLoading } from '../../../../universal/helpers/api';
import { AppState } from '../../../../universal/types';

export function isInkomenThemaActive(appState: AppState): boolean {
  const { WPI_AANVRAGEN, WPI_SPECIFICATIES, WPI_TOZO, WPI_TONK, WPI_BBZ } =
    appState;
  const { jaaropgaven, uitkeringsspecificaties } =
    WPI_SPECIFICATIES?.content ?? {};
  const hasAanvragen = !!WPI_AANVRAGEN?.content?.length;
  const hasTozo = !!WPI_TOZO?.content?.length;
  const hasTonk = !!WPI_TONK?.content?.length;
  const hasBbz = !!WPI_BBZ?.content?.length;
  const hasJaaropgaven = !!jaaropgaven?.length;
  const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;

  return (
    !(
      isLoading(WPI_AANVRAGEN) &&
      isLoading(WPI_SPECIFICATIES) &&
      isLoading(WPI_TOZO) &&
      isLoading(WPI_TONK) &&
      isLoading(WPI_BBZ)
    ) &&
    (hasAanvragen ||
      hasTozo ||
      hasTonk ||
      hasJaaropgaven ||
      hasBbz ||
      hasUitkeringsspecificaties)
  );
}
