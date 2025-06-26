import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import UserProfile from "@/components/Auth/UserProfile"; // <-- 1. Importa il componente

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ho migliorato un po' i metadati per l'app
export const metadata: Metadata = {
  title: "Subscription Tracker",
  description: "Manage all your subscriptions in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        <UserProvider>
          {/* 2. Aggiungi una struttura visiva con header e main */}
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b">
              <div className="container mx-auto h-16 flex items-center justify-between px-4">
                {/* Titolo dell'app cliccabile */}
                <a href="/dashboard" className="text-xl font-bold tracking-tight">
                  Subscription Tracker
                </a>
                
                {/* Componente del profilo utente */}
                <UserProfile />
              </div>
            </header>

            {/* Il contenuto della pagina (es. la dashboard) verrà inserito qui */}
            <main className="flex-grow container mx-auto p-4 md:p-6">
              {children}
            </main>

            <footer className="py-4 text-center text-sm text-gray-500 border-t">
              <div className="container mx-auto px-4">
                © {new Date().getFullYear()} Subscription Tracker. All Rights Reserved.
              </div>
            </footer>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
