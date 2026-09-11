"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/users", label: "Users" },
  { href: "/carts", label: "Carts" },
  { href: "/wishlists", label: "Wishlists" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 border-b border-slate-200 bg-white sm:w-56 sm:border-b-0 sm:border-r sm:min-h-screen">
      <div className="px-4 py-4">
        <span className="text-base font-semibold text-slate-900">ecommerce-admin</span>
      </div>
      <ul className="flex gap-1 overflow-x-auto px-2 pb-2 sm:flex-col sm:overflow-visible sm:pb-4">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0 sm:shrink">
              <Link
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
