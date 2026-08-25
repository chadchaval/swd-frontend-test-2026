import { FieldError } from '../common/field-error'
import type { FeatureFlagForm } from '../../hooks/use-feature-flag-form'

export function DefaultRuleSection({ form }: { form: FeatureFlagForm }) {
  return (
    <section className="bg-card border-border space-y-3 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Default</h2>
      <p className="text-muted-foreground text-sm">
        ค่าที่คืนเมื่อไม่ตรงกับ targeting rule ข้อไหนเลย
      </p>

      {/* ตัวเลือกต้องผูกกับ variations ไม่ใช่ค่าคงที่ พอผู้ใช้เปลี่ยนชื่อ variation dropdown ต้องเปลี่ยนตาม */}
      <form.Subscribe selector={(state) => state.values.variations}>
        {(variations) => (
          <form.Field name="defaultVariation">
            {(field) => (
              <div>
                <label htmlFor={field.name} className="mb-1 block text-sm">
                  Serve
                </label>
                <select
                  id={field.name}
                  className="border-border bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                >
                  <option value="">-- เลือก variation --</option>
                  {variations
                    .filter((variation) => variation.name.trim())
                    .map((variation) => (
                      <option key={variation.id} value={variation.name}>
                        {variation.name}
                      </option>
                    ))}
                </select>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        )}
      </form.Subscribe>
    </section>
  )
}
