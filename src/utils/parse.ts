export interface ParseResult {
  fields: string[]
  rows: Record<string, string>[]
}

function normalizeText(text: string): string {
  return text.replace(/^\uFEFF/, '').trim()
}

function cleanCell(value: string): string {
  return value.trim().replace(/^"(.*)"$/, '$1').replace(/\r/g, '')
}

function splitRow(line: string): string[] {
  return line.split('\t').map(cleanCell)
}

function buildRowFromFixedFields(
  fixedFields: string[],
  values: string[],
): Record<string, string> {
  const rowData: Record<string, string> = {}
  fixedFields.forEach((field, index) => {
    rowData[field] = values[index] ?? ''
  })
  return rowData
}

function looksLikeHeaderRow(cells: string[]): boolean {
  const first = cells[0]?.trim() ?? ''
  return first === '结算单号' || first.includes('结算') || first.includes('单号')
}

function parseDataRowsWithFixedFields(
  dataRows: string[][],
  fixedFields: string[],
): ParseResult | null {
  if (dataRows.length === 0 || fixedFields.length === 0) return null

  const rows = dataRows
    .filter((cells) => cells.some(Boolean))
    .map((values) => buildRowFromFixedFields(fixedFields, values))

  if (rows.length === 0) return null
  return { fields: [...fixedFields], rows }
}

export function parseHtmlTable(html: string, fixedFields?: string[]): ParseResult | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const rows = Array.from(doc.querySelectorAll('tr'))
  if (rows.length === 0) return null

  const tableRows = rows
    .map((row) =>
      Array.from(row.querySelectorAll('th, td')).map((cell) => cleanCell(cell.textContent ?? '')),
    )
    .filter((cells) => cells.some(Boolean))

  if (tableRows.length === 0) return null

  if (fixedFields && fixedFields.length > 0) {
    const dataRows = looksLikeHeaderRow(tableRows[0]) ? tableRows.slice(1) : tableRows
    return parseDataRowsWithFixedFields(dataRows, fixedFields)
  }

  if (tableRows.length >= 2 && looksLikeHeaderRow(tableRows[0])) {
    const [headerRow, ...dataRows] = tableRows
    const fields = headerRow.filter(Boolean)
    if (fields.length === 0 || dataRows.length === 0) return null
    return {
      fields,
      rows: dataRows.map((values) => {
        const rowData: Record<string, string> = {}
        fields.forEach((field, index) => {
          rowData[field] = values[index] ?? ''
        })
        return rowData
      }),
    }
  }

  return null
}

export function parseTsvPaste(text: string, fixedFields?: string[]): ParseResult | null {
  const normalized = normalizeText(text)
  if (!normalized) return null

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const allRows = lines.map(splitRow)

  if (fixedFields && fixedFields.length > 0) {
    const dataRows = looksLikeHeaderRow(allRows[0]) ? allRows.slice(1) : allRows
    return parseDataRowsWithFixedFields(dataRows, fixedFields)
  }

  if (allRows.length >= 2 && looksLikeHeaderRow(allRows[0])) {
    const [headers, ...dataRows] = allRows
    const fields = headers.filter(Boolean)
    if (fields.length === 0 || dataRows.length === 0) return null
    return {
      fields,
      rows: dataRows.map((values) => {
        const rowData: Record<string, string> = {}
        fields.forEach((field, index) => {
          rowData[field] = values[index] ?? ''
        })
        return rowData
      }),
    }
  }

  return null
}

export function parseClipboardPaste(
  plainText: string,
  htmlText: string,
  fixedFields?: string[],
): ParseResult | null {
  if (htmlText.trim()) {
    const htmlResult = parseHtmlTable(htmlText, fixedFields)
    if (htmlResult) return htmlResult
  }

  return parseTsvPaste(plainText, fixedFields)
}
