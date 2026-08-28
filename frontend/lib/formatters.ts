/**
 * Format a number as currency with thousand separators
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., $1,234.56)
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number with thousand separators (no currency symbol)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., 1,234.56)
 */
export function formatNumber(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format budget with dollar sign and thousand separators
 * @param budget - The budget amount
 * @param decimals - Number of decimal places (default: 0 for whole numbers, 2 for detailed)
 * @returns Formatted budget string (e.g., $1,234)
 */
export function formatBudget(budget: number, decimals: number = 0): string {
  return `$${formatNumber(budget, decimals)}`;
}
