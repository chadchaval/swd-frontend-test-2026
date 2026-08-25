type Issue = { message?: string } | string

// ✅ node ในต้นไม้ไม่ได้เป็น field ของฟอร์ม error จึงไม่ถูกส่งมาที่ field.state.meta
// zod ใส่ path เต็มไว้ใน errorMap ของฟอร์มอยู่แล้ว เช่น targeting[0].root.children[1].field จึงหยิบตาม path เอง
export function issuesAt(errorMap: unknown, path: string): Array<Issue> {
  const byPath = (
    errorMap as { onChange?: Record<string, Array<Issue>> } | undefined
  )?.onChange

  return byPath?.[path] ?? []
}
