import { useEffect, useState } from 'react'
import type { ContactMapping } from '../types'
import { createEmptyContact, normalizeEmails } from '../utils/contacts'

type ContactMode = 'preview' | 'edit'

interface ContactConfigProps {
  contacts: ContactMapping[]
  matchedContactIds: Set<string>
  unmatchedGroupCount: number
  onChange: (contacts: ContactMapping[]) => void
  onReset: () => void
}

function ContactPreviewCell({ value, isEmail = false }: { value: string; isEmail?: boolean }) {
  if (!value.trim()) {
    return <span className="contact-preview-empty">—</span>
  }

  if (isEmail) {
    const emails = value.split(';').map((item) => item.trim()).filter(Boolean)
    return (
      <div className="contact-preview-cell contact-preview-emails">
        {emails.map((email, index) => (
          <span key={`${email}-${index}`} className="contact-email-chip">
            {email}
          </span>
        ))}
      </div>
    )
  }

  return <div className="contact-preview-cell">{value}</div>
}

export function ContactConfig({
  contacts,
  matchedContactIds,
  unmatchedGroupCount,
  onChange,
  onReset,
}: ContactConfigProps) {
  const [mode, setMode] = useState<ContactMode>('preview')
  const [draft, setDraft] = useState<ContactMapping[]>(contacts)

  useEffect(() => {
    if (mode === 'preview') {
      setDraft(contacts)
    }
  }, [contacts, mode])

  const startEdit = () => {
    setDraft(contacts.map((contact) => ({ ...contact })))
    setMode('edit')
  }

  const cancelEdit = () => {
    setDraft(contacts)
    setMode('preview')
  }

  const saveEdit = () => {
    const normalized = draft.map((contact) => ({
      ...contact,
      收件人地址: normalizeEmails(contact.收件人地址),
      CC地址: normalizeEmails(contact.CC地址),
    }))
    onChange(normalized)
    setMode('preview')
  }

  const updateRow = (id: string, field: keyof ContactMapping, value: string) => {
    setDraft((current) =>
      current.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ),
    )
  }

  const deleteRow = (id: string) => {
    setDraft((current) => current.filter((contact) => contact.id !== id))
  }

  const addRow = () => {
    setDraft((current) => [...current, createEmptyContact()])
  }

  const isEditing = mode === 'edit'
  const visibleContacts = isEditing ? draft : contacts

  return (
    <section className="panel panel-contacts">
      <div className="panel-header">
        <div>
          <h2>收件人配置</h2>
          <p className="panel-desc">
            根据交易客户 + 活动客户匹配收件人和 CC，共 {contacts.length} 条规则
            {mode === 'preview' && matchedContactIds.size > 0 && (
              <span className="contact-match-summary">
                · 当前匹配 {matchedContactIds.size} 条
              </span>
            )}
            {mode === 'preview' && unmatchedGroupCount > 0 && (
              <span className="contact-unmatched-summary">
                · {unmatchedGroupCount} 组未匹配
              </span>
            )}
          </p>
        </div>
        <div className="panel-actions">
          {isEditing ? (
            <>
              <button type="button" className="btn btn-primary" onClick={saveEdit}>
                保存编辑
              </button>
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                取消
              </button>
              <button type="button" className="btn btn-secondary" onClick={addRow}>
                添加行
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={startEdit}>
              编辑
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            恢复默认
          </button>
        </div>
      </div>

      <div className="contact-mode-bar">
        <span className={`contact-mode-tag ${isEditing ? 'mode-edit' : 'mode-preview'}`}>
          {isEditing ? '编辑模式' : '预览模式'}
        </span>
        {!isEditing && (
          <span className="contact-mode-hint">
            预览模式下，与当前表格 A 匹配的规则会高亮显示
          </span>
        )}
      </div>

      <div className="contacts-table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>交易客户</th>
              <th>活动客户</th>
              <th>收件人地址</th>
              <th>CC地址</th>
              {isEditing && <th />}
            </tr>
          </thead>
          <tbody>
            {visibleContacts.map((contact) => {
              const isMatched = !isEditing && matchedContactIds.has(contact.id)

              return (
                <tr
                  key={contact.id}
                  className={isMatched ? 'contact-row-matched' : undefined}
                >
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={contact.交易客户}
                        onChange={(e) =>
                          updateRow(contact.id, '交易客户', e.target.value)
                        }
                        placeholder="交易客户"
                      />
                    ) : (
                      <ContactPreviewCell value={contact.交易客户} />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={contact.活动客户}
                        onChange={(e) =>
                          updateRow(contact.id, '活动客户', e.target.value)
                        }
                        placeholder="活动客户"
                      />
                    ) : (
                      <ContactPreviewCell value={contact.活动客户} />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={contact.收件人地址}
                        onChange={(e) =>
                          updateRow(contact.id, '收件人地址', e.target.value)
                        }
                        placeholder="email1@example.com;email2@example.com"
                        rows={2}
                      />
                    ) : (
                      <ContactPreviewCell value={contact.收件人地址} isEmail />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={contact.CC地址}
                        onChange={(e) =>
                          updateRow(contact.id, 'CC地址', e.target.value)
                        }
                        placeholder="cc1@example.com;cc2@example.com"
                        rows={2}
                      />
                    ) : (
                      <ContactPreviewCell value={contact.CC地址} isEmail />
                    )}
                  </td>
                  {isEditing && (
                    <td>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => deleteRow(contact.id)}
                        title="删除"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
