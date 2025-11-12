export const featureToggle = {
  expandHeeftAlsEigenaarHrNps: false, // TODO: Enable if we have the correct autorisation
};
export const MACExpandScopes = [
  'heeftAlsEigenaarHrNnp',
  ...(featureToggle.expandHeeftAlsEigenaarHrNps
    ? ['heeftAlsEigenaarHrNps']
    : []),
];
