import { SettingsView } from '@/components/SettingsView';

export const metadata = {
  title: 'إعدادات النظام | Super Admin',
};

export default function SuperAdminSettingsPage() {
  return <SettingsView isSuperAdmin={true} />;
}
