export function getProfileType(queryParams: Record<string, string>) {
  return queryParams.profileType === 'private' ||
    queryParams.profileType === 'private-commercial'
    ? queryParams.profileType
    : 'private';
}
