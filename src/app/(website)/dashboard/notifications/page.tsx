"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle>Alerts & Notifications Feed</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 divide-y divide-slate-100">
            {[
              {
                title: "Filing Invoice receipt generated",
                desc: "Corporate details invoice generated for GSTR compliance package.",
                time: "1 hour ago",
              },
              {
                title: "Specialist Assigned: CA Anjali Gupta",
                desc: "Filing officer allocated to handle verification lists.",
                time: "4 hours ago",
              },
              {
                title: "Filing verification: Query resolved",
                desc: "Query flags on trade license have been resolved.",
                time: "1 day ago",
              },
            ].map((notif, idx) => (
              <div
                key={idx}
                className={`pt-4 ${idx === 0 ? "pt-0 border-t-0" : ""} flex justify-between items-start gap-4 text-xs`}
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800">{notif.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {notif.desc}
                  </p>
                </div>
                <span className="text-xs text-slate-300 shrink-0">
                  {notif.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
