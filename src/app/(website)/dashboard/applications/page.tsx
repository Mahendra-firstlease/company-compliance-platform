"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";

export default function ApplicationsPage() {
  const [cases, setCases] = useState<ApplicationCase[]>([]);

  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  
  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle className="mb-2">All Corporate Filings</CardTitle>
          </div>
          <Link href="/dashboard/applications/new">
            <Button variant="outline" size="sm">
              <ClipboardList size={16} className="mr-2" />
              New Filing
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {cases.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-800">
                      {c.serviceTitle}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>Filing ID: {c.id}</span>
                      <span>&middot;</span>
                      <span>
                        Date: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        c.status === "APPROVED"
                          ? "green"
                          : c.query
                            ? "yellow"
                            : "indigo"
                      }
                      rounded="full"
                      size="sm"
                    >
                      {c.query ? "QUERY PENDING" : c.status.replace("_", " ")}
                    </Badge>
                    <Link href={`/applications/${c.serviceSlug}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold"
                      >
                        Manage Filing
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm">
                No Filings Active
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                You {"haven't"} initiated any compliance filings yet. Open the
                compliance services list to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
