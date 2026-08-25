// ตารางนี้คุมทั้ง dropdown และ query string ถ้าต้องเปลี่ยนเป็น eq/ne แบบ GOFF แก้ที่นี่ที่เดียว
export const OPERATORS = [
  { label: 'Equals To', value: '==', needsValue: true },
  { label: 'Not Equals To', value: '!=', needsValue: true },
  { label: 'Less Than', value: '<', needsValue: true },
  { label: 'Greater Than', value: '>', needsValue: true },
  { label: 'Less Than Equal To', value: '<=', needsValue: true },
  { label: 'Greater Than Equal To', value: '>=', needsValue: true },
  { label: 'Contains', value: 'co', needsValue: true }, // 6 ตัวล่างไม่มีสัญลักษณ์ จึงใช้คำย่อตาม GOFF
  { label: 'Starts With', value: 'sw', needsValue: true },
  { label: 'Ends With', value: 'ew', needsValue: true },
  { label: 'In a List', value: 'in', needsValue: true }, // ค่าคั่นด้วยจุลภาค แล้วไปประกอบเป็น [..] ใน build-query
  { label: 'Present', value: 'pr', needsValue: false },
  { label: 'Not', value: 'not', needsValue: true },
] as const

export type OperatorValue = (typeof OPERATORS)[number]['value']

export const OPERATOR_VALUES = OPERATORS.map((o) => o.value) as [
  OperatorValue,
  ...Array<OperatorValue>,
]

export function operatorNeedsValue(operator: OperatorValue): boolean {
  return OPERATORS.find((o) => o.value === operator)?.needsValue ?? true
}
