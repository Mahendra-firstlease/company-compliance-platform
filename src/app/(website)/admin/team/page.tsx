"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Search,
  Award,
  Mail,
  PhoneCall,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import apiFetch from "@/lib/apiClient";
import Select from "@/components/forms/Select";
import Input from "@/components/forms/Input";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

interface SpecialistMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialization: string;
  activeCases: number;
  completedCases: number;
  slaRate: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
}

export default function TeamConfigPage() {
  const modal = useModal();
  const [teamMembers, setTeamMembers] = useState<SpecialistMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch team members from MySQL backend API
  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<SpecialistMember[]>("/admin/team");
      if (Array.isArray(data)) {
        setTeamMembers(data);
      }
    } catch (err: any) {
      console.error("Error loading team members:", err);
      notify.error("Failed to load backoffice team members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const {
    pageItems: paginatedTeamMembers,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(teamMembers, {
    initialPageSize: 10,
  });

  // 1. Add Specialist Modal (Create)
  const handleAddMemberModal = () => {
    let name = "";
    let role = "Chartered Accountant (CA)";
    let spec = "MCA & GST Compliance";
    let email = "";
    let phone = "+91 98765 99999";
    let status = "AVAILABLE";

    const createMember = async () => {
      if (!name.trim()) {
        notify.error("Please enter specialist full name.");
        return;
      }
      if (!email.trim()) {
        notify.error("Please enter specialist email address.");
        return;
      }

      try {
        notify.loading({ title: "Adding Specialist...", description: "Saving to database." });
        const res = await apiFetch<any>("/admin/team", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            role,
            email: email.trim(),
            phone: phone.trim(),
            specialization: spec.trim(),
            status,
          }),
        });

        notify.success(`Specialist ${name} added successfully!`);
        modal.closeAll();
        fetchTeamMembers();
      } catch (err: any) {
        console.error("Error adding specialist:", err);
        notify.error(err.message || "Failed to add specialist.");
      }
    };

    modal.open({
      title: "Add Backoffice Specialist Executive",
      description: "Register a CA, CS, or Advocate to receive filing cases",
      size: "md",
      content: (
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Specialist Full Name *</label>
            <Input
              type="text"
              placeholder="e.g. CA Meera Kapoor"
              onChange={(e) => (name = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Email Address *</label>
            <Input
              type="email"
              placeholder="meera.kapoor@firstlease.com"
              onChange={(e) => (email = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Phone Number</label>
              <Input
                type="text"
                defaultValue="+91 98765 99999"
                onChange={(e) => (phone = e.target.value)}
                className="py-2.5 px-3"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Availability Status</label>
              <Select
                defaultValue="AVAILABLE"
                onChange={(val) => (status = val)}
                options={[
                  { label: "AVAILABLE", value: "AVAILABLE" },
                  { label: "BUSY", value: "BUSY" },
                  { label: "OFFLINE", value: "OFFLINE" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Professional Role</label>
            <Select
              defaultValue="Chartered Accountant (CA)"
              onChange={(val) => (role = val)}
              options={[
                { label: "Senior CA Consultant", value: "Senior CA Consultant" },
                { label: "Chartered Accountant (CA)", value: "Chartered Accountant (CA)" },
                { label: "Company Secretary (CS)", value: "Company Secretary (CS)" },
                { label: "Senior Legal Desk Advocate", value: "Senior Legal Desk Advocate" },
                { label: "Filing Verification Specialist", value: "Filing Verification Specialist" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Domain Specialization</label>
            <Input
              type="text"
              placeholder="e.g. MCA Registrations & Income Tax"
              onChange={(e) => (spec = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={createMember} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
              Save Specialist
            </Button>
          </div>
        </div>
      ),
    });
  };

  // 2. Edit Specialist Modal (Update)
  const handleEditMemberModal = (member: SpecialistMember) => {
    let name = member.name;
    let role = member.role;
    let spec = member.specialization;
    let email = member.email;
    let phone = member.phone;
    let status = member.status;

    const updateMember = async () => {
      try {
        notify.loading({ title: "Updating...", description: "Saving changes to database." });
        await apiFetch(`/admin/team/${member.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name,
            role,
            email,
            phone,
            specialization: spec,
            status,
          }),
        });

        notify.success(`Updated specialist ${name}`);
        modal.closeAll();
        fetchTeamMembers();
      } catch (err: any) {
        console.error("Error updating member:", err);
        notify.error(err.message || "Failed to update specialist.");
      }
    };

    modal.open({
      title: `Edit Specialist: ${member.name}`,
      description: "Update role, contact info, or operational status",
      size: "md",
      content: (
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Full Name</label>
            <Input
              type="text"
              defaultValue={member.name}
              onChange={(e) => (name = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Email Address</label>
            <Input
              type="email"
              defaultValue={member.email}
              onChange={(e) => (email = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Phone</label>
              <Input
                type="text"
                defaultValue={member.phone}
                onChange={(e) => (phone = e.target.value)}
                className="py-2.5 px-3"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Status</label>
              <Select
                defaultValue={member.status}
                onChange={(val) => (status = val as any)}
                options={[
                  { label: "AVAILABLE", value: "AVAILABLE" },
                  { label: "BUSY", value: "BUSY" },
                  { label: "OFFLINE", value: "OFFLINE" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Professional Role</label>
            <Input
              type="text"
              defaultValue={member.role}
              onChange={(e) => (role = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Specialization</label>
            <Input
              type="text"
              defaultValue={member.specialization}
              onChange={(e) => (spec = e.target.value)}
              className="py-2.5 px-3"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={updateMember} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </div>
        </div>
      ),
    });
  };

  // 3. Delete Specialist Modal (Delete)
  const handleDeleteMemberModal = (member: SpecialistMember) => {
    const confirmDelete = async () => {
      try {
        notify.loading({ title: "Deleting...", description: "Removing specialist from database." });
        await apiFetch(`/admin/team/${member.id}`, {
          method: "DELETE",
        });

        notify.success(`Removed specialist ${member.name}`);
        modal.closeAll();
        fetchTeamMembers();
      } catch (err: any) {
        console.error("Error deleting member:", err);
        notify.error(err.message || "Failed to delete specialist.");
      }
    };

    modal.open({
      title: "Remove Specialist Executive?",
      description: `Are you sure you want to remove ${member.name} (${member.role}) from the team database?`,
      size: "sm",
      content: (
        <div className="space-y-4 pt-2 text-xs">
          <p className="text-slate-600 leading-relaxed">
            This action will permanently delete this team record from MySQL.
          </p>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={confirmDelete} className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white">
              Confirm Delete
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Backoffice Legal Specialist Team Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Chartered Accountants (CAs), CS associates, and Advocates allocated to customer statutory filings.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddMemberModal}
          className="text-xs font-bold flex items-center gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={14} /> Add Executive
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialists Roster</span>
            <p className="text-2xl font-black text-slate-900">{teamMembers.length} Executives</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Queue Cases</span>
            <p className="text-2xl font-black text-indigo-600">
              {teamMembers.reduce((a, b) => a + (b.activeCases || 0), 0)}
            </p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Filings</span>
            <p className="text-2xl font-black text-emerald-600">
              {teamMembers.reduce((a, b) => a + (b.completedCases || 0), 0)}
            </p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg SLA Compliance</span>
            <p className="text-2xl font-black text-amber-600">98.2%</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Roster Datatable */}
      <div className="flex justify-end bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
        <TablePaginationToolbar
          pageSize={pageSize}
          pageIndex={pageIndex}
          totalPages={totalPages}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={setPageSize}
          onPageChange={setPageIndex}
        />
      </div>

      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Specialist Roster Directory</CardTitle>
            <CardDescription className="text-xs">Database-backed workload allocation roster</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="size-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading backoffice team from MySQL...</p>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-bold text-slate-700">No Specialists Found</p>
                <p className="text-xs text-slate-400">Click "Add Executive" to create your first team member.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View (sm+) */}
                <div className="hidden sm:block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Specialist Member</th>
                        <th className="py-3 px-4">Role & Domain</th>
                        <th className="py-3 px-4 text-center">Active Cases</th>
                        <th className="py-3 px-4 text-center">Completed</th>
                        <th className="py-3 px-4">SLA Rate</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {paginatedTeamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{member.name}</p>
                                <p className="text-[10px] text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{member.role}</p>
                            <span className="text-[10px] text-indigo-600 font-semibold">{member.specialization}</span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-black text-indigo-700">
                            {member.activeCases} active
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {member.completedCases}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            {member.slaRate}
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                member.status === "AVAILABLE"
                                  ? "green"
                                  : member.status === "BUSY"
                                  ? "yellow"
                                  : "gray"
                              }
                              rounded="full"
                              size="sm"
                            >
                              {member.status}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditMemberModal(member)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Edit Specialist"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMemberModal(member)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete Specialist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List View (< sm) */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {paginatedTeamMembers.map((member) => (
                    <div key={member.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{member.name}</h4>
                            <p className="text-[10px] text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            member.status === "AVAILABLE"
                              ? "green"
                              : member.status === "BUSY"
                              ? "yellow"
                              : "gray"
                          }
                          rounded="full"
                          size="sm"
                        >
                          {member.status}
                        </Badge>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-xs">
                        <p className="font-bold text-slate-800">{member.role}</p>
                        <p className="text-[11px] text-indigo-600 font-medium">{member.specialization}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="flex gap-3">
                          <span className="font-bold text-indigo-700">{member.activeCases} active</span>
                          <span className="text-slate-500">{member.completedCases} done</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMemberModal(member)}
                            className="text-xs font-bold py-1.5 px-3 min-h-[36px]"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDeleteMemberModal(member)}
                            className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 min-h-[36px]"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <TablePagination
                  entryStart={entryStart}
                  entryEnd={entryEnd}
                  totalItems={totalItems}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
