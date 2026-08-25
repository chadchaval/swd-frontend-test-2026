import Editor from '@monaco-editor/react'
import { useEffect, useState } from 'react'

// monaco สร้าง editor ลงบน DOM จริง ฝั่ง server จึง render ไม่ได้ ต้องรอ mount ฝั่ง client ก่อน
// ถ้าปล่อยให้ SSR แตะ จะได้ error element type is invalid แล้วทั้งหน้า fallback ไป client rendering
export function JsonPreview({ value }: { value: string }) {
  const [isReady, setIsReady] = useState(false)

  // import แบบ dynamic ใน effect เพื่อไม่ให้ setup-monaco ติดไปกับ bundle ฝั่ง server
  // ไฟล์นั้นเรียก self และ ?worker ซึ่งมีเฉพาะบนเบราว์เซอร์
  useEffect(() => {
    let isActive = true

    void import('../../lib/monaco/setup-monaco').then(() => {
      if (isActive) setIsReady(true)
    })

    return () => {
      isActive = false
    }
  }, [])

  if (!isReady) {
    return (
      <div className="text-muted-foreground flex h-[520px] items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-sm">
        กำลังโหลด editor...
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <Editor
        height="520px"
        language="json"
        theme="vs-dark"
        value={value}
        // readOnly กันแก้ผ่าน UI ส่วน domReadOnly กันแก้ผ่าน input method ที่ยิงเข้า DOM ตรง ๆ ต้องใส่คู่กัน
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}
