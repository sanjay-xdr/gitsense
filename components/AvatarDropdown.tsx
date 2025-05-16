'use client';

import { signOut } from "next-auth/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AvatarDropdown({ session }: { session: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 hover:text-gray-300 transition"
      >
        <img
          src={session.user?.image || "/default-avatar.png"}
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-white"
        />
        <ChevronDown className="w-4 h-4" />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg py-2 w-40">
          <a
            href="/dashboard"
            className="block px-4 py-2 hover:bg-gray-100 transition"
          >
            Dashboard
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 hover:bg-gray-100 transition"
          >
            Settings
          </a>
          <button
            onClick={() => signOut()}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}