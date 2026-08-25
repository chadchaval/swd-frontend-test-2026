import { z } from 'zod'
import { OPERATOR_VALUES } from '../lib/operators'

export const conditionSchema = z.object({
  id: z.string(),
  type: z.literal('condition'),
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(OPERATOR_VALUES),
  value: z.string(),
})

export type Condition = z.infer<typeof conditionSchema>

type GroupOf<TChild> = {
  id: string
  type: 'group'
  operator: 'and' | 'or'
  children: Array<TChild>
}

// ✅ TanStack Form เดิน DeepKeys ทุก field ถ้า type วนซ้ำไม่จำกัด จะ infer ทั้งฟอร์มไม่ได้เลย จึงจำกัดความลึกไว้ 4 ชั้นเฉพาะฝั่ง type
type NodeDepth4 = Condition
type NodeDepth3 = Condition | GroupOf<NodeDepth4>
type NodeDepth2 = Condition | GroupOf<NodeDepth3>

// ✅ type แบบวนซ้ำจริงไว้ใช้กับ logic และ test เท่านั้น ห้ามเอาไปใส่ใน form data ไม่งั้น TanStack Form จะ infer ไม่ได้
export type AnyGroup = {
  id: string
  type: 'group'
  operator: 'and' | 'or'
  children: Array<AnyRuleNode>
}

export type AnyRuleNode = Condition | AnyGroup

export type Group = GroupOf<NodeDepth2>
export type RuleNode = Condition | Group

const groupObjectSchema = z.object({
  id: z.string(),
  type: z.literal('group'),
  operator: z.enum(['and', 'or']),
  // ✅ ใช้ getter เพราะ ruleNodeSchema ยังไม่เกิดตอนบรรทัดนี้ถูกอ่าน getter จะประเมินตอนเรียกใช้
  get children() {
    return z.array(ruleNodeSchema).min(1, 'A group needs at least one item')
  },
})

// ✅ cast เพราะตอน runtime schema ตรวจได้ลึกไม่จำกัด แต่ TS type ถูกจำกัดไว้ 4 ชั้นตามข้อจำกัดด้านบน
export const groupSchema = groupObjectSchema as unknown as z.ZodType<Group, Group>

export const ruleNodeSchema = z.union([
  conditionSchema,
  groupObjectSchema,
]) as unknown as z.ZodType<RuleNode, RuleNode>

export const targetingRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  root: groupSchema,
  percentage: z.number().min(0).max(100),
  variation: z.string().min(1, 'Choose a variation to serve'),
})

export type TargetingRule = z.infer<typeof targetingRuleSchema>

export const variationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Variation name is required'),
  value: z.string().min(1, 'Variation value is required'),
})

export type Variation = z.infer<typeof variationSchema>

export const featureFlagSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Flag name is required')
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        'Use letters, numbers, dash or underscore only',
      ),
    description: z.string(),
    enabled: z.boolean(),
    variations: z.array(variationSchema).min(1, 'Add at least one variation'),
    targeting: z.array(targetingRuleSchema),
    defaultVariation: z.string().min(1, 'Choose a default variation'),
  })
  // check() ไว้ validate ข้าม field เช่น ชื่อ variation ซ้ำ หรืออ้างถึง variation ที่ไม่มีอยู่
  .check((ctx) => {
    const names = ctx.value.variations.map((v) => v.name)

    names.forEach((name, index) => {
      if (name && names.indexOf(name) !== index) {
        ctx.issues.push({
          code: 'custom',
          input: name,
          path: ['variations', index, 'name'],
          message: 'Variation name must be unique',
        })
      }
    })

    if (
      ctx.value.defaultVariation &&
      !names.includes(ctx.value.defaultVariation)
    ) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.defaultVariation,
        path: ['defaultVariation'],
        message: 'Default variation must be one of the variations above',
      })
    }

    ctx.value.targeting.forEach((rule, index) => {
      if (rule.variation && !names.includes(rule.variation)) {
        ctx.issues.push({
          code: 'custom',
          input: rule.variation,
          path: ['targeting', index, 'variation'],
          message: 'Served variation must be one of the variations above',
        })
      }
    })
  })

export type FeatureFlagFormValues = z.infer<typeof featureFlagSchema>
