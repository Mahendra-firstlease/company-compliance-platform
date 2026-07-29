"use client";

import React, { useState } from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import SectionHeading from "@/components/common/Heading";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/forms/Select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import FileUpload from "@/components/forms/FileUpload";
import Badge from "@/components/ui/Badge/Badge";
import {
  Tabs as UITabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { notify } from "@/lib/notify";
import {
  useModal,
  Modal,
  ModalSize,
  ModalPosition,
  ModalAnimation,
} from "@/components/ui/overlay";
import {
  Layers,
  PlayCircle,
  Terminal,
  ShieldCheck,
  CheckCircle,
  Code2,
  FileText,
  Compass,
  Sliders,
  Search,
  Tag,
  HelpCircle,
  UploadCloud,
} from "lucide-react";

export default function ComponentCustomizationPage() {
  const modal = useModal();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "button"
    | "overlay"
    | "notification"
    | "heading"
    | "breadcrumb"
    | "pagination"
    | "search"
    | "table"
    | "select"
    | "badge"
    | "tabs"
    | "card"
    | "accordion"
    | "fileupload"
  >("overview");

  // Local state for pagination sandbox demo
  const [currentPage, setCurrentPage] = useState(1);
  // Local state for search bar sandbox demo
  const [searchQuery, setSearchQuery] = useState("");
  // Local state for select sandbox demo
  const [selectValue, setSelectValue] = useState("");

  // Declarative Modal Sandbox State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<ModalSize>("md");
  const [modalPosition, setModalPosition] = useState<ModalPosition>("center");
  const [modalAnimation, setModalAnimation] = useState<ModalAnimation>("zoom");
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);
  const [closeOnEsc, setCloseOnEsc] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(true);

  // Helper form for programmatic modal sandbox
  const SandboxForm = () => {
    const [name, setName] = useState("");
    return (
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Service Title
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-indigo-500"
            placeholder="e.g. GST Registration"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => modal.closeAll()}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              notify.success(`Created service "${name || "New Service"}"`);
              modal.closeAll();
            }}
          >
            Create
          </Button>
        </div>
      </div>
    );
  };

  // Simulated promise notification trigger
  const triggerPromiseNotification = () => {
    const simulatedPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve("Data fetched!");
        } else {
          reject(new Error("Timeout"));
        }
      }, 2000);
    });

    notify.promise(simulatedPromise, {
      loading: {
        title: "Connecting to server...",
        description: "Syncing compliance records.",
      },
      success: {
        title: "Records Synchronized",
        description: "Latest government files downloaded successfully.",
      },
      error: {
        title: "Synchronization Failed",
        description: "Gateway timed out. Try again later.",
      },
    });
  };

  // Code Block Formatter helper
  const CodeBlock = ({ code }: { code: string }) => (
    <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-950">
      <code>{code}</code>
    </pre>
  );

  return (
    <Section className="bg-slate-50/50 min-h-screen pt-12 pb-20">
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sticky Side Navigation (Left 25%) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 shadow-sm sticky top-6 space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm">
                Documentation
              </h3>
              <p className="text-xs text-slate-400">Design System Library</p>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
              {[
                { id: "overview", label: "Overview", icon: FileText },
                { id: "button", label: "Button Component", icon: PlayCircle },
                { id: "overlay", label: "Overlay (Modals)", icon: Layers },
                {
                  id: "notification",
                  label: "Toast Notifications",
                  icon: Terminal,
                },
                { id: "heading", label: "Section Headings", icon: Code2 },
                { id: "breadcrumb", label: "Breadcrumbs", icon: Compass },
                { id: "pagination", label: "Pagination", icon: Sliders },
                { id: "search", label: "Search Bar", icon: Search },
                { id: "table", label: "Data Table", icon: FileText },
                { id: "select", label: "Select (Compound)", icon: Sliders },
                { id: "badge", label: "Badge Component", icon: Tag },
                { id: "tabs", label: "Tabs (Navigation)", icon: Sliders },
                { id: "card", label: "Card Component", icon: Layers },
                {
                  id: "accordion",
                  label: "Accordion Component",
                  icon: HelpCircle,
                },
                { id: "fileupload", label: "File Upload", icon: UploadCloud },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-left rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 border-l-2 border-indigo-500 pl-4.5"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? "text-indigo-500" : ""}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Documentation Content (Right 75%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    UI Design System Overview
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    This compliance portal is built using a clean, light-mode
                    tailored design system. We use reusable structural elements
                    and event emitters to ensure consistent styling, rapid
                    development, and perfect accessibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-indigo-500" />
                      Strict Accessibility
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All interactive overlays, popovers, and inputs conform to
                      accessibility standards including focus-traps and escape
                      controls.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                      <CheckCircle size={16} className="text-indigo-500" />
                      Dynamic Notifications
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Forms and user operations are wired to dynamic global
                      notifications mapping loading status, failure reports, and
                      promise-based trackers.
                    </p>
                  </div>
                </div>

                {/* Theme Customization Guide */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Theme Customization Guide
                  </h2>
                  <p className="text-xs text-slate-500">
                    Our theme parameters are centralized inside globals.css and
                    DashboardLayout properties, enabling global updates.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-xs text-slate-800">
                        1. Global Brand Colors (globals.css)
                      </h4>
                      <CodeBlock
                        code={`/* app/globals.css */
:root {
  --color-primary: #4f46e5;    /* Indigo base accent */
  --color-success: #10b981;    /* Success state green */
  --color-warning: #f59e0b;    /* Clarifications yellow */
  --color-error: #ef4444;      /* Alert labels red */
}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-xs text-slate-800">
                        2. Dashboard Theme Layout Schemes
                      </h4>
                      <p className="text-xs text-slate-400">
                        Toggle layout colors using the \`headerTheme\` prop on
                        DashboardLayout component.
                      </p>
                      <CodeBlock
                        code={`import DashboardLayout from "@/components/layouts/DashboardLayout";

// For User Dashboard (light slate design)
<DashboardLayout headerTheme="slate" title="User Portal" {...props}>
  {workspaceContent}
</DashboardLayout>

// For Backoffice Dashboard (indigo brand design)
<DashboardLayout headerTheme="indigo" title="Admin Portal" {...props}>
  {adminContent}
</DashboardLayout>`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Button Component Tab */}
            {activeTab === "button" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Button Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A flexible, state-aware button supporting loading
                    indicators, custom outline borders, icons, and size metrics.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center p-5 bg-slate-50 rounded-lg border border-slate-100">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button loading>Loading...</Button>
                    <Button size="sm">Small Size</Button>
                    <Button size="lg">Large Size</Button>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import Button from "@/components/common/Button";

// 1. Primary Action Button
<Button onClick={handleClick}>
  Submit Application
</Button>

// 2. Secondary Outline Button with Loading State
<Button variant="outline" loading={isSubmitting}>
  Cancel
</Button>

// 3. Small Ghost button
<Button variant="ghost" size="sm">
  Dismiss
</Button>`}
                  />
                </div>
              </div>
            )}

            {/* Overlay Modals Tab */}
            {activeTab === "overlay" && (
              <div className="space-y-6">
                {/* Modal Controller Showcase */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                      Programmatic Overlay API
                    </h1>
                    <p className="text-sm text-slate-500">
                      Spawn highly accessible modal overlays dynamically from
                      your code using the `useModal` hook.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    {/* Alerts panel */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest">
                          Alert Prompts
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Simple informational alerts.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          modal.alert({
                            title: "Action Approved",
                            description:
                              "The document verification is now finalized.",
                            variant: "success",
                          })
                        }
                      >
                        Launch Success Alert
                      </Button>
                    </div>

                    {/* Confirms panel */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest">
                          Confirm Prompt
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Confirm actions before committing.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          modal.confirm({
                            title: "Proceed with Deletion?",
                            description:
                              "You are about to delete this backup. This is non-reversible.",
                            variant: "danger",
                            confirmText: "Delete Backup",
                            onConfirm: () => notify.success("Backup deleted!"),
                            onCancel: () => notify.info("Action cancelled."),
                          })
                        }
                      >
                        Launch Confirmation
                      </Button>
                    </div>

                    {/* Custom content panel */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-widest">
                          Custom Content
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Inject custom components or forms.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          modal.open({
                            title: "Setup New Compliance Registry",
                            description:
                              "Input basic configuration parameters.",
                            content: <SandboxForm />,
                          })
                        }
                      >
                        Launch Custom Form
                      </Button>
                    </div>
                  </div>

                  {/* Usage Code */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-slate-800">
                      Code Usage Examples
                    </h3>
                    <CodeBlock
                      code={`import { useModal } from "@/components/ui/overlay";

export default function MyComponent() {
  const modal = useModal();

  const handleAction = () => {
    modal.confirm({
      title: "Save File Slices?",
      description: "Confirm details before locking database.",
      onConfirm: () => executeSave(),
      confirmText: "Save Now"
    });
  };
}`}
                    />
                  </div>
                </div>

                {/* Interactive Declarative Sandbox */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <PlayCircle size={18} className="text-indigo-500" />
                    Declarative Customizer Sandbox
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100">
                    {/* Size Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Size
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                        value={modalSize}
                        onChange={(e) =>
                          setModalSize(e.target.value as ModalSize)
                        }
                      >
                        {[
                          "xs",
                          "sm",
                          "md",
                          "lg",
                          "xl",
                          "2xl",
                          "3xl",
                          "4xl",
                          "5xl",
                          "full",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Position Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Position
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                        value={modalPosition}
                        onChange={(e) =>
                          setModalPosition(e.target.value as ModalPosition)
                        }
                      >
                        {["center", "top", "bottom", "left", "right"].map(
                          (p) => (
                            <option key={p} value={p}>
                              {p.toUpperCase()}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* Animation Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Animation
                      </label>
                      <select
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none"
                        value={modalAnimation}
                        onChange={(e) =>
                          setModalAnimation(e.target.value as ModalAnimation)
                        }
                      >
                        {[
                          "fade",
                          "zoom",
                          "scale",
                          "slide-up",
                          "slide-down",
                          "slide-left",
                          "slide-right",
                        ].map((a) => (
                          <option key={a} value={a}>
                            {a.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={closeOnBackdrop}
                        onChange={(e) => setCloseOnBackdrop(e.target.checked)}
                      />
                      Close on Backdrop Click
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={closeOnEsc}
                        onChange={(e) => setCloseOnEsc(e.target.checked)}
                      />
                      Close on ESC Key
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={showCloseButton}
                        onChange={(e) => setShowCloseButton(e.target.checked)}
                      />
                      Show Header Close Button
                    </label>
                  </div>

                  <div className="pt-2 flex justify-start">
                    <Button onClick={() => setIsModalOpen(true)}>
                      Launch Customized Modal
                    </Button>
                  </div>
                </div>

                {/* Declarative Modal Component */}
                <Modal
                  open={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  size={modalSize}
                  position={modalPosition}
                  animation={modalAnimation}
                  closeOnBackdrop={closeOnBackdrop}
                  closeOnEsc={closeOnEsc}
                  showCloseButton={showCloseButton}
                >
                  <Modal.Header>
                    <Modal.Title>Customized Overlay Demo</Modal.Title>
                    <Modal.Description>
                      Size: {modalSize.toUpperCase()} | Position:{" "}
                      {modalPosition.toUpperCase()} | Transition:{" "}
                      {modalAnimation.toUpperCase()}
                    </Modal.Description>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="space-y-3">
                      <p>
                        This modal container uses Headless UI's Dialog system
                        integrated with custom CSS attributes and coordinate
                        states.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-indigo-500 font-semibold">
                        <ShieldCheck size={14} />
                        <span>Fully Accessible & Focus Trapped</span>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        notify.success("Changes saved!");
                        setIsModalOpen(false);
                      }}
                    >
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            )}

            {/* Toast Notifications Tab */}
            {activeTab === "notification" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Toast Notifications System
                  </h1>
                  <p className="text-sm text-slate-500">
                    A flexible sonner-based notification listener displaying
                    success, failure, loading, and promise resolutions.
                  </p>
                </div>

                {/* Interactive sandbox */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Trigger Live Toast Notifications
                  </h3>
                  <div className="flex flex-wrap gap-3 p-5 bg-slate-50 rounded-lg border border-slate-100">
                    <Button
                      onClick={() =>
                        notify.success({
                          title: "Database Backup Complete",
                          description: "All files saved.",
                        })
                      }
                      className="bg-green-600 text-white"
                    >
                      Trigger Success
                    </Button>
                    <Button
                      onClick={() =>
                        notify.error({
                          title: "Connection Failed",
                          description: "Retrying network handshake.",
                        })
                      }
                      className="bg-red-600 text-white"
                    >
                      Trigger Error
                    </Button>
                    <Button
                      onClick={() =>
                        notify.info({
                          title: "System Notification",
                          description:
                            "Software update scheduled for midnight.",
                        })
                      }
                    >
                      Trigger Info
                    </Button>
                    <Button
                      variant="outline"
                      onClick={triggerPromiseNotification}
                    >
                      Trigger Promise Loader
                    </Button>
                  </div>
                </div>

                {/* Code Usage */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import { notify } from "@/lib/notify";

// 1. Success Message
notify.success("Changes Saved", "Your profile is updated.");

// 2. Error Message
notify.error("Invalid Input", "Double check registration code.");

// 3. Promise State Tracker
notify.promise(myAsyncFunction(), {
  loading: { title: "Saving...", description: "Uploading document." },
  success: { title: "Success!", description: "File uploaded successfully." },
  error: { title: "Upload failed", description: "File size exceeds limits." }
});`}
                  />
                </div>
              </div>
            )}

            {/* Headings Tab */}
            {activeTab === "heading" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Section Heading Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A dynamic header block supporting badges, bold highlights,
                    subtext descriptions, and left/center alignment modes.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 space-y-8">
                    {/* Centered Heading */}
                    <div className="border-b border-slate-200 pb-8">
                      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase text-center">
                        Center Align Preview
                      </div>
                      <SectionHeading
                        badge="Our Workflow"
                        title="Filing Made "
                        highlight="Effortless"
                        description="Track and submit your forms online with assistance from CA and CS legal professionals."
                        align="center"
                      />
                    </div>

                    {/* Left Heading */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-2 uppercase">
                        Left Align Preview
                      </div>
                      <SectionHeading
                        badge="Quick FAQ"
                        title="Frequently Asked "
                        highlight="Questions"
                        description="Detailed information about company compliance and filings."
                        align="left"
                      />
                    </div>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import SectionHeading from "@/components/common/Heading";

// 1. Center aligned section header
<SectionHeading
  badge="Overview"
  title="Browse our "
  highlight="Pricing"
  description="Simple and transparent pricing plans."
  align="center"
/>

// 2. Left aligned heading
<SectionHeading
  badge="Support"
  title="Need help?"
  align="left"
/>`}
                  />
                </div>
              </div>
            )}

            {/* Breadcrumbs Tab */}
            {activeTab === "breadcrumb" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Breadcrumb Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A navigation aid that highlights the user's location in the
                    portal hierarchy with optional home icons and custom
                    separators.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        STANDARD WITH HOME ICON
                      </span>
                      <Breadcrumb
                        items={[
                          { label: "Dashboard", href: "#" },
                          { label: "Compliance Services", href: "#" },
                          { label: "GST Registration" },
                        ]}
                      />
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1">
                        NO HOME ICON
                      </span>
                      <Breadcrumb
                        showHomeIcon={false}
                        items={[
                          { label: "Settings", href: "#" },
                          { label: "Profile Setup", href: "#" },
                          { label: "Verify Identity" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import Breadcrumb from "@/components/common/Breadcrumb";

// 1. Standard breadcrumb path
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "GST Registration" }
  ]}
/>

// 2. Hide home icon and render custom separators
<Breadcrumb
  showHomeIcon={false}
  items={[
    { label: "Onboarding", href: "/profile" },
    { label: "Business Scale" }
  ]}
/>`}
                  />
                </div>
              </div>
            )}

            {/* Pagination Tab */}
            {activeTab === "pagination" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Pagination Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A desktop & mobile responsive page selector supporting
                    sibling index margins, ellipsis dot buffers, and active
                    highlights.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Interactive Sandbox
                  </h3>
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">
                      CLICK TO NAVIGATE PAGES
                    </span>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={10}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import Pagination from "@/components/common/Pagination";

export default function ServicesCatalog() {
  const [page, setPage] = useState(1);

  return (
    <Pagination
      currentPage={page}
      totalPages={8}
      onPageChange={(nextPage) => setPage(nextPage)}
    />
  );
}`}
                  />
                </div>
              </div>
            )}

            {/* Search Bar Tab */}
            {activeTab === "search" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Search Bar Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A type-safe search input built with Class Variance Authority
                    (`cva`). Supports multiple sizes (`sm`, `md`, `lg`, `xl`),
                    fullWidth layouts, loading spinners, shortcut badges, clear
                    actions, and visual variants.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Interactive Sandbox
                  </h3>

                  {/* 1. Size Variants */}
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      1. Size Variants (sm, md, lg, xl)
                    </span>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Small (`size="sm"`)
                        </span>
                        <SearchBar
                          size="sm"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Search (sm size)..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Medium Default (`size="md"`)
                        </span>
                        <SearchBar
                          size="md"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Search (md size)..."
                          shortcut="⌘K"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Large (`size="lg"`)
                        </span>
                        <SearchBar
                          size="lg"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Search (lg size)..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Extra Large (`size="xl"`)
                        </span>
                        <SearchBar
                          size="xl"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Search (xl size)..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Visual Variants & Special States */}
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      2. Visual Styles & Special States
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Bordered Variant (`variant="bordered"`)
                        </span>
                        <SearchBar
                          variant="bordered"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Bordered style..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Filled Variant (`variant="filled"`)
                        </span>
                        <SearchBar
                          variant="filled"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Filled background style..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Glassmorphism (`variant="glass"`)
                        </span>
                        <SearchBar
                          variant="glass"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Glassmorphism style..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Subtle Borderless (`variant="subtle"`)
                        </span>
                        <SearchBar
                          variant="subtle"
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Subtle minimal style..."
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Loading State (`loading={true}`)
                        </span>
                        <SearchBar
                          loading={true}
                          value="Searching database..."
                          onChange={() => {}}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Full Width (`fullWidth={true}`)
                        </span>
                        <SearchBar
                          fullWidth
                          value={searchQuery}
                          onChange={(val) => setSearchQuery(val)}
                          placeholder="Spans 100% of container..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import SearchBar from "@/components/common/SearchBar";

// 1. Standard SearchBar with sizes and shortcut badge
<SearchBar
  size="lg"
  value={query}
  onChange={setQuery}
  placeholder="Search compliance catalog..."
  shortcut="⌘K"
  onSearch={(val) => handleSearch(val)}
/>

// 2. Full Width Loading SearchBar
<SearchBar
  fullWidth
  variant="filled"
  loading={isLoading}
  value={query}
  onChange={setQuery}
/>`}
                  />
                </div>
              </div>
            )}

            {/* Data Table Tab */}
            {activeTab === "table" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Data Table Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A highly composable set of table components designed to
                    match Shadcn UI specifications.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Filing Reference</TableHead>
                          <TableHead>Service Title</TableHead>
                          <TableHead>Date Issued</TableHead>
                          <TableHead className="text-right">
                            Filing Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-500">
                            MCA-GST8412
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            GST Registration
                          </TableCell>
                          <TableCell>12th June 2026</TableCell>
                          <TableCell className="text-right">
                            <span className="bg-green-50 text-green-600 font-semibold border border-green-150 px-2 py-0.5 rounded-full text-xs">
                              APPROVED
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold text-slate-500">
                            MCA-FSS1094
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            FSSAI License Renewal
                          </TableCell>
                          <TableCell>19th June 2026</TableCell>
                          <TableCell className="text-right">
                            <span className="bg-indigo-50 text-indigo-600 font-semibold border border-indigo-150 px-2 py-0.5 rounded-full text-xs">
                              UNDER_REVIEW
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>1</TableCell>
      <TableCell>John Doe</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
                  />
                </div>
              </div>
            )}

            {activeTab === "select" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Select (Compound Primitive)
                  </h1>
                  <p className="text-sm text-slate-500">
                    A highly customizable, fully accessible drop-down selector
                    supporting item grouping and divider separators.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="bg-slate-50 p-8 rounded-lg border border-slate-100 flex flex-col items-center justify-center min-h-[250px]">
                    <div className="w-64 space-y-2 text-left">
                      <span className="text-xs font-semibold text-slate-400">
                        Choose Filing Program
                      </span>
                      <Select
                        value={selectValue}
                        onValueChange={(val) => setSelectValue(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a filing..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Direct Taxes</SelectLabel>
                            <SelectItem value="gst">
                              GST Registration
                            </SelectItem>
                            <SelectItem value="itr">
                              Income Tax Return
                            </SelectItem>
                          </SelectGroup>
                          <SelectSeparator />
                          <SelectGroup>
                            <SelectLabel>
                              Indirect Taxes & Registrations
                            </SelectLabel>
                            <SelectItem value="fssai">
                              FSSAI Food License
                            </SelectItem>
                            <SelectItem value="msme">
                              MSME Udyam Registration
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {selectValue && (
                        <p className="text-xs text-slate-500 font-medium mt-2">
                          Active Selection:{" "}
                          <span className="text-primary font-semibold">
                            {selectValue}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator
} from "@/components/forms/Select";

const [selectedValue, setSelectedValue] = useState("");

<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select a filing..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Direct Taxes</SelectLabel>
      <SelectItem value="gst">GST Registration</SelectItem>
      <SelectItem value="itr">Income Tax Return</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Indirect Taxes</SelectLabel>
      <SelectItem value="fssai">FSSAI Food License</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
                  />
                </div>
              </div>
            )}

            {activeTab === "badge" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Badge Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A clean, small visual tag component for displaying statuses,
                    counts, and categories.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>

                  {/* Variants */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400">
                      Color Variants
                    </h4>
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <Badge variant="gray">Gray</Badge>
                      <Badge variant="red">Red</Badge>
                      <Badge variant="yellow">Yellow</Badge>
                      <Badge variant="green">Green</Badge>
                      <Badge variant="blue">Blue</Badge>
                      <Badge variant="indigo">Indigo</Badge>
                      <Badge variant="purple">Purple</Badge>
                      <Badge variant="pink">Pink</Badge>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400">
                      Sizes
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <Badge size="sm">Small (sm)</Badge>
                      <Badge size="md">Medium (md)</Badge>
                      <Badge size="lg">Large (lg)</Badge>
                    </div>
                  </div>

                  {/* Shapes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400">
                      Shapes
                    </h4>
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <Badge rounded="md">Rounded Md</Badge>
                      <Badge rounded="full">Rounded Full</Badge>
                    </div>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import Badge from "@/components/ui/Badge/Badge";

// Status Indicators
<Badge variant="green" rounded="full" size="sm">APPROVED</Badge>
<Badge variant="yellow" rounded="full" size="sm">QUERY PENDING</Badge>
<Badge variant="red" size="sm">URGENT</Badge>

// Categorization Tags
<Badge variant="indigo" size="md">FSSAI License</Badge>
<Badge variant="gray" size="lg">Draft</Badge>`}
                  />
                </div>
              </div>
            )}

            {activeTab === "tabs" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Tabs Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A clean, compound tabs navigator for rendering switcher
                    sections reactively.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="bg-slate-50 p-8 rounded-lg border border-slate-100 flex flex-col items-center justify-center min-h-[250px]">
                    <UITabs defaultValue="tab1" className="max-w-md w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tab1">Direct Taxes</TabsTrigger>
                        <TabsTrigger value="tab2">Indirect Taxes</TabsTrigger>
                        <TabsTrigger value="tab3">Corporate</TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="tab1"
                        className="mt-4 p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-left"
                      >
                        <h4 className="font-semibold text-xs text-slate-800">
                          Income Tax & GST Filing
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Process structural audits, GSTR-1, GSTR-3B filings,
                          and individual ITR returns.
                        </p>
                      </TabsContent>
                      <TabsContent
                        value="tab2"
                        className="mt-4 p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-left"
                      >
                        <h4 className="font-semibold text-xs text-slate-800">
                          FSSAI & MSME Registrations
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Apply for central and state food licenses,
                          professional tax, and factory NOC approvals.
                        </p>
                      </TabsContent>
                      <TabsContent
                        value="tab3"
                        className="mt-4 p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-left"
                      >
                        <h4 className="font-semibold text-xs text-slate-800">
                          MCA Corporate Filings
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Incorporate private limited entities, handle LLP
                          formations, and file annual ROC returns.
                        </p>
                      </TabsContent>
                    </UITabs>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <p>Content for Tab 1</p>
  </TabsContent>
  <TabsContent value="tab2">
    <p>Content for Tab 2</p>
  </TabsContent>
</Tabs>`}
                  />
                </div>
              </div>
            )}

            {activeTab === "card" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Card Component
                  </h1>
                  <p className="text-sm text-slate-500">
                    A clean, compound card layout for displaying chunked
                    information and data grids.
                  </p>
                </div>

                {/* Previews */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Live Component Previews
                  </h3>
                  <div className="bg-slate-50 p-8 rounded-lg border border-slate-100 flex flex-wrap gap-6 items-center justify-center min-h-[250px]">
                    {/* Standard Card */}
                    <Card className="w-80" enableHover>
                      <CardHeader>
                        <CardTitle>Company Registration</CardTitle>
                        <CardDescription>
                          Incorporate private limited & LLP firms
                        </CardDescription>
                        <CardAction>
                          <Badge variant="indigo" size="sm">
                            POPULAR
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Get your business incorporated within 7 days. Includes
                          name approval, MoA/AoA preparation, PAN, TAN, and
                          expert tax consultations.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <span className="font-semibold text-slate-800">
                          ₹3,999 onwards
                        </span>
                        <Button size="sm" variant="primary">
                          Apply Now
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Small Size Card */}
                    <Card className="w-80" size="sm" enableHover>
                      <CardHeader>
                        <CardTitle>Compliance Audit</CardTitle>
                        <CardDescription>Annual filing check</CardDescription>
                        <CardAction>
                          <Badge variant="green" size="sm">
                            SMALL SIZE
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Ensure corporate safety through comprehensive
                          compliance reviews, statutory audit assistance, and
                          MCA registry maintenance services.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <span className="font-semibold text-slate-800">
                          ₹5,000 / Year
                        </span>
                        <Button size="sm" variant="primary">
                          Check Audit
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Custom Spacing Card */}
                    <Card
                      className="w-80"
                      style={
                        { "--card-spacing": "2.25rem" } as React.CSSProperties
                      }
                      enableHover
                    >
                      <CardHeader>
                        <CardTitle>IP & Trademark</CardTitle>
                        <CardDescription>Secure brand assets</CardDescription>
                        <CardAction>
                          <Badge variant="yellow" size="sm">
                            CUSTOM SPACING
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Register unique company logos, brand titles, and
                          intellectual creations. Guaranteed prompt trademark
                          filing within 24 working hours.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <span className="font-semibold text-slate-800">
                          ₹1,999 + Govt. Fees
                        </span>
                        <Button size="sm" variant="primary">
                          File TM
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/common/Button";

<Card enableHover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>
      <Badge variant="indigo">Badge</Badge>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content text goes here...</p>
  </CardContent>
  <CardFooter>
    <span>Footer details</span>
    <Button size="xs">Action</Button>
  </CardFooter>
</Card>`}
                  />
                </div>
              </div>
            )}

            {/* Accordion Tab */}
            {activeTab === "accordion" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Accordion
                  </h2>
                  <p className="text-xs text-slate-400 max-w-lg leading-normal">
                    A vertically stacked set of interactive headings that each
                    reveal a section of content. Built as a compound component
                    with smooth transition effects.
                  </p>
                </div>

                {/* Live Sandbox */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
                  <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    Interactive Live Preview
                  </h3>

                  <div className="border border-slate-150 rounded-lg p-6 max-w-xl mx-auto bg-slate-50/30">
                    <Accordion type="single">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          What is your business compliance structure?
                        </AccordionTrigger>
                        <AccordionContent>
                          We support standard corporate filing types in India
                          including Private Limited Companies, LLPs, One Person
                          Companies (OPC), Sole Proprietorships, and Partnership
                          Firms.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          How secure is the document verification storage?
                        </AccordionTrigger>
                        <AccordionContent>
                          We prioritize document security. All files uploaded
                          through our secure portal are encrypted both in
                          transit (SSL/TLS) and at rest, accessible only to
                          assigned experts.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          Are government registration fees transparent?
                        </AccordionTrigger>
                        <AccordionContent>
                          Absolutely. We show the exact statutory fees charged
                          by Ministry of Corporate Affairs or municipal bodies,
                          as well as our professional filing assistance fees.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";

<Accordion type="single" className="divide-y-0">
  <AccordionItem value="item-1" className="border-b border-slate-250">
    <AccordionTrigger>What is company registration?</AccordionTrigger>
    <AccordionContent>
      Launch your business as a legally recognized Private Limited Company...
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
                  />
                </div>
              </div>
            )}

            {/* File Upload Tab */}
            {activeTab === "fileupload" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    File Upload
                  </h2>
                  <p className="text-xs text-slate-400 max-w-lg leading-normal">
                    A secure drag-and-drop file upload component built in
                    compliance with OWASP guidelines. Features filename
                    sanitization, extension validation, MIME type verification,
                    and progress loaders.
                  </p>
                </div>

                {/* Live Sandbox */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
                  <h3 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                    Interactive Live Preview
                  </h3>

                  <div className="border border-slate-150 rounded-lg p-6 max-w-md mx-auto bg-slate-50/30">
                    <FileUploadDemo />
                  </div>
                </div>

                {/* Usage Code */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-800">
                    Code Usage Examples
                  </h3>
                  <CodeBlock
                    code={`import FileUpload from "@/components/forms/FileUpload";

// Single standard FileUpload state trigger
const [file, setFile] = useState(null);

<FileUpload
  value={file}
  onChange={setFile}
  allowedTypes={["pdf", "png", "jpg"]}
  maxSizeMb={5}
  label="GST Certificate copy"
/>`}
                  />

                  <h3 className="font-semibold text-sm text-slate-800">
                    React Hook Form & Zod Integration
                  </h3>
                  <CodeBlock
                    code={`import FileUploadField from "@/components/forms/fields/FileUploadField";
import { fileUploadSchema } from "@/schemas/file.schema";

// Form Controller field integration
<FileUploadField
  control={form.control}
  name="gstCertificate"
  label="Secure File Attachment"
  allowedTypes={["pdf"]}
  maxSizeMb={2}
  required
/>`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Demo helper wrapper state component
function FileUploadDemo() {
  const [file, setFile] = useState<any>(null);
  return (
    <FileUpload
      value={file}
      onChange={setFile}
      onView={() => alert(`Viewing file: ${file.name}`)}
      allowedTypes={["pdf", "png", "jpg"]}
      maxSizeMb={2}
      label="Attach Identity KYC Proof"
    />
  );
}
