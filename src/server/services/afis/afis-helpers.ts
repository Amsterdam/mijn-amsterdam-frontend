import { AfisApiFeedResponseSource } from './afis-types';

export function getFeedEntryProperties<T>(
  response: AfisApiFeedResponseSource<T>
) {
  if (Array.isArray(response?.feed?.entry)) {
    return response.feed.entry
      .map((entry) => {
        return entry?.content?.properties ?? null;
      })
      .filter((entry) => entry !== null);
  }

  return [];
}
