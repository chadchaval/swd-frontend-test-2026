import { describe, expect, it } from 'vitest'
import { buildQuery } from './build-query'
import type {
  AnyGroup,
  AnyRuleNode,
  Condition,
} from '../../schema/feature-flag.schema'

function condition(
  field: string,
  operator: Condition['operator'],
  value = '',
): Condition {
  return { id: crypto.randomUUID(), type: 'condition', field, operator, value }
}

function group(
  operator: AnyGroup['operator'],
  children: Array<AnyRuleNode>,
): AnyGroup {
  return { id: crypto.randomUUID(), type: 'group', operator, children }
}

describe('buildQuery', () => {
  it('ใส่ quote ให้ค่าที่เป็นข้อความ', () => {
    expect(buildQuery(condition('country', '==', 'TH'))).toBe("country == 'TH'")
  })

  it('ไม่ใส่ quote ให้ตัวเลขและ boolean', () => {
    expect(buildQuery(condition('age', '>', '18'))).toBe('age > 18')
    expect(buildQuery(condition('isActive', '==', 'true'))).toBe(
      'isActive == true',
    )
  })

  it('pr ต้องมีค่าตามหลัง เหมือน operator อื่น ตาม editor ของจริง', () => {
    expect(buildQuery(condition('email', 'pr', 'true'))).toBe('email pr true')
    expect(buildQuery(condition('email', 'pr', ''))).toBe('')
  })

  it('operator in แปลงค่าคั่นจุลภาคเป็นรายการในวงเล็บเหลี่ยม', () => {
    expect(buildQuery(condition('country', 'in', 'TH, SG, MY'))).toBe(
      "country in ['TH','SG','MY']",
    )
  })

  it('operator not ต้องมีค่าตามหลัง ไม่ใช่ operator เดี่ยว', () => {
    expect(buildQuery(condition('plan', 'not', 'free'))).toBe("plan not 'free'")
    expect(buildQuery(condition('plan', 'not', ''))).toBe('')
  })

  it('group ชั้นบนสุดไม่ต้องครอบวงเล็บ', () => {
    const tree = group('and', [
      condition('country', '==', 'TH'),
      condition('age', '>', '18'),
    ])

    expect(buildQuery(tree)).toBe("country == 'TH' and age > 18")
  })

  it('group ที่ซ้อนอยู่ข้างในต้องครอบวงเล็บ', () => {
    const tree = group('and', [
      group('or', [
        condition('country', '==', 'TH'),
        condition('country', '==', 'SG'),
      ]),
      condition('age', '>', '18'),
    ])

    expect(buildQuery(tree)).toBe(
      "(country == 'TH' or country == 'SG') and age > 18",
    )
  })

  it('group ที่มีลูกตัวเดียวไม่ต้องครอบวงเล็บ', () => {
    const tree = group('and', [group('or', [condition('country', '==', 'TH')])])

    expect(buildQuery(tree)).toBe("country == 'TH'")
  })

  it('ซ้อนได้หลายชั้นโดยวงเล็บยังถูกต้อง', () => {
    const tree = group('and', [
      condition('plan', '!=', 'free'),
      group('or', [
        condition('role', '==', 'admin'),
        group('and', [
          condition('country', '==', 'TH'),
          condition('age', '>=', '20'),
        ]),
      ]),
    ])

    expect(buildQuery(tree)).toBe(
      "plan != 'free' and (role == 'admin' or (country == 'TH' and age >= 20))",
    )
  })

  it('ข้ามเงื่อนไขที่ยังกรอกไม่ครบ', () => {
    const tree = group('and', [
      condition('country', '==', 'TH'),
      condition('', '==', ''),
    ])

    expect(buildQuery(tree)).toBe("country == 'TH'")
  })

  it('group ว่างคืนค่าว่าง', () => {
    expect(buildQuery(group('and', []))).toBe('')
  })
})
