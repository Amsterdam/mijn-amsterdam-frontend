import { ThemaTitles } from '../../config/thema';
import { AppState } from '../../AppState';

export function getThemaTitle(hasStadspas: boolean, hasRegelingen: boolean) {
  switch (true) {
    default:
    case hasStadspas && hasRegelingen:
      return ThemaTitles.HLI;
    case hasStadspas:
      return 'Stadspas';
    case hasRegelingen:
      return 'Regelingen bij laag inkomen';
  }
}

export function getThemaTitleWithAppState(appState: AppState) {
  const hasStadspas = !!appState.HLI.content?.stadspas?.stadspassen.length;
  const hasRegelingen = !!appState.HLI.content?.regelingen.length;
  return getThemaTitle(hasStadspas, hasRegelingen);
}
