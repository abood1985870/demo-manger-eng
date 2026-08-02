import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RusukhAiEngine from './RusukhAiEngine';

export const metadata = { title: 'المستشار المالي الذكي | رُسوخ' };

export default async function AiCfoPage() {
  const store = await cookies();
  const tenantId = store.get('tenantId')?.value;
  const userRole = store.get('userRole')?.value?.toLowerCase();

  if (!tenantId) {
    redirect('/login');
  }

  // Only superadmin, owner, or specific high-level roles should see the CFO
  if (!['owner', 'superadmin', 'admin'].includes(userRole || '')) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-100px)] p-8 font-cairo">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-rose-500/20">
            🔒
          </div>
          <h2 className="text-xl font-bold text-white mb-2">صلاحيات غير كافية</h2>
          <p className="text-slate-400 text-sm">
            هذه الصفحة تحتوي على الأسرار المالية للشركة وتتطلب صلاحيات الإدارة العليا للوصول لمستشار الذكاء الاصطناعي.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="rusukh-page pb-12 bg-slate-950 min-h-[calc(100vh-64px)] flex flex-col">
      <RusukhAiEngine />
    </main>
  );
}
