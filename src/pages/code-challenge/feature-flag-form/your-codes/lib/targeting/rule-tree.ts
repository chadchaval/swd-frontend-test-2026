import { createId } from '../form/create-id'
import type {
  AnyGroup,
  AnyRuleNode,
  Condition,
  Group,
  TargetingRule,
} from '../../schema/feature-flag.schema'

export function createCondition(): Condition {
  return {
    id: createId(),
    type: 'condition',
    field: '',
    operator: '==',
    value: '',
  }
}

// ❓ กลุ่มใหม่ต้องมีลูกอย่างน้อยหนึ่งตัวเสมอ ไม่งั้น schema จะฟ้องตั้งแต่กดเพิ่ม
export function createGroup(): AnyGroup {
  return {
    id: createId(),
    type: 'group',
    operator: 'and',
    children: [createCondition()],
  }
}

export function createTargetingRule(): TargetingRule {
  return {
    id: createId(),
    name: '',
    root: createGroup() as Group,
    percentage: 100,
    variation: '',
  }
}

// ✅ ทุกตัวคืน object ใหม่ ไม่แก้ของเดิม React จึงรู้ว่าอะไรเปลี่ยนและ type ตรวจได้ครบ
export function replaceChildAt(
  group: AnyGroup,
  index: number,
  next: AnyRuleNode,
): AnyGroup {
  return {
    ...group,
    children: group.children.map((child, i) => (i === index ? next : child)),
  }
}

export function removeChildAt(group: AnyGroup, index: number): AnyGroup {
  return {
    ...group,
    children: group.children.filter((_, i) => i !== index),
  }
}

export function appendChild(group: AnyGroup, child: AnyRuleNode): AnyGroup {
  return { ...group, children: [...group.children, child] }
}
