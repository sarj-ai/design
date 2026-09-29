import type { Metadata } from "next"
import { Nunito, Geist_Mono } from "next/font/google"
import { Agentation } from "agentation"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PageTransition } from "@/components/shell/page-transition"
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
        <TooltipProvider>
          <PageTransition>{children}</PageTransition>
        </TooltipProvider>
        <Toaster
          dir="ltr"
          theme="light"
          /* Sonner centres the icon on the whole toast, so under a
             description it floats between the two lines. Pinned to the
             title's line instead. Replaces the primitive's toastOptions
             outright, so its own class is carried over. */
          toastOptions={{
            classNames: { toast: "cn-toast", icon: "mt-0.5 self-start" },
          }}
        />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
