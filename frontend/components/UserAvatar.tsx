'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UserAvatarProps {
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
  } | null;
  className?: string;
  fallbackColor?: string;
}

export function UserAvatar({ user, className, fallbackColor = 'bg-amber-500/10 text-amber-500' }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackCharacter = user?.name ? user.name.charAt(0).toUpperCase() : null;
  const showFallback = !user?.avatarUrl || imgError;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full shrink-0',
        showFallback ? fallbackColor : 'bg-slate-900',
        className || 'w-10 h-10' // Default size
      )}
      title={user?.name || 'مستخدم'}
    >
      {showFallback ? (
        fallbackCharacter ? (
          <span className="font-bold select-none text-current" style={{ fontSize: '0.45em' }}>
            {fallbackCharacter}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-current" />
        )
      ) : (
        <Image
          src={`/api/users/${user?.id}/avatar?t=${user?.avatarUrl?.substring(user.avatarUrl.length - 8) || Date.now()}`}
          alt={user?.name || 'صورة شخصية'}
          width={96}
          height={96}
          unoptimized
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
