'use client';

import { useState } from 'react';
import { Bot, X, Send, Sparkles, User, Minus } from 'lucide-react';

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: 'أهلاً بك في رُسوخ! 🌟 أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم في إدارة مشاريعك العقارية؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      let aiResponse = 'شكراً لتواصلك. هذه الميزة ستكون مدعومة بمحرك ذكاء اصطناعي حقيقي قريباً جداً لمساعدتك في أتمتة مهامك العقارية بالكامل!';
      
      if (currentInput.includes('سعر') || currentInput.includes('أسعار')) {
        aiResponse = 'بناءً على تحليلاتي لأسعار السوق الحالية، أنصحك بزيادة أسعار الوحدات المتبقية بنسبة 3% نظراً لارتفاع الطلب في المنطقة.';
      } else if (currentInput.includes('عقد') || currentInput.includes('عقود')) {
        aiResponse = 'يمكنك استخدام نظام العقود الذكية (CLM) من القائمة الجانبية لتوليد العقود آلياً لعملائك.';
      } else if (currentInput.includes('وافي') || currentInput.includes('ضمان')) {
        aiResponse = 'حسابات الضمان تبدو ممتازة. آخر تقرير هندسي يشير لنسبة إنجاز 40%، مما يسمح لك بسحب دفعة جديدة من حساب وافي.';
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-cairo">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">مساعد رُسوخ الذكي</h3>
                <p className="text-[10px] text-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> متصل الآن
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[350px] p-4 overflow-y-auto bg-slate-950 flex flex-col gap-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800' : 'bg-amber-500/20 text-amber-500'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tl-sm' : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tr-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tr-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل المساعد الذكي..."
                className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button 
                onClick={handleSend}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center hover:scale-110 transition-transform relative group"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <Sparkles className="w-4 h-4 text-white absolute top-2 right-2 animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
