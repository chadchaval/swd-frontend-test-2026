import { useForm } from '@tanstack/react-form'
import { featureFlagSchema } from '../schema/feature-flag.schema'
import type { FeatureFlagFormValues } from '../schema/feature-flag.schema'

// id ของค่าเริ่มต้นต้องคงที่ ห้ามสุ่ม ไม่งั้น SSR กับ client จะไม่ตรงกัน
export const defaultValues: FeatureFlagFormValues = {
  name: 'my-new-feature',
  description: '',
  enabled: true,
  variations: [
    { id: 'variation-on', name: 'on', value: 'true' },
    { id: 'variation-off', name: 'off', value: 'false' },
  ],
  targeting: [],
  defaultVariation: 'off',
}

// ส่ง schema ทั้งก้อนไม่ได้ เพราะ targeting เป็น type วนซ้ำ ตัว schema จึงอ้างถึงตัวเอง
// devtools ของ form จะ JSON.stringify options ทั้งก้อน แล้วเดินวนไม่จบจน dev server ตาย
// TanStack Form เรียกใช้แค่ ~standard.validate() ส่งไปเฉพาะส่วนนั้น validation จึงเหมือนเดิมทุกอย่าง
const featureFlagValidator = { '~standard': featureFlagSchema['~standard'] }

export function useFeatureFlagForm() {
  return useForm({
    defaultValues,
    validators: {
      onChange: featureFlagValidator,
    },
  })
}

export type FeatureFlagForm = ReturnType<typeof useFeatureFlagForm>
