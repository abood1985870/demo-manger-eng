'use client';

import { useState } from 'react';
import { FileText, FileSignature, CheckCircle2, Search, Plus, Eye, Send, FileCode2 } from 'lucide-react';

export default function ContractsBoard({ templates, contracts, leads }: { templates: any[], contracts: any[], leads: any[] }) {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Generator State
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [unitNumber, setUnitNumber] = useState('B-102');
  const [unitPrice, setUnitPrice] = useState('1,250,000');
  const [wafiAccount, setWafiAccount] = useState('SA9876543210001234567890');
  const [propertyName, setPropertyName] = useState('برج رُسوخ');
  
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    const lead = leads.find((l: any) => l.id === selectedLeadId);
    const buyerName = lead ? lead.name : 'ـــــــــــــــــــــــ';
    
    // Simple template string replacement
    let content = selectedTemplate.content
      .replace(/{{buyer_name}}/g, buyerName)
      .replace(/{{unit_number}}/g, unitNumber)
      .replace(/{{unit_area}}/g, '150')
      .replace(/{{unit_price}}/g, unitPrice)
      .replace(/{{wafi_account}}/g, wafiAccount)
      .replace(/{{property_name}}/g, propertyName)
      .replace(/{{date}}/g, new Date().toLocaleDateString('ar-SA'));
      
    // Convert basic markdown to HTML for display
    const html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mb-6 text-center">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n$/gim, '<br />');

    setGeneratedHtml(html);
  };

  return (
    <>
      <header className="rusukh-page-header border-b border-slate-800 pb-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10 px-8 pt-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-amber-500" />
            نظام الإدارة الذكية للعقود (CLM)
          </h1>
          <p className="text-slate-400 text-sm">توليد العقود القانونية تلقائياً وإدارة التوقيعات الإلكترونية (SPA)</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all font-medium text-sm border border-slate-700">
            <Search className="w-4 h-4" /> بحث في العقود
          </button>
          <button 
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> إنشاء عقد جديد
          </button>
        </div>
      </header>

      <section className="p-8">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">عقود قيد المراجعة</h3>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20"><FileCode2 className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white">4</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">عقود بانتظار التوقيع</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20"><Send className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white">2</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 font-medium">عقود تم توقيعها هذا الشهر</h3>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-black text-white">12</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates Column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-white mb-6">قوالب العقود المعتمدة</h2>
            {templates.map(t => (
              <div key={t.id} 
                   onClick={() => { setSelectedTemplate(t); setShowGenerator(true); }}
                   className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 cursor-pointer transition-all group shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-amber-500/50">
                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{t.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">يحتوي على متغيرات ديناميكية</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contracts List */}
          <div className="lg:col-span-2">
             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">سجل العقود</h2>
               </div>
               <div className="p-0">
                 <table className="w-full text-right text-sm">
                   <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase">
                     <tr>
                       <th className="px-6 py-4 font-bold">رقم المرجع</th>
                       <th className="px-6 py-4 font-bold">نوع العقد</th>
                       <th className="px-6 py-4 font-bold">العميل</th>
                       <th className="px-6 py-4 font-bold">الحالة</th>
                       <th className="px-6 py-4 font-bold">الإجراء</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     <tr className="hover:bg-slate-800/20 transition-colors">
                       <td className="px-6 py-5 font-mono text-slate-300">CTR-2026-089</td>
                       <td className="px-6 py-5 text-slate-200 font-medium">عقد بيع وحدة على الخارطة</td>
                       <td className="px-6 py-5 text-slate-400">عبدالله السالم</td>
                       <td className="px-6 py-5">
                         <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 w-max">
                           <Send className="w-3 h-3" /> بانتظار التوقيع
                         </span>
                       </td>
                       <td className="px-6 py-5">
                         <button className="text-slate-400 hover:text-amber-400 transition-colors">
                           <Eye className="w-5 h-5" />
                         </button>
                       </td>
                     </tr>
                     <tr className="hover:bg-slate-800/20 transition-colors">
                       <td className="px-6 py-5 font-mono text-slate-300">CTR-2026-088</td>
                       <td className="px-6 py-5 text-slate-200 font-medium">عقد بيع وحدة على الخارطة</td>
                       <td className="px-6 py-5 text-slate-400">خالد محمد</td>
                       <td className="px-6 py-5">
                         <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
                           <CheckCircle2 className="w-3 h-3" /> موقع
                         </span>
                       </td>
                       <td className="px-6 py-5">
                         <button className="text-slate-400 hover:text-amber-400 transition-colors">
                           <Eye className="w-5 h-5" />
                         </button>
                       </td>
                     </tr>
                   </tbody>
                 </table>
                 
                 {contracts.length === 0 && (
                   <div className="p-12 text-center border-t border-slate-800">
                     <FileSignature className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-400">لا توجد عقود بعد</h3>
                     <p className="text-sm text-slate-500">قم بإنشاء أول عقد لك لسحب بيانات العميل تلقائياً.</p>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Generator Modal */}
      {showGenerator && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowGenerator(false)}></div>
          
          <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Sidebar Controls */}
            <div className="w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-full">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-amber-500" />
                  مُولد العقود الذكي
                </h3>
                <p className="text-xs text-slate-500 mt-2">اختر العميل وسيتم سحب كافة البيانات آلياً.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">ارتباط بالعميل (CRM)</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                  >
                    <option value="">اختر عميلاً من مسار المبيعات...</option>
                    {leads.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} - ميزانية {l.budget}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">الوحدة العقارية</label>
                    <input 
                      type="text" 
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">قيمة العقد (ريال سعودي)</label>
                    <input 
                      type="text" 
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">حساب الضمان البنكي (وافي)</label>
                    <input 
                      type="text" 
                      value={wafiAccount}
                      onChange={(e) => setWafiAccount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950 flex gap-3">
                <button 
                  onClick={handleGenerate}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  توليد المعاينة
                </button>
              </div>
            </div>

            {/* Document Preview (A4 Page Style) */}
            <div className="flex-1 bg-slate-800 overflow-y-auto p-12 flex justify-center custom-scrollbar">
              {generatedHtml ? (
                <div className="bg-white w-[210mm] min-h-[297mm] p-16 shadow-2xl rounded-sm">
                  <div className="flex justify-between items-center border-b-2 border-slate-200 pb-8 mb-8">
                    <div>
                      <h1 className="text-3xl font-black text-slate-900">رُسوخ للتطوير</h1>
                      <p className="text-slate-500 mt-1 text-sm">ترخيص وافي: 994238</p>
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-slate-300 font-bold">شعار</span>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-slate prose-h1:text-amber-600 prose-strong:text-slate-900 max-w-none font-cairo text-right leading-loose" 
                    dangerouslySetInnerHTML={{ __html: generatedHtml }} 
                  />
                  
                  <div className="mt-24 pt-12 border-t-2 border-slate-100 grid grid-cols-2 gap-12">
                    <div className="text-center">
                      <p className="font-bold text-slate-700 mb-8">توقيع الطرف الأول (المطور)</p>
                      <div className="h-20 border-b border-dashed border-slate-300 mx-10">
                        {/* Signature placeholder */}
                        <div className="text-emerald-600 font-mono text-xs rotate-[-5deg] opacity-50 flex flex-col items-center justify-center h-full">
                          <span>Signed by Rusukh</span>
                          <span>Timestamp: {new Date().toISOString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-700 mb-8">توقيع الطرف الثاني (المشتري)</p>
                      <div className="h-20 border-b border-dashed border-slate-300 mx-10 bg-amber-50">
                        <span className="text-amber-600/50 text-xs font-bold block mt-8">حقل التوقيع الإلكتروني</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FileCode2 className="w-20 h-20 mb-6 opacity-20" />
                  <p className="text-lg">قم بتعبئة البيانات واضغط "توليد المعاينة" لإنشاء العقد الآلي.</p>
                </div>
              )}
            </div>
            
            {/* Action Bar Overlay */}
            {generatedHtml && (
              <div className="absolute bottom-6 left-6 right-[420px] bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl shadow-2xl flex justify-between items-center z-10">
                <span className="text-sm font-bold text-slate-300">هل العقد جاهز للإرسال؟</span>
                <div className="flex gap-3">
                  <button onClick={() => setShowGenerator(false)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium">إلغاء</button>
                  <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
                    <Send className="w-4 h-4" /> إرسال للتوقيع الإلكتروني
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}
