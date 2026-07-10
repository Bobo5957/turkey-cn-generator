import { tableBRowsToTsv, hasTableBData } from './tableB'
import { renderTemplate } from './template'

const TABLE_B_MARKER = '{{TABLE_B}}'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function tableBToHtml(
  tableBRows: Record<string, string>[],
  fieldNames: string[],
): string {
  const headerCells = fieldNames.map(
    (field) =>
      `<th style="border:1px solid #333;padding:6px 10px;background:#f2f2f2;font-weight:bold;text-align:left;white-space:nowrap;">${escapeHtml(field)}</th>`,
  ).join('')

  const bodyRows = tableBRows
    .map((row) => {
      const dataCells = fieldNames.map(
        (field) =>
          `<td style="border:1px solid #333;padding:6px 10px;white-space:nowrap;">${escapeHtml(row[field] ?? '')}</td>`,
      ).join('')
      return `<tr>${dataCells}</tr>`
    })
    .join('')

  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #333;font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:12px 0;"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
}

function textToHtmlParagraphs(text: string): string {
  const lines = text.split('\n')
  return lines
    .map((line) => {
      if (!line.trim()) {
        return '<div style="height:8px;"></div>'
      }
      return `<p style="margin:0 0 4px;font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;">${escapeHtml(line)}</p>`
    })
    .join('')
}

export interface EmailBodyParts {
  textBefore: string
  textAfter: string
  hasTableB: boolean
  plainText: string
  html: string
}

export function buildEmailBody(
  template: string,
  data: Record<string, string>,
  tableBRows: Record<string, string>[],
  tableBFieldNames: string[],
): EmailBodyParts {
  const hasTableB = template.includes(TABLE_B_MARKER)
  const [before = '', ...afterParts] = template.split(TABLE_B_MARKER)
  const after = afterParts.join(TABLE_B_MARKER)

  const dataWithoutTableB = { ...data, TABLE_B: '' }
  const textBefore = renderTemplate(before, dataWithoutTableB)
  const textAfter = renderTemplate(after, dataWithoutTableB)

  const tableTsv = tableBRowsToTsv(tableBRows, tableBFieldNames)
  const tableHtml = tableBToHtml(tableBRows, tableBFieldNames)

  const plainParts: string[] = []
  if (textBefore.trim()) plainParts.push(textBefore.trimEnd())
  if (hasTableB && hasTableBData(tableBRows, tableBFieldNames)) {
    plainParts.push(tableTsv)
  }
  if (textAfter.trim()) plainParts.push(textAfter.trimStart())
  const plainText = plainParts.join('\n\n')

  const htmlParts: string[] = []
  if (textBefore) htmlParts.push(textToHtmlParagraphs(textBefore))
  if (hasTableB) htmlParts.push(tableHtml)
  if (textAfter) htmlParts.push(textToHtmlParagraphs(textAfter))

  const html = `<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#000;">${htmlParts.join('')}</div>`

  return {
    textBefore,
    textAfter,
    hasTableB,
    plainText,
    html,
  }
}

export async function copyEmailToClipboard(plainText: string, html: string): Promise<void> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const htmlBlob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([plainText], { type: 'text/plain' })
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ])
      return
    }
  } catch {
    // fall through to plain text
  }

  try {
    await navigator.clipboard.writeText(plainText)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = plainText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}
