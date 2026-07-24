"use client";

import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import CompanyLogo from "@/components/common/CompanyLogo";
import Button from "@/components/common/Button";
import MegaMenu from "@/components/layouts/Header/MegaMenu";
import type { NavItem } from "@/components/layouts/Header/header.data";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserNavDropdown from "@/components/common/UserNavDropdown";

interface DesktopNavProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  items: NavItem[];
}

export default function DesktopNav({ open, setOpen, items }: DesktopNavProps) {
  const router = useRouter();
  const { status } = useSession();

  return (
    <nav>
      <Disclosure
        as="nav"
        className="relative bg-white shadow after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <CompanyLogo priority className="h-8 w-auto" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              {items.map((item) =>
                item.mega ? (
                  <MegaMenu key={item.label} item={item} />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden items-center gap-3 lg:flex">
              {status === "loading" ? (
                <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />
              ) : status === "authenticated" ? (
                <UserNavDropdown />
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    className="text-sm"
                    label="Login"
                    size="md"
                    variant="secondary"
                  />
                  <Button
                    onClick={() => router.push("/register")}
                    className="text-sm"
                    label="Sign up"
                    size="md"
                    variant="primary"
                  />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </Disclosure>
    </nav>
  );
}
