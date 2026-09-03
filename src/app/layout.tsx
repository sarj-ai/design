import type { Metadata } from "next"
import { Nunito, Geist_Mono } from "next/font/google"
import { Agentation } from "agentation"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const nunito = Nunito({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-nunito",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Design lab",
  description: "Design mockups built from the Sarj design system.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="light" dir="ltr" />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
