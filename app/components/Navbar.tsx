'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">MyApp</div>

        <div className="hidden md:flex space-x-4">
          <a href="/" className="hover:text-gray-300">Home</a>
          <button
            onClick={() => signIn('github')}
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Sign in with GitHub
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <a href="/" className="block hover:text-gray-300">Home</a>
          <button
            onClick={() => signIn('github')}
            className="w-full bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Sign in with GitHub
          </button>
        </div>
      )}
    </nav>
  );
}
