"use client";
import { notify } from "@/lib/notify";

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (name: string) => {
    notify.info(`${name} document opened.`);
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 mt-12">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-slate-400 font-semibold tracking-normal">
        {/* Left: Copyright */}
        <div>
          <span>&copy; {currentYear} Corporate Compliance Portal &middot; MCA Filing backoffice network.</span>
        </div>

        {/* Right: Policy Links */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <button
            onClick={() => handleLinkClick("Filing Support Guide")}
            className="hover:text-slate-600 transition-colors"
          >
            Filing Support
          </button>
          <span>&middot;</span>
          <button
            onClick={() => handleLinkClick("Privacy Policy")}
            className="hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </button>
          <span>&middot;</span>
          <button
            onClick={() => handleLinkClick("Terms of Service")}
            className="hover:text-slate-600 transition-colors"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
}
