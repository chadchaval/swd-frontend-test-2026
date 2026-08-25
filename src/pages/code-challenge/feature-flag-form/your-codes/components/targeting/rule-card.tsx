import { useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { FieldError } from '../common/field-error'
import { RuleGroup } from './rule-group'
import { buildQuery } from '../../lib/targeting/build-query'
import type { FeatureFlagForm } from '../../hooks/use-feature-flag-form'
import type {
  AnyGroup,
  Group,
  TargetingRule,
} from '../../schema/feature-flag.schema'

export function RuleCard({
  form,
  rule,
  index,
  onRemove,
}: {
  form: FeatureFlagForm
  rule: TargetingRule
  index: number
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

  return (
    <div
      ref={setNodeRef}
      // ใช้แค่แกน y เอง จะได้ไม่ต้องลง @dnd-kit/modifiers มาล็อกแกนให้ ลิสต์นี้เรียงแนวตั้งอย่างเดียว
      style={{
        transform: transform
          ? `translate3d(0, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      className={cn(
        'bg-card border-border relative space-y-3 rounded-lg border p-3',
        isDragging && 'z-10 opacity-60 shadow-lg',
      )}
    >
      <div className="flex items-center gap-2">
        {/* ลากได้เฉพาะที่หูจับ ถ้าผูก listener ไว้ทั้งการ์ด การลากเลือกข้อความในช่องกรอกจะกลายเป็นการลากการ์ดแทน */}
        <button
          type="button"
          aria-label={`ลากเพื่อจัดลำดับ rule ที่ ${index + 1}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring cursor-grab touch-none rounded p-1 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <form.Field name={`targeting[${index}].name`}>
          {(field) => (
            <Input
              className="h-9"
              placeholder={`Rule ${index + 1}`}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </form.Field>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="ลบ rule"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* ผูกทั้งต้นไม้เป็น field เดียว แล้วให้ component ลูกส่งต้นไม้ชุดใหม่กลับมา
          ส่วน path ที่ส่งลงไปใช้เปิดหา error อย่างเดียว ไม่ได้ใช้ผูกค่า */}
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
              <label htmlFor={field.name} className="mb-1 block text-xs">
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
                  <label htmlFor={field.name} className="mb-1 block text-xs">
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
      </div>

      <div className="bg-muted rounded-md px-3 py-2 font-mono text-xs break-all">
        {buildQuery(rule.root) || (
          <span className="text-muted-foreground font-sans">
            ยังกรอกเงื่อนไขไม่ครบ ข้อที่ไม่ครบจะไม่ถูกใส่ใน query
          </span>
        )}
      </div>
    </div>
  )
}
