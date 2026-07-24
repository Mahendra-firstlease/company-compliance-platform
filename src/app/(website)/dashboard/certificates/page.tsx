"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileCheck } from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";

export default function CertificatesPage() {
  const [cases, setCases] = useState<ApplicationCase[]>([]);

  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  const approvedCases = cases.filter((c) => c.status === "APPROVED");

  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader>
          <CardTitle>Issued compliance certificates</CardTitle>
          <CardDescription>
            Download active credentials and licenses issued by Ministry authorities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedCases.length > 0 ? (
              approvedCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-all duration-200"
                >
                  <div className="flex gap-3 items-center">
                    <FileCheck
                      className="text-green-500 shrink-0"
                      size={28}
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">
                        {c.serviceTitle}
                      </h4>
                      <p className="text-xs text-slate-400">
                        License Reference ID: {c.id}
                      </p>
                    </div>
                  </div>
                  <Link href={`/applications/${c.serviceSlug}`}>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs font-semibold"
                    >
                      Download License
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-50/50 border border-slate-100 rounded-lg text-xs text-slate-400 italic">
                No compliance certificates issued yet. Workspaces will unlock
                download triggers on approval.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
