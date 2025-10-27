"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { logout as logoutAction } from "@/store/authSlice";
import { logout as apiLogout, clearTokens } from "@/services/authUserService";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const nav = [
    { href: "/dashboard", label: "Agents" },
    { href: "/dashboard/usage", label: "Usage" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="mx-auto flex h-12 items-center justify-between px-4">
          {/* Left: Logo + workspace name placeholder */}
          <div className="flex items-center gap-3">
            <img src="/logoGobal.png" alt="LuxeWear" className="h-6 w-auto" />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">LuxeWear</span>
              <span>/</span>
              <span>Dashboard</span>
            </div>
          </div>

          {/* Right: quick links */}
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="#" className="hover:text-foreground/80">Changelog</Link>
            <Link href="/docs/user-guides" className="hover:text-foreground/80">Docs</Link>
            <Link href="#" className="hover:text-foreground/80">Help</Link>
            <div className="relative" ref={menuRef}>
              <button
                className="h-7 w-7 rounded-full bg-muted overflow-hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open profile menu"
              />
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-background shadow-xl">
                  <div className="p-4">
                    <div className="text-base font-semibold">0140_Vũ Đức Anh</div>
                    <div className="text-sm text-muted-foreground">vng15960@gmail.com</div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="p-2">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>
                    <Link href="/dashboard/user" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Account settings</Link>

                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={async () => {
                        await apiLogout();
                        dispatch(logoutAction());
                        clearTokens();
                        setMenuOpen(false);
                        router.push("/auth/login");
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Body with Sidebar */}
      <div className="mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 border-r bg-background/50">
          <nav className="p-4 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted ${
                    active ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
