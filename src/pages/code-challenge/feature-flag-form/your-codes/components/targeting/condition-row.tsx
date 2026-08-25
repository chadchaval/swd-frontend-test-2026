import { Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { FieldError } from '../common/field-error'
import { issuesAt } from '../../lib/form/form-errors'
import { OPERATORS, operatorNeedsValue } from '../../lib/targeting/operators'
import type { OperatorValue } from '../../lib/targeting/operators'
import type { Condition } from '../../schema/feature-flag.schema'

const SELECT_CLASS =
  'border-border bg-background h-9 rounded-md border px-2 text-sm'

export function ConditionRow({
  condition,
  path,
  errorMap,
  onChange,
  onRemove,
}: {
  condition: Condition
  path: string
  errorMap: unknown
  onChange: (next: Condition) => void
  onRemove: () => void
}) {
  const needsValue = operatorNeedsValue(condition.operator)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="h-9 min-w-28 flex-1"
          placeholder="field เช่น group"
          value={condition.field}
          onChange={(event) =>
            onChange({ ...condition, field: event.target.value })
          }
        />

        <select
          aria-label="operator"
          className={SELECT_CLASS}
          value={condition.operator}
          onChange={(event) =>
            onChange({
              ...condition,
              operator: event.target.value as OperatorValue,
            })
          }
        >
          {OPERATORS.map((operator) => (
            <option key={operator.value} value={operator.value}>
              {operator.label}
            </option>
          ))}
        </select>

        {/* operator อย่าง pr ไม่ต้องมีค่า ซ่อนช่องไปเลยดีกว่าปล่อยให้กรอกแล้วค่านั้นถูกทิ้งเงียบ ๆ */}
        {needsValue && (
          <Input
            className="h-9 min-w-28 flex-1"
            placeholder={
              condition.operator === 'in' ? 'คั่นด้วย , เช่น TH, SG' : 'ค่า'
            }
            value={condition.value}
            onChange={(event) =>
              onChange({ ...condition, value: event.target.value })
            }
          />
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="ลบเงื่อนไข"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <FieldError errors={issuesAt(errorMap, `${path}.field`)} />
    </div>
  )
}
