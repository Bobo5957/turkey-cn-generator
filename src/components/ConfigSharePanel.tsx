import { useRef, useState } from 'react'
import type { ContactMapping, TableConfig } from '../types'
import {
  createConfigBundle,
  downloadConfigBundle,
  parseConfigBundle,
} from '../utils/configBundle'

interface ConfigSharePanelProps {
  englishTemplate: string
  turkishTemplate: string
  tableConfig: TableConfig
  contacts: ContactMapping[]
  onImport: (bundle: ReturnType<typeof parseConfigBundle>) => void
}

export function ConfigSharePanel({
  englishTemplate,
  turkishTemplate,
  tableConfig,
  contacts,
  onImport,
}: ConfigSharePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleExport = () => {
    const bundle = createConfigBundle(
      englishTemplate,
      turkishTemplate,
      tableConfig,
      contacts,
    )
    downloadConfigBundle(bundle)
    setError('')
    setMessage('配置已导出为 JSON 文件，可发给其他同事导入')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const bundle = parseConfigBundle(JSON.parse(text) as unknown)
      onImport(bundle)
      setError('')
      setMessage(
        `已导入配置（${bundle.contacts.length} 条收件人规则），已保存到本浏览器`,
      )
    } catch (importError) {
      setMessage('')
      setError(
        importError instanceof Error ? importError.message : '导入失败，请检查文件格式',
      )
    }
  }

  return (
    <section className="panel panel-config-share">
      <div className="panel-header">
        <div>
          <h2>配置共享</h2>
          <p className="panel-desc">
            任何人都可以导出或导入配置，互相同步邮件模板、表格配置和收件人规则
          </p>
        </div>
        <div className="panel-actions">
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            导出配置
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleImportClick}>
            导入配置
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="config-share-file-input"
            onChange={handleImportFile}
          />
        </div>
      </div>
      <p className="config-share-hint">
        说明：每个人的配置存在自己浏览器里，不会自动同步。任何人都可以点「导入配置」加载别人发来的
        JSON 文件，也可以点「导出配置」把自己的设置发给别人。配置文件含业务邮箱，请通过公司渠道传输。
      </p>
      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
    </section>
  )
}
