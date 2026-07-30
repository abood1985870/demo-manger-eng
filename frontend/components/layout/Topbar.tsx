'use client';

import { Bell, Check, Globe2, Mail, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/UserAvatar';

type NotificationItem = {
  id: string;
  isRead: boolean;
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;
};

export function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/lawyer/notifications');
      if (response.ok) setNotifications(await response.json());
    } catch {
      // Notifications are helpful but must not block the main workspace.
    }
  }

  useEffect(() => {
    void fetchNotifications();
    const interval = window.setInterval(() => void fetchNotifications(), 30_000);
    fetch('/api/auth/profile')
      .then((response) => response.json())
      .then((profile) => { if (!profile.error) setCurrentUser(profile); })
      .catch(() => undefined);
    return () => window.clearInterval(interval);
  }, []);

  async function markAsRead(id?: string) {
    await fetch('/api/lawyer/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id } : {}),
    });
    await fetchNotifications();
  }

  function openNotification(notification: NotificationItem) {
    if (!notification.isRead) void markAsRead(notification.id);
    if (notification.link) router.push(notification.link);
    setShowNotifications(false);
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <header className="rusukh-topbar">
      <div className="rusukh-search">
        <Search />
        <input
          type="search"
          aria-label="البحث في النظام"
          placeholder="ابحث في المشاريع، العقود، المستندات…"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.currentTarget.value.trim()) {
              router.push(`/search?q=${encodeURIComponent(event.currentTarget.value.trim())}`);
            }
          }}
        />
      </div>

      <div className="rusukh-top-actions">
        <button type="button" aria-label="اللغة"><Globe2 /></button>
        <button type="button" aria-label="الرسائل"><Mail /></button>
        <div className="relative">
          <button
            type="button"
            aria-label={`التنبيهات${unreadCount ? `، ${unreadCount} غير مقروءة` : ''}`}
            onClick={() => setShowNotifications((value) => !value)}
          >
            <Bell />
            {unreadCount > 0 ? <i /> : null}
          </button>
          {showNotifications ? (
            <div className="rusukh-notifications">
              <div>
                <h2>التنبيهات</h2>
                {unreadCount ? (
                  <button type="button" onClick={() => void markAsRead()}>
                    <Check /> تعليم الكل كمقروء
                  </button>
                ) : null}
              </div>
              {notifications.length === 0 ? (
                <p>لا توجد إشعارات جديدة.</p>
              ) : notifications.slice(0, 8).map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                  className={notification.isRead ? '' : 'unread'}
                >
                  <b>{notification.title}</b>
                  <span>{notification.message}</span>
                  <small>{new Date(notification.createdAt).toLocaleString('ar-SA')}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="rusukh-top-profile">
          <UserAvatar user={currentUser} />
          <span><b>{String(currentUser?.name || 'فريق الأفق')}</b><small>مساحة العمل</small></span>
        </div>
      </div>
    </header>
  );
}
