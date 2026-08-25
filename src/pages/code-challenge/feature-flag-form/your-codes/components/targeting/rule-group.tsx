import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { ConditionRow } from './condition-row'
import { FieldError } from '../common/field-error'
import { issuesAt } from '../../lib/form/form-errors'
import {
  appendChild,
  createCondition,
  createGroup,
  removeChildAt,
  replaceChildAt,
} from '../../lib/targeting/rule-tree'
import type { AnyGroup } from '../../schema/feature-flag.schema'

// ✅ type ของ form data รองรับ children ซ้อนได้ 3 ชั้น ปิดปุ่มตรงนี้ให้ตรงกัน ผู้ใช้จะได้เห็นขอบเขตตั้งแต่ตอนกด
const MAX_GROUP_DEPTH = 2

export function RuleGroup({
  group,
  path,
  errorMap,
  onChange,
  onRemove,
  depth = 0,
}: {
  group: AnyGroup
  path: string
  errorMap: unknown
  onChange: (next: AnyGroup) => void
  onRemove?: () => void
  depth?: number
}) {
  const canNestGroup = depth < MAX_GROUP_DEPTH

  return (
    <div className="border-border space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <select
          aria-label="ตัวเชื่อมของกลุ่ม"
          className="border-border bg-background h-8 rounded-md border px-2 text-sm"
          value={group.operator}
          onChange={(event) =>
            onChange({
              ...group,
              operator: event.target.value as AnyGroup['operator'],
            })
          }
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>

        <span className="text-muted-foreground text-xs">
          เงื่อนไขในกลุ่มนี้ต้องเป็นจริง
          {group.operator === 'and' ? 'ทุกข้อ' : 'ข้อใดข้อหนึ่ง'}
        </span>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="ลบกลุ่ม"
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {group.children.map((child, index) =>
        // ✅ ตรงนี้คือจุดที่ recursive จริง กลุ่มเรียกตัวเองซ้ำเพื่อวาดกลุ่มที่ซ้อนอยู่ข้างใน
        child.type === 'group' ? (
          <RuleGroup
            key={child.id}
            group={child}
            path={`${path}.children[${index}]`}
            errorMap={errorMap}
            depth={depth + 1}
            onChange={(next) => onChange(replaceChildAt(group, index, next))}
            onRemove={() => onChange(removeChildAt(group, index))}
          />
        ) : (
          <ConditionRow
            key={child.id}
            condition={child}
            path={`${path}.children[${index}]`}
            errorMap={errorMap}
            onChange={(next) => onChange(replaceChildAt(group, index, next))}
            onRemove={() => onChange(removeChildAt(group, index))}
          />
        ),
      )}

      <FieldError errors={issuesAt(errorMap, `${path}.children`)} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(appendChild(group, createCondition()))}
        >
          <Plus className="size-4" /> Condition
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNestGroup}
          title={canNestGroup ? undefined : 'ซ้อนกลุ่มได้ลึกสุด 3 ชั้น'}
          onClick={() => onChange(appendChild(group, createGroup()))}
        >
          <Plus className="size-4" /> Group
        </Button>
      </div>
    </div>
  )
}
