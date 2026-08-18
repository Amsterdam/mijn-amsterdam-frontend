// Is mutated by the AppConfiguration bootstrap for OPS-prefixed keys.
export const opsFeatureToggle: Record<string, boolean> = {};

export type OpsFeatureToggleKey = `OPS.${string}`;
