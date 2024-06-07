import { ThemaTitles } from '../../../universal/config/thema';

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
