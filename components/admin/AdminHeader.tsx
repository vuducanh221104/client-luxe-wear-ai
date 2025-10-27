"use client";

import Link from "next/link";
import { ChevronDown, Grid, Sun, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { logout as logoutAction } from "@/store/authSlice";
import { clearTokens, logout as apiLogout } from "@/services/authUserService";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSignOut = async () => {
    await apiLogout();
    dispatch(logoutAction());
    clearTokens();
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Brand + nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logoGobal.png" alt="Brand" className="h-8 w-35 rounded-lg" />
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"><Grid className="h-4 w-4" /></button>
            <Link href="#" className="font-semibold">Overview</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Customers</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Products</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Settings</Link>
          </div>
        </div>

        {/* Right: Search + actions */}
        <div className="flex items-center gap-3" ref={menuRef}>
          <div className="hidden md:flex items-center gap-2 rounded-xl border bg-background px-3 h-9 text-sm">
            <span className="text-muted-foreground">Search</span>
            <span className="ml-2 rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘ K</span>
          </div>
          <button className="h-9 w-9 rounded-lg border inline-flex items-center justify-center" aria-label="Theme">
            <Sun className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-lg border inline-flex items-center justify-center" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 rounded-full bg-muted inline-flex items-center justify-center text-xs font-semibold"
            aria-label="User menu"
          >
            SN
          </button>
          {open && (
            <div className="absolute right-4 top-12 w-80 rounded-2xl border bg-background shadow-xl">
              <div className="p-4">
                <div className="text-base font-semibold">satnaing</div>
                <div className="text-sm text-muted-foreground">satnaingdev@gmail.com</div>
              </div>
              <div className="h-px bg-border" />
              <div className="p-2 text-sm">
                <a className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted" href="#">
                  <span>Profile</span>
                  <span className="text-muted-foreground">⇧⌘P</span>
                </a>
                <a className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted" href="#">
                  <span>Billing</span>
                  <span className="text-muted-foreground">⌘B</span>
                </a>
                <a className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted" href="#">
                  <span>Settings</span>
                  <span className="text-muted-foreground">⌘S</span>
                </a>
                <a className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted" href="#">
                  <span>New Team</span>
                </a>
                <div className="h-px bg-border my-1" />
                <button onClick={handleSignOut} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">
                  <span>Sign out</span>
                  <span>⇧⌘Q</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
