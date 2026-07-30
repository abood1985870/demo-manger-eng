export const MODULE_PERMISSION_KEYS = [
  'dashboard',
  'projects',
  'timeline',
  'billing',
  'clients',
  'compliance',
  'contracts',
  'documents',
  'team',
  'reports',
  'settings',
] as const;

export type ModulePermissionKey = typeof MODULE_PERMISSION_KEYS[number];
export type ModulePermissions = Record<ModulePermissionKey, boolean>;

export const MODULE_PERMISSION_OPTIONS: ReadonlyArray<{
  key: ModulePermissionKey;
  label: string;
  description: string;
  path: string;
}> = [
  { key: 'dashboard', label: 'النظرة التنفيذية', description: 'لوحة المؤشرات والملخص التنفيذي', path: '/dashboard' },
  { key: 'projects', label: 'المشاريع', description: 'المشاريع وتفاصيلها ومحادثاتها', path: '/matters' },
  { key: 'timeline', label: 'الجدول الزمني', description: 'المهام والمواعيد ومراحل التنفيذ', path: '/litigation' },
  { key: 'billing', label: 'التكاليف والفواتير', description: 'الفواتير والبيانات المالية للمشاريع', path: '/billing' },
  { key: 'clients', label: 'المبيعات والتحصيل', description: 'العملاء والمستثمرون والتحصيل', path: '/clients' },
  { key: 'compliance', label: 'التراخيص والامتثال', description: 'الرخص والاشتراطات وحالات الامتثال', path: '/compliance' },
  { key: 'contracts', label: 'العقود', description: 'عقود المشاريع وحالات الاعتماد', path: '/contracts' },
  { key: 'documents', label: 'المستندات والقوالب', description: 'مكتبة المستندات والمسودات والقوالب', path: '/templates' },
  { key: 'team', label: 'الفريق والصلاحيات', description: 'إدارة المستخدمين وصلاحياتهم', path: '/users' },
  { key: 'reports', label: 'التقارير', description: 'تقارير الأداء والمحفظة', path: '/dashboard#reports' },
  { key: 'settings', label: 'الإعدادات', description: 'إعدادات الحساب ومساحة العمل', path: '/settings' },
];

export const DEFAULT_TEAM_MEMBER_PERMISSIONS: ModulePermissions = {
  dashboard: true,
  projects: true,
  timeline: true,
  billing: true,
  clients: true,
  compliance: true,
  contracts: true,
  documents: true,
  team: true,
  reports: true,
  settings: true,
};

export const ALL_MODULE_PERMISSIONS: ModulePermissions = Object.fromEntries(
  MODULE_PERMISSION_KEYS.map((key) => [key, true]),
) as ModulePermissions;

export function isWorkspaceManager(role?: string | null) {
  return ['admin', 'owner', 'superadmin', 'super_admin'].includes((role || '').toLowerCase());
}

export function parseModulePermissions(value?: string | null, role?: string | null): ModulePermissions {
  if (isWorkspaceManager(role)) return { ...ALL_MODULE_PERMISSIONS };
  let parsed: Partial<ModulePermissions> = {};
  try {
    parsed = value ? JSON.parse(value) : {};
  } catch {
    parsed = {};
  }
  return Object.fromEntries(
    MODULE_PERMISSION_KEYS.map((key) => [
      key,
      typeof parsed[key] === 'boolean' ? parsed[key] : DEFAULT_TEAM_MEMBER_PERMISSIONS[key],
    ]),
  ) as ModulePermissions;
}

export function hasModulePermission(
  role: string | null | undefined,
  storedPermissions: string | null | undefined,
  permission: ModulePermissionKey,
) {
  return parseModulePermissions(storedPermissions, role)[permission];
}

export function moduleForPathname(pathname: string): ModulePermissionKey | null {
  if (pathname.startsWith('/matters') || pathname.startsWith('/my-cases')) return 'projects';
  if (pathname.startsWith('/litigation')) return 'timeline';
  if (pathname.startsWith('/billing')) return 'billing';
  if (pathname.startsWith('/clients')) return 'clients';
  if (pathname.startsWith('/compliance')) return 'compliance';
  if (pathname.startsWith('/contracts')) return 'contracts';
  if (pathname.startsWith('/templates') || pathname.startsWith('/knowledge')) return 'documents';
  if (pathname.startsWith('/users')) return 'team';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  return null;
}

export function firstAllowedPath(permissions: ModulePermissions) {
  return MODULE_PERMISSION_OPTIONS.find((option) => permissions[option.key] && option.key !== 'reports')?.path || '/login';
}
