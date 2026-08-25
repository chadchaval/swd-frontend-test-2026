# Feature Flag Editor

หน้าเว็บสำหรับกำหนดค่า Feature Flag พร้อมดูผลลัพธ์ JSON แบบ real-time
โจทย์: [README.md](src/pages/code-challenge/feature-flag-form/README.md)
โค้ดทั้งหมดอยู่ที่ `src/pages/code-challenge/feature-flag-form/your-codes/`

## หมายเหตุเรื่องการใช้ AI

พัฒนาโปรเจกต์นี้โดยใช้ AI ช่วยในลักษณะ pair programming ทั้งการร่างโค้ดและอธิบายแนวคิด
โดยเฉพาะ unit test และไฟล์นี้ ซึ่งเป็นงานที่ใช้เวลามาก

การตัดสินใจเชิงออกแบบทุกข้อในหัวข้อด้านล่างเป็นการเลือกของผมเอง
และได้ตรวจสอบกับผลรันจริงทุกส่วนก่อนส่ง

## เทคโนโลยีที่ใช้

|                 |                                           |
| :-------------- | :---------------------------------------- |
| React           | 19.2.5                                    |
| TanStack Start  | 1.168.49                                  |
| Form            | `@tanstack/react-form` 1.28.6             |
| Validation      | `zod` 4.3.6                               |
| JSON Preview    | `@monaco-editor/react` 4.7.0              |
| Styling         | Tailwind CSS 4.2.2 + shadcn/ui + radix-ui |
| Build / Test    | Vite 7.3.2 / Vitest 3.2.4                 |
| Package Manager | pnpm 11.6.0                               |

เพิ่มเข้ามาเอง 3 ตัว ดูเหตุผลในหัวข้อ [dependency ที่เพิ่มเข้ามา](#6-dependency-ที่เพิ่มเข้ามา)

## วิธีติดตั้งและรัน

```bash
pnpm install
pnpm dev
```

เปิด `http://localhost:3000/code-challenge/feature-flag-form`

ต้องต่ออินเทอร์เน็ตเฉพาะตอน `pnpm install` เท่านั้น ตัว editor โหลดจาก `node_modules` ในเครื่อง

## วิธีรันเทส

```bash
pnpm test
```

มีเทส 17 ข้อ ครอบคลุมการประกอบ query string (group ซ้อนหลายชั้น, group ที่มีลูกตัวเดียว,
เงื่อนไขที่กรอกไม่ครบ, operator แต่ละแบบ) และการแปลงค่าฟอร์มเป็น JSON

## โครงสร้างไฟล์

```
your-codes/
├── index.tsx                 # ประกอบหน้า และเป็นเจ้าของ form
├── hooks/                    # useForm ที่ผูก schema เข้ากับฟอร์ม
├── schema/                   # zod schema และ type ทั้งหมด
├── components/               # UI ล้วน ไม่มี business logic
│   ├── targeting/            # targeting-section, rule-card, rule-group, condition-row
│   ├── flag/                 # flag-metadata, variations, default-rule
│   ├── preview/              # json-preview
│   └── common/               # field-error
└── lib/                      # logic ล้วน ไม่มี JSX
    ├── targeting/            # build-query, operators, rule-tree (+ test)
    ├── output/               # to-json-output (+ test)
    ├── form/                 # create-id, form-errors
    └── monaco/               # setup-monaco
```

แบ่งสองแกน แกนนอกคือ UI กับ logic แกนในคือเรื่องที่ไฟล์นั้นรับผิดชอบ
`lib/` ไม่ import `components/` เลยสักไฟล์ จึงเขียน unit test ได้โดยไม่ต้อง render อะไร
และ test วางไว้ข้างไฟล์ที่มันทดสอบ

---

# การตัดสินใจในการออกแบบ

โจทย์ไม่ได้ระบุบางเรื่องไว้ ส่วนนี้สรุปเฉพาะสิ่งที่เลือกและเหตุผลโดยย่อ
รายละเอียดดูได้จากโค้ดและ comment ในไฟล์ที่อ้างถึง

### 1. โครงสร้างข้อมูลของ targeting rule

ไฟล์: `schema/feature-flag.schema.ts`

- **เลือก:** เก็บเงื่อนไขเป็นต้นไม้ที่มี node สองชนิด คือ `condition` (ใบ) กับ `group` (กิ่ง) แยกด้วย field `type` และทุก node มี `id`
- **เหตุผล:** discriminated union ทำให้ฟังก์ชัน recursive เขียนง่ายและ TypeScript แยกสาขาให้เอง ส่วน `id` จำเป็นเพราะ React ต้องการ key ที่คงที่ ถ้าใช้ index แล้วลบตัวกลาง ค่าที่พิมพ์ไว้จะสลับกัน
- **ผลที่ตามมา:** `id` เป็น state ของฟอร์มเท่านั้น ไม่ถูกส่งออกไปใน JSON

### 2. ผูกทั้งต้นไม้เป็น field เดียว

ไฟล์: `components/targeting/rule-card.tsx`, `lib/targeting/rule-tree.ts`, `lib/form/form-errors.ts`

- **เลือก:** ผูก `targeting[i].root` เป็น field เดียว แล้วให้ component ที่ recursive ส่งต้นไม้ชุดใหม่กลับมา แทนการทำทุก node เป็น field
- **เหตุผล:** ถ้าแยกเป็น field ต่อ node ต้องประกอบ path เป็น string ตอนรัน แต่ component ที่เรียกตัวเองไม่รู้ว่าตัวเองอยู่ชั้นไหนตอน compile จึงต้อง cast เป็น `never` ทุกจุด เท่ากับปิด type checking ทิ้งทั้งต้นไม้
- **แลกกับ:** พิมพ์ในเงื่อนไขหนึ่งข้อ ต้นไม้ของ rule ข้อนั้นจะ render ใหม่ทั้งก้อน แต่ rule ข้ออื่นและส่วนอื่นของฟอร์มไม่กระทบ
- **ผลที่ตามมา:** error ของ node ที่อยู่ลึกไม่ถูกส่งมาที่ `field.state.meta` จึงส่ง path ลงไปกับ recursion เพื่อเปิดหาใน `errorMap` ของฟอร์มแทน โดย path นั้นเป็นแค่ key ของ object ไม่ต้องผ่าน type check

> ข้อจำกัดที่เจอระหว่างทาง: ถ้าใส่ type ที่วนซ้ำไม่จำกัดลงใน form data ทั้งฟอร์มพังทันที
> ได้ `TS2589` และทุก field กลายเป็น `any` เพราะ TanStack Form เดิน `DeepKeys` ทุก path
> แก้ด้วยการจำกัดความลึกฝั่ง type และแยก type แบบวนซ้ำจริงไว้ใช้กับ logic และ test
> ทดสอบแล้วว่าจำกัดกี่ชั้นก็ได้ ขอแค่มีจุดจบ ที่ 14 ชั้นก็ยังคอมไพล์ผ่าน

### 3. รูปแบบ query string

ไฟล์: `lib/targeting/operators.ts`, `lib/targeting/build-query.ts`

- **เลือก:** ใช้สัญลักษณ์กับตัวเปรียบเทียบ (`==`, `!=`, `<` ...) ใช้คำย่อกับตัวที่ไม่มีสัญลักษณ์ (`co`, `sw`, `ew`, `in`, `pr`, `not`) และใช้ single quote ทั้งเส้น
- **เหตุผล:** editor ของจริงใช้คำย่อและ double quote ทั้งหมด แต่ `expected.json` ในโจทย์ใช้ `group == 'beta'` จึงยึดตามโจทย์เพราะเป็น output ที่ถูกให้คะแนน
- **ผลที่ตามมา:** สามตัวที่เดาผิดตอนแรกและต้องไปเปิด editor ของจริงถึงจะรู้ คือ `in` ใช้วงเล็บเหลี่ยม (`country in ['TH','EN']`), `not` เป็นตัวเปรียบเทียบที่ต้องมีค่า (`plan not 'free'`) และ `pr` ก็มีค่าตามหลัง (`ad pr "ad"`)

### 4. โครงสร้าง JSON ที่ส่งออก

ไฟล์: `lib/output/to-json-output.ts`

- **เลือก:** ยึดตาม `expected.json` คือครอบด้วย `flags` และไม่มี `name` ใน targeting
- **เหตุผล:** JSON ที่ editor ของจริงสร้างไม่มี `flags` ครอบและมี `name` อยู่ด้วย แต่เกณฑ์ให้คะแนนระบุความถูกต้องของ output ไว้ตรง ๆ
- **ผลที่ตามมา:** ช่อง Rule name ที่มีในหน้าจอตาม editor ของจริง จะไม่ปรากฏใน JSON ส่วน `disable` กับ `metadata.description` ใส่แบบมีเงื่อนไข เมื่อใช้งานตามปกติ output จึงตรงกับ `expected.json` ทุกตัวอักษร

### 5. แก้ src/styles.css ซึ่งเป็นไฟล์ที่โจทย์ให้มา

ไฟล์: `src/styles.css`

- **เลือก:** ย้ายบล็อก `--color-*` และ `--radius-*` ไปเป็น `@theme inline` แล้วเติมชุดค่าสีของโหมดสว่างใน `:root`
- **เหตุผล:** design token ของ shadcn ใช้ไม่ได้เลยทั้งแอปตั้งแต่ต้น `bg-card` และ `border-border` คำนวณออกมาเป็นโปร่งใส และ `rounded-xl` ได้ `0px` เพราะ Tailwind v4 สร้าง utility ให้เฉพาะ token ที่ประกาศใน `@theme` และค่าสีโหมดสว่างไม่มีนิยามอยู่ที่ไหนเลย
- **ผลที่ตามมา:** ตรวจแล้วว่าใช้ได้ครบทั้ง light, dark และ auto ไม่ได้แตะ `theme-toggle.tsx` เพราะฝั่ง TypeScript เขียนไว้ถูกอยู่แล้ว

### 6. dependency ที่เพิ่มเข้ามา

ไฟล์: `package.json`, `lib/monaco/setup-monaco.ts`, `components/targeting/targeting-section.tsx`

- **เลือก:** เพิ่ม `monaco-editor` และ `@dnd-kit/core` กับ `@dnd-kit/sortable`
- **เหตุผล:** `@monaco-editor/react` เป็นตัวห่อ 188 KB ที่ประกาศ `monaco-editor` เป็น peer dependency ซึ่งโจทย์ไม่ได้ประกาศไว้ ตัว loader จึงดึง editor จาก CDN ตอนรัน ส่วน dnd-kit ใช้ทำโบนัสสลับลำดับ rule ให้รองรับทั้งเมาส์และคีย์บอร์ด
- **ผลที่ตามมา:** ต้องบอก Vite ด้วยว่า worker ของ monaco อยู่ไหน และ `setup-monaco` ถูก import แบบ dynamic ใน effect เพราะใช้ `self` กับ `?worker` ซึ่งมีเฉพาะบนเบราว์เซอร์ ถ้าปล่อยให้ SSR แตะจะได้ `Element type is invalid` แล้วทั้งหน้าถอยไป client rendering

## สิ่งที่ยังไม่ได้ทำ

- **ชนิดของค่าใน condition** เดาจากสิ่งที่พิมพ์ `18` เป็นตัวเลข `true` เป็น boolean นอกนั้นเป็นข้อความ ทำให้ระบุข้อความ `'18'` ไม่ได้ ถ้าต้องการควรเพิ่ม dropdown เลือกชนิด
- **ขนาด bundle ของ monaco** `dist/client/assets` รวม 15 MB โดยเกือบ 14 MB เป็น monaco ซึ่งลากทุกภาษาเข้ามาทั้งที่ใช้แค่ JSON ลดได้ด้วยการ import เฉพาะ core กับภาษา JSON แต่เป็น import path ภายในที่เปลี่ยนตามเวอร์ชันได้ ปัจจุบันแยกเป็น chunk ต่างหากและโหลดทีหลังอยู่แล้ว จึงไม่บล็อกการแสดงผลครั้งแรก
