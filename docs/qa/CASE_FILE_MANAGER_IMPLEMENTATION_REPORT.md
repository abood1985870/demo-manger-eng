# CASE FILE MANAGER - Implementation Report

## 1. ملخص التنفيذ
تم بنجاح بناء ميزة "مدير ملفات القضية" (Case File Manager) كجزء من نظام إدارة القضايا (Legal Module). تتيح الميزة للمستخدمين رفع، تنظيم، وتحميل الملفات بشكل هرمي ضمن مجلدات متداخلة، معزولة تماماً بناءً على `tenant_id` (الشركة) و `case_id` (القضية). 

تم دمج الواجهة بسلاسة في صفحة "تفاصيل المشروع/القضية" (`matters/page.tsx`) باستخدام التبويب الجديد 📂 **الملفات**.

## 2. تصميم قاعدة البيانات
تم استخدام قاعدتي بيانات (Tables) عبر علاقات ذاتية للمجلدات:
- `case_file_folders`: يحتوي على المجلدات (`id`, `tenant_id`, `case_id`, `parent_folder_id`, `name`, `created_by_id`, `deleted_at`).
- `case_files`: يحتوي على الملفات (`id`, `tenant_id`, `case_id`, `folder_id`, `original_name`, `display_name`, `storage_key`, `mime_type`, `extension`, `size`, `uploaded_by_id`, `deleted_at`).

## 3. اسم Migration
`2026_01_01_000010_create_case_file_manager_tables.php`

## 4. طريقة التخزين
تم إعادة استخدام نظام تخزين Laravel الحالي (`Storage::disk('local')`). 
المسار الآمن للملفات: `case-files/{tenantId}/{caseId}/{uuid}.ext`
تم تطبيق العزل التام للملفات، بحيث لا يمكن الوصول إليها برابط مباشر بل عن طريق API يتحقق من الصلاحيات والـ Tenant.

## 5. APIs المضافة
جميع النقاط (Endpoints) مسجلة ضمن `routes/api.php` في المجموعة `legal/cases/{caseId}`:
- `GET /files` - جلب محتويات مجلد أو الجذر.
- `POST /folders` - إنشاء مجلد.
- `PUT /folders/{folderId}/rename` و `/move` - إعادة التسمية والنقل.
- `DELETE /folders/{folderId}` - حذف المجلد (ممنوع إذا لم يكن فارغاً).
- `POST /files` - رفع ملفات.
- `PUT /files/{fileId}/rename` و `/move` - إعادة التسمية والنقل.
- `DELETE /files/{fileId}` - حذف الملف.
- `GET /files/{fileId}/download` - تنزيل الملف.
- `GET /files/{fileId}/preview` - معاينة الملف (مع حجب الملفات التنفيذية والسكربتات).

## 6. المكونات والشاشات المعدلة
- **جديد:** `frontend/app/(developer)/matters/CaseFileManager.tsx` (واجهة إدارة الملفات مع مسار تنقل، عرض شبكي، ونوافذ إنشاء).
- **مُعدّل:** `frontend/app/(developer)/matters/page.tsx` (تم إضافة تبويب 📂 الملفات وربطه بالمكون الجديد).

## 7. قواعد الصلاحيات والعزل بين الشركات
- **العزل المطلق (Tenant & Case Isolation):** يتم إضافة `where('tenant_id', auth()->user()->tenant_id)` و `where('case_id', $caseId)` على **كل** استعلام يخص الملفات والمجلدات. لا يمكن للمستخدم نقل أو رفع ملف لقضية لا تخص شركته.

## 8. طريقة منع العلاقات الدائرية
- عند نقل مجلد، يتم فحص السلسلة الهرمية (Parent hierarchy) تصاعدياً للتحقق من عدم نقل المجلد إلى أحد المجلدات الفرعية الخاصة به.
- تم وضع حد أقصى للعمق (`Depth Limit = 10`) لمنع الإرهاق.

## 9. أنواع الملفات المسموحة والحد الأقصى
- **الأنواع:** `pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, webp, txt, csv, zip`
- **حجب:** `exe, bat, sh, php, js, html, svg` (سواء في الرفع أو في المعاينة).
- **الحجم:** `25MB` للملف الواحد.
- **تجريد اسم الملف:** يتم إخفاء `storage_key` من الـ API (باستخدام `$hidden` في Model)، ولا يُعرض إلا الاسم النظيف للمستخدم.

## 10. نتائج الاختبارات ومعايير القبول
- `[PASS]` تبويب الملفات يعمل داخل القضية.
- `[PASS]` يمكن إنشاء مجلد داخل مجلد (العمق < 10).
- `[PASS]` يمكن رفع ملفات داخل أي مستوى في الجذر والمجلدات.
- `[PASS]` مسار التنقل (Breadcrumbs) يعمل.
- `[PASS]` منع العلاقات الدائرية يعمل (محمي في الـ Backend).
- `[PASS]` حذف مجلد غير فارغ ممنوع.
- `[PASS]` العزل بين الشركات مطبق (مفروض بـ `tenant_id` إجبارياً على مستوى الـ Backend).
- `[PASS]` حجب رفع الملفات التنفيذية.
- `[PASS]` `storage_key` مخفي عن المستخدم، وتحميل/معاينة الملف تتم من خلال API آمن.

---

### النتيجة النهائية
**القرار:** CASE_FILE_MANAGER_READY
