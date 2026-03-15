"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/tasks": "Tasks",
};

export default function Header() {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/lead/") ? "Lead Detail" : "SalesCRM");

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
