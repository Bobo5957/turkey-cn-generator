import { TableB } from './TableB'
import { EmailPreview } from './EmailPreview'
import type { TableConfig } from '../types'
import type { ProcessedGroup } from '../utils/rowProcessing'
import { getTemplateForVariant } from '../utils/rowProcessing'

interface RowResultsProps {
  processedGroups: ProcessedGroup[]
  tableConfig: TableConfig
  englishTemplate: string
  turkishTemplate: string
}

export function RowResults({
  processedGroups,
  tableConfig,
  englishTemplate,
  turkishTemplate,
}: RowResultsProps) {
  if (processedGroups.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>分组输出</h2>
            <p className="panel-desc">
              粘贴或填写表格 A 后，相同交易客户 + 活动客户的行将合并生成表格 B 和邮件正文
            </p>
          </div>
        </div>
        <p className="preview-placeholder">暂无数据，请先粘贴或填写表格 A...</p>
      </section>
    )
  }

  const totalRows = processedGroups.reduce(
    (sum, group) => sum + group.sourceRowIndices.length,
    0,
  )

  return (
    <section className="row-results">
      <div className="row-results-header">
        <h2>分组输出</h2>
        <p className="panel-desc">
          表格 A 共 {totalRows} 行，按交易客户 + 活动客户合并为 {processedGroups.length} 组
        </p>
      </div>

      <div className="row-results-list">
        {processedGroups.map((group) => {
          const template = getTemplateForVariant(
            group.templateVariant,
            englishTemplate,
            turkishTemplate,
          )

          return (
            <article key={group.groupKey} className="row-result-card">
              <header className="row-result-title">
                <h3>{group.label}</h3>
                <span className={`variant-tag variant-${group.templateVariant}`}>
                  {group.templateVariant === 'turkish' ? '土耳其语' : 'English'}
                </span>
              </header>

              <TableB tableBRows={group.tableBRows} tableConfig={tableConfig} compact />

              <EmailPreview
                template={template}
                templateData={group.templateData}
                tableBRows={group.tableBRows}
                tableConfig={tableConfig}
                contactMatch={group.contactMatch}
                trader={group.trader}
                activity={group.activity}
                templateVariant={group.templateVariant}
                compact
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
