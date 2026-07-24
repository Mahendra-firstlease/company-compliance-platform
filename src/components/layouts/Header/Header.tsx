"use client";
import { useState } from "react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NAV_ITEMS } from "./header.data";
export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] =
  useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white">
      <DesktopNav 
      open={mobileMenuOpen}
      setOpen={setMobileMenuOpen}
      items={NAV_ITEMS}
       />
      <MobileNav
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen} 
        items={NAV_ITEMS}
        />
    </header>
  );
}