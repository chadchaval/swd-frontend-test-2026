import { buildQuery } from './build-query'
import type {
  FeatureFlagFormValues,
  Variation,
} from '../schema/feature-flag.schema'

type FlagValue = string | number | boolean

// ฟอร์มเก็บทุกอย่างเป็น string แต่ JSON ต้องได้ชนิดจริง เช่น true ไม่ใช่ "true"
function parseVariationValue(raw: string): FlagValue {
  const trimmed = raw.trim()

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed)

  return trimmed
}

// ฟอร์มใช้ array เพื่อให้เพิ่มลบและเรียงลำดับได้ แต่ output ต้องเป็น object ตาม expected.json
function toVariationsObject(
  variations: Array<Variation>,
): Record<string, FlagValue> {
  const result: Record<string, FlagValue> = {}

  variations.forEach((variation) => {
    const name = variation.name.trim()
    if (!name) return // ข้าม variation ที่ยังไม่ได้ตั้งชื่อ ไม่งั้นจะได้ key ว่าง
    result[name] = parseVariationValue(variation.value)
  })

  return result
}

export function toJsonOutput(values: FeatureFlagFormValues) {
  const flagName = values.name.trim() || 'untitled-flag'

  const flag: Record<string, unknown> = {
    variations: toVariationsObject(values.variations),
    targeting: values.targeting.map((rule) => ({
      query: buildQuery(rule.root),
      percentage: rule.percentage,
      variation: rule.variation,
    })),
    defaultRule: {
      variation: values.defaultVariation,
    },
  }

  // ใส่ 2 key นี้เฉพาะตอนมีค่าจริง เพื่อให้ output ปกติตรงกับ expected.json เป๊ะ
  if (!values.enabled) {
    flag.disable = true
  }

  if (values.description.trim()) {
    flag.metadata = { description: values.description.trim() }
  }

  return {
    flags: {
      [flagName]: flag, // ชื่อ flag เป็น key ของ object ไม่ใช่ field ชื่อ name
    },
  }
}
