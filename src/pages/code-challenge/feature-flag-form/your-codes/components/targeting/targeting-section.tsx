import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { RuleCard } from './rule-card'
import { createTargetingRule } from '../../lib/targeting/rule-tree'
import type { DragEndEvent } from '@dnd-kit/core'
import type { FeatureFlagForm } from '../../hooks/use-feature-flag-form'

export function TargetingSection({ form }: { form: FeatureFlagForm }) {
  const sensors = useSensors(
    // ต้องลากให้ได้ 8px ก่อนถึงนับเป็นการลาก ไม่งั้นแค่คลิกช่องกรอกในการ์ดก็กลายเป็นการลาก
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // ตัวนี้ทำให้จัดลำดับด้วยคีย์บอร์ดได้ Tab ไปที่หูจับ เคาะ Space แล้วกดลูกศร
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <section className="bg-card border-border space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Targeting</h2>
        <p className="text-muted-foreground text-sm">
          ไล่จากบนลงล่าง ใครเข้าเงื่อนไขข้อไหนก่อนได้ variation ของข้อนั้น
          ลากที่หูจับเพื่อสลับลำดับได้
        </p>
      </div>

      <form.Field name="targeting">
        {(targetingField) => {
          const rules = targetingField.state.value

          //dnd-kit บอกแค่ว่าลากอะไรไปวางทับอะไร ต้องแปลง id เป็นตำแหน่งเองแล้วสั่ง moveValue
          function handleDragEnd(event: DragEndEvent) {
            const { active, over } = event
            if (!over || active.id === over.id) return

            const from = rules.findIndex((rule) => rule.id === active.id)
            const to = rules.findIndex((rule) => rule.id === over.id)
            if (from === -1 || to === -1) return

            targetingField.moveValue(from, to)
          }

          return (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={rules.map((rule) => rule.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {rules.map((rule, index) => (
                      <RuleCard
                        key={rule.id}
                        form={form}
                        rule={rule}
                        index={index}
                        onRemove={() => targetingField.removeValue(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => targetingField.pushValue(createTargetingRule())}
              >
                <Plus className="size-4" /> Add rule
              </Button>
            </div>
          )
        }}
      </form.Field>
    </section>
  )
}
