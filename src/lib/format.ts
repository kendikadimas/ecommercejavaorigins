/**
 * Formats a number to NZD currency format: "$14.99 NZD"
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)} NZD`;
}
