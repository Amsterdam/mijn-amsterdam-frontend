import { themaTitle } from './HLI-thema-config.ts';
import { AppState } from '../../../../universal/types/App.types.ts';

export function getThemaTitle(hasStadspas: boolean, hasRegelingen: boolean) {
  switch (true) {
    default:
    case hasStadspas && hasRegelingen:
      return themaTitle;
    case hasStadspas:
      return 'Stadspas';
    case hasRegelingen:
      return 'Regelingen bij laag inkomen';
  }
}

export function getThemaTitleWithAppState(appState: AppState) {
  const hasStadspas = !!appState.HLI?.content?.stadspas?.stadspassen?.length;
  const hasRegelingen = !!appState.HLI?.content?.regelingen.length;
  return getThemaTitle(hasStadspas, hasRegelingen);
}
