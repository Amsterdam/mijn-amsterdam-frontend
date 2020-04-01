export interface FOCUSData {}

export function fetch() {
  return Promise.resolve({
    focus: true,
  });
}
