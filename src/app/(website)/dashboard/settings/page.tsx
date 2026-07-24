"use client";

import React from "react";
import Button from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { notify } from "@/lib/notify";

export default function SettingsPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <Card enableHover>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Notifications
            </span>
            <p className="text-xs text-slate-400">
              Receive email alerts when case status shifts or queries are
              raised.
            </p>
          </div>
          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              SMS Gateway Verification
            </span>
            <p className="text-xs text-slate-400">
              Receive OTP reminders on your registered mobile number.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                notify.success("Preferences saved successfully.")
              }
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
