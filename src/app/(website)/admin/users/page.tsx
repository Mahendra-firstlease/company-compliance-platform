"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  UserCheck,
  ShieldAlert,
  Building2,
  FileText,
  ArrowRight,
  User,
  Filter,
  CheckCircle2,
  Eye,
  IdCardLanyard,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import apiFetch from "@/lib/apiClient";
import { formatDate } from "@/utils/formatters";

interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CLIENT" | "EXECUTIVE" | "ADMIN";
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
    const executives = users.filter((u) => u.role === "EXECUTIVE").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const withBusiness = users.filter((u) => u.businessName !== "Not Provided").length;

    return { total, clients, executives, admins, withBusiness };
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
          u.businessName.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card enableHover size="sm" className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Total Users</p>
              <h3 className="text-xl font-black text-slate-900">{stats.total}</h3>
            </div>
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Users size={18} />
            </div>
          </CardContent>
        </Card>

        <Card enableHover size="sm" className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Business Clients</p>
              <h3 className="text-xl font-black text-slate-900">{stats.clients}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Building2 size={18} />
            </div>
          </CardContent>
        </Card>

        <Card enableHover size="sm" className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">Legal Specialists</p>
              <h3 className="text-xl font-black text-slate-900">{stats.executives}</h3>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
              <UserCheck size={18} />
            </div>
          </CardContent>
        </Card>

        <Card enableHover size="sm" className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">System Admins</p>
              <h3 className="text-xl font-black text-slate-900">{stats.admins}</h3>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg">
              <ShieldAlert size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
          {["ALL", "CLIENT", "EXECUTIVE", "ADMIN"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                roleFilter === r
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r === "ALL" ? "All Users" : r}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, business..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Main Datatable Card */}
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management Directory</CardTitle>
            <CardDescription>
              View basic profile info, business registrations, and applied compliance filings.
            </CardDescription>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredUsers.length} users
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading user directory...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
              <>
                {/* Desktop Table View (sm+) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Business Profile</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4 text-center">Applied Services</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{user.name}</h4>
                                <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                user.role === "ADMIN"
                                  ? "indigo"
                                  : user.role === "EXECUTIVE"
                                  ? "blue"
                                  : "gray"
                              }
                              rounded="full"
                              size="sm"
                            >
                              {user.role}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-slate-800">{user.businessName}</p>
                              {user.businessType !== "Individual" && (
                                <p className="text-[10px] text-slate-400">
                                  {user.businessType} &middot; {user.state}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {user.phone}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
                              <FileText size={12} />
                              {user.applicationsCount} filings
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold flex items-center gap-1 px-2 ml-auto cursor-pointer"
                              >
                               <IdCardLanyard size={16} />  Profile 
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View (< sm) */}
                <div className="sm:hidden divide-y divide-slate-100 p-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{user.name}</h4>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "indigo"
                              : user.role === "EXECUTIVE"
                              ? "blue"
                              : "gray"
                          }
                          rounded="full"
                          size="sm"
                        >
                          {user.role}
                        </Badge>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-xs">
                        <p className="font-bold text-slate-800">{user.businessName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{user.phone}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-[11px]">
                          {user.applicationsCount} filings
                        </span>
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm" className="text-xs font-bold py-1.5 px-2 min-h-9">
                            View Profile <ArrowRight size={12} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
          ) : (
            <div className="p-12 text-center space-y-3">
              <User size={32} className="text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No users found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No users match your current filter or search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
