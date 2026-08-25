# NOTES

บันทึกการตัดสินใจเชิงเทคนิคของโจทย์ Feature Flag Editor
โค้ดทั้งหมดอยู่ที่ `src/pages/code-challenge/feature-flag-form/your-codes/`

## หมายเหตุเรื่องการใช้ AI

พัฒนาโดยใช้ AI ช่วยในลักษณะ pair programming ทั้งการร่างโค้ดและอธิบายแนวคิด
การตัดสินใจในเอกสารนี้เป็นการเลือกของผมเอง และตรวจสอบกับผลรันจริงทุกข้อ

---

## 1. โครงสร้างข้อมูลของ targeting rule

เงื่อนไขหนึ่งชุดเป็นต้นไม้ที่มี node แค่ 2 ชนิด

```ts
Condition = { id, type: 'condition', field, operator, value } // ใบ
Group = { id, type: 'group', operator: 'and' | 'or', children } // กิ่ง ลูกเป็น node อะไรก็ได้
```

- ใช้ **discriminated union** ผ่าน field `type` เพื่อให้ TypeScript แยกสาขาได้เอง และฟังก์ชัน recursive เขียนง่าย
- ทุก node มี **`id`** เพราะ React ต้องการ key ที่คงที่ ถ้าใช้ index เป็น key แล้วลบตัวกลางออก ค่าที่พิมพ์ไว้จะสลับกัน และจำเป็นถ้าจะต่อยอดเป็น drag and drop
- `id` เป็น state ของฟอร์มเท่านั้น ไม่ถูกส่งออกไปใน JSON

## 2. ข้อจำกัดที่เจอจริง: recursive type ทำให้ TanStack Form infer ไม่ได้

พอใส่ type ที่วนซ้ำไม่จำกัดลงใน form data ทั้งฟอร์มพังทันที ทุก field กลายเป็น `any`
พร้อม error `TS2589 Type instantiation is excessively deep and possibly infinite`

สาเหตุคือ TanStack Form ใช้ `DeepKeys<TFormData>` เดินทุก path ของข้อมูล เมื่อเจอ type ที่วนซ้ำไม่จำกัด TypeScript จึงเดินไม่จบ

ทดลองแล้วว่าวิธีต่อไปนี้ **ไม่ช่วย**: เปลี่ยนเป็น `interface`, แยก component ออกไป, ถอด validator ออก

วิธีที่ใช้คือ **แยก type เป็นสองชุด**

| type                       | ใช้ที่ไหน             | ความลึก                           |
| :------------------------- | :-------------------- | :-------------------------------- |
| `RuleNode` / `Group`       | ใน form data          | จำกัด 4 ชั้น เฉพาะฝั่ง TypeScript |
| `AnyRuleNode` / `AnyGroup` | `buildQuery` และ test | ไม่จำกัด                          |

ตอน runtime Zod ยังตรวจได้ลึกไม่จำกัด เพราะ schema ใช้ getter วนซ้ำจริง สิ่งที่จำกัดคือ type เท่านั้น
ในทางปฏิบัติ 4 ชั้นเกินพอสำหรับเงื่อนไขของ feature flag

## 3. Zod schema ที่อ้างถึงตัวเอง

ใช้ getter ตามที่ Zod v4 แนะนำ

```ts
get children() {
  return z.array(ruleNodeSchema)
}
```

ถ้าเขียน `children: z.array(ruleNodeSchema)` ตรง ๆ จะพัง เพราะตอนอ่านบรรทัดนั้น `ruleNodeSchema` ยังไม่ถูกสร้าง
getter ทำให้ประเมินตอนถูกเรียกใช้แทน

Zod v4 เป็น standard schema อยู่แล้ว จึงส่งเข้า `validators.onChange` ของ TanStack Form ได้ตรง ๆ ไม่ต้องมี adapter
ส่วน validation ที่ต้องดูข้ามหลาย field เช่น ชื่อ variation ซ้ำ หรือ default rule อ้างถึง variation ที่ไม่มีอยู่ ทำใน `.check()` ระดับ object

## 4. รูปแบบ operator ใน query string

GO Feature Flag ของจริงใช้คำย่อทั้งหมด (`eq`, `ne`, `lt`, `gt`, ...) ตรวจสอบจาก editor ของเขาแล้ว
แต่ `expected.json` ในโจทย์ใช้ `group == 'beta'`

เลือกยึดตามโจทย์ คือใช้สัญลักษณ์กับตัวเปรียบเทียบ (`==`, `!=`, `<`, `>`, `<=`, `>=`)
และใช้คำย่อกับตัวที่ไม่มีสัญลักษณ์ (`co`, `sw`, `ew`, `in`, `pr`, `not`)

สองตัวที่ต้องไปดูของจริงถึงจะรู้รูปแบบ

- `in` รับค่าเป็นรายการในวงเล็บเหลี่ยม เช่น `country in ['TH', 'SG']` ไม่ใช่วงเล็บกลม
- `not` เป็นตัวเปรียบเทียบที่ต้องมีค่าตามหลัง เช่น `plan not 'free'` ไม่ใช่ logical not ที่ครอบทั้ง expression
  จึงมี `pr` ตัวเดียวที่ไม่ต้องกรอกค่า และเป็นตัวเดียวที่ UI ซ่อนช่อง value

เรื่อง quote ของจริงใช้ double quote ทั้งหมด (`s in ["aeq"]`) แต่ `expected.json` ใช้ single quote (`group == 'beta'`)
เลือก single quote ให้เหมือนกันทั้งเส้น เพราะ output ที่ถูกให้คะแนนคือ `expected.json`
ถ้าผสมสองแบบใน query เดียวกันจะอ่านแล้วสะดุดกว่า

ทั้งหมดรวมไว้ใน `lib/operators.ts` ที่เดียว ทั้ง label ที่แสดงใน dropdown ค่าใน query และข้อมูลว่า operator ตัวนั้นต้องมีช่อง value หรือไม่
ถ้าต้องเปลี่ยนไปใช้คำย่อทั้งหมดแบบ GOFF แก้ที่ไฟล์นี้ไฟล์เดียว

## 5. ชนิดของค่าใน condition

ให้ผู้ใช้กรอกช่องเดียวแล้วเดาชนิดจากสิ่งที่พิมพ์

- `18` เป็นตัวเลข ไม่ใส่ quote
- `true` และ `false` เป็น boolean ไม่ใส่ quote
- นอกนั้นเป็นข้อความ ใส่ quote ให้

ข้อจำกัดคือถ้าอยากได้ข้อความ `'18'` จริง ๆ จะทำไม่ได้ ทางแก้คือเพิ่ม dropdown เลือกชนิด
แต่เลือกไม่ทำเพื่อให้ UI เบาและเอาเวลาไปลงกับส่วน targeting ที่ซับซ้อนกว่า

## 6. โครงสร้าง JSON ที่ส่งออก

`expected.json` ในโจทย์กับ JSON ที่ editor ของจริงสร้าง **ไม่เหมือนกัน**

|                     | GOFF ของจริง          | expected.json ของโจทย์ |
| :------------------ | :-------------------- | :--------------------- |
| ครอบด้วย `flags`    | ไม่มี                 | มี                     |
| `name` ใน targeting | มี                    | ไม่มี                  |
| `percentage`        | ไม่มีในตัวอย่างที่ลอง | มี                     |

เลือกยึด `expected.json` เพราะเกณฑ์ให้คะแนนระบุเรื่องความถูกต้องของ output ไว้ตรง ๆ
ส่วน UI ยังทำตาม editor ของจริงตามที่โจทย์บอก รวมถึงช่อง Rule name ที่มีในหน้าจอแต่ไม่ถูกส่งออกไปใน JSON

### description และ enabled

โจทย์กำหนดให้ฟอร์มมีคำอธิบายและสถานะ แต่ `expected.json` ไม่ได้บอกว่าสองอย่างนี้ไปอยู่ตรงไหน
จึงใส่แบบมีเงื่อนไข อ้างอิงจาก GOFF ของจริงที่มีทั้งปุ่ม Disable และส่วน Metadata

- `disable: true` โผล่เฉพาะตอนปิดใช้งาน
- `metadata.description` โผล่เฉพาะตอนกรอกคำอธิบาย

ผลคือเมื่อใช้งานตามปกติ output จะตรงกับ `expected.json` ทุกตัวอักษร แต่ช่องในฟอร์มก็ไม่ได้เป็นของตายที่ไม่มีผลอะไร

## 7. การตีความคำว่า Group และ Role ในเกณฑ์

เกณฑ์เขียนว่า "การจัดการสร้างกลุ่ม (Groups) และการกำหนดสิทธิ์ (Roles)"
ตีความว่าอยู่ในบริบทของ targeting rule คือ Group หมายถึงกลุ่มเงื่อนไข and/or ที่ซ้อนกันได้
ส่วน Role หมายถึง field ที่ใช้ target เช่น `role == 'admin'`

เนื่องจากผู้ใช้พิมพ์ชื่อ field ได้เอง จึงรองรับทั้ง `role`, `group`, `country` หรืออะไรก็ได้โดยไม่ต้องทำระบบแยก

## 8. การแยกไฟล์

`schema/` และ `lib/` เป็น logic ล้วน ไม่มี JSX เลย จึงเขียน unit test ได้โดยไม่ต้อง render อะไร
ส่วน `components/` เป็น UI ล้วน ไม่ถือ business logic

`buildQuery` และ `toJsonOutput` มี test ครอบคลุมเคสที่พลาดง่าย เช่น group ซ้อนหลายชั้น group ที่มีลูกตัวเดียว
และเงื่อนไขที่ผู้ใช้ยังกรอกไม่ครบ รันด้วย `pnpm test`

## 9. แก้ src/styles.css ซึ่งเป็นไฟล์ที่โจทย์ให้มา

design token ของ shadcn ใช้ไม่ได้เลยทั้งแอปตั้งแต่ต้น `bg-card` `bg-primary` `border-border` คำนวณออกมาเป็นโปร่งใส
และ `rounded-xl` ได้ `0px` ทำให้การ์ดทุกใบมุมเหลี่ยม เส้นขอบเป็นสีดำ default ของเบราว์เซอร์

สาเหตุมีสองชั้น

- `--color-*` กับ `--radius-*` ถูกวางไว้ใน `:root` ธรรมดา แต่ Tailwind v4 สร้าง utility ให้เฉพาะ token ที่ประกาศใน `@theme` เท่านั้น class อย่าง `bg-card` จึงไม่ถูกสร้างตั้งแต่ตอน build
- ค่าสีของโหมดสว่างไม่มีนิยามอยู่ที่ไหนเลย มีแต่ชุดโหมดมืดใน `:root[data-theme='dark']`

แก้สองจุดตรงกับสาเหตุ คือย้ายบล็อก mapping ไปเป็น `@theme inline` และเติมชุดค่าโหมดสว่างใน `:root`
ส่วน media query ของ `prefers-color-scheme` เดิมคัดลอก mapping มาซ้ำโดยไม่ได้ให้ค่าสีอะไร เปลี่ยนเป็นให้ค่าชุดโหมดมืดแทน

ตัว `theme-toggle.tsx` เขียนไว้ถูกอยู่แล้ว คือใส่ `data-theme` เมื่อผู้ใช้เลือกเอง และถอดออกเมื่อเป็น auto เพื่อให้ media query ตัดสิน
ปัญหาอยู่ที่ฝั่ง CSS ล้วน ๆ จึงไม่ได้แตะไฟล์ TypeScript เลย ตรวจแล้วว่าใช้ได้ครบทั้ง light, dark และ auto

เลือกแก้แทนที่จะเลี่ยงไปใช้สีตรง ๆ เพราะเกณฑ์ให้คะแนนพูดถึงความสม่ำเสมอของ spacing และ border
ถ้า `rounded-xl` กับ `bg-card` ที่เขียนไว้ไม่ทำงาน ความสม่ำเสมอที่ตั้งใจไว้ก็มองไม่เห็น

## 10. pnpm-workspace.yaml

pnpm 11 ไม่อ่าน field `pnpm.onlyBuiltDependencies` ใน `package.json` อีกแล้ว ย้ายไปอยู่ใน `pnpm-workspace.yaml` แทน
ทำให้ build script ของ esbuild ถูกบล็อกและ `pnpm dev` รันไม่ได้
จึงเพิ่มไฟล์นี้เข้ามาเพื่อให้ install และ dev ทำงานได้ทั้งบน pnpm 10 และ 11

## 11. เพิ่ม monaco-editor เข้า package.json

`@monaco-editor/react` เป็นตัวห่อขนาด 188 KB ไม่ได้มี monaco อยู่ในตัว ประกาศ `monaco-editor` ไว้เป็น peer dependency
โจทย์ไม่ได้ประกาศแพ็กเกจนี้ไว้ ตัว loader จึงทำตามค่าเริ่มต้นคือดึง monaco จาก CDN ตอนรัน

ตัว monaco อยู่ในเครื่องอยู่แล้วเพราะ pnpm ติดตั้ง peer ให้อัตโนมัติ แต่ถูกผูกไว้ใต้ `@monaco-editor/react` เท่านั้น
`import 'monaco-editor'` จากโค้ดเราจึงได้ `MODULE_NOT_FOUND` เพราะ pnpm ไม่ให้เอื้อมถึงแพ็กเกจที่ไม่ได้ประกาศไว้

เลือกประกาศ `monaco-editor` ลง `package.json` แล้วชี้ loader มาที่ตัวในเครื่องแทน CDN เหตุผลคือ
editor เป็นส่วนที่โจทย์ให้คะแนน ไม่ควรพึ่งบริการภายนอกตอนเปิดหน้าครั้งแรก
เวอร์ชันที่ใส่คือ `0.55.1` ซึ่งเป็นตัวที่ pnpm ติดตั้งมาให้อยู่แล้ว จึงไม่ได้ดึงของใหม่เข้ามา แค่ประกาศให้ตรงกับความจริง

การใช้ตัวในเครื่องต้องบอก Vite ด้วยว่า worker อยู่ไหน เพราะ monaco แยก worker ตามภาษา
ทั้งการตั้งค่า worker และ `loader.config` อยู่ใน `lib/setup-monaco.ts` ไฟล์เดียว และถูก import แบบ dynamic ใน effect
เพื่อไม่ให้ติดไปกับ bundle ฝั่ง server เนื่องจากไฟล์นั้นเรียก `self` และ `?worker` ซึ่งมีเฉพาะบนเบราว์เซอร์

ตรวจแล้วว่าหน้าเว็บไม่ยิงไปที่ CDN เลย ไฟล์ทั้งหมดมาจาก `node_modules` ในเครื่อง

## 12. ขนาด bundle ของ monaco

`pnpm build` แล้ววัดจริง `dist/client/assets` รวม 15 MB จาก 96 ไฟล์

| ไฟล์ | ขนาด |
| :--- | ---: |
| `ts.worker.js` | 6,848 KB |
| `setup-monaco.js` | 3,688 KB |
| `css.worker.js` | 1,008 KB |
| `html.worker.js` | 680 KB |
| `index.js` (แอปทั้งตัว) | 428 KB |

monaco กินไปเกือบ 14 MB คิดเป็นราว 30 เท่าของโค้ดที่เขียนเอง
และมี worker ของ TypeScript, CSS, HTML ติดมาด้วยทั้งที่ใช้แค่ JSON เพราะ `import * as monaco from 'monaco-editor'` ลากทุกภาษาที่ monaco รองรับเข้ามาหมด

สิ่งที่ทำไปแล้วเพื่อลดผลกระทบคือ import `setup-monaco` แบบ dynamic ใน effect
monaco จึงถูกแยกเป็น chunk ต่างหากและโหลดทีหลัง ไม่ได้อยู่ใน bundle หลัก ผู้ใช้เห็นฟอร์มก่อน แล้ว editor ค่อยตามมา

ที่ยังไม่ได้ทำคือลดขนาดตัว monaco เอง ซึ่งน่าจะทำได้ด้วยการ import เฉพาะ core กับภาษา JSON

```ts
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
```

เลือกไม่ทำในรอบนี้เพราะเป็น import path ภายในของ monaco ที่เปลี่ยนได้ตามเวอร์ชัน
และเวลาที่เหลือควรลงกับ targeting rule ซึ่งเป็นส่วนที่มีคะแนนมากที่สุด ส่วนขนาด bundle ไม่ได้อยู่ในเกณฑ์ให้คะแนน

## 13. monaco กับ SSR

ใส่ `<Editor>` ลงในหน้าตรง ๆ แล้ว SSR พัง ได้ `Element type is invalid ... but got: object` แล้วทั้งหน้าถอยไป client rendering
หน้ายังใช้งานได้ ถ้าไม่เปิด log ก็ไม่รู้ แต่เท่ากับเสียประโยชน์ของ SSR ทั้งหน้าเพราะ component ตัวเดียว

แก้โดยแยกเป็น `components/json-preview.tsx` แล้วรอ mount ฝั่ง client ก่อนค่อยโหลด editor ฝั่ง server แสดงกล่อง placeholder แทน
อีกทางที่แก้ได้คือใส่ `ssr.noExternal` ใน `vite.config.ts` แต่เลือกไม่ทำเพราะเป็นไฟล์ของโจทย์
และวิธีที่ใช้ตรงกับความจริงมากกว่า คือ monaco render ฝั่ง server ไม่ได้อยู่แล้ว จึงไม่ควรพยายามให้มัน render

## 14. วิธีผูก rule tree เข้ากับฟอร์ม

ทางที่ตรงไปตรงมาคือทำทุก node เป็น field ของฟอร์ม เช่น `targeting[0].root.children[1].children[0].field`
ทดลองแล้วพบว่า path ที่เขียนเป็น template literal ตรง ๆ ใช้ได้ TypeScript แปลงให้เป็น type ที่ตรงกับ `DeepKeys` พอดี
แต่ใน component ที่เรียกตัวเอง path ต้องรับมาทาง prop ซึ่งประกาศได้แค่ `string` เพราะ component ไม่มีทางรู้ตอน compile ว่าตัวเองอยู่ชั้นไหน
พอเป็น `string` ก็ไม่ตรงกับ path ตัวไหนเลย ทางออกเดียวคือ cast เป็น `never` ทุกจุด เท่ากับปิด type checking ทิ้งทั้งต้นไม้

เลือกอีกทางแทน คือผูก**ทั้งต้นไม้ของ rule หนึ่งข้อเป็น field เดียว** (`targeting[0].root`)
component ที่ recursive รับ node กับ callback `onChange` แล้วส่งต้นไม้ชุดใหม่กลับขึ้นไป
การแก้ค่าใช้ฟังก์ชันบริสุทธิ์ใน `lib/rule-tree.ts` ทั้งหมด ไม่มี path เป็น string ให้พิมพ์ผิด และ type ตรวจได้ครบ

แลกมาด้วยการที่พิมพ์ในเงื่อนไขหนึ่งข้อ แล้วต้นไม้ของ rule ข้อนั้นจะ render ใหม่ทั้งก้อน
แต่ rule ข้ออื่นและส่วนอื่นของฟอร์มไม่กระทบ เพราะยังแยกด้วย `form.Field` ตามปกติ และต้นไม้หนึ่งข้อมีขนาดเล็ก

### error ของ node ที่อยู่ลึก

พอ node ไม่ได้เป็น field ของฟอร์ม error จาก zod จึงไม่ถูกส่งมาที่ `field.state.meta.errors`
แต่ zod ใส่ path เต็มไว้ใน `errorMap` ของฟอร์มอยู่แล้ว เช่น `targeting[0].root.children[1].field`
จึงส่ง path ลงไปกับ component ที่ recursive เพื่อใช้**เปิดหา error เท่านั้น** ไม่ได้ใช้ผูกค่า ตัวช่วยอยู่ใน `lib/form-errors.ts`
path ตรงนี้เป็นแค่ key ของ object ไม่ต้องผ่าน type check จึงได้ error ตรงแถวทุกชั้นโดยไม่ต้อง cast อะไรเลย

### ความลึกของกลุ่ม

ทดลองแล้วว่า `form.Field` รองรับ `children` ซ้อนได้ถึง 3 ชั้น ชั้นที่ 4 ขึ้น TS2322
ปุ่ม Group จึงถูกปิดเมื่อซ้อนครบ 3 ชั้นให้ตรงกัน เลือกปิดปุ่มแทนที่จะปล่อยให้กดแล้วค่อยไปพัง เพราะผู้ใช้ควรเห็นขอบเขตตั้งแต่ตอนกด

## ยังไม่ได้ยืนยัน

- `pr` (Present) ยังไม่ได้เห็นตัวอย่างจากของจริง ตอนนี้สร้างเป็น `email pr` คือไม่มีค่าตามหลัง
- ค่าใน `in` ให้กรอกคั่นด้วยจุลภาคช่องเดียว ยังไม่ได้ทำเป็น UI แบบเพิ่มทีละรายการ
