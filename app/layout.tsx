import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "21 Days Membership Spin Reward System",
  description: "Membership, spin, reward control and admin payout frontend for SpinGold."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
