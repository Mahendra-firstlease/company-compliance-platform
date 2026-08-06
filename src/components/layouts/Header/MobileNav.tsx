"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  SquaresPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import type { NavItem, NavLink } from "./header.data";
import CompanyLogo from "@/components/common/CompanyLogo";
import { useSession, signOut } from "next-auth/react";
import { notify } from "@/lib/notify";
import { MobileMenuSkeleton } from "@/components/ui/skeletons";
import apiFetch from "@/lib/apiClient";

interface DynamicMobileServiceLink extends NavLink {
  description?: string;
}

interface MobileNavProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  items: NavItem[];
}

export default function MobileNav({ open, setOpen, items }: MobileNavProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dynamicServices, setDynamicServices] = useState<DynamicMobileServiceLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic services from MySQL backend API for mobile menu (matching Desktop MegaMenu)
  useEffect(() => {
    let active = true;
    apiFetch<any[]>("/services")
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setDynamicServices(
            data.map((s: any) => ({
              label: s.title,
              href: `/services/${s.slug}`,
              description: s.shortDescription || s.title,
            }))
          );
        } else if (active) {
          setDynamicServices([]);
        }
      })
      .catch((err) => console.error("Mobile nav services error:", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setOpen(false);
      notify.loading({
        title: "Signing out...",
        description: "Clearing session data.",
      });
      await signOut({ callbackUrl: "/" });
      notify.success({
        title: "Signed Out",
        description: "You have been successfully logged out.",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              transition
              className="
                w-screen
                max-w-sm
                bg-white
                shadow-2xl
                duration-300
                ease-in-out
                data-closed:translate-x-full
              "
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between shadow px-5 py-4">
                  <CompanyLogo priority className="h-8 w-auto" />

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* User Info Header if logged in */}
                {status === "authenticated" && session?.user && (
                  <div className="bg-slate-50 border-b px-5 py-3 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold uppercase shadow-2xs">
                      {session.user.name?.[0] || session.user.email?.[0] || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {session.user.name || "User Account"}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {session.user.email}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <div className="space-y-1">
                    {items.map((item) => {
                      if (!item.mega) {
                        return (
                          <Link
                            key={item.label}
                            href={item.href ?? "#"}
                            className="
                              block
                              rounded-lg
                              px-4
                              py-3
                              font-bold
                              text-sm
                              text-slate-700
                              hover:bg-slate-50
                              hover:text-primary
                              transition-colors
                            "
                            onClick={() => setOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      }

                      return (
                        <Disclosure key={item.label} defaultOpen={true}>
                          {({ open: isOpen }) => (
                            <>
                              <DisclosureButton
                                className="
                                  group
                                  flex
                                  w-full
                                  items-center
                                  justify-between
                                  rounded-lg
                                  px-4
                                  py-3
                                  font-bold
                                  text-sm
                                  text-slate-700
                                  hover:bg-slate-50
                                  hover:text-primary
                                  transition-colors
                                "
                              >
                                <span>{item.label}</span>
                                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                              </DisclosureButton>

                              {/* Accordion Smooth Animated Transition Panel */}
                              <DisclosurePanel
                                transition
                                className="pl-2 pb-2 transition-all duration-300 ease-in-out data-closed:-translate-y-2 data-closed:opacity-0 overflow-hidden"
                              >
                                <div className="space-y-1.5 my-2 pl-2 border-l-2 border-slate-100">
                                  {isLoading ? (
                                    <MobileMenuSkeleton />
                                  ) : dynamicServices.length > 0 ? (
                                    dynamicServices.map((link: DynamicMobileServiceLink) => (
                                      <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-indigo-50/60 transition-colors"
                                        onClick={() => setOpen(false)}
                                      >
                                        <div className="flex size-7 flex-none items-center justify-center rounded-md bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-indigo-600 border border-slate-200/50 transition-colors mt-0.5">
                                          <SquaresPlusIcon className="size-3.5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                            {link.label}
                                          </span>
                                          {link.description && (
                                            <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                                              {link.description}
                                            </span>
                                          )}
                                        </div>
                                      </Link>
                                    ))
                                  ) : (
                                    <p className="text-xs text-slate-500 font-medium py-2 px-3">
                                      No active services in catalog at the moment.
                                    </p>
                                  )}
                                </div>

                                <div className="pt-2 px-2 pb-2">
                                  <Link
                                    href="/services"
                                    className="flex items-center justify-between font-bold text-xs text-indigo-700 py-2.5 px-3.5 bg-indigo-50/80 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
                                    onClick={() => setOpen(false)}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <SparklesIcon className="size-3.5 text-indigo-600" />
                                      <span>View All Services Catalog</span>
                                    </span>
                                    <span>→</span>
                                  </Link>
                                </div>
                              </DisclosurePanel>
                            </>
                          )}
                        </Disclosure>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="shadow-2xs shadow-slate-200/50 p-5">
                  {status === "authenticated" && session?.user ? (
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center font-bold text-xs py-2.5 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                      >
                        Client Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full font-bold text-xs py-2.5 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowRightStartOnRectangleIcon className="size-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        fullWidth
                        variant="primary"
                        size="md"
                        className="rounded-lg font-bold"
                        onClick={() => {
                          setOpen(false);
                          router.push("/login");
                        }}
                      >
                        Log In
                      </Button>

                      <Button
                        fullWidth
                        variant="outline"
                        size="md"
                        className="rounded-lg font-bold border-slate-200"
                        onClick={() => {
                          setOpen(false);
                          router.push("/register");
                        }}
                      >
                        Register Business
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
