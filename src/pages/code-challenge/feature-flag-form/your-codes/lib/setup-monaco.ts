import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// ✅ monaco แยก worker ตามภาษา ถ้าไม่บอกว่า worker อยู่ไหน มันจะไปหาไฟล์ที่ Vite ไม่ได้ build ไว้
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    return label === 'json' ? new JsonWorker() : new EditorWorker()
  },
}

// ✅ ค่าเริ่มต้นของ @monaco-editor/react คือดึง monaco จาก CDN บรรทัดนี้สั่งให้ใช้ตัวที่ติดตั้งในเครื่องแทน
loader.config({ monaco })
