import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider'; // NEW: Import QueryProvider
export const metadata: Metadata = {
   title: 'SpeakToScrape',
   description: 'Autonomous web scraping agent with natural language interface',
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" suppressHydrationWarning>
         <body>
            <QueryProvider> {/* NEW: Wrap with QueryProvider */}
               <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
               >
                  {children}
                  <Toaster
                     position="top-right"
                     toastOptions={{
                        duration: 4000,
                     }}
                  />
               </ThemeProvider>
            </QueryProvider> {/* NEW: Close QueryProvider */}
         </body>
      </html>
   );
}
