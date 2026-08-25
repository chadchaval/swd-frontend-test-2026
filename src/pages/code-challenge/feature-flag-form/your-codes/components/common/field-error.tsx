type Issue = { message?: string } | string | undefined | null

// error ที่ได้จาก standard schema เป็น object ที่มี message ส่วนกรณีอื่นอาจเป็น string
function toMessage(issue: Issue): string {
  if (!issue) return ''
  if (typeof issue === 'string') return issue
  return issue.message ?? ''
}

export function FieldError({ errors }: { errors: Array<Issue> }) {
  // zod ยิง error ทุกข้อของ field พร้อมกัน เอามาต่อกันจะอ่านยาก จึงโชว์ทีละข้อ
  const message = errors.map(toMessage).find(Boolean)

  if (!message) return null

  return <p className="mt-1 text-xs text-red-500">{message}</p>
}
