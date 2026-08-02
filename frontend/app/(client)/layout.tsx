import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Building2, UserCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'بوابة العملاء | رُسوخ',
  description: 'بوابة المستثمرين والملاك لمتابعة العقارات الخاصة بهم.',
};

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-cairo" dir="rtl">
      {/* Client Topbar */}
      <header className="h-16 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 shadow-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">رُسوخ</span>
            <span className="text-[10px] text-amber-400 font-bold block -mt-1">بوابة المستثمر</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/5">
            <UserCircle className="w-5 h-5 text-slate-400" />
            <span className="font-medium">عبدالله الراجحي</span>
          </div>
          <Link href="/landing" className="text-slate-400 hover:text-rose-400 transition-colors p-2" title="تسجيل الخروج">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8">
        {children}
      </div>
    </div>
  );
}
