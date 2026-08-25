"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "#/lib/utils"

// ❓ shadcn ตัวจริงใช้ bg-primary ซึ่งโหมดสว่างจะออกมาเกือบดำ แยกเปิดปิดด้วยตำแหน่งลูกกลมอย่างเดียว
// เลือกใช้เขียวเพราะ flag เปิดปิดควรอ่านออกจากสีได้ทันที ไม่ต้องเพ่งว่าลูกกลมอยู่ซ้ายหรือขวา
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none",
        "bg-slate-300 data-[state=checked]:bg-emerald-500",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
          "translate-x-0.5 data-[state=checked]:translate-x-[18px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
