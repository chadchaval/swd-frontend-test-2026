type Issue = { message?: string } | string

// zod ใส่ path เต็มไว้ให้แล้ว ไฟล์นี้มีหน้าที่เปิดหาตาม path นั้น แล้วส่งต่อให้ FieldError แสดง
// onChange คือชื่อ validator ที่ตั้งไว้ใน useForm ถ้าย้ายไปตรวจตอน onBlur ต้องแก้บรรทัดล่างตามด้วย
export function issuesAt(errorMap: unknown, path: string): Array<Issue> {
  const byPath = (
    errorMap as { onChange?: Record<string, Array<Issue>> } | undefined
  )?.onChange

  return byPath?.[path] ?? []
}
