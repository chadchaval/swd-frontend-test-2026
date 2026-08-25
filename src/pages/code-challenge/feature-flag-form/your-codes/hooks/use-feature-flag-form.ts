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
