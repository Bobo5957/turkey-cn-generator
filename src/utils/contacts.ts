import type { ContactMapping, ContactMatch } from '../types'

export function normalizeEmails(raw: string): string {
  return raw
    .replace(/["']/g, '')
    .replace(/[\r\n]+/g, ';')
    .replace(/\s+/g, ' ')
    .split(/[;,\s]+/)
    .map((e) => e.trim())
    .filter((e) => e.includes('@'))
    .join(';')
}

function row(
  交易客户: string,
  活动客户: string,
  to: string,
  cc: string,
): Omit<ContactMapping, 'id'> {
  return {
    交易客户,
    活动客户,
    收件人地址: normalizeEmails(to),
    CC地址: normalizeEmails(cc),
  }
}

export const DEFAULT_CONTACTS: Omit<ContactMapping, 'id'>[] = [
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'Migros',
    'risat@mieko.com.tr;onurakkus@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'muhasebe@mieko.com.tr;don@mieko.com.tr;ozlemturker@xiaomi.com;douyulin@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'KVK TEKNOLOJİ ÜRÜNLERİ VE TİCARET ANONİM ŞİRKETİ',
    'MEDİA MARKT TURKEY TİC. LTD. ŞTİ.',
    'hunberk.aktay@kvk.com;bekir.yilmaz@kvk.com;ozge.seker@kvk.com;tumerkan.basaran@kvk.com;yigithan.sivri@kvk.com;ziya.can@kvk.com',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;wangsiyu18@xiaomi.com;baona@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'DSM GRUP DANIŞMANLIK İLETİŞİM VE SATIŞ TİCARET A.Ş.',
    'DSM GRUP DANIŞMANLIK İLETİŞİM VE SATIŞ TİCARET A.Ş.',
    'ecem.evirgen@trendyol.com;neyire.iyidogan@trendyol.com;eren.ozturk@trendyol.com',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;baona@xiaomi.com;saniyebucekansiz@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'DORA ILETISIM VE TICARET ANONİM SİRKETİ',
    'Vodafone',
    'ozgeurcan@doramobile.com;fundayeter@ouno.com.tr;berkayarmutcu@doramobile.com',
    'douyulin@xiaomi.com;wangsiyu18@xiaomi.com;ismailakcay@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'Hepsiburada',
    'risat@mieko.com.tr;onurakkus@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'douyulin@xiaomi.com;baona@xiaomi.com;zhangbo30@xiaomi.com;saniyebucekansiz@xiaomi.com;sametcalis@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'KVK TEKNOLOJİ ÜRÜNLERİ VE TİCARET ANONİM ŞİRKETİ',
    'Turkcell',
    'ilem.yildiz@turkcell.com.tr;hunberk.aktay@kvk.com;yigithan.sivri@kvk.com;ziya.can@kvk.com',
    'burak.keskin@turkcell.com.tr;douyulin@xiaomi.com;zhangbo30@xiaomi.com;baona@xiaomi.com;burcutopal@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'VATAN BİLGİSAYAR SANVE TİC.A.Ş.',
    'VATAN BİLGİSAYAR SANVE TİC.A.Ş.',
    'burak.beyazit@vatanbilgisayar.com;arzu.durmaz@vatanbilgisayar.com;merve.kelem@vatanbilgisayar.com;hasan.karaduman@vatanbilgisayar.com;sevval.islek@vatanbilgisayar.com;cosar.car@vatanbilgisayar.com;berke.ay@vatanbilgisayar.com',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;wangsiyu18@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'Mieko-mistore',
    'risat@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'onurakkus@mieko.com.tr;muhasebe@mieko.com.tr;don@mieko.com.tr;douyulin@xiaomi.com;cuimulei@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;cankutkasber@xiaomi.com;liudongmei5@xiaomi.com;zhangmin50@xiaomi.com',
  ),
  row(
    'Teknosa İç ve Dış Ticaret A.Ş.',
    'Teknosa İç ve Dış Ticaret A.Ş.',
    'BOzsipahi@teknosa.com;GHepsen@teknosa.com;Cumhur.Cokbulan@teknosa.com;ydurak@teknosa.com',
    'HArkoc@teknosa.com;douyulin@xiaomi.com;zhangbo30@xiaomi.com;ozlemturker@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'EVOFONE BİLGİ TEKNOLOJİLERİ SANAYİ TİCARET ANONİM ŞİRKETİ',
    'Evo-mistore',
    'serdar.gurbuz@evofone.com;eda.soylu@evofone.com;oguzhan.baykal@evofone.com;emirhan.kosum@evofone.com;pelin.demirci@evofone.com;ahmetturan.ozbey@evofone.com',
    'ahmetturan.ozbey@evofone.com;douyulin@xiaomi.com;zhangbo30@xiaomi.com;cankutkasber@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com;zhangmin50@xiaomi.com',
  ),
  row(
    'PORT IC VE DIS TICARET AS',
    'Türk Telekomünikasyon A.S.',
    'esra.bilginoglu@portmobile.com.tr;tugce.hakkial@portmobile.com.tr',
    'douyulin@xiaomi.com;burcutopal@xiaomi.com;ismailakcay@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'Pazarama',
    'onurakkus@mieko.com.tr;risat@mieko.com.tr;muhasebe@mieko.com.tr;don@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;cuimulei@xiaomi.com;saniyebucekansiz@xiaomi.com;baona@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'AMAZON TURKEY PERAKENDE HIZMETLERI LIMITED SIRKETI',
    'AMAZON TURKEY PERAKENDE HIZMETLERI LIMITED SIRKETI',
    'fhusta@amazon.com;debit-balancetr@amazon.com;emingky@amazon.com.tr;mtaghiye@amazon.cz;Yagizhan@amazon.com;alikaank@amazon.com.tr;yagizhan@amazon.com;eseroglu@amazon.com.tr;umutdbil@amazon.com.tr',
    'fhusta@amazon.com;debit-balancetr@amazon.com;emingky@amazon.com.tr;mtaghiye@amazon.cz;Yagizhan@amazon.com;alikaank@amazon.com.tr;yagizhan@amazon.com;eseroglu@amazon.com.tr;umutdbil@amazon.com.tr',
  ),
  row(
    'SECONA INVESTMENT MANAGEMENT LIMITED',
    'SECONA INVESTMENT MANAGEMENT LIMITED',
    '',
    '',
  ),
  row(
    'MOBILTEL ILETISIM HIZMETLERI SANAYI VE TICARET ANONIM SIRKETI',
    'Türk Telekomünikasyon A.S.',
    'AdemDogan@mobiltel.com.tr;gamzeucar@mobiltel.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;ismailakcay@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'Evkur Alisveris Merkezleri Ticaret A.S.',
    'Evkur Alisveris Merkezleri Ticaret A.S.',
    'saime_uluc@evkur.com.tr;ilknur_turanli@evkur.com.tr;hakan_celenk@evkur.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;ozlemturker@xiaomi.com;wangsiyu18@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'onurakkus@mieko.com.tr;risat@mieko.com.tr;muhasebe@mieko.com.tr;don@mieko.com.tr',
    'douyulin@xiaomi.com;baona@xiaomi.com;zhangbo30@xiaomi.com;cuimulei@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'n11 Elektronik Ticaret ve Bilişim Hizmetleri A.Ş.',
    'n11 Elektronik Ticaret ve Bilişim Hizmetleri A.Ş.',
    'Enis.Erol@n11.com;Cinar.Ozcinar@n11.com;Bora.Sahin@n11.com',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;saniyebucekansiz@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'MPN',
    'onurakkus@mieko.com.tr;risat@mieko.com.tr;muhasebe@mieko.com.tr;don@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;cuimulei@xiaomi.com;saniyebucekansiz@xiaomi.com;baona@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'HONG KONG BKS INTL TRADING CO.,LIMITED',
    'HONG KONG BKS INTL TRADING CO.,LIMITED',
    'don@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'douyulin@xiaomi.com;cuimulei@xiaomi.com;cankutkasber@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'Arcelik',
    'risat@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'eren.tunc@arcelik.com.tr;tugba.guler@arcelik.com.tr;douyulin@xiaomi.com;ozlemturker@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'EVOFONE TELEKOMÜNİKASYON VE İLETİŞİM ARAÇLARI LTD.ŞTİ',
    'Evo-mistore',
    'serdar.gurbuz@evofone.com;eda.soylu@evofone.com;oguzhan.baykal@evofone.com;emirhan.kosum@evofone.com;pelin.demirci@evofone.com;ahmetturan.ozbey@evofone.com',
    'ahmetturan.ozbey@evofone.com;douyulin@xiaomi.com;zhangbo30@xiaomi.com;cankutkasber@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com;zhangmin50@xiaomi.com',
  ),
  row(
    'Doğuş Planet Elektronik Ticaret ve Bilişim Hizmetleri A.Ş.',
    'Doğuş Planet Elektronik Ticaret ve Bilişim Hizmetleri A.Ş.',
    'Enis.Erol@n11.com;Cinar.Ozcinar@n11.com;Bora.Sahin@n11.com',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;saniyebucekansiz@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'EVOFONE TELEKOMÜNİKASYON VE İLETİŞİM ARAÇLARI LTD.ŞTİ',
    'MEDİA MARKT TURKEY TİC. LTD. ŞTİ.',
    'serdar.gurbuz@evofone.com;eda.soylu@evofone.com;oguzhan.baykal@evofone.com;emirhan.kosum@evofone.com;pelin.demirci@evofone.com;ahmetturan.ozbey@evofone.com',
    'ahmetturan.ozbey@evofone.com;douyulin@xiaomi.com;zhangbo30@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'KVK TEKNOLOJİ ÜRÜNLERİ VE TİCARET ANONİM ŞİRKETİ',
    'KVK TEKNOLOJİ ÜRÜNLERİ VE TİCARET ANONİM ŞİRKETİ',
    'ilem.yildiz@turkcell.com.tr;hunberk.aktay@kvk.com;yigithan.sivri@kvk.com;ziya.can@kvk.com',
    'burak.keskin@turkcell.com.tr;douyulin@xiaomi.com;zhangbo30@xiaomi.com;baona@xiaomi.com;burcutopal@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MİEKO BİLGİ TEKNOLOJİLERİ ANONİM ŞİRKETİ',
    'MP1',
    'onurakkus@mieko.com.tr;risat@mieko.com.tr;muhasebe@mieko.com.tr;don@mieko.com.tr;linqiongzhu@mieko.com.tr;yuna@mieko.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;cuimulei@xiaomi.com;saniyebucekansiz@xiaomi.com;baona@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MOBILTEL ILETISIM HIZMETLERI SANAYI VE TICARET ANONIM SIRKETI',
    'Arcelik',
    'AdemDogan@mobiltel.com.tr;gamzeucar@mobiltel.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;ismailakcay@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
  row(
    'MOBILTEL ILETISIM HIZMETLERI SANAYI VE TICARET ANONIM SIRKETI',
    'Migros',
    'AdemDogan@mobiltel.com.tr;gamzeucar@mobiltel.com.tr',
    'douyulin@xiaomi.com;zhangbo30@xiaomi.com;ismailakcay@xiaomi.com;wangshuo46@xiaomi.com;shepinhui@xiaomi.com;chenfangmin@xiaomi.com;liudongmei5@xiaomi.com',
  ),
]

export function createDefaultContacts(): ContactMapping[] {
  return DEFAULT_CONTACTS.map((c, i) => ({
    ...c,
    id: `default-${i}`,
  }))
}

export function createEmptyContact(): ContactMapping {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    交易客户: '',
    活动客户: '',
    收件人地址: '',
    CC地址: '',
  }
}

export function matchContact(
  contacts: ContactMapping[],
  交易客户: string,
  活动客户: string,
): ContactMatch {
  const trader = 交易客户.trim()
  const activity = 活动客户.trim()

  if (!trader && !activity) {
    return { to: '', cc: '', matched: false }
  }

  const found = contacts.find(
    (c) => c.交易客户.trim() === trader && c.活动客户.trim() === activity,
  )

  if (!found) {
    return { to: '', cc: '', matched: false }
  }

  return {
    to: found.收件人地址,
    cc: found.CC地址,
    matched: true,
    contactId: found.id,
  }
}
