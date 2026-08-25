import Header from '#/components/features/header'
import { DefaultRuleSection } from './components/default-rule-section'
import { FlagMetadataSection } from './components/flag-metadata-section'
import { VariationsSection } from './components/variations-section'
import { useFeatureFlagForm } from './hooks/use-feature-flag-form'
import { toJsonOutput } from './lib/to-json-output'

function YourCode() {
  const form = useFeatureFlagForm()

  return (
    <section className="space-y-5">
      <Header
        title="Feature Flag Editor"
        subTitle="กรอกฟอร์มด้านซ้าย แล้วดูผลลัพธ์ JSON ด้านขวาแบบ real-time"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FlagMetadataSection form={form} />
          <VariationsSection form={form} />
          <DefaultRuleSection form={form} />
        </form>

        {/* ตอนนี้ preview เป็น pre ธรรมดาไปก่อน เดี๋ยว Phase 3 ค่อยเปลี่ยนเป็น Monaco */}
        <div className="bg-card border-border h-fit rounded-xl border p-5">
          <h2 className="mb-3 text-lg font-semibold">JSON Preview</h2>
          {/* Subscribe เลือกเฉพาะ values ทำให้ส่วนนี้ re-render เมื่อค่าฟอร์มเปลี่ยนเท่านั้น */}
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-blue-300">
                {JSON.stringify(toJsonOutput(values), null, 2)}
              </pre>
            )}
          </form.Subscribe>
        </div>
      </div>
    </section>
  )
}

export default YourCode
