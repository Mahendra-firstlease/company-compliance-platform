"use client";

import React from "react";
import { ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  // Inject custom CSS color variables based on config keys
  const chartStyle = React.useMemo(() => {
    const styleObj: Record<string, string> = {};
    Object.entries(config).forEach(([key, item]) => {
      if (item.color) {
        styleObj[`--color-${key}`] = item.color;
      }
    });
    return styleObj;
  }, [config]);

  return (
    <div
      className={cn("w-full h-full min-h-[250px] font-sans text-xs", className)}
      style={chartStyle as React.CSSProperties}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltipCustom({ active, payload, label, config }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-md text-xs space-y-1.5 min-w-[140px] animate-in fade-in duration-150">
      {label && <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((item: any, idx: number) => {
          const key = item.dataKey || item.name;
          const conf = config?.[key] || { label: key, color: item.color || item.fill };
          const color = conf.color || item.color || item.fill || "var(--indigo-600)";

          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-slate-700 font-medium">
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-600 font-semibold">{conf.label || item.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {typeof item.value === "number" ? item.value.toLocaleString("en-IN") : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
