import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'Mudiraj Community Membership & Organization Management System | Andhra Pradesh',
  description:
    'Official Portal for Mudiraj Community Membership Registration, State/District/Constitution/Mandal Organization Hierarchy, and Main, Youth & Mahila Leadership Teams in Andhra Pradesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
