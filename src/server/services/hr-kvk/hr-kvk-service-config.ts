export const featureToggle = {
  expandHeeftAlsEigenaarHrNps: false, // TODO: Enable if we have the correct authorization
};
export const MACExpandScopes = [
  'heeftAlsEigenaarHrNnp',
  ...(featureToggle.expandHeeftAlsEigenaarHrNps
    ? ['heeftAlsEigenaarHrNps']
    : []),
];
