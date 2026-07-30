'use client';

import React, { useState, useEffect } from 'react';
import { 
  Folder, File as FileIcon, FileText, Image as ImageIcon, 
  Archive, FileCode2, Upload, Plus, Trash2, Edit2, 
  FolderInput, Download, Eye, ChevronRight, Home, X, Loader2
} from 'lucide-react';

interface CaseFileManagerProps {
  caseId: string;
}

interface CaseFileFolder {
  id: string;
  name: string;
  parent_folder_id: string | null;
  updated_at: string;
}

interface CaseFile {
  id: string;
  display_name: string;
  extension: string;
  mime_type: string;
  size: number;
  updated_at: string;
}

interface Breadcrumb {
  id: string;
  name: string;
}

export default function CaseFileManager({ caseId }: CaseFileManagerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<CaseFileFolder[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  useEffect(() => {
    fetchData(currentFolderId);
  }, [currentFolderId, caseId]);

  const fetchData = async (folderId: string | null) => {
    setIsLoading(true);
    setError('');
    try {
      const url = new URL(`/api/legal/cases/${caseId}/files`, window.location.origin);
      if (folderId) url.searchParams.append('folderId', folderId);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('تعذر تحميل ملفات القضية.');
      
      const data = await response.json();
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setBreadcrumbs(data.breadcrumbs || []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      const response = await fetch(`/api/legal/cases/${caseId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent_folder_id: currentFolderId
        })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.error || 'فشل في إنشاء المجلد');
      }
      
      setNewFolderName('');
      setShowCreateModal(false);
      fetchData(currentFolderId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    if (currentFolderId) {
      formData.append('folder_id', currentFolderId);
    }
    
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files[]', selectedFiles[i]);
    }
    
    try {
      const response = await fetch(`/api/legal/cases/${caseId}/files`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.error || 'تعذر رفع الملف. تحقق من نوع الملف وحجمه وحاول مرة أخرى.');
      }
      
      fetchData(currentFolderId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المجلد؟')) return;
    try {
      const response = await fetch(`/api/legal/cases/${caseId}/folders/${folderId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.error || 'فشل الحذف');
      }
      fetchData(currentFolderId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    try {
      const response = await fetch(`/api/legal/cases/${caseId}/files/${fileId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('فشل الحذف');
      fetchData(currentFolderId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getFileIcon = (mime: string, ext: string) => {
    if (mime.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
    if (mime.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
    if (ext === 'zip' || ext === 'rar') return <Archive className="w-8 h-8 text-amber-500" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-8 h-8 text-blue-500" />;
    if (ext === 'xls' || ext === 'xlsx') return <FileText className="w-8 h-8 text-emerald-500" />;
    return <FileIcon className="w-8 h-8 text-slate-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 font-cairo">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm font-bold">
          <button 
            onClick={() => setCurrentFolderId(null)}
            className="text-amber-500 hover:text-amber-400 flex items-center gap-1"
          >
            <Home className="w-4 h-4" /> ملفات القضية
          </button>
          
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <button 
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`${idx === breadcrumbs.length - 1 ? 'text-slate-200' : 'text-amber-500 hover:text-amber-400'}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> إنشاء مجلد
          </button>
          
          <label className="gold-gradient-bg text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer opacity-100 hover:opacity-90">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? 'جاري التحميل...' : 'رفع ملفات'}
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          
          {folders.length === 0 && files.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 text-sm">
              {currentFolderId ? 'هذا المجلد فارغ.' : 'لا توجد ملفات في هذه القضية حتى الآن.'}
            </div>
          )}

          {/* Folders */}
          {folders.map(folder => (
            <div 
              key={folder.id} 
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-colors flex flex-col items-center gap-3 relative group"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleDeleteFolder(folder.id)} className="p-1 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              
              <button onClick={() => setCurrentFolderId(folder.id)} className="flex flex-col items-center gap-2 w-full mt-2">
                <Folder className="w-10 h-10 text-amber-400 fill-amber-400/20" />
                <span className="text-sm font-bold text-slate-200 text-center line-clamp-2">{folder.name}</span>
              </button>
            </div>
          ))}

          {/* Files */}
          {files.map(file => (
            <div 
              key={file.id} 
              className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col items-center gap-3 relative group"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => window.open(`/api/legal/cases/${caseId}/files/${file.id}/preview`, '_blank')} className="p-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDeleteFile(file.id)} className="p-1 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              
              <div className="flex flex-col items-center gap-2 w-full mt-2" title={file.display_name}>
                {getFileIcon(file.mime_type, file.extension)}
                <span className="text-sm font-bold text-slate-200 text-center line-clamp-1 w-full">{file.display_name}</span>
                <span className="text-xs text-slate-500">{formatSize(file.size)}</span>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">إنشاء مجلد جديد</h3>
            <form onSubmit={handleCreateFolder}>
              <input 
                type="text"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="اسم المجلد"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-amber-500 text-black font-bold py-2.5 rounded-xl">إنشاء</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-slate-800 text-white font-bold py-2.5 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
