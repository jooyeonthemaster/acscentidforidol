import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from './contexts/TranslationContext';
import GlobalLanguageSelector from '@/components/GlobalLanguageSelector';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "퍼스널 센트 | Personal Scent",
  description: "당신의 개성과 취향을 AI가 분석하여 완벽한 향수를 추천해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TranslationProvider>
          {/* 전역 언어 선택기 */}
          <GlobalLanguageSelector />
          
          {/* 메인 콘텐츠 */}
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}