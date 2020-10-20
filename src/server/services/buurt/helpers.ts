export function recursiveCoordinateSwap(coords: any) {
  for (const coord of coords) {
    const c1 = coord[0];
    if (typeof c1 !== 'number') {
      recursiveCoordinateSwap(coord);
    } else if (typeof c1 === 'number') {
      coord[0] = coord[1];
      coord[1] = c1;
    }
  }
}

export function getApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded && responseData?._embedded[id];
  return Array.isArray(results) ? results : null;
}
