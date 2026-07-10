export const DEFAULT_FIELDS = [
  '结算单号',
  '结算单名称',
  '活动政策类型名称',
  '活动政策单号',
  '所属区域',
  '所属国家',
  '交易客户',
  '活动客户',
  '销售主体',
  '本次结算总金额（不含税）',
  '币种',
  '结算支付方式',
  '审批状态',
  '创建时间',
  'CN',
  'offer number（登台账用）',
]

export const TRY_CURRENCY_LABEL = '新土耳其里拉'
export const USD_CURRENCY_LABEL = '美元'

export const ENGLISH_TEMPLATE = `Xiaomi Rebate-Credit Note Notification
Dear Customer,
 
Please note that Xiaomi has released a new Credit Note ('CN') to you for the agreed settlement, please kindly find the enclosed documents for your reference.
{{TABLE_B}}
If you have any questions, please contact your KAM.
Best regards,
Xiaomi HK-Turkey Official`

export const TURKISH_TEMPLATE = `【Rebate Invoice】Information for rebate invoice

Sayın İlgili,
 
Xiaomi Türkiye'nin tarafınızla olan anlaşmasına istinaden satış destek primi tutarının tamamlandığını ve faturasının kesilmesi için hazır hale geldiğini bildirmek isteriz.
 
Tarafımıza keseceğiniz faturanın üzerine ilgili CN Numarası ve "Satış Destek" ibaresinin yazılı olduğundan ve her CN için ayrı fatura düzenlediğinizden emin olunuz.
{{TABLE_B}}
Ayrıca, ilgili tutarı ödemenizden mahsup etmeden önce aşağıdaki bilgileri içeren onay e-postasını göndermenizi önemle rica ederiz:
-PO numarası
-Mahsup tutarı
 
Herhangi bir sorunuz olur ise,  shepinhui@xiaomi.com ile iletişime geçebilirsiniz.
 
Saygılarımızla,
Xiaomi Türkiye`

export const DEFAULT_TEMPLATE = `收件人（To）：{{收件人地址}}
抄送（CC）：{{CC地址}}

您好，

以下是土耳其 CN 结算信息，请查收：

结算单号：{{结算单号}}
结算单名称：{{结算单名称}}
活动政策类型：{{活动政策类型名称}}
活动政策单号：{{活动政策单号}}
所属区域：{{所属区域}}
所属国家：{{所属国家}}
交易客户：{{交易客户}}
活动客户：{{活动客户}}
销售主体：{{销售主体}}
结算金额（不含税）：{{本次结算总金额（不含税）}} {{币种}}
结算支付方式：{{结算支付方式}}
审批状态：{{审批状态}}
创建时间：{{创建时间}}
CN号：{{CN}}
Offer Number：{{offer number（登台账用）}}

如有问题请随时联系，谢谢！`

export function createEmptyRowData(fields: string[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, '']))
}

export function createEmptyRows(fields: string[], count = 1): Record<string, string>[] {
  return Array.from({ length: count }, () => createEmptyRowData(fields))
}
