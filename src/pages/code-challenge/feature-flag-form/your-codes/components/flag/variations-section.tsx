import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { createId } from '../../lib/form/create-id'
import { FieldError } from '../common/field-error'
import type { FeatureFlagForm } from '../../hooks/use-feature-flag-form'

export function VariationsSection({ form }: { form: FeatureFlagForm }) {
  return (
    <section className="bg-card border-border space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Variations</h2>

      <form.Field name="variations">
        {(variationsField) => (
          <div className="space-y-3">
            {variationsField.state.value.map((variation, index) => (
              // key ต้องเป็น id ที่คงที่ ถ้าใช้ index แล้วลบตัวกลาง ค่าที่พิมพ์ไว้จะสลับกัน
              <div key={variation.id} className="flex items-start gap-2">
                <form.Field name={`variations[${index}].name`}>
                  {(field) => (
                    <div className="flex-1">
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="ชื่อ เช่น on"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                <form.Field name={`variations[${index}].value`}>
                  {(field) => (
                    <div className="flex-1">
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="ค่า เช่น true"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.Field>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="ลบ variation"
                  disabled={variationsField.state.value.length <= 1}
                  onClick={() => variationsField.removeValue(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <FieldError errors={variationsField.state.meta.errors} />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                variationsField.pushValue({
                  id: createId(),
                  name: '',
                  value: '',
                })
              }
            >
              <Plus className="size-4" /> Add variation
            </Button>
          </div>
        )}
      </form.Field>
    </section>
  )
}
