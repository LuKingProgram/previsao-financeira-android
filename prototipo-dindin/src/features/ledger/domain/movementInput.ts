export function parseBrazilianAmountToCents(value: string): number | null {
  const normalized = value.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  if (!normalized || /[^\d.,]/.test(normalized)) return null;

  let integerPart = normalized;
  let fractionalPart = '';

  if (normalized.includes(',')) {
    if ((normalized.match(/,/g)?.length ?? 0) !== 1) return null;
    [integerPart, fractionalPart] = normalized.split(',');
    if (fractionalPart.length < 1 || fractionalPart.length > 2) return null;
    if (
      integerPart.includes('.') &&
      !/^\d{1,3}(?:\.\d{3})+$/.test(integerPart)
    ) {
      return null;
    }
    if (!integerPart.includes('.') && !/^\d+$/.test(integerPart)) return null;
    integerPart = integerPart.replace(/\./g, '');
  } else if (normalized.includes('.')) {
    const dotCount = normalized.match(/\./g)?.length ?? 0;
    if (dotCount > 1) {
      if (!/^\d{1,3}(?:\.\d{3})+$/.test(normalized)) return null;
      integerPart = normalized.replace(/\./g, '');
    } else {
      const [whole, fraction = ''] = normalized.split('.');
      if (fraction.length === 3 && /^\d{1,3}$/.test(whole)) {
        integerPart = `${whole}${fraction}`;
      } else {
        if (!/^\d+$/.test(whole) || fraction.length < 1 || fraction.length > 2) {
          return null;
        }
        integerPart = whole;
        fractionalPart = fraction;
      }
    }
  } else if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const cents =
    Number(integerPart) * 100 + Number(fractionalPart.padEnd(2, '0') || '0');
  return Number.isSafeInteger(cents) ? cents : null;
}
