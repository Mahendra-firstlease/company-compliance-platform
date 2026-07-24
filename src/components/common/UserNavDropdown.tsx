"use client";

import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  Squares2X2Icon,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { notify } from "@/lib/notify";

export default function UserNavDropdown() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
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

  if (status === "loading") {
    return <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />;
  }

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const userName = session.user.name || "User Account";
  const userEmail = session.user.email || "";
  const avatarChar =
    session.user.name?.[0] || session.user.email?.[0]?.toUpperCase() || "U";
  const userRole = (session.user as any)?.role || "CLIENT";
  const isAdminOrExec = userRole === "ADMIN" || userRole === "EXECUTIVE";

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-full bg-slate-50 p-1.5 pr-3 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden">
        <div
          className={`flex size-7 items-center justify-center rounded-full text-white text-xs font-bold uppercase shadow-2xs ${
            isAdminOrExec ? "bg-indigo-900" : "bg-primary"
          }`}
        >
          {avatarChar}
        </div>
        <span className="max-w-30 truncate">{userName.split(" ")[0]}</span>
        {isAdminOrExec && (
          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
            Admin
          </span>
        )}
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white p-1.5 text-sm/6 border border-slate-200 shadow-xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
      >
        <div className="px-3 py-2 border-b border-slate-100 mb-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900 truncate">
              {userName}
            </p>
            {isAdminOrExec && (
              <span className="text-[9px] font-extrabold bg-indigo-900 text-white px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
        </div>

        {isAdminOrExec ? (
          <MenuItem>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <ShieldCheckIcon className="size-4 text-indigo-700" />
              Backoffice Admin Console
            </Link>
          </MenuItem>
        ) : (
          <>
            <MenuItem>
              <Link
                href="/business-profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <BuildingOfficeIcon className="size-4 text-indigo-600" />
                Business Profile
              </Link>
            </MenuItem>

            <MenuItem>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="size-4 text-slate-400" />
                My Account
              </Link>
            </MenuItem>

            <MenuItem>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Squares2X2Icon className="size-4 text-slate-400" />
                Filing Dashboard
              </Link>
            </MenuItem>
          </>
        )}

        <div className="border-t border-slate-100 my-1" />

        <MenuItem>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <ArrowRightStartOnRectangleIcon className="size-4 text-red-500" />
            Sign Out
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
