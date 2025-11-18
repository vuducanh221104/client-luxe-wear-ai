"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout as logoutAction } from "@/store/authSlice";
import { logout as apiLogout, clearTokens } from "@/services/authUserService";
import UserAvatar from "@/components/user-avatar";
import { Bot, BarChart2, UserRoundCog, SlidersHorizontal, Shield, Book, MessageSquare, ArrowLeft } from "lucide-react";
import { Code2 } from "lucide-react";
import TenantSwitcher from "@/components/tenant/TenantSwitcher";

type NavItem = { href: string; label: string; icon?: React.ElementType };

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const currentTenant = useAppSelector((s) => s.tenant.currentTenant);

  // Detect agent context from path or query
  const agentMatch = pathname?.match(/^\/dashboard\/agents\/([^/]+)$/);
  const agentIdFromPath = agentMatch?.[1] || null;
  const agentIdFromQuery = searchParams?.get("agentId") || null;
  const currentAgentId = agentIdFromPath || agentIdFromQuery;
  const currentTab = searchParams?.get("tab") || "config";

  const defaultNav: NavItem[] = [
    { href: "/dashboard", label: "Agents", icon: Bot },
    { href: "/dashboard/usage", label: "Usage", icon: BarChart2 },
    { href: "/dashboard/user", label: "Account Settings", icon: UserRoundCog },
    { href: "/dashboard/workspaceSetting/general", label: "Workspace Settings", icon: SlidersHorizontal },

  ];

  const agentNav: NavItem[] = currentAgentId
    ? [
        { href: `/dashboard/agents/${currentAgentId}?tab=config`, label: "Config", icon: SlidersHorizontal },
        { href: `/dashboard/agents/${currentAgentId}?tab=api`, label: "API & Security", icon: Shield },
        { href: `/dashboard/agents/${currentAgentId}?tab=embed`, label: "Embed Widget", icon: Code2 },
        { href: `/dashboard/knowledge?agentId=${currentAgentId}`, label: "Knowledge", icon: Book },
        { href: `/dashboard/analytics?agentId=${currentAgentId}`, label: "Analytics", icon: BarChart2 },
        { href: `/dashboard/chat?agentId=${currentAgentId}`, label: "Chat", icon: MessageSquare },
        { href: "/dashboard", label: "Back to Agents", icon: ArrowLeft },
      ]
    : [];

  const nav = currentAgentId ? agentNav : defaultNav;

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
            <TenantSwitcher />
            <Link href="/docs/user-guides" className="hover:text-foreground/80">Docs</Link>
            <Link href="/dashboard/pages/settings" className="hover:text-foreground/80">Settings</Link>
            <div className="relative" ref={menuRef}>
              <button
                className="overflow-hidden rounded-full"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                <UserAvatar image={user?.avatar_url || undefined} fallback={(user?.name || user?.email || "U").slice(0,2).toUpperCase()} className="h-7 w-7" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-background shadow-xl">
                  <div className="p-4">
                    <div className="text-base font-semibold">{user?.name || "User"}</div>
                    <div className="text-sm text-muted-foreground">{user?.email || ""}</div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="p-2">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>

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
              const basePath = item.href.split("?")[0];
              const hrefUrl = new URL(item.href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
              const hrefTab = hrefUrl.searchParams.get("tab");
              const hrefAgentId = hrefUrl.searchParams.get("agentId");

              let isActive = false;
              if (hrefTab) {
                // inside agent details tabs
                isActive = pathname === `/dashboard/agents/${currentAgentId}` && currentTab === hrefTab;
              } else if (hrefAgentId) {
                // standalone pages with agentId in query
                isActive = pathname === basePath && currentAgentId === hrefAgentId;
              } else {
                // normal pages
                isActive = pathname === basePath;
              }

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted focus:bg-muted focus:text-foreground ${
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main key={currentTenant || 'no-tenant'} className="flex-1 px-4 py-6 transition-opacity duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
