import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KTX Carpooling – Đi học cùng tuyến đường, tiết kiệm hơn",
  description:
    "Nền tảng ghép xe máy dành riêng cho sinh viên ký túc xá Khu A & Khu B ĐHQG-HCM. Kết nối sinh viên cùng tuyến đường đến HCMUS, HCMUT, UIT, USSH, IU, UEL.",
  keywords: ["KTX Carpooling", "ghép xe máy sinh viên", "KTX ĐHQG-HCM", "carpooling"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
