"use client";
import Link from "next/link";
import { ChevronDown, BookOpen, FileCode, RefreshCcw, BookMarked } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showBridge, setShowBridge] = useState(false);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto h-14 flex items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logoGobal.png" alt="Logo" className="h-11 w-auto" />
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-16 text-base font-semibold">
          <Link href="/pricing" className="hover:text-foreground/80">Pricing</Link>
          <Link href="#" className="hover:text-foreground/80">Enterprise</Link>
          <div
            className="relative"
            onMouseEnter={() => {
              setOpen(true);
              setShowBridge(true);
            }}
            onMouseLeave={() => {
              setOpen(false);
              setShowBridge(false);
            }}
          >
            <button
              onMouseEnter={() => {
                setOpen(true);
                setShowBridge(true);
              }}
              onClick={() => {
                setOpen((v) => !v);
                setShowBridge(true);
              }}
              className="inline-flex items-center gap-1 hover:text-foreground/80"
            >
              Resources <ChevronDown className="h-4 w-4" />
            </button>
            {/* Hover bridge area only when hovering trigger */}
            {showBridge && (
              <div
                className="absolute left-0 top-full w-[560px] max-w-[90vw] h-3"
                onMouseEnter={() => setOpen(true)}
              />
            )}

            {open && (
              <div className="absolute left-0 top-full mt-3 w-[560px] max-w-[90vw] rounded-2xl border bg-background shadow-2xl">
                <div className="p-6">
                  <div className="text-2xl font-bold">Resources</div>
                  <div className="mt-4 space-y-5">
                    <Link href="/docs/user-guides" className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted" onClick={() => setOpen(false)}>
                      <div className="h-12 w-12 rounded-xl border inline-flex items-center justify-center"><BookOpen className="h-5 w-5" /></div>
                      <div>
                        <div className="text-lg font-semibold">Guide</div>
                        <p className="text-sm text-muted-foreground">Find out everything on how to use chatbase, and unlock its full potential.</p>
                      </div>
                    </Link>
                    <Link href="#" className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted" onClick={() => setOpen(false)}>
                      <div className="h-12 w-12 rounded-xl border inline-flex items-center justify-center"><BookMarked className="h-5 w-5" /></div>
                      <div>
                        <div className="text-lg font-semibold">Blog</div>
                        <p className="text-sm text-muted-foreground">Learn more about chatbase by reading our latest articles.</p>
                      </div>
                    </Link>
                    <Link href="/docs/user-guides" className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted" onClick={() => setOpen(false)}>
                      <div className="h-12 w-12 rounded-xl border inline-flex items-center justify-center"><FileCode className="h-5 w-5" /></div>
                      <div>
                        <div className="text-lg font-semibold">Docs</div>
                        <p className="text-sm text-muted-foreground">Explore our API and learn how to integrate chatbase with your app.</p>
                      </div>
                    </Link>
                    <Link href="#" className="flex items-start gap-4 p-2 rounded-xl hover:bg-muted" onClick={() => setOpen(false)}>
                      <div className="h-12 w-12 rounded-xl border inline-flex items-center justify-center"><RefreshCcw className="h-5 w-5" /></div>
                      <div>
                        <div className="text-lg font-semibold">Changelog</div>
                        <p className="text-sm text-muted-foreground">Stay up to date with the latest updates and features.</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Login + Dashboard */}
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-base font-semibold hover:text-foreground/80">Login</Link>
          <Link href="/dashboard" className="text-base font-semibold hover:text-foreground/80">Dashboard</Link>
        </div>
      </div>
    </header>
  );
}
