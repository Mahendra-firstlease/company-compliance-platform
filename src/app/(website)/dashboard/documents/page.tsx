"use client";

import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Badge from "@/components/ui/Badge/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";

export default function DocumentsPage() {
  const [cases, setCases] = useState<ApplicationCase[]>([]);

  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  const totalUploadedDocs = cases.reduce((acc, c) => acc + Object.keys(c.uploadedDocs).length, 0);

  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader>
          <CardTitle>Secure Document Chest</CardTitle>
          <CardDescription>
            Vault for verified documents and attachments registered with MCA/FSSAI filings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {totalUploadedDocs > 0 ? (
              cases.flatMap((c) =>
                Object.entries(c.uploadedDocs).map(([docName, file]) => (
                  <div
                    key={`${c.id}-${docName}`}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-3 shadow-3xs hover:bg-slate-100/50 transition-all duration-200"
                  >
                    <div className="flex gap-2.5 items-start">
                      <FileText
                        className="text-primary mt-0.5 shrink-0"
                        size={20}
                      />
                      <div className="space-y-0.5">
                        <h4
                          className="font-semibold text-xs text-slate-800 truncate max-w-32"
                          title={docName}
                        >
                          {docName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate max-w-32">
                          {file.name}
                        </p>
                        <span className="text-xs text-slate-350 block">
                          {c.serviceTitle}
                        </span>
                      </div>
                    </div>
                    <Badge variant="indigo" size="sm">
                      {file.type}
                    </Badge>
                  </div>
                ))
              )
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-50/50 border border-slate-100 rounded-lg text-xs text-slate-400 italic">
                No verified documents registered in the chest.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
