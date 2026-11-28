import type { Metadata } from "next"
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"

import { Providers } from "./providers"
import "./globals.css"

// Plus Jakarta Sans: huruf geometris yang hangat (dirancang di Indonesia),
// tetap terbaca di ukuran tabel yang kecil.
const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin Chatbot",
    template: "%s | Dashboard Admin Chatbot",
  },
  description:
    "Kelola dokumen sumber, pertanyaan tak terjawab, dan layanan chatbot administrasi mahasiswa.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fontSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
