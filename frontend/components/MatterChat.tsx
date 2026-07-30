/* eslint-disable @next/next/no-img-element -- Avatars are untrusted tenant URLs and are loaded directly under the image CSP. */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, MessageSquare, Send, X, Paperclip, FileText } from 'lucide-react';

interface MatterChatProps {
  matterId: string;
  currentUserId: string;
}

export default function MatterChat({ matterId, currentUserId }: MatterChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [chatFile, setChatFile] = useState<File | null>(null);
  
  // Mentions
  const [users, setUsers] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingRequestIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/messages`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'فشل تحميل المحادثات');
      }
    } catch (e) {
      setError('حدث خطأ في الاتصال');
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
    }
  }, [matterId]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/members`);
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch users for mentions', e);
    }
  }, [matterId]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchMessages, fetchUsers]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = textareaRef.current?.value ?? newMessage;
    if (!messageToSend.trim() || isSending) return;
    setIsSending(true);
    const clientRequestId = pendingRequestIdRef.current || crypto.randomUUID();
    pendingRequestIdRef.current = clientRequestId;

    try {
      let finalMessage = messageToSend;
      
      if (chatFile) {
        const formData = new FormData();
        formData.append('matterId', matterId);
        formData.append('file', chatFile);
        const fileRes = await fetch('/api/lawyer/documents', { method: 'POST', body: formData });
        if (fileRes.ok) {
          const doc = await fileRes.json();
          finalMessage += `\n\n[ملف مرفق: ${chatFile.name}](${doc.downloadUrl})`;
        }
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/lawyer/matters/${matterId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: finalMessage, replyToMessageId: replyTo?.id, clientRequestId }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      
      if (res.ok) {
        const createdMessage = await res.json();
        setNewMessage('');
        setReplyTo(null);
        setChatFile(null);
        setShowMentions(false);
        pendingRequestIdRef.current = null;
        setIsSending(false);
        if (createdMessage?.id) {
          setMessages((current) => current.some((message) => message.id === createdMessage.id)
            ? current
            : [...current, createdMessage]);
        }
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('فشل في الإرسال');
    } finally {
      pendingRequestIdRef.current = null;
      setIsSending(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editContent })
      });
      if (res.ok) {
        setEditingMessageId(null);
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('فشل في التعديل');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('فشل في الحذف');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    
    // Check if user is typing a mention, e.g., @name
    const lastWordMatch = textBeforeCursor.match(/@(\S*)$/);
    if (lastWordMatch) {
      setShowMentions(true);
      setMentionFilter(lastWordMatch[1]);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: any) => {
    if (!textareaRef.current) return;
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = newMessage.slice(0, selectionStart);
    const textAfterCursor = newMessage.slice(selectionStart);

    // Replace the incomplete mention with the full user name
    const newTextBefore = textBeforeCursor.replace(/@(\S*)$/, `@${user.name} `);
    setNewMessage(newTextBefore + textAfterCursor);
    setShowMentions(false);

    // Focus back on input
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = newTextBefore.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return '👤';
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-amber-600 text-slate-100 border-amber-500/30',
      'bg-emerald-600 text-slate-100 border-emerald-500/30',
      'bg-blue-600 text-slate-100 border-blue-500/30',
      'bg-indigo-600 text-slate-100 border-indigo-500/30',
      'bg-purple-600 text-slate-100 border-purple-500/30',
      'bg-rose-600 text-slate-100 border-rose-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  if (isLoading) {
    return <div className="p-8 text-center text-amber-500 animate-pulse">جاري تحميل التعقيبات...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 mb-2">{error}</p>
        <button onClick={fetchMessages} className="text-amber-400 border border-amber-500/50 px-3 py-1 rounded">إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[450px] bg-slate-950 rounded-2xl border border-slate-800 font-cairo">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold text-slate-100">التعقيبات والمحادثة الداخلية</h3>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">
            لا توجد تحديثات على هذا المشروع حتى الآن.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.authorId === currentUserId;
            const isDeleted = !!msg.deletedAt;
            const ageMinutes = (new Date().getTime() - new Date(msg.createdAt).getTime()) / 60000;
            const canEdit = isMe && !isDeleted && ageMinutes <= 15;

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center overflow-hidden text-[11px] font-bold border shadow-md ${getAvatarBg(msg.author?.name || 'م')}`}>
                  {msg.author?.avatarUrl ? (
                    <img src={msg.author.avatarUrl} alt={`صورة ${msg.author.name}`} className="h-full w-full object-cover" />
                  ) : getInitials(msg.author?.name || 'م')}
                </div>

                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Name and Meta */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-amber-400">{msg.author?.name}</span>
                    <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {msg.author?.role === 'lawyer' ? 'مدير مشروع' : msg.author?.role === 'admin' ? 'مدير الشركة' : 'شريك'}
                    </span>
                    <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(msg.createdAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className={`rounded-2xl p-3 shadow-lg ${
                    isDeleted 
                      ? 'bg-slate-900/50 border border-slate-800 text-slate-500 italic' 
                      : isMe 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-slate-200 rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.replyTo && !isDeleted && (
                      <div className="mb-2 p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 border-r-2 border-r-amber-500">
                        <span className="font-bold text-amber-500 block mb-0.5">{msg.replyTo.author?.name}</span>
                        <span className="line-clamp-1">{msg.replyTo.body}</span>
                      </div>
                    )}

                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMessageId(null)} className="text-[10px] text-slate-400 hover:text-slate-200">إلغاء</button>
                          <button onClick={() => handleEdit(msg.id)} className="text-[10px] text-amber-400 font-bold hover:text-amber-300">حفظ</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">
                        {msg.body.split(/(\[[^\]]+\]\([^)]+\))/g).map((part: string, index: number) => {
                          const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                          if (linkMatch) {
                            return <a key={index} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-amber-400 font-bold underline flex items-center w-fit gap-1 mt-1 bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/20"><FileText className="w-3.5 h-3.5 shrink-0" /> {linkMatch[1]}</a>;
                          }
                          return part.split(/(\s+)/).map((word: string, i: number) => {
                            if (word.startsWith('@')) {
                              return <strong key={`${index}-${i}`} className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded font-bold border border-amber-500/20">{word}</strong>;
                            }
                            return word;
                          });
                        })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!isDeleted && (
                    <div className="flex items-center gap-3 mt-1.5 px-1">
                      <button onClick={() => setReplyTo(msg)} className="text-[10px] text-slate-500 hover:text-amber-400 transition">رد</button>
                      {canEdit && (
                        <>
                          <button onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.body); }} className="text-[10px] text-slate-500 hover:text-amber-400 transition">تعديل</button>
                          <button onClick={() => handleDelete(msg.id)} className="text-[10px] text-slate-500 hover:text-red-400 transition">حذف</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/30 relative">
        
        {/* Mentions dropdown list */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 mb-2 max-h-[150px] overflow-y-auto z-50">
            <p className="text-[10px] text-slate-400 px-2 pb-1.5 border-b border-slate-800 mb-1">الإشارة إلى عضو:</p>
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => insertMention(u)}
                className="w-full text-right px-2.5 py-1.5 text-xs text-slate-200 hover:bg-amber-500/10 hover:text-amber-400 rounded-lg flex items-center gap-2 transition"
              >
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold border border-slate-700">
                  {getInitials(u.name)}
                </div>
                <span>{u.name}</span>
              </button>
            ))}
          </div>
        )}

        {replyTo && (
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-2 transition animate-in slide-in-from-bottom-2">
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              رد على <strong className="text-amber-500">{replyTo.author?.name}</strong>: {replyTo.body.substring(0, 30)}...
            </div>
            <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-red-400 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {chatFile && (
          <div className="flex items-center justify-between bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 mb-2 transition animate-in slide-in-from-bottom-2">
            <div className="text-[10px] text-amber-400 flex items-center gap-1.5 font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>ملف جاهز للرفع: {chatFile.name}</span>
            </div>
            <button onClick={() => setChatFile(null)} className="text-amber-500/50 hover:text-amber-400 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <label className="bg-slate-950 border border-slate-800 text-slate-400 p-3 rounded-xl hover:text-amber-400 transition cursor-pointer flex-shrink-0 flex items-center justify-center h-11">
            <Paperclip className="w-4 h-4" />
            <input type="file" className="hidden" onChange={e => setChatFile(e.target.files?.[0] || null)} />
          </label>
          <textarea
            data-testid="matter-chat-input"
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onInput={(e) => setNewMessage(e.currentTarget.value)}
            placeholder="اكتب تحديثاً للفريق... استخدم @ للإشارة إلى عضو"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50 resize-none h-11 subtle-scroll"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isSending}
            className="bg-amber-500 text-slate-950 p-3 rounded-xl hover:brightness-110 transition disabled:opacity-50 flex-shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
