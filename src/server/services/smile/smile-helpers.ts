/**
 * The smile API provides dates in different formats.
 * This function aims to normalize them into a Date object.
 * @param smileDate
 * @returns
 */
export function smileDateParser(smileDate: string): string {
  if (smileDate.length === 0) {
    return smileDate;
  }
  const datePart = smileDate.split(' ')[0];
  const dateInParts = datePart.split('-');

  return new Date(
    `${dateInParts[2]}-${dateInParts[1]}-${dateInParts[0]}`
  ).toISOString();
}
