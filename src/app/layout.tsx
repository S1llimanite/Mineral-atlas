import type { ReactNode } from 'react';
import './globals.css';
import { TopNav } from '@/components/TopNav';
import { Sidebar } from '@/components/Sidebar';
import { StoreHydrator } from '@/components/StoreHydrator';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: '薄片矿物数字图鉴 | Petrographic Mineral Atlas',
  description:
    '数字薄片鉴定工作台 —— 矿物晶体学数据库、三维晶体可视化与偏光显微镜鉴定辅助平台',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="min-h-screen bg-void text-ink antialiased" style={{ paddingTop: 64 }}>
        <ThemeProvider>
          <StoreHydrator />
          <TopNav />
          <div className="flex">
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            <main className="flex-1 min-w-0 px-5 sm:px-7 lg:px-10 py-8 page-enter">
              {children}
            </main>
          </div>
          <footer className="border-t border-hair py-6 mt-12 text-center text-[11px] text-ink-faint">
            Petrographic Mineral Atlas · Mineral Gallery Light v0.5 · 资料来源已审核且可追溯
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}