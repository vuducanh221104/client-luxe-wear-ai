"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const nav = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/agents", label: "Manage Agents" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <aside className="hidden md:block w-60 shrink-0 border-r bg-background">
      <div className="p-4 text-sm font-semibold">Admin</div>
      <nav className="p-2 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted ${
              pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
