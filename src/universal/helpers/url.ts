export function isHttpsUrl(value: string) {
  return URL.canParse(value) && new URL(value).protocol === 'https:';
}
