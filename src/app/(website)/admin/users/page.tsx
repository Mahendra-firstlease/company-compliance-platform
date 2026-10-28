"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ShieldAlert,
  Building2,
  FileText,
  ArrowRight,
  User as UserIcon,
  X,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import apiFetch from "@/lib/apiClient";
import { formatDate } from "@/utils/formatters";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CLIENT" | "ADMIN";
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  businessType: string;
  industry: string;
  state: string;
  applicationsCount: number;
  documentsCount: number;
  paymentsCount: number;
  certificatesCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setIsLoading(true);
        const data = await apiFetch<AdminUserListItem[]>("/admin/users");
        if (active) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load admin users directory:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  // Compute KPI statistics
  const stats = useMemo(() => {
    const total = users.length;
    const clients = users.filter((u) => u.role === "CLIENT").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const withBusiness = users.filter((u) => u.businessName && u.businessName !== "Not Provided").length;

    return { total, clients, admins, withBusiness };
  }, [users]);

  // Compute filtered users
  const filteredUsers = useMemo(() => {
    let list = users;

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          (u.businessName && u.businessName.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, roleFilter, searchQuery]);

  const {
    pageItems: paginatedUsers,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(filteredUsers, {
    initialPageSize: 10,
    resetDeps: [roleFilter, searchQuery],
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Consolidated Stat Strip (Distilled from 4 large cards into an integrated metrics ribbon) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
          <div className="p-2.5 bg-primary-light text-primary rounded-lg shrink-0">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Users</span>
            <span className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{stats.total}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors sm:border-l sm:border-slate-100 sm:pl-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Business Clients</span>
            <span className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{stats.clients}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors sm:border-l sm:border-slate-100 sm:pl-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Administrators</span>
            <span className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{stats.admins}</span>
          </div>
        </div>
      </div>

      {/* Streamlined Toolbar: Search + Role Filter Tabs + Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs">
        {/* Left: Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: "All Users", count: stats.total },
            { id: "CLIENT", label: "Clients", count: stats.clients },
            { id: "ADMIN", label: "Admins", count: stats.admins },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-white text-primary shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Right: Search Box + Pagination Controls */}
        <div className="flex items-center gap-2.5 sm:ml-auto">
          <div className="relative w-full sm:w-72">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, business..."
              className="w-full pl-8 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:bg-white focus:border-primary text-slate-800 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Clear filter"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <TablePaginationToolbar
            pageSize={pageSize}
            pageIndex={pageIndex}
            totalPages={totalPages}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={setPageSize}
            onPageChange={setPageIndex}
          />
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs">
        {/* Table Header Strip */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="font-bold text-sm text-slate-900">User Accounts Directory</h2>
            <p className="text-xs text-slate-500">
              Manage platform clients, compliance team allocations, and statutory filing portfolios.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Showing {entryStart}–{entryEnd} of {totalItems} accounts
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading user accounts directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            {/* Desktop Table View (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Business Entity</th>
                    <th className="py-3 px-4 font-mono">Phone</th>
                    <th className="py-3 px-4 text-center">Filings</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedUsers.map((user) => {
                    const hasBusiness = Boolean(
                      user.businessName && user.businessName !== "Not Provided"
                    );

                    return (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary-border/60">
                              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                                {user.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={user.role === "ADMIN" ? "indigo" : "gray"}
                            rounded="full"
                            size="sm"
                          >
                            {user.role === "ADMIN" ? "Administrator" : "Client"}
                          </Badge>
                        </td>

                        {/* Business Entity */}
                        <td className="py-3.5 px-4">
                          {hasBusiness ? (
                            <div>
                              <p className="font-semibold text-slate-800 leading-snug">{user.businessName}</p>
                              {user.businessType && user.businessType !== "Individual" && (
                                <p className="text-[11px] text-slate-400">
                                  {user.businessType} {user.state ? `· ${user.state}` : ""}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unregistered</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {user.phone || <span className="text-slate-300 font-mono">—</span>}
                        </td>

                        {/* Filings Count */}
                        <td className="py-3.5 px-4 text-center">
                          {user.applicationsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full text-xs font-mono tabular-nums">
                              <FileText size={11} />
                              {user.applicationsCount} {user.applicationsCount === 1 ? "filing" : "filings"}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">0 filings</span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Action Link */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold flex items-center gap-1 px-2.5 h-8 text-slate-700 hover:text-primary hover:bg-primary-light border-slate-200 hover:border-primary-border rounded-md ml-auto cursor-pointer"
                            >
                              <span>360° Profile</span>
                              <ArrowRight size={12} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100 p-2">
              {paginatedUsers.map((user) => {
                const hasBusiness = Boolean(
                  user.businessName && user.businessName !== "Not Provided"
                );

                return (
                  <div
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="p-3.5 space-y-2.5 active:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-xs shrink-0 uppercase border border-primary-border/60">
                          {user.name ? user.name.charAt(0) : "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">{user.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={user.role === "ADMIN" ? "indigo" : "gray"}
                        rounded="full"
                        size="sm"
                      >
                        {user.role === "ADMIN" ? "Admin" : "Client"}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 rounded-md p-2.5 space-y-1 text-xs border border-slate-100">
                      <p className="font-bold text-slate-800">
                        {hasBusiness ? user.businessName : <span className="text-slate-400 italic font-normal">No registered entity</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {user.phone || "No phone registered"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-primary font-bold bg-primary-light px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums">
                        {user.applicationsCount} {user.applicationsCount === 1 ? "filing" : "filings"}
                      </span>
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold py-1.5 px-2.5 h-8">
                          View Profile <ArrowRight size={12} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <TablePagination
              entryStart={entryStart}
              entryEnd={entryEnd}
              totalItems={totalItems}
            />
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <UserIcon size={32} className="text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No matching user accounts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No accounts matched your search for "${searchQuery}".`
                : "No accounts found under the selected role filter."}
            </p>
            {(searchQuery || roleFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("ALL");
                }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear search & filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
