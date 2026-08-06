"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  ArrowLeft,
  ArrowRight,
  Clock,
  Briefcase,
  MapPin,
  Users as UsersIcon,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import Select from "@/components/forms/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  industry: string;
  state: string;
  employeeCount: string;
  annualTurnover: string;
}

interface ApplicationCase {
  id: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  status: string;
  customerName: string;
  customerPhone: string;
  address: string;
  queryText?: string;
  governmentFee: number;
  professionalFee: number;
  totalFee: number;
  assignedExecutive: string;
  createdAt: string;
  updatedAt: string;
  documentsCount: number;
  certificatesCount: number;
  paymentsCount: number;
}

interface DocumentItem {
  id: string;
  docName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  status: string;
  createdAt: string;
  fileUrl: string;
}

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

interface CertificateItem {
  id: string;
  certificateName: string;
  certificateUrl: string;
  issuedDate: string;
}

interface User360Detail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CLIENT" | "EXECUTIVE" | "ADMIN";
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  businessProfiles: BusinessProfile[];
  applications: ApplicationCase[];
  documents: DocumentItem[];
  payments: PaymentItem[];
  certificates: CertificateItem[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User360Detail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUserProfile() {
      try {
        setIsLoading(true);
        const data = await apiFetch<User360Detail>(`/admin/users/${userId}`);
        if (active) {
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load 360-degree user profile:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    if (userId) {
      loadUserProfile();
    }

    return () => {
      active = false;
    };
  }, [userId]);

  // Handle role change
  const handleRoleChange = async (newRole: "CLIENT" | "EXECUTIVE" | "ADMIN") => {
    try {
      setIsUpdatingRole(true);
      const updated = await apiFetch<any>(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setUser((prev) => (prev ? { ...prev, role: updated.role } : null));
      notify.success({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (err) {
      console.error("Failed to update user role:", err);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3 animate-in fade-in duration-300">
        <div className="size-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading 360-degree user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center space-y-4 animate-in fade-in duration-300">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">User Profile Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested user record could not be found in the system database.
        </p>
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            &larr; Back to Users Directory
          </Button>
        </Link>
      </div>
    );
  }

  const primaryBusiness = user.businessProfiles[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "indigo"
                    : user.role === "EXECUTIVE"
                      ? "yellow"
                      : "gray"
                }
                rounded="full"
                size="sm"
              >
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              User ID: {user.id} &middot; Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Role Change Selector */}
        <div className="flex items-center gap-2 min-w-44">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Role:</span>
          <Select
            value={user.role}
            disabled={isUpdatingRole}
            onChange={(val) => handleRoleChange(val as any)}
            options={[
              { label: "CLIENT", value: "CLIENT" },
              { label: "EXECUTIVE", value: "EXECUTIVE" },
              { label: "ADMIN", value: "ADMIN" },
            ]}
          />
        </div>
      </div>

      {/* Grid Row 1: Basic Profile Info & Registered Business Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic User Information */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User size={16} className="text-indigo-600" />
              Basic Account Information
            </CardTitle>
            <ShieldCheck size={16} className="text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-2">
                <User size={14} className="text-slate-400" /> Full Name:
              </span>
              <span className="font-bold text-slate-900">{user.name}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-2">
                <Mail size={14} className="text-slate-400" /> Email Address:
              </span>
              <span className="font-mono text-slate-800">{user.email}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-2">
                <Phone size={14} className="text-slate-400" /> Phone Contact:
              </span>
              <span className="font-mono text-slate-800">{user.phone}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" /> Account Created:
              </span>
              <span className="text-slate-700">{formatDate(user.createdAt)}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-semibold flex items-center gap-2">
                <Clock size={14} className="text-slate-400" /> Last Profile Update:
              </span>
              <span className="text-slate-700">{formatDate(user.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Registered Business Profile */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 size={16} className="text-indigo-600" />
              Registered Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            {primaryBusiness ? (
              <>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" /> Legal Business Name:
                  </span>
                  <span className="font-bold text-slate-900">{primaryBusiness.businessName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-400" /> Business Constitution:
                  </span>
                  <span className="font-semibold text-slate-800">{primaryBusiness.businessType}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> State Jurisdiction:
                  </span>
                  <span className="text-slate-800">{primaryBusiness.state}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <UsersIcon size={14} className="text-slate-400" /> Employee Capacity:
                  </span>
                  <span className="text-slate-800">{primaryBusiness.employeeCount} staff</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-semibold flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-400" /> Annual Turnover:
                  </span>
                  <span className="font-bold text-emerald-700">{primaryBusiness.annualTurnover}</span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <Building2 size={24} className="text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No business profile configured.</p>
                <p className="text-xs text-slate-400">User has not completed business onboarding yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Applied Services / Application Cases Section */}
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText size={16} className="text-indigo-600" />
              Applied Statutory Services ({user.applications.length})
            </CardTitle>
            <CardDescription>
              Complete record of all compliance applications submitted by this user.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {user.applications.length > 0 ? (
            <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Service Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Executive</th>
                    <th className="py-3 px-4">Total Fee</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {user.applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {app.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {app.serviceTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            app.status === "APPROVED"
                              ? "green"
                              : app.queryText
                                ? "red"
                                : "indigo"
                          }
                          rounded="full"
                          size="sm"
                        >
                          {app.queryText ? "ACTION REQUIRED" : app.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {app.assignedExecutive}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(app.totalFee)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/applications/${app.serviceSlug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            Workspace <ArrowRight size={10} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y divide-slate-100">
              {user.applications.map((app) => (
                <div key={app.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900">{app.serviceTitle}</p>
                      <p className="text-[11px] font-mono text-slate-500">{app.id}</p>
                    </div>
                    <Badge
                      variant={
                        app.status === "APPROVED"
                          ? "green"
                          : app.queryText
                            ? "red"
                            : "indigo"
                      }
                      rounded="full"
                      size="sm"
                    >
                      {app.queryText ? "ACTION REQUIRED" : app.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Executive</p>
                      <p className="font-semibold">{app.assignedExecutive}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Fee</p>
                      <p className="font-bold text-slate-900">{formatCurrency(app.totalFee)}</p>
                    </div>
                  </div>
                  <Link href={`/applications/${app.serviceSlug}`}>
                    <Button variant="outline" size="sm" fullWidth className="min-h-[44px] text-xs font-semibold">
                      Open Workspace <ArrowRight size={12} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-2">
              <FileText size={24} className="text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No compliance applications filed yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Row 3: Documents/Certificates (50%) & Payments (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issued Certificates & Documents */}
        <Card enableHover size="sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award size={16} className="text-indigo-600" />
              Issued Certificates ({user.certificates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {user.certificates.length > 0 ? (
              user.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800">{cert.certificateName}</h4>
                    <p className="text-[11px] text-slate-400">Issued: {formatDate(cert.issuedDate)}</p>
                  </div>
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-xs"
                  >
                    Download <ExternalLink size={12} />
                  </a>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No statutory certificates issued yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card enableHover size="sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard size={16} className="text-indigo-600" />
              Payment History ({user.payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {user.payments.length > 0 ? (
              user.payments.map((pmt) => (
                <div
                  key={pmt.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800">{formatCurrency(pmt.amount)}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref: {pmt.transactionId} &middot; {pmt.paymentMethod}
                    </p>
                  </div>
                  <Badge variant="green" rounded="full" size="sm">
                    {pmt.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No payment transactions recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
