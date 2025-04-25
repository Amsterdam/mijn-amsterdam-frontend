import { VergunningDetailPagina } from './VergunningDetail';
import { VergunningenThemaPagina } from './Vergunningen';
import { VergunningenList } from './VergunningenList';

export const VergunningenRoutes = [
  { route: '/vergunningen/lijst/:kind/:page?', Component: VergunningenList },
  { route: '/vergunningen/:caseType/:id', Component: VergunningDetailPagina },
  { route: '/vergunningen', Component: VergunningenThemaPagina },
];
