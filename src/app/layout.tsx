import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

// Using system fonts for now due to network restrictions in build environment
// Inter can be re-enabled when deploying with network access

export const metadata: Metadata = {
  title: "PAM - Personal Asset Manager",
  description: "Ensuring Liquidity Always - Your financial lifeguard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
