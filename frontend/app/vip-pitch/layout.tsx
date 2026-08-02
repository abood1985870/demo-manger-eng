import { ReactNode } from 'react';
import '../globals.css';
import { AiAssistantWidget } from '@/components/AiAssistantWidget';

export default function VipPitchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-amber-500/30 selection:text-amber-200">
      {children}
      <AiAssistantWidget />
    </div>
  );
}
