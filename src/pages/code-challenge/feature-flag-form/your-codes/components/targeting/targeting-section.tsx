import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { FieldError } from '../common/field-error'
import { RuleGroup } from './rule-group'
import { buildQuery } from '../../lib/targeting/build-query'
import { createTargetingRule } from '../../lib/targeting/rule-tree'
import type { FeatureFlagForm } from '../../hooks/use-feature-flag-form'
import type { AnyGroup, Group } from '../../schema/feature-flag.schema'

export function TargetingSection({ form }: { form: FeatureFlagForm }) {
  return (
    <section className="bg-card border-border space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Targeting</h2>
        <p className="text-muted-foreground text-sm">
          ไล่จากบนลงล่าง ใครเข้าเงื่อนไขข้อไหนก่อนได้ variation ของข้อนั้น
        </p>
      </div>

      <form.Field name="targeting">
        {(targetingField) => (
          <div className="space-y-4">
            {targetingField.state.value.map((rule, index) => (
              <div
                // ห้ามใช้ index  ถ้าใช้แล้วลบ rule ตัวกลางออก ค่าที่พิมพ์ไว้จะสลับกัน เพราะ React จำสลับตัว
                key={rule.id}
                className="border-border space-y-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <form.Field name={`targeting[${index}].name`}>
                    {(field) => (
                      <Input
                        className="h-9"
                        placeholder={`Rule ${index + 1}`}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                    )}
                  </form.Field>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="ลบ rule"
                    onClick={() => targetingField.removeValue(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* ตัวแม่ผูกลูกทั้งหมด เป็น field เดียว*/}
                {/* ใช้ Subscribe ดึง error ของลูกๆมาแสดงตาม path */}
                <form.Subscribe selector={(state) => state.errorMap}>
                  {(errorMap) => (
                    <form.Field name={`targeting[${index}].root`}>
                      {(field) => (
                        <RuleGroup
                          group={field.state.value as AnyGroup}
                          path={`targeting[${index}].root`}
                          errorMap={errorMap}
                          onChange={(next) => field.handleChange(next as Group)}
                        />
                      )}
                    </form.Field>
                  )}
                </form.Subscribe>

                <div className="flex flex-wrap items-end gap-3">
                  <form.Field name={`targeting[${index}].percentage`}>
                    {(field) => (
                      <div className="w-28">
                        <label
                          htmlFor={field.name}
                          className="mb-1 block text-xs"
                        >
                          Percentage
                        </label>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          max={100}
                          className="h-9"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.valueAsNumber)
                          }
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe selector={(state) => state.values.variations}>
                    {(variations) => (
                      <form.Field name={`targeting[${index}].variation`}>
                        {(field) => (
                          <div className="min-w-40 flex-1">
                            <label
                              htmlFor={field.name}
                              className="mb-1 block text-xs"
                            >
                              Serve
                            </label>
                            <select
                              id={field.name}
                              className="border-border bg-background h-9 w-full rounded-md border px-3 text-sm"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                            >
                              <option value="">-- เลือก variation --</option>

                              {variations
                                .filter((variation) => variation.name.trim())
                                .map((variation) => (
                                  <option
                                    key={variation.id}
                                    value={variation.name}
                                  >
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
                </div>

                <div className="bg-muted rounded-md px-3 py-2 font-mono text-xs break-all">
                  {/* buildQuery คืนค่าว่างเมื่อยังไม่มีเงื่อนไขที่ครบสักข้อ */}
                  {buildQuery(rule.root) || (
                    <span className="text-muted-foreground font-sans">
                      ยังกรอกเงื่อนไขไม่ครบ ข้อที่ไม่ครบจะไม่ถูกใส่ใน query
                    </span>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => targetingField.pushValue(createTargetingRule())}
            >
              <Plus className="size-4" /> Add rule
            </Button>
          </div>
        )}
      </form.Field>
    </section>
  )
}
