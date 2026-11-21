import type { EnergieLabelFrontend } from '../energie-label/energie-label.types.ts';
import type { VvEDataFrontend } from './zwd.types.ts';

export type WonenDataFrontend = {
  vve: VvEDataFrontend | null;
  energieLabel: EnergieLabelFrontend | null;
};
