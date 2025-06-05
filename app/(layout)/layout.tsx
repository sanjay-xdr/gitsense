import React from "react";
import Navbar from "@/components/Navbar";
export default function NavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>
        <Navbar />
      </div>

      <div>{children}</div>
      <footer className="bg-slate-100 dark:bg-slate-800 p-4 text-center text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        This site is currently a work in progress.
      </footer>
    </>
  );
}
