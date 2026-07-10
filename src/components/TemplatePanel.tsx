import { useEffect, useState } from 'react'
import type { TemplateVariant } from '../types'
import { TEMPLATE_VARIANT_LABELS } from '../utils/emailTemplate'

interface TemplatePanelProps {
  englishTemplate: string
  turkishTemplate: string
  activeVariant: TemplateVariant
  onChange: (variant: TemplateVariant, template: string) => void
  onReset: () => void
}

export function TemplatePanel({
  englishTemplate,
  turkishTemplate,
  activeVariant,
  onChange,
  onReset,
}: TemplatePanelProps) {
  const [editingVariant, setEditingVariant] = useState<TemplateVariant>(activeVariant)

  useEffect(() => {
    setEditingVariant(activeVariant)
  }, [activeVariant])

  const currentTemplate =
    editingVariant === 'turkish' ? turkishTemplate : englishTemplate

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>邮件模板设置</h2>
          <p className="panel-desc">
            使用 <code>{'{{字段名}}'}</code> 或 <code>{'{{TABLE_B}}'}</code> 作为占位符
          </p>
          <p className="template-active-badge">
            当前自动选用：
            <span className={`variant-tag variant-${activeVariant}`}>
              {TEMPLATE_VARIANT_LABELS[activeVariant]}
            </span>
            {activeVariant === 'turkish'
              ? '（币种为新土耳其里拉）'
              : '（币种为美元或其他）'}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          恢复默认
        </button>
      </div>

      <div className="template-tabs">
        <button
          type="button"
          className={`template-tab ${editingVariant === 'english' ? 'active' : ''}`}
          onClick={() => setEditingVariant('english')}
        >
          英文模板
        </button>
        <button
          type="button"
          className={`template-tab ${editingVariant === 'turkish' ? 'active' : ''}`}
          onClick={() => setEditingVariant('turkish')}
        >
          土耳其语模板
        </button>
      </div>

      <textarea
        className="template-input"
        value={currentTemplate}
        onChange={(e) => onChange(editingVariant, e.target.value)}
        rows={16}
        placeholder="输入邮件模板..."
        spellCheck={false}
      />
    </section>
  )
}
