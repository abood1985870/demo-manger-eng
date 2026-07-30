'use client';

import { Briefcase, Filter, Search, Plus, ShieldCheck, UserCheck, ChevronLeft, X, CheckCircle2, AlertTriangle, FileText, Calendar, Clock, Lock, Users, AlertCircle, Loader2, Edit2, Check, UserPlus, Folder, FolderPlus, Settings2, Trash2, Archive, Upload, Paperclip } from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';
import MatterChat from '@/components/MatterChat';
import ProjectCommandCenter from '@/components/ProjectCommandCenter';
import CaseFileManager from './CaseFileManager';
import { MATTER_STATUS_ARABIC, MATTER_STATUS_COLORS, MatterStatus, MATTER_STATUSES } from '@/lib/matter-status';
import { PRACTICE_AREA_NAMES } from '@/lib/legal-template-constants';
import { PROJECT_STAGE_OPTIONS } from '@/lib/project-domain';

const MAX_PROJECT_FILES = 5;
const MAX_PROJECT_FILE_SIZE = 10 * 1024 * 1024;
const PROJECT_FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.png,.jpg,.jpeg,.dwg,.dxf,.zip';

export default function MattersPage() {
  const [chatFiles, setChatFiles] = useState<File[]>([]);

  // Bundle state
  const [isSendingBundle, setIsSendingBundle] = useState(false);
  const [matters, setMatters] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<any>(null);
  const [selectedMatterFull, setSelectedMatterFull] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [canCreateCase, setCanCreateCase] = useState(false);
  const [userRole, setUserRole] = useState('');
  const openedMatterFromUrlRef = useRef(false);

  // Folders State
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderForm, setFolderForm] = useState({ id: '', name: '', viewerIds: [] as string[] });
  
  // Editing Matter State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCaseNumber, setEditCaseNumber] = useState('');
  const [editLawyerId, setEditLawyerId] = useState('');
  const [editTeamMemberIds, setEditTeamMemberIds] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editFolderId, setEditFolderId] = useState<string>('');
  const [editStage, setEditStage] = useState<string>('PLANNING');

  // New Matter Form State
  const [newMatter, setNewMatter] = useState({
    title: '', caseNumber: '', lawyerId: '', teamMemberIds: [] as string[],
    clientMode: 'none', clientId: '', beneficiaryAccountId: '',
    externalPartyName: '', externalPartyType: 'person', externalPartyPhone: '',
    externalPartyEmail: '', externalPartyNotes: '', notes: '', folderId: '',
    city: '', region: '', stage: 'PLANNING', plannedStart: '', dueDate: '',
    projectValue: '', budgetAtCompletion: '', plannedValue: '', earnedValue: '',
    actualCost: '', totalUnits: '', soldUnits: '', collectedAmount: '',
    files: [] as File[]
  });
  const [projectFileError, setProjectFileError] = useState('');

  // Import from Document State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDraftId, setImportDraftId] = useState<string | null>(null);
  const [importDuplicateWarning, setImportDuplicateWarning] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);

  const [importFormData, setImportFormData] = useState({
    title: '',
    caseNumber: '',
    courtName: '',
    caseType: '',
    plaintiff: '',
    defendant: '',
    clientId: '',
    beneficiaryAccountId: '',
    lawyerId: '',
    docDate: '',
    nextHearingDate: '',
    circuitNumber: '',
    cityRegion: '',
    amountClaimed: '',
    summary: '',
  });

  const [importConfidence, setImportConfidence] = useState<Record<string, 'HIGH' | 'MEDIUM' | 'LOW' | 'NULL'>>({
    caseNumber: 'NULL',
    courtName: 'NULL',
    caseType: 'NULL',
    plaintiff: 'NULL',
    defendant: 'NULL',
    docDate: 'NULL',
    nextHearingDate: 'NULL',
    circuitNumber: 'NULL',
    cityRegion: 'NULL',
    amountClaimed: 'NULL',
    summary: 'NULL',
  });

  const handleImportExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setIsImporting(true);
    setImportStep('analyzing');
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const res = await fetch('/api/lawyer/matters/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل استخراج البيانات من المستند');
        setImportStep('upload');
        return;
      }

      setImportDraftId(data.draftId);
      setImportFormData({
        title: data.extractedData.caseNumber ? `مشروع رقم ${data.extractedData.caseNumber}` : (data.extractedData.courtName ? `مشروع ${data.extractedData.courtName}` : 'مشروع مستخرج من مستند'),
        caseNumber: data.extractedData.caseNumber || '',
        courtName: data.extractedData.courtName || '',
        caseType: data.extractedData.caseType || '',
        plaintiff: data.extractedData.plaintiff || '',
        defendant: data.extractedData.defendant || '',
        clientId: '',
        beneficiaryAccountId: '',
        lawyerId: currentUserId || '',
        docDate: data.extractedData.docDate || '',
        nextHearingDate: data.extractedData.nextHearingDate || '',
        circuitNumber: data.extractedData.circuitNumber || '',
        cityRegion: data.extractedData.cityRegion || '',
        amountClaimed: data.extractedData.amountClaimed || '',
        summary: data.extractedData.summary || '',
      });
      setImportConfidence(data.confidence || {});
      setImportNotice(data.extractedData.extractionNotice || null);
      setImportDuplicateWarning(data.duplicateWarning || null);
      setImportStep('review');
    } catch (err) {
      alert('حدث خطأ أثناء الاتصال بالنظام لاستخراج البيانات');
      setImportStep('upload');
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importDraftId) return;
    setIsConfirmingImport(true);
    try {
      const res = await fetch(`/api/lawyer/matters/import/${importDraftId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importFormData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('تم تأكيد البيانات وإنشاء المشروع بنجاح.');
        setShowImportModal(false);
        await fetchMatters(selectedFolderId);
      } else {
        alert(data.error || 'حدث خطأ أثناء التأكيد');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الاتصال بالنظام');
    } finally {
      setIsConfirmingImport(false);
    }
  };

  const handleRejectImport = async () => {
    if (importDraftId) {
      try {
        await fetch(`/api/lawyer/matters/import/${importDraftId}/reject`, { method: 'POST' });
      } catch (err) {
        console.error('Error rejecting draft', err);
      }
    }
    setShowImportModal(false);
  };

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole') || '';
    const storedCanCreate = sessionStorage.getItem('canCreateCase') === 'true';
    setCurrentUserId(sessionStorage.getItem('userId') || '');
    setCanCreateCase(
      storedCanCreate
      || ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(storedRole.toUpperCase())
    );
    setUserRole(storedRole);

    void fetch('/api/auth/profile')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Profile unavailable')))
      .then((profile) => {
        const role = String(profile.role || storedRole);
        const allowed = Boolean(profile.canCreateCase)
          || ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(role.toUpperCase());
        setCurrentUserId(String(profile.id || sessionStorage.getItem('userId') || ''));
        setUserRole(role);
        setCanCreateCase(allowed);
        sessionStorage.setItem('userId', String(profile.id || ''));
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('canCreateCase', String(allowed));
      })
      .catch(() => {
        // Keep the cached session values when the profile endpoint is temporarily unavailable.
      });

    fetchInitialData();
  }, []);

  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');

  const handleArchiveMatter = async (matterId: string) => {
    const reason = prompt('الرجاء كتابة سبب أرشفة هذه المشروع:');
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert('تمت أرشفة المشروع بنجاح.');
        setSelectedMatter(null);
        await fetchMatters(selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error || 'فشلت أرشفة المشروع');
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    }
  };

  const handleUnarchiveMatter = async (matterId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء أرشفة هذه المشروع وإعادتها للمشاريع النشطة؟')) return;

    try {
      const res = await fetch(`/api/lawyer/matters/${matterId}/unarchive`, {
        method: 'PATCH'
      });
      if (res.ok) {
        alert('تم إلغاء الأرشفة بنجاح.');
        setSelectedMatter(null);
        await fetchMatters(selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error || 'فشلت عملية إلغاء الأرشفة');
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    }
  };

  // Operational Features Tab State
  const [matterTab, setMatterTab] = useState<'overview' | 'chat' | 'tasks' | 'hearings' | 'timeline' | 'generate_doc' | 'parties' | 'deadlines' | 'financials' | 'access' | 'files'>('overview');
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [hearingsList, setHearingsList] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [docTemplates, setDocTemplates] = useState<any[]>([]);

  // 5 Deep Features States
  const [partiesList, setPartiesList] = useState<any[]>([]);
  const [deadlinesList, setDeadlinesList] = useState<any[]>([]);
  const [financialsData, setFinancialsData] = useState<any>(null);
  const [accessList, setAccessList] = useState<any[]>([]);

  const [conflictCheckResult, setConflictCheckResult] = useState<any>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictOverrideReason, setConflictOverrideReason] = useState('');

  const [newPartyForm, setNewPartyForm] = useState({ name: '', partyType: 'PERSON', role: 'PLAINTIFF', phone: '', email: '', notes: '' });
  const [newDeadlineForm, setNewDeadlineForm] = useState({ title: '', deadlineType: 'APPEAL_DEADLINE', dueDate: '', notes: '' });
  const [feeAgreementForm, setFeeAgreementForm] = useState({ totalFee: '', notes: '' });
  const [newPaymentForm, setNewPaymentForm] = useState({ amount: '', paymentDate: '', method: 'BANK_TRANSFER', reference: '', notes: '' });
  const [newAccessForm, setNewAccessForm] = useState({ userId: '', accessRole: 'ASSIGNED_LAWYER', canViewFinancials: false, canManageFinancials: false, canEdit: true });

  const [newTaskForm, setNewTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', userId: '', dueDate: '' });
  const [newHearingForm, setNewHearingForm] = useState({ type: 'HEARING', title: '', court: '', date: '', summary: '' });
  const [generateDocForm, setGenerateDocForm] = useState({ templateId: '', customTitle: '' });
  const [isTabLoading, setIsTabLoading] = useState(false);

  const fetchMatterSubData = useCallback(async (matterId: string) => {
    setIsTabLoading(true);
    try {
      const [tasksRes, hearingsRes, timelineRes, templatesRes, partiesRes, deadlinesRes, financialsRes, accessRes] = await Promise.all([
        fetch(`/api/lawyer/tasks?matterId=${matterId}`),
        fetch(`/api/lawyer/hearings?matterId=${matterId}`),
        fetch(`/api/lawyer/matters/${matterId}/timeline`),
        fetch('/api/lawyer/templates'),
        fetch(`/api/lawyer/matters/${matterId}/parties`),
        fetch(`/api/lawyer/matters/${matterId}/deadlines`),
        fetch(`/api/lawyer/matters/${matterId}/financials`),
        fetch(`/api/lawyer/matters/${matterId}/access`)
      ]);

      if (tasksRes.ok) setTasksList(await tasksRes.json());
      if (hearingsRes.ok) setHearingsList(await hearingsRes.json());
      if (timelineRes.ok) setTimelineEvents(await timelineRes.json());
      if (templatesRes.ok) setDocTemplates(await templatesRes.json());
      if (partiesRes.ok) setPartiesList(await partiesRes.json());
      if (deadlinesRes.ok) setDeadlinesList(await deadlinesRes.json());
      if (financialsRes.ok) setFinancialsData(await financialsRes.json());
      if (accessRes.ok) setAccessList(await accessRes.json());
    } catch (e) {
      console.error('Failed to fetch matter sub data', e);
    } finally {
      setIsTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatter) {
      setEditTitle(selectedMatter.title || '');
      setEditCaseNumber(selectedMatter.caseNumber || '');
      setEditLawyerId(selectedMatter.lawyerId || '');
      setEditTeamMemberIds(selectedMatter.teamMembers?.map((m: any) => m.id) || []);
      setEditNotes(selectedMatter.notes || '');
      setEditFolderId(selectedMatter.folderId || '');
      setEditStage(selectedMatter.developmentProfile?.stage || 'PLANNING');
    } else {
      setSelectedMatterFull(null);
    }
  }, [selectedMatter]);

  const handleViewMatter = useCallback(async (matter: any) => {
    setSelectedMatter(matter);
    setMatterTab('overview');
    try {
      const res = await fetch(`/api/lawyer/matters/${matter.id}`);
      if (res.ok) setSelectedMatterFull(await res.json());
      await fetchMatterSubData(matter.id);
    } catch (e) {
      console.error('Failed to fetch full matter details', e);
    }
  }, [fetchMatterSubData]);

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatter || !newTaskForm.title) return;
    try {
      const res = await fetch('/api/lawyer/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTaskForm,
          matterId: selectedMatter.id,
        })
      });
      if (res.ok) {
        setNewTaskForm({ title: '', description: '', priority: 'MEDIUM', userId: '', dueDate: '' });
        await fetchMatterSubData(selectedMatter.id);
        await fetchMatters(selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ أثناء إضافة المهمة');
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    try {
      const res = await fetch(`/api/lawyer/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchMatterSubData(selectedMatter.id);
        await fetchMatters(selectedFolderId);
      }
    } catch (e) {
      console.error('Error toggling task status', e);
    }
  };

  const handleCreateHearingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatter || !newHearingForm.date) return;
    try {
      const res = await fetch('/api/lawyer/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newHearingForm,
          matterId: selectedMatter.id,
        })
      });
      if (res.ok) {
        setNewHearingForm({ type: 'HEARING', title: '', court: '', date: '', summary: '' });
        await fetchMatterSubData(selectedMatter.id);
        await fetchMatters(selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ أثناء إضافة الموعد');
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    }
  };

  const handleGenerateDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatter || !generateDocForm.templateId) return;
    try {
      const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/generate-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateDocForm)
      });
      if (res.ok) {
        alert('تم توليد المستند وتعبئة البيانات بنجاح في ملفات المشروع!');
        setGenerateDocForm({ templateId: '', customTitle: '' });
        const fullRes = await fetch(`/api/lawyer/matters/${selectedMatter.id}`);
        if (fullRes.ok) setSelectedMatterFull(await fullRes.json());
        await fetchMatterSubData(selectedMatter.id);
      } else {
        const data = await res.json();
        alert(data.error || 'حدث خطأ أثناء التوليد');
      }
    } catch (e) {
      alert('حدث خطأ بالاتصال بالنظام');
    }
  };

  const handleUpdateStatus = async (newStatus: string, note?: string) => {
    if (!selectedMatterFull) return;
    setIsStatusUpdating(true);
    try {
      const res = await fetch(`/api/lawyer/matters/${selectedMatterFull.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note })
      });
      if (res.ok) {
        const updatedMatter = await res.json();
        // Update both partial and full states
        setSelectedMatter((prev: any) => ({ ...prev, status: updatedMatter.status }));
        const fullRes = await fetch(`/api/lawyer/matters/${selectedMatterFull.id}`);
        if (fullRes.ok) setSelectedMatterFull(await fullRes.json());
        fetchMatters(selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [clientsRes, lawyersRes, teamUsersRes, foldersRes] = await Promise.all([
        fetch('/api/lawyer/clients'),
        fetch('/api/lawyer/users?roles=lawyer'),
        fetch('/api/lawyer/users'),
        fetch('/api/lawyer/folders')
      ]);

      if (clientsRes.ok) setClients(await clientsRes.json());
      if (lawyersRes.ok) setLawyers(await lawyersRes.json());
      if (teamUsersRes.ok) setTeamUsers(await teamUsersRes.json());
      if (foldersRes.ok) setFolders(await foldersRes.json());
    } catch (error) {
      console.error('Failed to fetch initial data', error);
    }
  };

  const fetchMatters = useCallback(async (folderId: string) => {
    setIsLoading(true);
    try {
      const qs = folderId !== 'all' ? `?folderId=${folderId}` : '';
      const res = await fetch(`/api/lawyer/matters${qs}`);
      if (res.ok) {
        const loadedMatters = await res.json();
        setMatters(loadedMatters);

        if (!openedMatterFromUrlRef.current) {
          openedMatterFromUrlRef.current = true;
          const requestedMatterId = new URLSearchParams(window.location.search).get('matterId');
          const requestedMatter = loadedMatters.find((matter: any) => matter.id === requestedMatterId);
          if (requestedMatter) await handleViewMatter(requestedMatter);
        }
      }
    } catch (error) {
      console.error('Failed to fetch matters', error);
    } finally {
      setIsLoading(false);
    }
  }, [handleViewMatter]);

  useEffect(() => {
    void fetchMatters(selectedFolderId);
  }, [fetchMatters, selectedFolderId]);

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: newMatter.title, caseNumber: newMatter.caseNumber,
        lawyerId: newMatter.lawyerId, teamMemberIds: newMatter.teamMemberIds,
        notes: newMatter.notes, beneficiaryAccountId: newMatter.beneficiaryAccountId,
        folderId: newMatter.folderId || null,
        dueDate: newMatter.dueDate || null,
        city: newMatter.city,
        region: newMatter.region,
        stage: newMatter.stage,
        plannedStart: newMatter.plannedStart || null,
        projectValue: newMatter.projectValue,
        budgetAtCompletion: newMatter.budgetAtCompletion,
        plannedValue: newMatter.plannedValue,
        earnedValue: newMatter.earnedValue,
        actualCost: newMatter.actualCost,
        totalUnits: newMatter.totalUnits,
        soldUnits: newMatter.soldUnits,
        collectedAmount: newMatter.collectedAmount,
      };

      if (newMatter.clientMode === 'existing') payload.clientId = newMatter.clientId;
      else if (newMatter.clientMode === 'external') {
        payload.externalPartyName = newMatter.externalPartyName;
        payload.externalPartyType = newMatter.externalPartyType;
        payload.externalPartyPhone = newMatter.externalPartyPhone;
        payload.externalPartyEmail = newMatter.externalPartyEmail;
        payload.externalPartyNotes = newMatter.externalPartyNotes;
      }

      const res = await fetch('/api/lawyer/matters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const createdMatter = await res.json();
        const uploadResults = createdMatter?.id
          ? await Promise.all(newMatter.files.map(async (file) => {
              const formData = new FormData();
              formData.append('matterId', createdMatter.id);
              formData.append('file', file);
              const uploadResponse = await fetch('/api/lawyer/documents', { method: 'POST', body: formData });
              const uploadData = await uploadResponse.json().catch(() => ({}));
              return {
                fileName: file.name,
                ok: uploadResponse.ok,
                error: uploadData.error || 'تعذر رفع الملف',
              };
            }))
          : [];
        const failedUploads = uploadResults.filter((result) => !result.ok);
        await fetchMatters(selectedFolderId);
        setShowCreateModal(false);
        setProjectFileError('');
        setNewMatter({
          title: '', caseNumber: '', lawyerId: lawyers[0]?.id || '', teamMemberIds: [],
          clientMode: 'none', clientId: '', beneficiaryAccountId: '',
          externalPartyName: '', externalPartyType: 'person', externalPartyPhone: '',
          externalPartyEmail: '', externalPartyNotes: '', notes: '', folderId: '',
          city: '', region: '', stage: 'PLANNING', plannedStart: '', dueDate: '',
          projectValue: '', budgetAtCompletion: '', plannedValue: '', earnedValue: '',
          actualCost: '', totalUnits: '', soldUnits: '', collectedAmount: '', files: []
        });
        if (failedUploads.length > 0) {
          alert(`تم إنشاء المشروع، لكن تعذر رفع الملفات التالية:\n${failedUploads.map((result) => `• ${result.fileName}: ${result.error}`).join('\n')}`);
        }
      } else {
        const data = await res.json();
        alert(`خطأ: ${data.error}`);
      }
    } catch (error) {
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUpdates = async () => {
    if (!selectedMatter) return;
    setIsSubmitting(true);
    try {
      // Save matter general details
      const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, caseNumber: editCaseNumber, lawyerId: editLawyerId, teamMemberIds: editTeamMemberIds, notes: editNotes, stage: editStage })
      });
      
      // Save folder change if needed
      if (res.ok && editFolderId !== (selectedMatter.folderId || '')) {
        await fetch(`/api/lawyer/matters/${selectedMatter.id}/folder`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: editFolderId || 'none' })
        });
      }

      if (res.ok) {
        setIsEditing(false);
        setSelectedMatter(null); // Close modal to refresh smoothly
        await fetchMatters(selectedFolderId);
        alert('تم تحديث بيانات المشروع بنجاح.');
      } else {
        const data = await res.json();
        alert(`فشل التحديث: ${data.error}`);
      }
    } catch (e) {
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendBundle = async () => {
    if (!selectedMatterFull) return;
    const email = prompt('أدخل البريد الإلكتروني للعميل:');
    if (!email) return;
    
    setIsSendingBundle(true);
    try {
      const res = await fetch(`/api/legal/cases/${selectedMatterFull.id}/bundle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, include_documents: true, include_invoices: true })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message + '\nرابط التحميل: ' + data.download_link);
      } else {
        alert('تعذر إرسال الحزمة');
      }
    } catch (e) {
      alert('خطأ في الاتصال');
    } finally {
      setIsSendingBundle(false);
    }
  };

  const handleConvertClient = async () => {
    if (!selectedMatter) return;
    if (!confirm('هل تريد تحويل هذا الطرف الخارجي إلى عميل رسمي مسجل في النظام؟')) return;
    try {
      const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/convert-client`, { method: 'POST' });
      if (res.ok) {
        setSelectedMatter(await res.json());
        await fetchMatters(selectedFolderId);
        alert('تم تحويل الطرف الخارجي إلى عميل مسجل بنجاح.');
      } else {
        const data = await res.json();
        alert(`فشل التحويل: ${data.error}`);
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = folderForm.id ? 'PATCH' : 'POST';
      const url = folderForm.id ? `/api/lawyer/folders/${folderForm.id}` : '/api/lawyer/folders';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderForm.name, viewerIds: folderForm.viewerIds })
      });
      if (res.ok) {
        setShowFolderModal(false);
        const foldersRes = await fetch('/api/lawyer/folders');
        if (foldersRes.ok) setFolders(await foldersRes.json());
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Error saving folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('سيتم حذف المجلد فقط، وستنتقل المشاريع الموجودة داخله إلى "مشاريع بدون مجلد". لن يتم حذف أي مشروع. هل أنت متأكد؟')) return;
    try {
      const res = await fetch(`/api/lawyer/folders/${folderId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedFolderId === folderId) setSelectedFolderId('all');
        const foldersRes = await fetch('/api/lawyer/folders');
        if (foldersRes.ok) setFolders(await foldersRes.json());
        await fetchMatters(selectedFolderId === folderId ? 'all' : selectedFolderId);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting folder');
    }
  };

  const filteredMatters = matters.filter(m => {
    const matchesSearch = m.title.includes(searchTerm) || 
      (m.client?.name || '').includes(searchTerm) || 
      (m.externalPartyName || '').includes(searchTerm) || 
      m.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesArchive = archiveFilter === 'all' 
      ? true 
      : archiveFilter === 'archived' 
      ? m.isArchived === true 
      : m.isArchived !== true;
    return matchesSearch && matchesStatus && matchesArchive;
  });

  const selectedFolderObj = folders.find(f => f.id === selectedFolderId);
  const isManager = ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(userRole.toUpperCase());
  const canManageSelectedFolder = selectedFolderObj && (isManager || selectedFolderObj.createdById === currentUserId);

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `منتهي (${Math.abs(days)} يوم)`;
    if (days === 0) return 'ينتهي اليوم';
    if (days === 1) return 'غداً';
    if (days === 2) return 'بعد غد';
    return `بعد ${days} يوم`;
  };

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <span>إدارة محفظة المشاريع</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">متابعة المشاريع وبيانات الأداء وفرق التنفيذ</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setFolderForm({ id: '', name: '', viewerIds: [] }); setShowFolderModal(true); }} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer">
            <FolderPlus className="w-4 h-4" /> <span>مجلد جديد</span>
          </button>
          {canCreateCase && (
            <button onClick={() => { setShowImportModal(true); setImportStep('upload'); setImportFile(null); setImportDraftId(null); setImportDuplicateWarning(null); }} className="border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer">
              <FileText className="w-4 h-4 text-amber-400" /> <span>استيراد مشروع من مستند</span>
            </button>
          )}
          {canCreateCase && <button data-testid="create-matter-button" onClick={() => { setProjectFileError(''); setShowCreateModal(true); }} className="gold-gradient-bg text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> <span>فتح مشروع جديد</span>
          </button>}
        </div>
      </div>

      {/* Folders Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 subtle-scroll">
        <button onClick={() => setSelectedFolderId('all')} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${selectedFolderId === 'all' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
          <Briefcase className="w-4 h-4" /> <span>كل المشاريع</span>
        </button>
        <button onClick={() => setSelectedFolderId('none')} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${selectedFolderId === 'none' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
          <FileText className="w-4 h-4" /> <span>مشاريع بدون محفظة</span>
        </button>
        {folders.map(f => (
          <button key={f.id} onClick={() => setSelectedFolderId(f.id)} className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${selectedFolderId === f.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>
            <Folder className="w-4 h-4" /> <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Folder Management Actions */}
      {selectedFolderId !== 'all' && selectedFolderId !== 'none' && canManageSelectedFolder && (
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 ml-auto">خيارات المجلد:</p>
          <button onClick={() => { setFolderForm({ id: selectedFolderObj.id, name: selectedFolderObj.name, viewerIds: selectedFolderObj.viewers.map((v:any) => v.id) }); setShowFolderModal(true); }} className="text-xs flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            <Settings2 className="w-3.5 h-3.5" /> تعديل
          </button>
          <button onClick={() => handleDeleteFolder(selectedFolderObj.id)} className="text-xs flex items-center gap-1 text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /> حذف المجلد
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ابحث باسم المشروع، المدينة، العميل، أو الرمز..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select value={archiveFilter} onChange={(e) => setArchiveFilter(e.target.value as any)} className="w-full md:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer">
            <option value="active">المشاريع النشطة</option>
            <option value="archived">المشاريع المؤرشفة</option>
            <option value="all">جميع المشاريع</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer">
            <option value="all">كل الحالات</option>
            {MATTER_STATUSES.map(s => (
              <option key={s} value={s}>{MATTER_STATUS_ARABIC[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : (
        <div className="space-y-3 sm:hidden">
          {filteredMatters.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-slate-400">{selectedFolderId !== 'all' && selectedFolderId !== 'none' ? 'لا توجد مشاريع داخل هذه المحفظة.' : 'لا توجد مشاريع مطابقة للبحث أو مسجلة حالياً.'}</div>
          ) : (
            filteredMatters.map((matter) => (
              <article key={matter.id} className="glass-card rounded-2xl border border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold leading-6 text-slate-100">{matter.title}</h2>
                    <p className="mt-1 font-mono text-[11px] text-amber-400">{matter.caseNumber || matter.id.slice(0, 8)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold border ${MATTER_STATUS_COLORS[matter.status as MatterStatus]?.bg || 'bg-slate-500/10'} ${MATTER_STATUS_COLORS[matter.status as MatterStatus]?.text || 'text-slate-400'} ${MATTER_STATUS_COLORS[matter.status as MatterStatus]?.border || 'border-slate-500/20'}`}>
                    {MATTER_STATUS_ARABIC[matter.status as MatterStatus] || matter.status}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 text-xs">
                  <div><dt className="text-slate-500">العميل / المستثمر</dt><dd className="mt-1 truncate font-semibold text-slate-300">{matter.client?.name || matter.externalPartyName || 'غير محدد'}</dd></div>
                  <div><dt className="text-slate-500">مدير المشروع</dt><dd className="mt-1 truncate font-semibold text-slate-300">{matter.lawyer?.name || 'غير محدد'}</dd></div>
                  {matter.dueDate && <div className="col-span-2"><dt className="text-slate-500">تاريخ الانتهاء</dt><dd className={`mt-1 font-semibold ${new Date(matter.dueDate) < new Date() ? 'text-rose-400' : 'text-amber-400'}`}>{new Date(matter.dueDate).toLocaleDateString('ar-SA')} - <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{getRelativeTime(matter.dueDate)}</span></dd></div>}
                </dl>
                <button onClick={() => handleViewMatter(matter)} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20">التفاصيل</button>
              </article>
            ))
          )}
        </div>
      )}

      {!isLoading && (
        <div className="hidden overflow-hidden rounded-2xl sm:block glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/50">
                  <th className="p-4 pr-6">المشروع والرمز</th>
                  <th className="p-4">العميل / المستثمر</th>
                  <th className="p-4">مدير المشروع</th>
                  <th className="p-4">المجلد</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 pl-6 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMatters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">{selectedFolderId !== 'all' && selectedFolderId !== 'none' ? 'لا توجد مشاريع داخل هذه المحفظة.' : 'لا توجد مشاريع مطابقة للبحث أو مسجلة حالياً.'}</td>
                  </tr>
                ) : (
                  filteredMatters.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-4 pr-6">
                        <p className="font-bold text-slate-100 text-sm">{m.title}</p>
                        <span className="font-mono text-amber-400 text-[10px]">{m.id.substring(0,8)}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">
                        <p>{m.client ? m.client.name : m.externalPartyName ? `الطرف الخارجي: ${m.externalPartyName}` : 'غير محدد'}</p>
                      </td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">👤 {m.lawyer?.name || 'غير محدد'}</span></td>
                      <td className="p-4 text-slate-400">
                        {m.folder ? (
                           <span className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 w-max"><Folder className="w-3 h-3" /> {m.folder.name}</span>
                        ) : (
                           <span className="text-[10px] text-slate-500">بدون</span>
                        )}
                      </td>
                      <td className="p-4">
                        {m.dueDate ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold text-slate-200">{new Date(m.dueDate).toLocaleDateString('ar-SA')}</span>
                            <span className={`text-[10px] w-max px-1.5 py-0.5 rounded ${new Date(m.dueDate) < new Date() ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{getRelativeTime(m.dueDate)}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">غير محدد</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${MATTER_STATUS_COLORS[m.status as MatterStatus]?.bg || 'bg-slate-500/10'} ${MATTER_STATUS_COLORS[m.status as MatterStatus]?.text || 'text-slate-400'} ${MATTER_STATUS_COLORS[m.status as MatterStatus]?.border || 'border-slate-500/20'}`}>
                          {MATTER_STATUS_ARABIC[m.status as MatterStatus] || m.status}
                        </span>
                      </td>
                      <td className="p-4 pl-6 text-left">
                        <button onClick={() => handleViewMatter(m)} className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-xs cursor-pointer bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 inline-flex transition-colors">التفاصيل <ChevronLeft className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl w-full max-w-md border-amber-500/30 shadow-2xl shadow-amber-500/10">
            <h3 className="font-bold text-lg text-slate-100 mb-4">{folderForm.id ? 'تعديل المجلد' : 'مجلد جديد'}</h3>
            <form onSubmit={handleFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المجلد *</label>
                <input required type="text" maxLength={100} value={folderForm.name} onChange={e => setFolderForm({ ...folderForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">السماح للمستخدمين برؤية المجلد (اختياري)</label>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 subtle-scroll">
                  {teamUsers.filter(u => u.id !== currentUserId && !['ADMIN', 'OWNER', 'SUPERADMIN'].includes(u.role.toUpperCase())).map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={folderForm.viewerIds.includes(u.id)} onChange={(e) => {
                        const newIds = e.target.checked ? [...folderForm.viewerIds, u.id] : folderForm.viewerIds.filter(id => id !== u.id);
                        setFolderForm({ ...folderForm, viewerIds: newIds });
                      }} className="rounded bg-slate-950 text-amber-500 border-slate-800 focus:ring-0 focus:ring-offset-0" />
                      <span>{u.name}</span>
                    </label>
                  ))}
                  <p className="text-[10px] text-slate-500 mt-2 italic">مدراء النظام والشركة يمكنهم رؤية المجلد دائماً ولا يظهرون هنا.</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowFolderModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="gold-gradient-bg text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors hover:brightness-110">{isSubmitting ? 'جاري الحفظ...' : 'حفظ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW MATTER MODAL */}
      {showCreateModal && (
        <div className="rusukh-create-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-3 sm:p-5">
          <div data-testid="create-matter-modal" className="rusukh-create-modal max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-3xl sm:max-h-[calc(100vh-2.5rem)]">
            <div className="rusukh-create-modal__header sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 sm:px-7">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black"><Plus className="h-5 w-5 text-amber-600" /><span>إضافة مشروع تطوير عقاري</span></h3>
                <p className="mt-1 text-[11px] text-slate-500">ابدأ بالبيانات الأساسية، ويمكن استكمال المؤشرات والتفاصيل لاحقاً.</p>
              </div>
              <button aria-label="إغلاق نافذة إضافة المشروع" onClick={() => setShowCreateModal(false)} className="rounded-full border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreateMatter} className="space-y-6 p-5 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المشروع *</label>
                  <input data-testid="matter-title-input" type="text" required value={newMatter.title} onChange={e => setNewMatter({ ...newMatter, title: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز المشروع</label>
                  <input type="text" value={newMatter.caseNumber} onChange={e => setNewMatter({ ...newMatter, caseNumber: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">محفظة / مجلد المشروع</label>
                  <select value={newMatter.folderId} onChange={e => setNewMatter({ ...newMatter, folderId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50">
                    <option value="">بدون مجلد</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ التسليم المخطط</label>
                  <input type="date" value={newMatter.dueDate} onChange={e => setNewMatter({ ...newMatter, dueDate: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مدير المشروع</label>
                  <select value={newMatter.lawyerId} onChange={e => setNewMatter({ ...newMatter, lawyerId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50">
                    <option value="">اختر مديراً</option>
                    {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الحساب المستفيد (اختياري)</label>
                  <select value={newMatter.beneficiaryAccountId} onChange={e => setNewMatter({ ...newMatter, beneficiaryAccountId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50">
                    <option value="">اختر حساباً</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المدينة</label>
                  <input type="text" value={newMatter.city} onChange={e => setNewMatter({ ...newMatter, city: e.target.value })} placeholder="مثال: الرياض" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">مرحلة المشروع</label>
                  <select value={newMatter.stage} onChange={e => setNewMatter({ ...newMatter, stage: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50">
                    {PROJECT_STAGE_OPTIONS.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                  </select>
                </div>
              </div>
              <details className="rusukh-create-advanced rounded-2xl border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5">
                  <span>
                    <strong className="block text-xs">المؤشرات المالية والقيمة المكتسبة</strong>
                    <small className="mt-1 block text-[10px] text-slate-500">اختياري — يمكن إدخالها بعد إنشاء المشروع</small>
                  </span>
                  <span className="rusukh-create-advanced__chevron text-lg text-amber-600">⌄</span>
                </summary>
                <div className="border-t border-slate-200 p-4">
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[
                    ['projectValue', 'قيمة المشروع (ر.س)'],
                    ['budgetAtCompletion', 'ميزانية الإكمال BAC'],
                    ['plannedValue', 'القيمة المخططة PV'],
                    ['earnedValue', 'القيمة المكتسبة EV'],
                    ['actualCost', 'التكلفة الفعلية AC'],
                    ['collectedAmount', 'التحصيل الفعلي'],
                    ['totalUnits', 'إجمالي الوحدات'],
                    ['soldUnits', 'الوحدات المباعة'],
                  ].map(([field, label]) => (
                    <label key={field} className="text-[10px] font-bold text-slate-400">
                      {label}
                      <input
                        type="number"
                        min="0"
                        step={field.includes('Units') ? '1' : '0.01'}
                        value={newMatter[field as keyof typeof newMatter] as string}
                        onChange={e => setNewMatter({ ...newMatter, [field]: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-5 text-slate-500">يحسب النظام SPI = EV ÷ PV وCPI = EV ÷ AC تلقائياً. يمكن ترك القيم صفراً وإكمالها لاحقاً.</p>
                </div>
              </details>
              <div className="rusukh-client-mode flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                {['existing', 'external', 'none'].map((mode) => (
                  <label key={mode} className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg cursor-pointer transition ${newMatter.clientMode === mode ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
                    <input data-testid={`matter-client-mode-${mode}`} type="radio" name="clientMode" value={mode} checked={newMatter.clientMode === mode} onChange={e => setNewMatter({ ...newMatter, clientMode: e.target.value })} className="hidden" />
                    {mode === 'existing' ? 'عميل مسجل' : mode === 'external' ? 'طرف خارجي (جديد)' : 'بدون'}
                  </label>
                ))}
              </div>
              {newMatter.clientMode === 'existing' && (
                <select required value={newMatter.clientId} onChange={e => setNewMatter({ ...newMatter, clientId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50">
                  <option value="">اختر عميلاً</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {newMatter.clientMode === 'external' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><input data-testid="matter-external-party-input" type="text" required placeholder="اسم الشخص أو الجهة" value={newMatter.externalPartyName} onChange={e => setNewMatter({ ...newMatter, externalPartyName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" /></div>
                  <input type="text" placeholder="الرقم" value={newMatter.externalPartyPhone} onChange={e => setNewMatter({ ...newMatter, externalPartyPhone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                  <select value={newMatter.externalPartyType} onChange={e => setNewMatter({ ...newMatter, externalPartyType: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50">
                    <option value="person">شخص</option><option value="company">منشأة</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات</label>
                <textarea data-testid="matter-notes-input" value={newMatter.notes} onChange={e => setNewMatter({ ...newMatter, notes: e.target.value })} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 resize-y" />
              </div>

              <div className="rusukh-create-panel rounded-2xl border p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <label htmlFor="project-files" className="block text-xs font-black text-slate-200">ملفات المشروع (اختياري)</label>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      أرفق حتى {MAX_PROJECT_FILES} ملفات، بحد أقصى 10 ميجابايت لكل ملف. يدعم PDF وWord وExcel وPowerPoint والصور وملفات CAD وZIP والنصوص.
                    </p>
                  </div>
                </div>
                <input
                  id="project-files"
                  data-testid="matter-files-input"
                  type="file"
                  multiple
                  accept={PROJECT_FILE_ACCEPT}
                  onChange={(event) => {
                    const selectedFiles = Array.from(event.target.files || []);
                    if (selectedFiles.length > MAX_PROJECT_FILES) {
                      setProjectFileError(`يمكن إرفاق ${MAX_PROJECT_FILES} ملفات كحد أقصى.`);
                      event.target.value = '';
                      return;
                    }
                    const oversizedFile = selectedFiles.find((file) => file.size > MAX_PROJECT_FILE_SIZE);
                    if (oversizedFile) {
                      setProjectFileError(`الملف «${oversizedFile.name}» أكبر من 10 ميجابايت.`);
                      event.target.value = '';
                      return;
                    }
                    setProjectFileError('');
                    setNewMatter({ ...newMatter, files: selectedFiles });
                  }}
                  className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-400 file:ml-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-slate-950 hover:border-amber-500/40 hover:file:brightness-110"
                />
                {projectFileError && <p role="alert" className="mt-2 text-[11px] font-bold text-rose-400">{projectFileError}</p>}
                {newMatter.files.length > 0 && (
                  <div data-testid="selected-project-files" className="mt-3 space-y-2">
                    {newMatter.files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-slate-300">
                          <Paperclip className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          <span className="truncate">{file.name}</span>
                          <span className="shrink-0 text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} ك.ب</span>
                        </span>
                        <button
                          type="button"
                          aria-label={`إزالة الملف ${file.name}`}
                          onClick={() => setNewMatter({ ...newMatter, files: newMatter.files.filter((selectedFile) => selectedFile !== file) })}
                          className="rounded-lg p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conflict Check Section */}
              <div className="rusukh-create-panel rounded-2xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">فحص تكرار اسم المشروع أو الجهة قبل الإنشاء</span>
                  </div>
                  <button
                    type="button"
                    disabled={isCheckingConflict || (!newMatter.externalPartyName && !newMatter.title)}
                    onClick={async () => {
                      const nameToCheck = newMatter.externalPartyName || newMatter.title;
                      if (!nameToCheck) return;
                      setIsCheckingConflict(true);
                      try {
                        const res = await fetch('/api/lawyer/conflict-check', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: nameToCheck })
                        });
                        if (res.ok) {
                          setConflictCheckResult(await res.json());
                        }
                      } catch (e) {
                        console.error('Error running conflict check', e);
                      } finally {
                        setIsCheckingConflict(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingConflict ? 'جاري الفحص...' : 'فحص السجلات الآن'}
                  </button>
                </div>

                {conflictCheckResult && (
                  <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                    conflictCheckResult.riskLevel === 'HIGH' ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' :
                    conflictCheckResult.riskLevel === 'MEDIUM' ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' :
                    'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>مستوى الخطورة: {conflictCheckResult.riskLevel}</span>
                      <span>{conflictCheckResult.hasConflict ? '⚠️ توجد سجلات متشابهة' : '✅ لا يوجد سجل مطابق معروف'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{conflictCheckResult.reason}</p>

                    {conflictCheckResult.matches?.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <p className="font-bold text-[11px]">السجلات المتطابقة:</p>
                        {conflictCheckResult.matches.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] flex justify-between">
                            <span>{m.name} ({m.typeName})</span>
                            <span className="font-bold">{m.matterTitle || m.details}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rusukh-create-modal__footer sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t px-5 py-4 sm:-mx-7 sm:-mb-7 sm:px-7">
                <button type="button" onClick={() => { setShowCreateModal(false); setConflictCheckResult(null); }} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">إلغاء</button>
                <button data-testid="create-matter-submit" type="submit" disabled={isSubmitting} className="gold-gradient-bg text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs hover:brightness-110 transition-colors">{isSubmitting ? 'جاري الحفظ...' : 'حفظ وإنشاء المشروع'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATTER DETAILS MODAL */}
      {selectedMatter && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden text-right" dir="rtl">
          <div data-testid="matter-details-modal" className="rusukh-dark-surface flex h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 p-4 text-slate-100 shadow-2xl sm:h-[90vh] md:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 shrink-0 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">{selectedMatter.id.substring(0,8)}</span>
                {isEditing ? <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="font-extrabold text-xl text-white bg-slate-900 border border-slate-800 rounded px-2 mt-2 w-full max-w-lg focus:outline-none focus:border-amber-500/50" /> : <h3 className="font-extrabold text-xl sm:text-2xl text-white mt-3">{selectedMatter.title}</h3>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/lawyer/matters/${selectedMatter.id}/report`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> تصدير تقرير PDF
                </a>

                {selectedMatter.isArchived ? (
                  isManager && (
                    <button
                      onClick={() => handleUnarchiveMatter(selectedMatter.id)}
                      className="text-xs text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" /> إلغاء الأرشفة
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleArchiveMatter(selectedMatter.id)}
                    className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" /> أرشفة المشروع
                  </button>
                )}

                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"><Edit2 className="w-3.5 h-3.5" /> تعديل</button>}
                <button onClick={() => { setSelectedMatter(null); setIsEditing(false); }} className="text-slate-400 hover:text-white font-bold bg-slate-900 rounded-full p-2 border border-slate-800 transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-4 lg:mt-6 flex-1 min-h-0 overflow-x-hidden overflow-y-auto lg:overflow-hidden subtle-scroll">
              <div className="min-w-0 lg:col-span-1 space-y-4 lg:overflow-y-auto lg:pr-2 subtle-scroll">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-500 text-sm border-b border-slate-800 pb-2">التصنيف والتنظيم</h4>
                  {isEditing ? (
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">مجلد المشروع (تغيير المجلد)</label>
                      <select value={editFolderId} onChange={e => setEditFolderId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-amber-500/50">
                        <option value="">بدون مجلد</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500 text-xs">مجلد المشروع</p>
                      {selectedMatter.folder ? <p className="font-bold text-slate-200 text-xs flex items-center gap-1 mt-1 bg-slate-800/50 px-2 py-1.5 rounded-md w-fit border border-slate-700/50"><Folder className="w-3.5 h-3.5 text-amber-400" /> {selectedMatter.folder.name}</p> : <p className="text-xs text-slate-400 mt-1">بدون مجلد</p>}
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-500 text-sm border-b border-slate-800 pb-2">تفاصيل المشروع</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div><label className="text-xs text-slate-400 block mb-1">رقم المشروع</label><input type="text" value={editCaseNumber} onChange={e=>setEditCaseNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">مدير المشروع</label><select value={editLawyerId} onChange={e=>setEditLawyerId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"><option value="">-- اختر --</option>{lawyers.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">مرحلة المشروع الحالية</label>
                        <select
                          data-testid="edit-project-stage"
                          value={editStage}
                          onChange={e => setEditStage(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                        >
                          {PROJECT_STAGE_OPTIONS.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div><p className="text-slate-500 text-xs">رقم المشروع</p><p className="font-bold text-slate-200 text-xs">{selectedMatter.caseNumber || '---'}</p></div>
                      <div><p className="text-slate-500 text-xs">مدير المشروع المسؤول</p><p className="font-bold text-amber-400 text-xs">{selectedMatter.lawyer?.name || '---'}</p></div>
                      <div><p className="text-slate-500 text-xs">مرحلة المشروع الحالية</p><p className="font-bold text-emerald-300 text-xs">{PROJECT_STAGE_OPTIONS.find((stage) => stage.value === selectedMatter.developmentProfile?.stage)?.label || 'غير محددة'}</p></div>
                      {(selectedMatter.client?.name || selectedMatter.externalPartyName) && (
                        <div><p className="text-slate-500 text-xs">العميل أو الطرف الخارجي</p><p data-testid="matter-party-name" className="font-bold text-slate-200 text-xs">{selectedMatter.client?.name || selectedMatter.externalPartyName}</p></div>
                      )}
                      {selectedMatter.notes && (
                        <div><p className="text-slate-500 text-xs mt-2">الوصف والتفاصيل</p><p className="text-slate-300 text-xs mt-1 bg-slate-800/30 p-2 rounded whitespace-pre-wrap">{selectedMatter.notes}</p></div>
                      )}
                      <div>
                        <p className="text-slate-500 text-xs mt-2">الملفات المرفقة ({selectedMatter.documents?.length || 0})</p>
                        {selectedMatter.documents?.length > 0 ? (
                          <div className="flex flex-col gap-2 mt-1">
                            {selectedMatter.documents.map((doc: any) => (
                              <a key={doc.id} href={`/api/lawyer/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg text-xs text-amber-400 hover:bg-slate-700 transition">
                                <FileText className="w-4 h-4 shrink-0" /> <span className="truncate">{doc.title}</span>
                              </a>
                            ))}
                          </div>
                        ) : <p className="text-xs text-slate-500 mt-1">لا توجد ملفات</p>}
                      </div>
                    </div>
                  )}
                  {isEditing && <button onClick={handleSaveUpdates} className="text-xs bg-amber-500 hover:brightness-110 transition-colors text-slate-950 px-3 py-2 rounded-xl font-bold w-full mt-4">حفظ التعديلات</button>}
                  {!isEditing && (
                    <button disabled={isSendingBundle} onClick={handleSendBundle} className="w-full bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-500/50 font-bold py-2 rounded-xl text-xs mt-4">
                      {isSendingBundle ? 'جاري الإرسال...' : 'إرسال حزمة القضية للعميل'}
                    </button>
                  )}
                  {selectedMatter.externalPartyName && !isEditing && (
                    <button onClick={handleConvertClient} className="w-full gold-gradient-bg text-slate-950 font-bold py-2 rounded-xl text-xs mt-2">تحويل الطرف الخارجي لعميل</button>
                  )}
                </div>

                {/* Status Update Section */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-amber-500 text-sm border-b border-slate-800 pb-2">حالة المشروع وسير العمل</h4>
                  {selectedMatterFull ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">الحالة الحالية:</span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${MATTER_STATUS_COLORS[selectedMatterFull.status as MatterStatus]?.bg || 'bg-slate-500/10'} ${MATTER_STATUS_COLORS[selectedMatterFull.status as MatterStatus]?.text || 'text-slate-400'} ${MATTER_STATUS_COLORS[selectedMatterFull.status as MatterStatus]?.border || 'border-slate-500/20'}`}>
                          {MATTER_STATUS_ARABIC[selectedMatterFull.status as MatterStatus] || selectedMatterFull.status}
                        </span>
                      </div>
                      
                      {!isEditing && (['ADMIN', 'OWNER', 'SUPERADMIN'].includes(userRole.toUpperCase()) || selectedMatterFull.lawyerId === currentUserId || selectedMatterFull.teamMembers?.some((m:any) => m.id === currentUserId)) && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/50">
                          <label className="text-xs text-slate-300 block font-bold">تحديث الحالة</label>
                          <select 
                            onChange={(e) => {
                              if (e.target.value === selectedMatterFull.status || e.target.value === '') return;
                              const note = prompt(`الرجاء إدخال ملاحظة (اختياري) لتوضيح سبب تغيير الحالة إلى "${MATTER_STATUS_ARABIC[e.target.value as MatterStatus]}":`);
                              if (note !== null) handleUpdateStatus(e.target.value, note);
                              e.target.value = '';
                            }}
                            disabled={isStatusUpdating}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                          >
                            <option value="">-- اختر حالة جديدة --</option>
                            {MATTER_STATUSES.map(s => (
                              <option key={s} value={s} disabled={s === selectedMatterFull.status}>{MATTER_STATUS_ARABIC[s]}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Status History */}
                      {selectedMatterFull.statusHistory && selectedMatterFull.statusHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                          <p className="text-xs text-slate-500 mb-3 font-bold">سجل الحالات</p>
                          <div className="space-y-3 relative before:absolute before:inset-y-0 before:right-2 before:w-px before:bg-slate-800">
                            {selectedMatterFull.statusHistory.map((history: any) => (
                              <div key={history.id} className="relative pl-2 pr-6">
                                <div className="absolute right-1 top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-slate-900/50" />
                                <p className="text-[10px] text-slate-400 mb-0.5">{new Date(history.createdAt).toLocaleString('ar-SA')}</p>
                                <p className="text-xs text-slate-200">
                                  تغيرت إلى <span className="font-bold text-amber-400">{MATTER_STATUS_ARABIC[history.newStatus as MatterStatus] || history.newStatus}</span>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">بواسطة {history.changedBy?.name}</p>
                                {history.note && <p className="text-[10px] text-slate-400 bg-slate-800/30 p-1.5 rounded mt-1">{history.note}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 text-slate-400 animate-spin" /></div>
                  )}
                </div>
              </div>
              <div className="min-w-0 lg:col-span-2 min-h-[65vh] lg:min-h-0 lg:h-full flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 p-3 sm:p-4">
                {/* Tabs Bar */}
                <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-3 mb-4 shrink-0 subtle-scroll">
                  <button
                    onClick={() => setMatterTab('overview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    ◫ مركز المشروع
                  </button>
                  <button
                    data-testid="project-tab-chat"
                    onClick={() => setMatterTab('chat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'chat' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    💬 المحادثات والملاحظات
                  </button>
                  <button
                    onClick={() => setMatterTab('tasks')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'tasks' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    📋 المهام ({tasksList.length})
                  </button>
                  <button
                    onClick={() => setMatterTab('hearings')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'hearings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    📅 المواعيد والمراحل ({hearingsList.length})
                  </button>
                  <button
                    onClick={() => setMatterTab('timeline')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'timeline' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    ⏳ الخط الزمني
                  </button>
                  <button
                    onClick={() => setMatterTab('generate_doc')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'generate_doc' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    📄 توليد مستند من قالب
                  </button>
                  <button
                    onClick={() => setMatterTab('parties')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'parties' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    👥 الأطراف ({partiesList.length})
                  </button>
                  <button
                    onClick={() => setMatterTab('deadlines')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'deadlines' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    ⏱️ الاستحقاقات الحرجة ({deadlinesList.length})
                  </button>
                  <button
                    onClick={() => setMatterTab('financials')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'financials' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    💰 الميزانية والدفعات
                  </button>
                  <button
                    onClick={() => setMatterTab('access')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'access' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    🛡️ الفريق والصلاحيات ({accessList.length})
                  </button>
                  <button
                    onClick={() => setMatterTab('files')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${matterTab === 'files' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  >
                    📂 الملفات
                  </button>
                </div>

                {matterTab === 'overview' && selectedMatterFull && (
                  <ProjectCommandCenter matter={selectedMatterFull} tasks={tasksList} appointments={hearingsList} />
                )}

                {/* Tab: Files */}
                {matterTab === 'files' && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto subtle-scroll">
                    <CaseFileManager caseId={selectedMatter.id} />
                  </div>
                )}

                {/* Tab 1: Chat */}
                {matterTab === 'chat' && (
                  <div className="flex-1 flex flex-col min-h-0">
                    <MatterChat matterId={selectedMatter.id} currentUserId={currentUserId} />
                  </div>
                )}

                {/* Tab 2: Tasks */}
                {matterTab === 'tasks' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    {/* Add Task Form */}
                    <form onSubmit={handleCreateTaskSubmit} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> إضافة مهمة جديدة للمشروع
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="عنوان المهمة *"
                            value={newTaskForm.title}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <select
                          value={newTaskForm.userId}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, userId: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                        >
                          <option value="">المسؤول: أنا (أو اختر مدير مشروع)</option>
                          {teamUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role})
                            </option>
                          ))}
                        </select>
                        <select
                          value={newTaskForm.priority}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                        >
                          <option value="LOW">أولوية منخفضة</option>
                          <option value="MEDIUM">أولوية متوسطة</option>
                          <option value="HIGH">أولوية عالية</option>
                          <option value="URGENT">عاجلة جداً</option>
                        </select>
                        <input
                          type="date"
                          value={newTaskForm.dueDate}
                          onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                        />
                        <button
                          type="submit"
                          className="gold-gradient-bg text-slate-950 font-bold px-4 py-2 rounded-lg text-xs hover:brightness-110"
                        >
                          إضافة المهمة
                        </button>
                      </div>
                    </form>

                    {/* Tasks List */}
                    <div className="space-y-2">
                      {tasksList.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">لا توجد مهام مسجلة لهذه المشروع حالياً.</p>
                      ) : (
                        tasksList.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                              task.isDone
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                  task.isDone ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 hover:border-amber-400'
                                }`}
                              >
                                {task.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${task.isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span>👤 {task.user?.name || 'غير محدد'}</span>
                                  {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                                task.priority === 'URGENT'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {task.priority === 'URGENT' ? 'عاجلة' : task.priority === 'HIGH' ? 'عالية' : 'عادية'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Hearings & Appointments */}
                {matterTab === 'hearings' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    {/* Add Hearing Form */}
                    <form onSubmit={handleCreateHearingSubmit} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> إضافة موعد / موعد جديدة
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={newHearingForm.type}
                          onChange={(e) => setNewHearingForm({ ...newHearingForm, type: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                        >
                          <option value="HEARING">موعد ميدانية</option>
                          <option value="DEADLINE">موعد تسليم تقرير</option>
                          <option value="CLIENT_MEETING">اجتماع عميل</option>
                          <option value="INTERNAL_REVIEW">مراجعة داخلية</option>
                          <option value="OTHER">موعد آخر</option>
                        </select>
                        <input
                          type="datetime-local"
                          required
                          value={newHearingForm.date}
                          onChange={(e) => setNewHearingForm({ ...newHearingForm, date: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                        />
                        <input
                          type="text"
                          placeholder="اسم الموقع أو الجهة / الجهة"
                          value={newHearingForm.court}
                          onChange={(e) => setNewHearingForm({ ...newHearingForm, court: e.target.value })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 sm:col-span-2"
                        />
                        <button
                          type="submit"
                          className="gold-gradient-bg text-slate-950 font-bold px-4 py-2 rounded-lg text-xs hover:brightness-110 sm:col-span-2"
                        >
                          إضافة الموعد
                        </button>
                      </div>
                    </form>

                    {/* Hearings List */}
                    <div className="space-y-2">
                      {hearingsList.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">لا توجد مواعيد أو مواعيد مسجلة لهذه المشروع.</p>
                      ) : (
                        hearingsList.map((h) => (
                          <div key={h.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {h.type === 'HEARING' ? 'موعد' : h.type === 'DEADLINE' ? 'تسليم' : h.type === 'CLIENT_MEETING' ? 'اجتماع' : 'موعد'}
                                </span>
                                <p className="text-xs font-bold text-slate-200">{h.title || h.court}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">📅 {new Date(h.date).toLocaleString('ar-SA')}</p>
                            </div>
                            {new Date(h.date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && new Date(h.date) >= new Date() && (
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse shrink-0">
                                قادم خلال 3 أيام!
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: Timeline */}
                {matterTab === 'timeline' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto subtle-scroll pr-1">
                    <h4 className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-2 shrink-0">الخط الزمني لسجل أحداث المشروع</h4>
                    {timelineEvents.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">لا توجد أحداث مسجلة.</p>
                    ) : (
                      <div className="space-y-3 relative before:absolute before:inset-y-0 before:right-2.5 before:w-px before:bg-slate-800">
                        {timelineEvents.map((ev) => (
                          <div key={ev.id} className="relative pr-7 text-xs">
                            <div className="absolute right-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-slate-900/60" />
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-bold text-amber-400">{ev.title}</span>
                              <span>{new Date(ev.date).toLocaleString('ar-SA')}</span>
                            </div>
                            <p className="text-slate-200 font-semibold">{ev.details}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">بواسطة: {ev.actorName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 5: Generate Document */}
                {matterTab === 'generate_doc' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    <form onSubmit={handleGenerateDocumentSubmit} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                        استخدام قالب مشروع مع معاينة وتعديل قبل الحفظ
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-300 mb-1">اختر قالب المشروع المعياري *</label>
                          <select
                            required
                            value={generateDocForm.templateId}
                            onChange={(e) => {
                              const tId = e.target.value;
                              const selectedT = docTemplates.find(t => t.id === tId);
                              let previewText = selectedT ? selectedT.content : '';

                              if (selectedT && selectedMatter) {
                                const clientName = selectedMatter.client?.name || selectedMatter.externalPartyName || '[يحتاج تعبئة يدوية: اسم العميل]';
                                const beneficiaryName = selectedMatter.beneficiaryAccount?.name || '[يحتاج تعبئة يدوية: الحساب المستفيد]';
                                const caseNumber = selectedMatter.caseNumber || selectedMatter.id.substring(0, 8);
                                const matterTitle = selectedMatter.title;
                                const courtName = selectedMatter.title.includes('موقع أو جهة') ? selectedMatter.title : 'الموقع أو الجهة المختصة';
                                const opponentName = selectedMatter.externalPartyName || '[يحتاج تعبئة يدوية: اسم المورد أو المقاول]';
                                const lawyerName = selectedMatter.lawyer?.name || 'مدير المشروع الوكيل';
                                const companyName = selectedMatter.tenant?.name || 'شركة التطوير العقاري';
                                const today = new Date().toLocaleDateString('ar-SA');
                                const matterStatus = MATTER_STATUS_ARABIC[selectedMatter.status as MatterStatus] || selectedMatter.status;
                                const claimAmount = selectedMatter.amountClaimed || 'القيمة المحددة بملف المشروع';

                                previewText = previewText.replace(/\{\{clientName\}\}/g, clientName);
                                previewText = previewText.replace(/\{\{beneficiaryName\}\}/g, beneficiaryName);
                                previewText = previewText.replace(/\{\{caseNumber\}\}/g, caseNumber);
                                previewText = previewText.replace(/\{\{matterTitle\}\}/g, matterTitle);
                                previewText = previewText.replace(/\{\{courtName\}\}/g, courtName);
                                previewText = previewText.replace(/\{\{opponentName\}\}/g, opponentName);
                                previewText = previewText.replace(/\{\{lawyerName\}\}/g, lawyerName);
                                previewText = previewText.replace(/\{\{companyName\}\}/g, companyName);
                                previewText = previewText.replace(/\{\{today\}\}/g, today);
                                previewText = previewText.replace(/\{\{matterStatus\}\}/g, matterStatus);
                                previewText = previewText.replace(/\{\{claimAmount\}\}/g, claimAmount);

                                previewText = previewText.replace(/\{client_name\}/g, clientName);
                                previewText = previewText.replace(/\{case_number\}/g, caseNumber);
                                previewText = previewText.replace(/\{court_name\}/g, courtName);
                              }

                              setGenerateDocForm({
                                ...generateDocForm,
                                templateId: tId,
                                customTitle: selectedT ? `${selectedT.title} - ${selectedMatter.caseNumber || selectedMatter.title}` : '',
                                editedContent: previewText,
                              } as any);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                          >
                            <option value="">-- اختر قالباً اعتمادياً --</option>
                            {docTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                🏗️ {t.title} ({PRACTICE_AREA_NAMES[t.practiceArea] || t.practiceArea})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الملف الناتج (اختياري)</label>
                          <input
                            type="text"
                            placeholder="توليد تلقائي بحسب اسم القالب والمشروع"
                            value={generateDocForm.customTitle}
                            onChange={(e) => setGenerateDocForm({ ...generateDocForm, customTitle: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>

                      {generateDocForm.templateId && (
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-amber-300">
                              مراجعة وتعديل محتوى المستند التلقائي:
                            </label>
                            <span className="text-[10px] text-slate-400">يمكنك تعديل النص مباشرة قبل الحفظ</span>
                          </div>

                          {(generateDocForm as any).editedContent?.includes('يحتاج تعبئة يدوية') && (
                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>تنبيه: توجد بعض المتغيرات التي تتطلب تعبئة يدوية داخل النص أدناه قبل الحفظ.</span>
                            </div>
                          )}

                          <textarea
                            rows={9}
                            value={(generateDocForm as any).editedContent || ''}
                            onChange={(e) => setGenerateDocForm({ ...generateDocForm, editedContent: e.target.value } as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-amber-500/50 font-sans leading-relaxed"
                          />
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={!generateDocForm.templateId}
                          className="flex-1 gold-gradient-bg text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:brightness-110 disabled:opacity-50 cursor-pointer"
                        >
                          حفظ كمستند رسمي في ملفات المشروع
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab 6: Multiple Case Parties */}
                {matterTab === 'parties' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newPartyForm.name) return;
                        try {
                          const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/parties`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newPartyForm)
                          });
                          if (res.ok) {
                            setNewPartyForm({ name: '', partyType: 'PERSON', role: 'PLAINTIFF', phone: '', email: '', notes: '' });
                            await fetchMatterSubData(selectedMatter.id);
                          } else {
                            const d = await res.json();
                            alert(d.error || 'فشلت إضافة الطرف');
                          }
                        } catch (err) {
                          alert('حدث خطأ بالنظام');
                        }
                      }}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0"
                    >
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" /> إضافة طرف جديد بداخل المشروع
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="اسم الطرف المعني *"
                          value={newPartyForm.name}
                          onChange={(e) => setNewPartyForm({ ...newPartyForm, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                        <select
                          value={newPartyForm.partyType}
                          onChange={(e) => setNewPartyForm({ ...newPartyForm, partyType: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="PERSON">شخص فرد</option>
                          <option value="COMPANY">شركة / منشأة</option>
                          <option value="GOVERNMENT_ENTITY">جهة حكومية</option>
                          <option value="OTHER">أخرى</option>
                        </select>
                        <select
                          value={newPartyForm.role}
                          onChange={(e) => setNewPartyForm({ ...newPartyForm, role: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="CLIENT">عميل متضامن</option>
                          <option value="OPPONENT">مقاول أو مورد رئيسي</option>
                          <option value="PLAINTIFF">مدعي</option>
                          <option value="DEFENDANT">مدعى عليه</option>
                          <option value="WITNESS">شاهد</option>
                          <option value="EXPERT">خبير معتمد</option>
                          <option value="REPRESENTATIVE">ممثل نظامي</option>
                          <option value="THIRD_PARTY">طرف ثالث</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="رقم الهاتف (اختياري)"
                          value={newPartyForm.phone}
                          onChange={(e) => setNewPartyForm({ ...newPartyForm, phone: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                        <input
                          type="email"
                          placeholder="البريد الإلكتروني (اختياري)"
                          value={newPartyForm.email}
                          onChange={(e) => setNewPartyForm({ ...newPartyForm, email: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <button type="submit" className="w-full gold-gradient-bg text-slate-950 font-bold py-2 rounded-xl text-xs hover:brightness-110">
                        حفظ وإضافة الطرف
                      </button>
                    </form>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">أطراف المشروع المسجلون ({partiesList.length}):</h4>
                      {partiesList.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">لا يوجد أطراف مضافة حتى الآن.</p>
                      ) : (
                        partiesList.map((party) => (
                          <div key={party.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-100">{party.name}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  {party.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                النوع: {party.partyType} {party.phone ? `| هاتف: ${party.phone}` : ''} {party.email ? `| بريد: ${party.email}` : ''}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (!confirm('هل أنت متأكد من حذف هذا الطرف؟')) return;
                                const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/parties/${party.id}`, { method: 'DELETE' });
                                if (res.ok) await fetchMatterSubData(selectedMatter.id);
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 7: Hearings Deadlines */}
                {matterTab === 'deadlines' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newDeadlineForm.title || !newDeadlineForm.dueDate) return;
                        try {
                          const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/deadlines`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newDeadlineForm)
                          });
                          if (res.ok) {
                            setNewDeadlineForm({ title: '', deadlineType: 'APPEAL_DEADLINE', dueDate: '', notes: '' });
                            await fetchMatterSubData(selectedMatter.id);
                          } else {
                            const d = await res.json();
                            alert(d.error || 'فشلت إضافة الاستحقاق');
                          }
                        } catch (err) {
                          alert('حدث خطأ بالنظام');
                        }
                      }}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0"
                    >
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> إضافة استحقاق حرج قادم
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="عنوان الاستحقاق *"
                          value={newDeadlineForm.title}
                          onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                        <select
                          value={newDeadlineForm.deadlineType}
                          onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, deadlineType: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="APPEAL_DEADLINE">اعتماد أو قرار المالك</option>
                          <option value="REPLY_DEADLINE">رد جهة أو استشاري</option>
                          <option value="OBJECTION_DEADLINE">إقفال ملاحظة أو عدم مطابقة</option>
                          <option value="SUBMISSION_DEADLINE">تسليم مستند أو مخطط</option>
                          <option value="PAYMENT_DEADLINE">دفعة أو مستخلص مستحق</option>
                        </select>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">تاريخ ووقت الاستحقاق *</label>
                          <input
                            type="datetime-local"
                            required
                            value={newDeadlineForm.dueDate}
                            onChange={(e) => setNewDeadlineForm({ ...newDeadlineForm, dueDate: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full gold-gradient-bg text-slate-950 font-bold py-2 rounded-xl text-xs hover:brightness-110">
                        حفظ الاستحقاق
                      </button>
                    </form>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">سجل الاستحقاقات والتواريخ الحرجة:</h4>
                      {deadlinesList.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">لا توجد استحقاقات حرجة مسجلة.</p>
                      ) : (
                        deadlinesList.map((d) => {
                          const isMissed = d.status === 'MISSED' || (d.status === 'OPEN' && new Date(d.dueDate) < new Date());
                          return (
                            <div key={d.id} className={`p-3 rounded-xl border flex items-center justify-between ${isMissed ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-100">{d.title}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isMissed ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/10 text-sky-300'}`}>
                                    {d.deadlineType}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                    {d.status === 'DONE' ? 'تمت المعالجة' : isMissed ? 'مـتأخرة' : 'قائمة'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">تاريخ الاستحقاق: {new Date(d.dueDate).toLocaleString('ar-SA')}</p>
                              </div>

                              <button
                                onClick={async () => {
                                  const newStatus = d.status === 'DONE' ? 'OPEN' : 'DONE';
                                  const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/deadlines/${d.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: newStatus })
                                  });
                                  if (res.ok) await fetchMatterSubData(selectedMatter.id);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition"
                              >
                                {d.status === 'DONE' ? 'إعادة كـ قائمة' : 'تعليم كـ منجزة'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 8: Fees & Payments Management */}
                {matterTab === 'financials' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">إجمالي الدفعات الاتفاقية:</span>
                        <span className="text-base font-extrabold text-amber-400 mt-1 block">
                          {financialsData?.totalFee || 0} {financialsData?.currency || 'SAR'}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">إجمالي المدفوع حتى الآن:</span>
                        <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                          {financialsData?.totalPaid || 0} {financialsData?.currency || 'SAR'}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">المتبقي المطلوب سداده:</span>
                        <span className="text-base font-extrabold text-rose-400 mt-1 block">
                          {financialsData?.remainingBalance || 0} {financialsData?.currency || 'SAR'}
                        </span>
                      </div>
                    </div>

                    {/* Set Fee Agreement Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/financials`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ totalFee: Number(feeAgreementForm.totalFee), notes: feeAgreementForm.notes })
                          });
                          if (res.ok) {
                            alert('تم حفظ اتفاقية الدفعات بنجاح.');
                            await fetchMatterSubData(selectedMatter.id);
                          } else {
                            const d = await res.json();
                            alert(d.error || 'فشل الحفظ');
                          }
                        } catch (err) {
                          alert('حدث خطأ بالاتصال');
                        }
                      }}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-amber-400">تحديد / تحديث اتفاقية الدفعات الداخلية (SAR)</h4>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="إجمالي مبلغ الدفعات الاتفاقية (SAR) *"
                          value={feeAgreementForm.totalFee}
                          onChange={(e) => setFeeAgreementForm({ ...feeAgreementForm, totalFee: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                        <button type="submit" className="gold-gradient-bg text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:brightness-110">
                          حفظ الدفعات
                        </button>
                      </div>
                    </form>

                    {/* Add Payment Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newPaymentForm.amount) return;
                        try {
                          const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/financials/payments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              amount: Number(newPaymentForm.amount),
                              paymentDate: newPaymentForm.paymentDate || new Date().toISOString(),
                              method: newPaymentForm.method,
                              reference: newPaymentForm.reference,
                              notes: newPaymentForm.notes,
                            })
                          });
                          if (res.ok) {
                            setNewPaymentForm({ amount: '', paymentDate: '', method: 'BANK_TRANSFER', reference: '', notes: '' });
                            await fetchMatterSubData(selectedMatter.id);
                          } else {
                            const d = await res.json();
                            alert(d.error || 'فشلت إضافة الدفعة');
                          }
                        } catch (err) {
                          alert('حدث خطأ');
                        }
                      }}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-emerald-400">إضافة تحويل أو دفعة مالية مقبوضة</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="المبلغ المدفوع (SAR) *"
                          value={newPaymentForm.amount}
                          onChange={(e) => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                        <select
                          value={newPaymentForm.method}
                          onChange={(e) => setNewPaymentForm({ ...newPaymentForm, method: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="BANK_TRANSFER">تحويل بنكي</option>
                          <option value="CASH">نقداً / كاش</option>
                          <option value="CARD">بطاقة / مدى</option>
                          <option value="OTHER">طريقة أخرى</option>
                        </select>
                        <input
                          type="text"
                          placeholder="رقم مرجع التحويل (اختياري)"
                          value={newPaymentForm.reference}
                          onChange={(e) => setNewPaymentForm({ ...newPaymentForm, reference: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <button type="submit" className="w-full bg-emerald-500 hover:brightness-110 text-slate-950 font-bold py-2 rounded-xl text-xs transition">
                        تسجيل الدفعة المالية
                      </button>
                    </form>

                    {/* Payments History List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">سجل الدفعات المقبوضة:</h4>
                      {(!financialsData?.payments || financialsData.payments.length === 0) ? (
                        <p className="text-xs text-slate-500 py-4 text-center">لا توجد دفعات مسجلة بعد.</p>
                      ) : (
                        financialsData.payments.map((p: any) => (
                          <div key={p.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-emerald-400">{p.amount} SAR ({p.method})</p>
                              <p className="text-[11px] text-slate-400">التاريخ: {new Date(p.paymentDate).toLocaleDateString('ar-SA')} {p.reference ? `| مرجع: ${p.reference}` : ''}</p>
                            </div>
                            <span className="text-[10px] text-slate-500">بواسطة: {p.receivedBy?.name || 'مدير'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 9: Team Access Control */}
                {matterTab === 'access' && (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto subtle-scroll pr-1">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newAccessForm.userId) return;
                        try {
                          const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/access`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newAccessForm)
                          });
                          if (res.ok) {
                            setNewAccessForm({ userId: '', accessRole: 'ASSIGNED_LAWYER', canViewFinancials: false, canManageFinancials: false, canEdit: true });
                            await fetchMatterSubData(selectedMatter.id);
                          } else {
                            const d = await res.json();
                            alert(d.error || 'فشل تعيين الصلاحية');
                          }
                        } catch (err) {
                          alert('حدث خطأ');
                        }
                      }}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0"
                    >
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> تعيين عضو ومنحه صلاحيات دقيقة بداخل المشروع
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          required
                          value={newAccessForm.userId}
                          onChange={(e) => setNewAccessForm({ ...newAccessForm, userId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="">-- اختر مدير المشروع / المستخدم --</option>
                          {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <select
                          value={newAccessForm.accessRole}
                          onChange={(e) => setNewAccessForm({ ...newAccessForm, accessRole: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="ASSIGNED_LAWYER">مدير مشروع مكلّف</option>
                          <option value="ASSISTANT">مساعد ميداني</option>
                          <option value="REVIEWER">مراجع فني</option>
                          <option value="VIEWER">مشاهدة فقط</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAccessForm.canViewFinancials}
                            onChange={(e) => setNewAccessForm({ ...newAccessForm, canViewFinancials: e.target.checked })}
                          />
                          <span>عرض الدفعات والمدفوعات</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAccessForm.canManageFinancials}
                            onChange={(e) => setNewAccessForm({ ...newAccessForm, canManageFinancials: e.target.checked })}
                          />
                          <span>إدارة واستلام المدفوعات</span>
                        </label>
                      </div>

                      <button type="submit" className="w-full gold-gradient-bg text-slate-950 font-bold py-2 rounded-xl text-xs hover:brightness-110">
                        تعيين وتأكيد الصلاحية
                      </button>
                    </form>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">فريق العمل وأعضاء المشروع ({accessList.length}):</h4>
                      {accessList.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">لم يتم تعيين صلاحيات مخصصة بشكل منفصل بعد.</p>
                      ) : (
                        accessList.map((acc) => (
                          <div key={acc.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100">{acc.user?.name}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300">
                                  {acc.accessRole}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                رؤية المالية: {acc.canViewFinancials ? 'نعم' : 'لا'} | إدارة المالية: {acc.canManageFinancials ? 'نعم' : 'لا'}
                              </p>
                            </div>
                            {isManager && (
                              <button
                                onClick={async () => {
                                  if (!confirm('إلغاء صلاحية هذا المستخدم وإزالته من فريق المشروع؟')) return;
                                  const res = await fetch(`/api/lawyer/matters/${selectedMatter.id}/access/${acc.id}`, { method: 'DELETE' });
                                  if (res.ok) await fetchMatterSubData(selectedMatter.id);
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Import Matter from Document Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card relative z-10 w-full max-w-3xl rounded-3xl border border-amber-500/20 p-6 md:p-8 shadow-2xl bg-slate-900 my-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="gold-gradient-bg p-2.5 rounded-2xl text-slate-950">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">إنشاء مشروع من مستند (ذكاء ذكي مع مراجعة بشرية)</h2>
                  <p className="text-xs text-slate-400">استخراج الحقول تلقائياً ومراجعتها وتعديلها قبل الإنشاء</p>
                </div>
              </div>
              <button onClick={handleRejectImport} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStep === 'upload' && (
              <form onSubmit={handleImportExtract} className="space-y-6">
                <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 text-center bg-slate-950/50 transition">
                  <FileText className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-bold text-slate-200 mb-1">انقر لاختيار مستند أو اسحبه هنا</p>
                  <p className="text-xs text-slate-400 mb-4">أنواع الملفات المسموحة: PDF, PNG, JPG, JPEG (حد أقصى 15 ميجابايت)</p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                  />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> تنبيه أمان وخصوصية:
                  </p>
                  <p>يتم تحليل المستند محلياً بدون إرساله إلى أي خدمات خارجية. يمكنك مراجعة وتعديل كافة البيانات قبل الموافقة على إنشاء المشروع.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowImportModal(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800">
                    إلغاء
                  </button>
                  <button type="submit" disabled={!importFile || isImporting} className="gold-gradient-bg text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:brightness-110 disabled:opacity-50">
                    <span>تحليل واستخراج البيانات</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {importStep === 'analyzing' && (
              <div className="py-16 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
                <h3 className="text-base font-bold text-slate-200">جاري تحليل المستند واستخراج البيانات...</h3>
                <p className="text-xs text-slate-400">جاري التعرف على الموقع أو الجهة، رقم المشروع، التواريخ والأطراف محلياً.</p>
              </div>
            )}

            {importStep === 'review' && (
              <div className="space-y-6">
                {importDuplicateWarning && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-200">تنبيه تكرار محتمل:</p>
                      <p>{importDuplicateWarning}</p>
                    </div>
                  </div>
                )}

                {importNotice && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{importNotice}</span>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-4 max-h-[60vh] overflow-y-auto subtle-scroll">
                  <h3 className="text-sm font-extrabold text-amber-400 border-b border-slate-800 pb-2">مراجعة وتعديل بيانات المشروع المستخرجة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">عنوان / موضوع المشروع *</label>
                      <input
                        type="text"
                        required
                        value={importFormData.title}
                        onChange={(e) => setImportFormData({ ...importFormData, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">رقم المشروع</label>
                        {importConfidence.caseNumber === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {importConfidence.caseNumber === 'MEDIUM' && <span className="text-[10px] text-amber-400 font-bold">🟡 ثقة متوسطة</span>}
                        {(importConfidence.caseNumber === 'LOW' || importConfidence.caseNumber === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود، أدخله يدويًا</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.caseNumber}
                        onChange={(e) => setImportFormData({ ...importFormData, caseNumber: e.target.value })}
                        placeholder="مثال: 1445/1234"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">اسم الموقع أو الجهة</label>
                        {importConfidence.courtName === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {importConfidence.courtName === 'MEDIUM' && <span className="text-[10px] text-amber-400 font-bold">🟡 ثقة متوسطة</span>}
                        {(importConfidence.courtName === 'LOW' || importConfidence.courtName === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود، أدخله يدويًا</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.courtName}
                        onChange={(e) => setImportFormData({ ...importFormData, courtName: e.target.value })}
                        placeholder="مثال: الموقع أو الجهة العامة بالرياض"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">نوع المشروع</label>
                        {importConfidence.caseType === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {(importConfidence.caseType === 'LOW' || importConfidence.caseType === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود، أدخله يدويًا</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.caseType}
                        onChange={(e) => setImportFormData({ ...importFormData, caseType: e.target.value })}
                        placeholder="سكني، تجاري، متعدد الاستخدام..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">العميل المرتبط (اختياري)</label>
                      <select
                        value={importFormData.clientId}
                        onChange={(e) => setImportFormData({ ...importFormData, clientId: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      >
                        <option value="">-- اختر عميلاً مسجلاً --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">المدعي (الطرف الأول)</label>
                        {importConfidence.plaintiff === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {(importConfidence.plaintiff === 'LOW' || importConfidence.plaintiff === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.plaintiff}
                        onChange={(e) => setImportFormData({ ...importFormData, plaintiff: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">المدعى عليه (الطرف الثاني)</label>
                        {importConfidence.defendant === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {(importConfidence.defendant === 'LOW' || importConfidence.defendant === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.defendant}
                        onChange={(e) => setImportFormData({ ...importFormData, defendant: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">تاريخ المستند</label>
                        {importConfidence.docDate === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {importConfidence.docDate === 'MEDIUM' && <span className="text-[10px] text-amber-400 font-bold">🟡 ثقة متوسطة</span>}
                        {(importConfidence.docDate === 'LOW' || importConfidence.docDate === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.docDate}
                        onChange={(e) => setImportFormData({ ...importFormData, docDate: e.target.value })}
                        placeholder="1445/05/20"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">تاريخ الموعد القادمة</label>
                        {importConfidence.nextHearingDate === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {importConfidence.nextHearingDate === 'MEDIUM' && <span className="text-[10px] text-amber-400 font-bold">🟡 ثقة متوسطة</span>}
                        {(importConfidence.nextHearingDate === 'LOW' || importConfidence.nextHearingDate === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.nextHearingDate}
                        onChange={(e) => setImportFormData({ ...importFormData, nextHearingDate: e.target.value })}
                        placeholder="1445/06/15"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">رقم الدائرة</label>
                        {importConfidence.circuitNumber === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {(importConfidence.circuitNumber === 'LOW' || importConfidence.circuitNumber === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.circuitNumber}
                        onChange={(e) => setImportFormData({ ...importFormData, circuitNumber: e.target.value })}
                        placeholder="مثال: الدائرة الثالثة"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">قيمة المشروع أو المبلغ</label>
                        {importConfidence.amountClaimed === 'HIGH' && <span className="text-[10px] text-emerald-400 font-bold">🟢 ثقة عالية</span>}
                        {(importConfidence.amountClaimed === 'LOW' || importConfidence.amountClaimed === 'NULL') && <span className="text-[10px] text-rose-400 font-bold">🔴 غير موجود</span>}
                      </div>
                      <input
                        type="text"
                        value={importFormData.amountClaimed}
                        onChange={(e) => setImportFormData({ ...importFormData, amountClaimed: e.target.value })}
                        placeholder="مثال: 150,000 ريال"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">ملخص المستند المستخرج</label>
                      <textarea
                        rows={3}
                        value={importFormData.summary}
                        onChange={(e) => setImportFormData({ ...importFormData, summary: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleRejectImport}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض المسودة وإلغاء</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isConfirmingImport || !importFormData.title}
                    className="gold-gradient-bg text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:brightness-110 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                  >
                    {isConfirmingImport ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>تأكيد وإنشاء المشروع</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
