"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FileCheck, Download } from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getApplications, getDashboardCertificates, certificateDownloadName } from "@/lib/applications";
import { downloadFile } from "@/utils/download";

export default function CertificatesPage() {
  const [cases, setCases] = useState<Awaited<ReturnType<typeof getApplications>>>([]);

  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  const certificates = useMemo(() => getDashboardCertificates(cases), [cases]);

  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader>
          <CardTitle>Issued compliance certificates</CardTitle>
          <CardDescription>
            Download official documents uploaded by your filing specialist after approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/50 transition-all duration-200"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <FileCheck
                      className="text-green-500 shrink-0"
                      size={28}
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-800 truncate">
                        {cert.certificateName}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {cert.serviceTitle}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Ref: {cert.applicationId}
                        {cert.issuedDate ? ` · ${new Date(cert.issuedDate).toLocaleDateString("en-IN")}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/applications/${cert.serviceSlug}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-bold cursor-pointer"
                      >
                        View Filing
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        downloadFile(
                          cert.certificateUrl,
                          certificateDownloadName(cert.serviceTitle, cert.certificateName),
                        );
                      }}
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      leftIcon={<Download size={13} />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-slate-50/50 border border-slate-100 rounded-lg text-xs text-slate-400 italic">
                No compliance certificates issued yet. Your specialist will upload
                official documents here once your filing is approved.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
