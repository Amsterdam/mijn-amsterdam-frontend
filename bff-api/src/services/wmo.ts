export interface WMOData {}

export function fetch() {
  return Promise.resolve({
    wmo: true,
  });
}
