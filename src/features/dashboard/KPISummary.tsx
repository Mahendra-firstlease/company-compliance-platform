import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { AlertCircle, CheckCircle, ClipboardList, Clock } from "lucide-react";

type Props = {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
};

function KPISummary({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card enableHover size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Filings
          </CardDescription>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 shrink-0">
            <ClipboardList size={16} />
          </div>
        </CardHeader>
        <CardContent className="mt-1">
          <span className="text-3xl font-black text-slate-800 block">
            {stats.total}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-1 block">
            Active application cards
          </span>
        </CardContent>
      </Card>

      <Card enableHover size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
            Pending Actions
          </CardDescription>
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-500 shrink-0">
            <AlertCircle size={16} />
          </div>
        </CardHeader>
        <CardContent className="mt-1">
          <span className="text-3xl font-black text-amber-600 block">
            {stats.pending}
          </span>
          <span className="text-xs font-semibold text-amber-400 mt-1 block">
            Requires documentation
          </span>
        </CardContent>
      </Card>

      <Card enableHover size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="text-xs font-semibold text-primary uppercase tracking-wider">
            In Progress
          </CardDescription>
          <div className="p-2 rounded-lg bg-primary-light border border-primary-border text-primary shrink-0">
            <Clock size={16} />
          </div>
        </CardHeader>
        <CardContent className="mt-1">
          <span className="text-3xl font-black text-primary block">
            {stats.inProgress}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-1 block">
            Under government review
          </span>
        </CardContent>
      </Card>

      <Card enableHover size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="text-xs font-semibold text-green-500 uppercase tracking-wider">
            Completed
          </CardDescription>
          <div className="p-2 rounded-lg bg-green-50 border border-green-100 text-green-500 shrink-0">
            <CheckCircle size={16} />
          </div>
        </CardHeader>
        <CardContent className="mt-1">
          <span className="text-3xl font-black text-green-600 block">
            {stats.completed}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-1 block">
            Approved licenses & certificates
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export default KPISummary;
