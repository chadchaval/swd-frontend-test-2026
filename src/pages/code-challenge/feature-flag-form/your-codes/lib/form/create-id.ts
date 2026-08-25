// ใช้เฉพาะตอน user กดเพิ่มรายการ ห้ามเรียกตอนสร้าง defaultValues เพราะ SSR กับ client จะได้ id คนละตัวแล้ว hydration ไม่ตรงกัน
export function createId(): string {
  return crypto.randomUUID()
}
