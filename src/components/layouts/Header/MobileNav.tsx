"use client";

import Link from "next/link";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon, XMarkIcon, UserIcon, ArrowRightStartOnRectangleIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import type { NavItem, NavLink } from "./header.data";
import { useModal } from "@/components/ui/overlay";
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import CompanyLogo from "@/components/common/CompanyLogo";
import { useSession, signOut } from "next-auth/react";
import { notify } from "@/lib/notify";

interface MobileNavProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  items: NavItem[];
}

export default function MobileMenu({ open, setOpen, items }: MobileNavProps) {
  const modal = useModal();
  const { data: session, status } = useSession();

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
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
                shadow-xl
                duration-300
                data-closed:translate-x-full
              "
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <CompanyLogo priority className="h-8 w-auto" />

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 hover:bg-gray-100"
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
                              font-medium
                              text-gray-700
                              hover:bg-gray-50
                            "
                            onClick={() => setOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      }

                      return (
                        <Disclosure key={item.label}>
                          <DisclosureButton
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              rounded-lg
                              px-4
                              py-3
                              font-medium
                              text-gray-700
                              hover:bg-gray-50
                            "
                          >
                            {item.label}
                            <ChevronDownIcon className="h-4 w-4" />
                          </DisclosureButton>

                          <DisclosurePanel className="pl-4 pb-2">
                            <div className="space-y-1 my-2">
                              {item.links?.map((link: NavLink) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                  onClick={() => setOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                            <div className="pt-2 px-4 pb-2 border-t border-slate-100 mt-2">
                              <Link
                                href="/services"
                                className="flex items-center justify-between font-bold text-xs text-primary py-2 px-3 bg-primary-light border border-primary-border rounded-lg"
                                onClick={() => setOpen(false)}
                              >
                                <span>View All Services Catalog →</span>
                              </Link>
                            </div>
                          </DisclosurePanel>
                        </Disclosure>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t p-5">
                  {status === "authenticated" && session?.user ? (
                    <div className="space-y-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors shadow-xs w-full"
                      >
                        <Squares2X2Icon className="size-4" />
                        Go to Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors w-full"
                      >
                        <UserIcon className="size-4" />
                        My Profile
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors w-full cursor-pointer mt-2"
                      >
                        <ArrowRightStartOnRectangleIcon className="size-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        label="Login"
                        variant="secondary"
                        size="md"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          modal.open({
                            title: "Sign In",
                            description: "Access your dashboard and services.",
                            content: <LoginForm />,
                            size: "sm",
                          });
                        }}
                      />

                      <Button
                        label="Sign Up"
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          modal.open({
                            title: "Create Account",
                            description: "Register to get started with our services.",
                            content: <RegisterForm />,
                            size: "md",
                          });
                        }}
                      />
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
