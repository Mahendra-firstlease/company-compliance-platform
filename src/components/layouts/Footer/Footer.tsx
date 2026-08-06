"use client";

import React from 'react';
import Link from 'next/link';
import { footerData } from '@/data/footer';
import CompanyLogo from '@/components/common/CompanyLogo';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { APP_METADATA } from '@/constants';

const Footer: React.FC = () => {
  // Helper to map social media name to SVG components
  const getSocialIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'facebook':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-indigo-50/80 via-slate-50 to-blue-50/60 border-t border-slate-200/80 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-80 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-20 relative z-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          
          {/* Brand & Description Column */}
          <div className="space-y-4">
            <div className="flex justify-center sm:justify-start">
              <CompanyLogo priority variant="footer" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium text-center sm:text-left max-w-sm">
              {footerData.companyInfo.description}
            </p>

            <div className="pt-2 flex justify-center sm:justify-start gap-2.5">
              {footerData.socialMedia.map((social) => {
                const IconComponent = getSocialIcon(social.name);
                if (!IconComponent) return null;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    rel="noreferrer"
                    target="_blank"
                    className="size-9 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-2xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span className="sr-only">{social.name}</span>
                    {IconComponent}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
            {footerData.links.map((column) => {
              const linksToRender = column.title.toLowerCase().includes('helpful')
                ? [...column.links, { title: 'Live Chat Support', url: '#' }]
                : column.links;

              return (
                <div key={column.title} className="text-center sm:text-left">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{column.title}</p>

                  <ul className="mt-4 space-y-2.5 text-xs font-medium">
                    {linksToRender.map((link) => {
                      const isLiveChat = link.title.toLowerCase().includes('live chat');
                      return ( 
                        <li key={link.title}>
                          <Link
                            className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                            href={link.url}
                          >
                            <span>{link.title}</span>
                            {isLiveChat && (
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Contact Details Column */}
            <div className="text-center sm:text-left space-y-3">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Corporate Helpdesk</p>

              <ul className="space-y-3 text-xs font-medium">
                <li>
                  <a
                    className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    href={`mailto:${APP_METADATA.supportEmail}`}
                  >
                    <Mail className="size-4 text-indigo-600 shrink-0" />
                    <span>{APP_METADATA.supportEmail}</span>
                  </a>
                </li>

                <li>
                  <a
                    className="flex items-center justify-center sm:justify-start gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
                    href={`tel:${APP_METADATA.supportPhone}`}
                  >
                    <Phone className="size-4 text-indigo-600 shrink-0" />
                    <span>{APP_METADATA.supportPhone}</span>
                  </a>
                </li>

                <li className="flex items-start justify-center sm:justify-start gap-2 text-slate-600">
                  <MapPin className="size-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-normal">
                    Compliance Towers, Connaught Place, New Delhi, India
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {footerData.companyInfo.name || "FirstLease Platforms Pvt Ltd"}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">
              Terms & Conditions
            </Link>
            <span>&middot;</span>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="size-3.5" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;