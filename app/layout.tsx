import type { ReactNode } from "react";

export const metadata = {
  title: "ecommerce-admin",
  description: "Local admin dashboard backed by DynamoDB via LocalStack/AWS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f6f7f9" }}>
        {children}
      </body>
    </html>
  );
}
