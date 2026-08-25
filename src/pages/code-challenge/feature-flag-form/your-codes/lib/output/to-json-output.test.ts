import { describe, expect, it } from 'vitest'
import { toJsonOutput } from './to-json-output'
import type { FeatureFlagFormValues } from '../../schema/feature-flag.schema'

function values(
  overrides: Partial<FeatureFlagFormValues> = {},
): FeatureFlagFormValues {
  return {
    name: 'my-new-feature',
    description: '',
    enabled: true,
    variations: [
      { id: 'v1', name: 'on', value: 'true' },
      { id: 'v2', name: 'off', value: 'false' },
    ],
    targeting: [],
    defaultVariation: 'off',
    ...overrides,
  }
}

describe('toJsonOutput', () => {
  it('ได้โครงตรงกับ expected.json ของโจทย์', () => {
    const output = toJsonOutput(
      values({
        targeting: [
          {
            id: 'r1',
            name: 'Rule 1',
            root: {
              id: 'g1',
              type: 'group',
              operator: 'and',
              children: [
                {
                  id: 'c1',
                  type: 'condition',
                  field: 'group',
                  operator: '==',
                  value: 'beta',
                },
              ],
            },
            percentage: 50,
            variation: 'on',
          },
        ],
      }),
    )

    expect(output).toEqual({
      flags: {
        'my-new-feature': {
          variations: { on: true, off: false },
          targeting: [
            { query: "group == 'beta'", percentage: 50, variation: 'on' },
          ],
          defaultRule: { variation: 'off' },
        },
      },
    })
  })

  it('แปลง variations จาก array เป็น object และแปลงชนิดค่าให้ถูก', () => {
    const output = toJsonOutput(
      values({
        variations: [
          { id: 'v1', name: 'on', value: 'true' },
          { id: 'v2', name: 'limit', value: '10' },
          { id: 'v3', name: 'label', value: 'hello' },
        ],
      }),
    )

    expect(output.flags['my-new-feature'].variations).toEqual({
      on: true,
      limit: 10,
      label: 'hello',
    })
  })

  it('ข้าม variation ที่ยังไม่ได้ตั้งชื่อ ไม่ให้เกิด key ว่าง', () => {
    const output = toJsonOutput(
      values({
        variations: [
          { id: 'v1', name: 'on', value: 'true' },
          { id: 'v2', name: '  ', value: 'false' },
        ],
      }),
    )

    expect(
      Object.keys(output.flags['my-new-feature'].variations as object),
    ).toEqual(['on'])
  })

  it('ใส่ disable เฉพาะตอนปิดใช้งาน และวางไว้หลัง variations', () => {
    const enabled = toJsonOutput(values())
    expect(enabled.flags['my-new-feature']).not.toHaveProperty('disable')

    const disabled = toJsonOutput(values({ enabled: false }))
    expect(disabled.flags['my-new-feature']).toHaveProperty('disable', true)
    expect(Object.keys(disabled.flags['my-new-feature'] as object)).toEqual([
      'variations',
      'disable',
      'targeting',
      'defaultRule',
    ])
  })

  it('ใส่ metadata.description เฉพาะตอนกรอกคำอธิบาย', () => {
    expect(toJsonOutput(values()).flags['my-new-feature']).not.toHaveProperty(
      'metadata',
    )

    const withDescription = toJsonOutput(values({ description: '  ทดสอบ  ' }))
    expect(withDescription.flags['my-new-feature']).toHaveProperty('metadata', {
      description: 'ทดสอบ',
    })
  })

  it('ใช้ชื่อ flag ที่กรอกเป็น key และถอยไปใช้ untitled-flag เมื่อยังไม่ได้ตั้งชื่อ', () => {
    expect(
      Object.keys(toJsonOutput(values({ name: 'another-flag' })).flags),
    ).toEqual(['another-flag'])

    expect(Object.keys(toJsonOutput(values({ name: '   ' })).flags)).toEqual([
      'untitled-flag',
    ])
  })
})
