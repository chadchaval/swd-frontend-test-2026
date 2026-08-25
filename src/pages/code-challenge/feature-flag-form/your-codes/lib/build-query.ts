import { operatorNeedsValue } from './operators'
import type { AnyRuleNode } from '../schema/feature-flag.schema'

// เดาชนิดจากค่าที่ user พิมพ์ เลขกับ boolean ไม่ต้องมี quote ส่วนข้อความต้องมี
function formatScalar(raw: string): string {
  const trimmed = raw.trim()

  if (trimmed === 'true' || trimmed === 'false') return trimmed
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return trimmed

  return `'${trimmed.replace(/'/g, "\\'")}'`
}

function formatValue(operator: string, raw: string): string {
  if (operator === 'in') {
    const items = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map(formatScalar)

    return `(${items.join(', ')})`
  }

  return formatScalar(raw)
}

// isRoot คุมการครอบวงเล็บ ชั้นบนสุดไม่ครอบ แต่ group ที่ซ้อนอยู่ข้างในต้องครอบเสมอ
export function buildQuery(node: AnyRuleNode, isRoot = true): string {
  if (node.type === 'condition') {
    if (!node.field.trim()) return ''

    if (!operatorNeedsValue(node.operator)) {
      return `${node.field.trim()} ${node.operator}`
    }

    if (!node.value.trim()) return ''

    return `${node.field.trim()} ${node.operator} ${formatValue(node.operator, node.value)}`
  }

  const parts = node.children
    .map((child) => buildQuery(child, false))
    .filter((part) => part !== '') // ✅ ตัดเงื่อนไขที่ยังกรอกไม่ครบออก ไม่งั้น query จะมี and ลอยๆ

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0] // ลูกตัวเดียวไม่ต้องมีวงเล็บ

  const joined = parts.join(` ${node.operator} `)

  return isRoot ? joined : `(${joined})`
}
