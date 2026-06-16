"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream text-deepbrown">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-deepbrown text-cream p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl text-cream">Admin Portal</h1>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-cream/70 mt-2">anah by Sindhura Reddy</p>
          </div>
          <nav className="flex md:flex-col gap-3 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-4 py-3 font-sans text-sm transition-colors ${
                    active ? "bg-cream text-deepbrown" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/" target="_blank" className="btn-outline text-center border-cream text-cream hover:bg-cream hover:text-deepbrown">
              View Site
            </Link>
            <button onClick={logout} className="btn-dark bg-cream text-deepbrown hover:opacity-90">
              Logout
            </button>
          </div>
        </aside>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
