export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const formatter = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function displayAmount(amount: number) {
  return formatter.format(amount);
}
