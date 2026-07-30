import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: {
    default: 'رُسوخ | قيادة التطوير العقاري',
    template: '%s | رُسوخ',
  },
  description: 'منصة عربية لإدارة محفظة مشاريع التطوير العقاري والتكاليف والمبيعات والامتثال في المملكة العربية السعودية.',
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-cairo antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
