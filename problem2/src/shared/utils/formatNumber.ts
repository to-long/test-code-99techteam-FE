/**
 * Formats a number string in European format: xxx.xxx.xxx,yyy
 * Uses dots (.) for thousands separator and comma (,) for decimal separator
 */
export function formatEuropeanNumber(value: string): string {
  if (!value || value === '') return '';

  // Remove any existing formatting (dots and commas)
  const cleanValue = value.replace(/[.,]/g, '');

  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';

  // Format integer part with dots as thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator if there's a decimal part
  if (decimalPart) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
}

/**
 * Parses a European formatted number string back to a plain number string
 * Converts dots (thousands) and comma (decimal) to standard format
 * Handles both European format (comma as decimal) and standard format (dot as decimal)
 */
export function parseEuropeanNumber(value: string): string {
  if (!value || value === '') return '';

  // If there's a comma, treat it as European decimal separator
  if (value.includes(',')) {
    const parts = value.split(',');
    const integerPart = parts[0]?.replace(/\./g, '') || '';
    const decimalPart = parts[1] || '';
    if (decimalPart) {
      return `${integerPart}.${decimalPart}`;
    }
    return integerPart;
  }

  // If there's a dot but no comma, check if it's decimal or thousands separator
  if (value.includes('.')) {
    const parts = value.split('.');
    // If single dot and part after has 1-2 digits, treat as decimal separator
    // Otherwise, treat all dots as thousands separators
    if (parts.length === 2) {
      const lastPart = parts[1] || '';
      if (lastPart.length <= 2 && /^\d+$/.test(lastPart)) {
        // Single dot with 1-2 digits after = decimal separator
        return `${parts[0]}.${lastPart}`;
      }
    }
    // Multiple dots or single dot with 3+ digits = thousands separators
    return value.replace(/\./g, '');
  }

  // No dots or commas, return as is
  return value;
}
