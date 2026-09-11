import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: "ecommerce-admin",
  description: "Admin dashboard backed by DynamoDB via LocalStack/AWS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <ToastProvider>
          <div className="flex min-h-screen flex-col sm:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
