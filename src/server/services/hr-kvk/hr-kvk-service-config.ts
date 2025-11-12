export const featureToggle = {
  expandHeeftAlsEigenaarHrNps: true,
};
export const MACExpandScopes = [
  'heeftAlsEigenaarHrNnp',
  ...(featureToggle.expandHeeftAlsEigenaarHrNps
    ? ['heeftAlsEigenaarHrNps']
    : []),
];
