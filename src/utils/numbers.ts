const DECIMAL_PLACES = 2

export function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = parseFloat(trimmed.replace(/,/g, ''))
  return Number.isFinite(num) ? num : null
}

export function formatAmount(
  value: number | null,
  decimalPlaces = DECIMAL_PLACES,
): string {
  if (value === null) return ''
  return value.toFixed(decimalPlaces)
}

export function normalizeDecimalString(
  value: string,
  decimalPlaces = DECIMAL_PLACES,
): string {
  const trimmed = value.trim()
  if (!trimmed) return value

  const amount = parseAmount(trimmed)
  if (amount === null) return value
  return formatAmount(amount, decimalPlaces)
}

export function normalizeRowAmountFields(
  row: Record<string, string>,
  amountFields: string[],
): Record<string, string> {
  const next = { ...row }
  for (const field of amountFields) {
    if (next[field]?.trim()) {
      next[field] = normalizeDecimalString(next[field])
    }
  }
  return next
}

export function normalizeRowsAmountFields(
  rows: Record<string, string>[],
  amountFields: string[],
): Record<string, string>[] {
  if (amountFields.length === 0) return rows
  return rows.map((row) => normalizeRowAmountFields(row, amountFields))
}
