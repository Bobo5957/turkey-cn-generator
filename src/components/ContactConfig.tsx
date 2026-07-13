import { useEffect, useMemo, useState } from 'react'
import type { ContactMapping } from '../types'
import {
  batchUpdateContactEmails,
  type ContactBatchTarget,
} from '../utils/contactBatch'
import { createEmptyContact, normalizeEmails } from '../utils/contacts'

type ContactMode = 'preview' | 'edit'

interface ContactConfigProps {
  contacts: ContactMapping[]
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
  onChange,
  onReset,
}: ContactConfigProps) {
  const [mode, setMode] = useState<ContactMode>('preview')
  const [draft, setDraft] = useState<ContactMapping[]>(contacts)
  const [batchEmail, setBatchEmail] = useState('')
  const [batchTarget, setBatchTarget] = useState<ContactBatchTarget>('CC地址')
  const [batchOnlyFiltered, setBatchOnlyFiltered] = useState(true)
  const [batchMessage, setBatchMessage] = useState('')
  const [filterTrader, setFilterTrader] = useState('')
  const [filterActivity, setFilterActivity] = useState('')

  useEffect(() => {
    if (mode === 'preview') {
      setDraft(contacts)
    }
  }, [contacts, mode])

  const startEdit = () => {
    setDraft(contacts.map((contact) => ({ ...contact })))
    setMode('edit')
    setBatchMessage('')
  }

  const cancelEdit = () => {
    setDraft(contacts)
    setMode('preview')
    setBatchMessage('')
  }

  const saveEdit = () => {
    const normalized = draft.map((contact) => ({
      ...contact,
      收件人地址: normalizeEmails(contact.收件人地址),
      CC地址: normalizeEmails(contact.CC地址),
    }))
    onChange(normalized)
    setMode('preview')
    setBatchMessage('')
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

  const traderOptions = useMemo(() => {
    const values = new Set<string>()
    for (const contact of visibleContacts) {
      const value = contact.交易客户.trim()
      if (value) values.add(value)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [visibleContacts])

  const activityOptions = useMemo(() => {
    const values = new Set<string>()
    for (const contact of visibleContacts) {
      const value = contact.活动客户.trim()
      if (value) values.add(value)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [visibleContacts])

  const filteredContacts = useMemo(() => {
    return visibleContacts.filter((contact) => {
      if (filterTrader && contact.交易客户.trim() !== filterTrader) {
        return false
      }
      if (filterActivity && contact.活动客户.trim() !== filterActivity) {
        return false
      }
      return true
    })
  }, [visibleContacts, filterTrader, filterActivity])

  const hasActiveFilters = filterTrader !== '' || filterActivity !== ''

  const filteredContactIds = useMemo(
    () => new Set(filteredContacts.map((contact) => contact.id)),
    [filteredContacts],
  )

  useEffect(() => {
    if (filterTrader || filterActivity) {
      setBatchOnlyFiltered(true)
    }
  }, [filterTrader, filterActivity])

  const clearFilters = () => {
    setFilterTrader('')
    setFilterActivity('')
  }

  const applyBatchUpdate = (action: 'add' | 'remove') => {
    const source = isEditing ? draft : contacts
    const result = batchUpdateContactEmails(source, {
      target: batchTarget,
      email: batchEmail,
      action,
      scopeContactIds: batchOnlyFiltered ? filteredContactIds : undefined,
    })

    if (!batchEmail.trim().includes('@')) {
      setBatchMessage('请输入有效的邮箱地址')
      return
    }

    if (result.affectedCount === 0) {
      setBatchMessage(
        action === 'add'
          ? '没有可更新的规则（可能已存在该邮箱）'
          : '筛选范围内没有规则包含该邮箱',
      )
      return
    }

    if (isEditing) {
      setDraft(result.contacts)
    } else {
      onChange(result.contacts)
    }

    const scopeLabel = batchOnlyFiltered
      ? `筛选结果 ${filteredContacts.length} 条中的`
      : '全部'
    const targetLabel =
      batchTarget === 'both' ? '收件人 + CC' : batchTarget === '收件人地址' ? '收件人' : 'CC'
    const actionLabel = action === 'add' ? '添加' : '删除'
    setBatchMessage(
      `已在 ${result.affectedCount} 条${scopeLabel}${targetLabel}中${actionLabel} ${batchEmail.trim()}`,
    )
  }

  return (
    <section className="panel panel-contacts">
      <div className="panel-header">
        <div>
          <h2>收件人配置</h2>
          <p className="panel-desc">
            按交易客户 + 活动客户维护收件人和 CC，共 {contacts.length} 条规则
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
            预览模式下可直接批量编辑邮箱，修改后立即保存
          </span>
        )}
      </div>

      <div className="contact-filter-panel">
        <div className="contact-filter-header">
          <h3>筛选规则</h3>
          <span className="contact-filter-count">
            显示 {filteredContacts.length} / {visibleContacts.length} 条
          </span>
        </div>
        <div className="contact-filter-form">
          <label>
            交易客户
            <select
              value={filterTrader}
              onChange={(e) => setFilterTrader(e.target.value)}
            >
              <option value="">全部（{traderOptions.length} 项）</option>
              {traderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            活动客户
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
            >
              <option value="">全部（{activityOptions.length} 项）</option>
              {activityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-compact"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            清空筛选
          </button>
        </div>
      </div>

      <div className="contact-batch-panel">
        <div className="contact-batch-header">
          <h3>批量编辑邮箱</h3>
          <p className="contact-batch-desc">
            在收件人或 CC 列表中批量添加/删除邮箱。勾选「仅筛选结果」后，只作用于上方筛选出的规则。
            {isEditing && '（编辑模式下修改草稿，需保存编辑后生效）'}
          </p>
        </div>
        <div className="contact-batch-form">
          <label>
            目标列
            <select
              value={batchTarget}
              onChange={(e) => setBatchTarget(e.target.value as ContactBatchTarget)}
            >
              <option value="收件人地址">收件人</option>
              <option value="CC地址">CC</option>
              <option value="both">收件人 + CC</option>
            </select>
          </label>
          <label className="contact-batch-email">
            邮箱地址
            <input
              type="email"
              value={batchEmail}
              onChange={(e) => {
                setBatchEmail(e.target.value)
                if (batchMessage) setBatchMessage('')
              }}
              placeholder="someone@xiaomi.com"
            />
          </label>
          <label className="contact-batch-checkbox">
            <input
              type="checkbox"
              checked={batchOnlyFiltered}
              onChange={(e) => setBatchOnlyFiltered(e.target.checked)}
            />
            仅筛选结果（{filteredContacts.length} 条）
          </label>
          <div className="contact-batch-actions">
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              onClick={() => applyBatchUpdate('add')}
            >
              批量添加
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-compact"
              onClick={() => applyBatchUpdate('remove')}
            >
              批量删除
            </button>
          </div>
        </div>
        {batchMessage && <p className="contact-batch-message">{batchMessage}</p>}
      </div>

      <div className="contacts-table-wrapper">
        {filteredContacts.length === 0 ? (
          <p className="contact-filter-empty">没有符合筛选条件的规则</p>
        ) : (
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
            {filteredContacts.map((contact) => (
                <tr key={contact.id}>
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
            ))}
          </tbody>
        </table>
        )}
      </div>
    </section>
  )
}
