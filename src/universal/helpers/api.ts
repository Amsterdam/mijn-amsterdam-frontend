export function isLoading(data: any) {
  return data === null;
}
export function isError(data: any) {
  return data !== null && data.isError;
}
