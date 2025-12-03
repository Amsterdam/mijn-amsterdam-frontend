/**
 * The smile API provides dates in different formats.
 * This function aims to normalize them into a Date object.
 */
export function parseSmileDate(smileDate: string): string {
  if (smileDate.length === 0) {
    return smileDate;
  }
  const datePart = smileDate.split(' ')[0];
  const [day, month, year] = datePart.split('-');
  return new Date(`${year}-${month}-${day}`).toISOString();
}
