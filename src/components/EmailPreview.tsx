import { useMemo, useState } from 'react'
import type { ContactMatch, TableConfig, TemplateVariant } from '../types'
import { buildEmailBody, copyEmailToClipboard } from '../utils/emailBody'
import { getTableBFieldNames, hasTableBData } from '../utils/tableB'
import { TEMPLATE_VARIANT_LABELS } from '../utils/emailTemplate'

interface EmailPreviewProps {
  template: string
  templateData: Record<string, string>
  tableBRows: Record<string, string>[]
  tableConfig: TableConfig
  contactMatch: ContactMatch
  trader: string
  activity: string
  templateVariant: TemplateVariant
  compact?: boolean
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export function EmailPreview({
  template,
  templateData,
  tableBRows,
  tableConfig,
  contactMatch,
  trader,
  activity,
  templateVariant,
  compact = false,
}: EmailPreviewProps) {
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedTo, setCopiedTo] = useState(false)
  const [copiedCc, setCopiedCc] = useState(false)
  const tableBFieldNames = getTableBFieldNames(tableConfig)

  const emailBody = useMemo(
    () => buildEmailBody(template, templateData, tableBRows, tableBFieldNames),
    [template, templateData, tableBRows, tableBFieldNames],
  )

  const hasTableBContent = hasTableBData(tableBRows, tableBFieldNames)
  const hasContent = emailBody.plainText.trim().length > 0

  const handleCopyBody = async () => {
    if (!hasContent) return
    await copyEmailToClipboard(emailBody.plainText, emailBody.html)
    setCopiedBody(true)
    setTimeout(() => setCopiedBody(false), 2000)
  }

  const handleCopyTo = async () => {
    if (!contactMatch.to) return
    await copyText(contactMatch.to)
    setCopiedTo(true)
    setTimeout(() => setCopiedTo(false), 2000)
  }

  const handleCopyCc = async () => {
    if (!contactMatch.cc) return
    await copyText(contactMatch.cc)
    setCopiedCc(true)
    setTimeout(() => setCopiedCc(false), 2000)
  }

  const hasLookupKeys = trader.trim() || activity.trim()
  const showWarning = hasLookupKeys && !contactMatch.matched

  return (
    <section className={`panel panel-preview${compact ? ' panel-nested' : ''}`}>
      <div className="panel-header">
        <div>
          <h2>{compact ? '邮件正文' : '邮件正文预览'}</h2>
          {!compact && (
            <p className="panel-desc">
              正文含表格 B 时会以表格形式显示，复制后可粘贴到 Outlook / Word
              <span className={`variant-tag variant-${templateVariant}`}>
                {TEMPLATE_VARIANT_LABELS[templateVariant]}
              </span>
            </p>
          )}
          {compact && (
            <p className="panel-desc">
              复制后可粘贴到 Outlook / Word
              <span className={`variant-tag variant-${templateVariant}`}>
                {TEMPLATE_VARIANT_LABELS[templateVariant]}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="email-addresses">
        <div className="email-address-row">
          <span className="email-label">收件人（To）</span>
          <span className={`email-value ${!contactMatch.to ? 'empty' : ''}`}>
            {contactMatch.to || '（未匹配）'}
          </span>
          <button
            type="button"
            className={`btn btn-secondary btn-compact ${copiedTo ? 'copied' : ''}`}
            onClick={handleCopyTo}
            disabled={!contactMatch.to}
          >
            {copiedTo ? '✓ 已复制' : '复制收件人'}
          </button>
        </div>
        <div className="email-address-row">
          <span className="email-label">抄送（CC）</span>
          <span className={`email-value ${!contactMatch.cc ? 'empty' : ''}`}>
            {contactMatch.cc || '（未匹配）'}
          </span>
          <button
            type="button"
            className={`btn btn-secondary btn-compact ${copiedCc ? 'copied' : ''}`}
            onClick={handleCopyCc}
            disabled={!contactMatch.cc}
          >
            {copiedCc ? '✓ 已复制' : '复制 CC'}
          </button>
        </div>
        {showWarning && (
          <p className="match-warning">
            未找到「{trader}」+「{activity}」的收件人配置，请在下方收件人配置中添加或修改
          </p>
        )}
        {contactMatch.matched && (
          <p className="match-success">✓ 已匹配收件人配置</p>
        )}
      </div>

      <div className="preview-content preview-body">
        {hasContent ? (
          <>
            {emailBody.textBefore && (
              <div className="preview-text">{emailBody.textBefore}</div>
            )}
            {emailBody.hasTableB && hasTableBContent && (
              <div className="preview-table-wrapper">
                <table className="email-table-b">
                  <thead>
                    <tr>
                      {tableBFieldNames.map((field) => (
                        <th key={field}>{field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableBRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {tableBFieldNames.map((field) => (
                          <td key={field}>{row[field] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {emailBody.textAfter && (
              <div className="preview-text">{emailBody.textAfter}</div>
            )}
          </>
        ) : (
          <p className="preview-placeholder">填写数据后此处将显示邮件正文...</p>
        )}
      </div>

      <div className="preview-copy-footer">
        <button
          type="button"
          className={`btn btn-primary ${copiedBody ? 'copied' : ''}`}
          onClick={handleCopyBody}
          disabled={!hasContent}
        >
          {copiedBody ? '✓ 已复制' : '复制邮件正文'}
        </button>
      </div>
    </section>
  )
}
