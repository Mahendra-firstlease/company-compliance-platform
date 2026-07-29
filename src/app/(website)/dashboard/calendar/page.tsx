"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bell,
  AlertCircle,
  Sparkles,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useModal } from "@/components/ui/overlay";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";

const FullCalendar = dynamic<any>(() => import("@fullcalendar/react"), { ssr: false });

export default function CalendarPage() {
  const modal = useModal();
  const [activeMonthTitle, setActiveMonthTitle] = useState("June 2026");

  // Compliance calendar filter and toggle states
  const [calendarFilters, setCalendarFilters] = useState({
    gst: true,
    roc: true,
    labour: true,
    license: true
  });
  const [reminders, setReminders] = useState({
    email: true,
    sms: true,
    whatsapp: false
  });

  const calendarRef = useRef<any>(null);

  // June 2026 compliance calendar events list
  const calendarEvents = useMemo(() => {
    const list = [
      { title: "GST", start: "2026-06-07", type: "gst", className: "fc-event-gst" },
      { title: "PF", start: "2026-06-12", type: "labour", className: "fc-event-labour" },
      { title: "ROC", start: "2026-06-15", type: "roc", className: "fc-event-roc" },
      { title: "GST", start: "2026-06-20", type: "gst", className: "fc-event-gst" },
      { title: "Labour", start: "2026-06-25", type: "labour", className: "fc-event-labour" },
      { title: "TDS", start: "2026-06-30", type: "license", className: "fc-event-license" }
    ];
    return list.filter(item => calendarFilters[item.type as keyof typeof calendarFilters]);
  }, [calendarFilters]);

  const handleEventClick = (info: any) => {
    const title = info.event.title;
    const date = info.event.startStr;
    
    let details = "Annual corporate filing or statutory return.";
    let instructions = "Please ensure all required business ledgers are updated and uploaded under the Documents workspace.";
    
    if (title === "GST") {
      details = "GST Monthly Return (GSTR-3B) Filing";
      instructions = "Prepare sales/purchase registers and file before the statutory cut-off to avoid late fees.";
    } else if (title === "PF") {
      details = "Provident Fund Wage Deposit";
      instructions = "Calculate wage contribution summaries for employees and generate challans for verification.";
    } else if (title === "ROC") {
      details = "Registrar of Companies Audit & Filing";
      instructions = "Verify director details, shareholder sheets, and attach certified balance sheets.";
    } else if (title === "Labour") {
      details = "Labour Welfare Fund Filing";
      instructions = "Submit professional tax summaries and payroll registrations before cutoff.";
    } else if (title === "TDS") {
      details = "TDS Quarterly Tax Deposit";
      instructions = "Reconcile deductee accounts and file Form 24Q/26Q data sheets.";
    }

    modal.open({
      title: "Statutory Deadline Details",
      size: "sm",
      content: (
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto size-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base">{details}</h4>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Due Date: {date}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed px-2 font-medium">{instructions}</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
            <Button size="sm" variant="outline" onClick={() => modal.closeAll()}>
              Dismiss
            </Button>
            <Button size="sm" variant="primary" onClick={() => {
              window.location.href = "/dashboard/documents";
              modal.closeAll();
            }}>
              Upload Files
            </Button>
          </div>
        </div>
      )
    });
  };

  const handleTaskClick = (title: string, dateStr: string) => {
    let details = "Annual corporate filing or statutory return.";
    let instructions = "Please ensure all required business ledgers are updated and uploaded under the Documents workspace.";
    
    const base = title.split(" ")[0];
    
    if (base === "GST") {
      details = "GST Monthly Return (GSTR-3B) Filing";
      instructions = "Prepare sales/purchase registers and file before the statutory cut-off to avoid late fees.";
    } else if (base === "PF") {
      details = "Provident Fund Wage Deposit";
      instructions = "Calculate payroll and employee contributions and deposit online.";
    } else if (base === "ROC") {
      details = "Registrar of Companies Audit & Filing";
      instructions = "Verify director sheets and file annual corporate details before the deadline.";
    }

    modal.open({
      title: "Statutory Deadline Details",
      size: "sm",
      content: (
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto size-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base">{details}</h4>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Due Date: 2026-06-{dateStr.split(" ")[1]}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed px-2 font-medium">{instructions}</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-4">
            <Button size="sm" variant="outline" onClick={() => modal.closeAll()}>
              Dismiss
            </Button>
            <Button size="sm" variant="primary" onClick={() => {
              window.location.href = "/dashboard/documents";
              modal.closeAll();
            }}>
              Upload Files
            </Button>
          </div>
        </div>
      )
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("reminders_pref");
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Top Toolbar Ribbons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filing Schedule</h3>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Compliance Registry Calendar</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>calendar</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-455">reminders</span>
          </div>
        </div>

        {/* Split layout block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Calendar View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Calendar View</span>
              
              {/* Month Switcher controls */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-3xs">
                <button 
                  type="button" 
                  onClick={() => {
                    const api = calendarRef.current?.getApi();
                    if (api) {
                      api.prev();
                    }
                  }}
                  className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider min-w-20 text-center">
                  {activeMonthTitle}
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    const api = calendarRef.current?.getApi();
                    if (api) {
                      api.next();
                    }
                  }}
                  className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Grid Container using @fullcalendar/react */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 p-4 shadow-3xs compliance-calendar-theme">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                initialDate="2026-06-01"
                events={calendarEvents}
                headerToolbar={false}
                dayMaxEvents={true}
                height="auto"
                eventClick={handleEventClick}
                datesSet={(dateInfo: any) => {
                  setActiveMonthTitle(dateInfo.view.title);
                }}
              />
              <style>{`
                .compliance-calendar-theme .fc {
                  --fc-border-color: #e2e8f0; /* slate-200 */
                  --fc-daygrid-event-dot-width: 0px;
                  background-color: transparent;
                  font-family: inherit;
                }
                .compliance-calendar-theme .fc-theme-standard td,
                .compliance-calendar-theme .fc-theme-standard th {
                  border-color: #e2e8f0 !important; /* slate-200 */
                }
                .compliance-calendar-theme .fc-col-header-cell {
                  background-color: #f8fafc !important; /* slate-50 */
                  color: #64748b !important; /* slate-500 */
                  font-size: 10px !important;
                  text-transform: uppercase !important;
                  letter-spacing: 0.15em !important;
                  font-weight: 800 !important;
                  padding: 8px 0 !important;
                  border-bottom: 2px solid #e2e8f0 !important;
                }
                .compliance-calendar-theme .fc-day {
                  background-color: #ffffff !important;
                  transition: background-color 150ms;
                }
                .compliance-calendar-theme .fc-day:hover {
                  background-color: #f1f5f9 !important; /* slate-100 */
                }
                .compliance-calendar-theme .fc-day-other {
                  background-color: #f8fafc !important; /* slate-50 */
                  opacity: 0.6;
                }
                .compliance-calendar-theme .fc-daygrid-day-number {
                  color: #64748b !important; /* slate-500 */
                  font-size: 10px !important;
                  font-weight: 800 !important;
                  padding: 8px !important;
                  float: left !important;
                }
                .compliance-calendar-theme .fc-event {
                  border-radius: 6px !important;
                  padding: 3px 6px !important;
                  font-weight: 850 !important;
                  font-size: 9px !important;
                  text-align: center !important;
                  text-transform: uppercase !important;
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02) !important;
                  cursor: pointer !important;
                  margin: 2px 4px !important;
                  transition: opacity 150ms;
                }
                .compliance-calendar-theme .fc-event:hover {
                  opacity: 0.85 !important;
                }
                .compliance-calendar-theme .fc-event-gst {
                  background-color: #e0e7ff !important; /* indigo-100 */
                  border: 1px solid #c7d2fe !important;
                  color: #4338ca !important;
                }
                .compliance-calendar-theme .fc-event-labour {
                  background-color: #fef3c7 !important; /* amber-100 */
                  border: 1px solid #fde68a !important;
                  color: #d97706 !important;
                }
                .compliance-calendar-theme .fc-event-roc {
                  background-color: #dcfce7 !important; /* green-100 */
                  border: 1px solid #bbf7d0 !important;
                  color: #15803d !important;
                }
                .compliance-calendar-theme .fc-event-license {
                  background-color: #ffe4e6 !important; /* rose-100 */
                  border: 1px solid #fecdd3 !important;
                  color: #be123c !important;
                }
                .compliance-calendar-theme .fc-daygrid-day-frame {
                  min-height: 70px !important;
                }
                .compliance-calendar-theme .fc-scrollgrid {
                  border-radius: 12px !important;
                  overflow: hidden !important;
                  border: 1px solid #e2e8f0 !important;
                }
              `}</style>
            </div>

            {/* Filter Switcher pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                { key: "gst", label: "GST Returns" },
                { key: "roc", label: "ROC Filings" },
                { key: "labour", label: "Labour Returns" },
                { key: "license", label: "License Renewals" },
              ].map((filter) => {
                const isSelected = calendarFilters[filter.key as keyof typeof calendarFilters];
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => {
                      setCalendarFilters(prev => ({
                        ...prev,
                        [filter.key]: !isSelected
                      }));
                      notify.success(`${filter.label} filter updated.`);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer shadow-3xs",
                      isSelected 
                        ? "bg-primary text-white border-primary" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-350 hover:text-slate-800"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tasks and Notifications */}
          <div className="space-y-8">
            
            {/* Upcoming Deadlines */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider text-left">
                Upcoming Tasks
              </h3>
              <div className="space-y-3">
                {(() => {
                  const visibleTasks = [
                    { title: "GST Return", date: "Jun 20", type: "gst", icon: FileText, color: "text-primary bg-primary-light", badge: "Pending", badgeColor: "bg-amber-100 text-amber-805" },
                    { title: "ROC Filing", date: "Jun 30", type: "roc", icon: CheckCircle, color: "text-green-600 bg-green-50", badge: "Upcoming", badgeColor: "bg-slate-100 text-slate-705" },
                    { title: "PF Filing", date: "Jun 15", type: "labour", icon: Clock, color: "text-amber-605 bg-amber-50", badge: "Urgent", badgeColor: "bg-rose-100 text-rose-805" }
                  ].filter(task => calendarFilters[task.type as keyof typeof calendarFilters]);

                  if (visibleTasks.length === 0) {
                    return (
                      <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-xs text-slate-400 italic font-semibold px-4 leading-relaxed">
                        No upcoming tasks.<br/>Check filters below to restore schedule list.
                      </div>
                    );
                  }

                  return visibleTasks.map((task, idx) => {
                    const Icon = task.icon;
                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => handleTaskClick(task.title, task.date)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-3xs hover:shadow-2xs hover:border-slate-350 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", task.color)}>
                            <Icon size={16} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-xs text-slate-850">{task.title}</h4>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{task.date}</p>
                          </div>
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md", task.badgeColor)}>
                          {task.badge}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Notification Reminders manager */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider text-left">
                Reminder Management
              </h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 shadow-3xs text-left">
                {[
                  { key: "email", label: "Email Reminder", desc: "Weekly digests and statutory deadline reminders", icon: Bell },
                  { key: "sms", label: "SMS Alerts", desc: "Real-time OTP logins and status change warnings", icon: AlertCircle },
                  { key: "whatsapp", label: "WhatsApp Alerts", desc: "Receive immediate updates on mobile chat", icon: Sparkles }
                ].map((rem) => {
                  const isChecked = reminders[rem.key as keyof typeof reminders];
                  const Icon = rem.icon;
                  return (
                    <div key={rem.key} className="flex items-start justify-between gap-4 p-1">
                      <div className="flex gap-3 text-left">
                        <div className="size-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={15} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{rem.label}</span>
                          <span className="text-xs text-slate-400 font-medium block mt-0.5 leading-relaxed">{rem.desc}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !isChecked;
                          setReminders(prev => {
                            const updated = { ...prev, [rem.key]: nextVal };
                            localStorage.setItem("reminders_pref", JSON.stringify(updated));
                            return updated;
                          });
                          notify.success(`${rem.label} preference saved.`);
                        }}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-hidden shadow-3xs shrink-0 mt-1.5",
                          isChecked ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-150 ease-in-out",
                            isChecked ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
