'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2, CheckCircle2, ChevronRight, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateFromDocPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [tempFilePath, setTempFilePath] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsExtracting(true);
    
    try {
      const formData = new FormData();
      formData.append('document', file);

      const res = await fetch('/api/legal/documents/extract', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setExtractedData(data.extractedData);
          setTempFilePath(data.temporaryFilePath);
        } else {
          alert('فشل استخراج البيانات: ' + data.error);
        }
      } else {
        alert('حدث خطأ في الاتصال بالخادم');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ غير متوقع');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tenantId = sessionStorage.getItem('tenantId');
      
      const payload = {
        tenantId,
        title: extractedData.title,
        caseNumber: extractedData.caseNumber,
        notes: extractedData.notes,
        tempFilePath, // Send temp path to move it permanently
        stage: 'PLANNING',
        clientMode: 'external',
        externalPartyName: extractedData.clientName,
      };

      const res = await fetch('/api/lawyer/matters', { // Fallback to existing api
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('تم إنشاء القضية بنجاح وربط المستند.');
        router.push('/matters');
      } else {
        alert('تعذر الإنشاء');
      }
    } catch (error) {
      alert('خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-cairo" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <FileUp className="w-6 h-6 text-amber-400" />
          إنشاء قضية من مستند
        </h1>
        <Link href="/matters" className="text-slate-400 hover:text-amber-400 flex items-center text-sm">
          العودة للقضايا <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {!extractedData ? (
        <div className="glass-card p-10 rounded-3xl text-center space-y-6 border border-slate-800">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <FileUp className="w-10 h-10 text-slate-400" />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-slate-200">ارفع ملف القضية الأولي</h2>
            <p className="text-sm text-slate-400 mt-2">
              (مثل: صحيفة دعوى، عقد، مستند رسمي) وسيقوم النظام الذكي باستخراج البيانات.
            </p>
          </div>

          <div className="flex justify-center">
            <input type="file" onChange={handleFileChange} className="text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer" />
          </div>

          <button
            onClick={handleExtract}
            disabled={!file || isExtracting}
            className="mt-6 gold-gradient-bg text-slate-950 font-bold px-8 py-3 rounded-xl disabled:opacity-50"
          >
            {isExtracting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> جاري الاستخراج...</span>
            ) : 'استخراج البيانات'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreateCase} className="glass-card p-8 rounded-3xl space-y-6 border border-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-200">مراجعة البيانات المستخرجة</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">اسم القضية / المشروع</label>
              <input type="text" value={extractedData.title} onChange={(e) => setExtractedData({...extractedData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">رقم القضية</label>
              <input type="text" value={extractedData.caseNumber} onChange={(e) => setExtractedData({...extractedData, caseNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">العميل / الطرف</label>
              <input type="text" value={extractedData.clientName} onChange={(e) => setExtractedData({...extractedData, clientName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">ملاحظات ذكية</label>
            <textarea value={extractedData.notes} onChange={(e) => setExtractedData({...extractedData, notes: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 h-24"></textarea>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
            <button type="button" onClick={() => setExtractedData(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500">
              إلغاء وإعادة الرفع
            </button>
            <button type="submit" disabled={isSubmitting} className="gold-gradient-bg text-slate-950 font-bold px-8 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>تأكيد وإنشاء القضية</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
