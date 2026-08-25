import { Input } from '#/components/ui/input'
import { FieldError } from './field-error'
import type { FeatureFlagForm } from '../hooks/use-feature-flag-form'

export function FlagMetadataSection({ form }: { form: FeatureFlagForm }) {
  return (
    <section className="bg-card border-border space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Flag</h2>

      <form.Field name="name">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block text-sm">
              Flag Name
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="my-new-feature"
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div>
            <label htmlFor={field.name} className="mb-1 block text-sm">
              Description
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="อธิบายว่า flag นี้ใช้ทำอะไร"
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-emerald-500"
              checked={field.state.value}
              onChange={(event) => field.handleChange(event.target.checked)}
            />
            {field.state.value ? 'Enabled' : 'Disabled'}
          </label>
        )}
      </form.Field>
    </section>
  )
}
