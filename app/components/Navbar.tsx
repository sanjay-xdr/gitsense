// import { auth } from "next-auth"; // Adjust the import based on your Next.js setup
import Link from "next/link";
import AvatarDropdown from "./AvatarDropdown"; // Client Component for dropdown interactivity
import { signIn } from "next-auth/react";
import {auth} from "../auth"


export default async function Navbar() {
  const session = await auth();

  if(!session){
    return <p>You are not authenticated</p>
  }
  
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href={"/"} className="hover:text-grey-400 transition"> GitSense</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/repos" className="hover:text-gray-300 transition">
            Repos
          </Link>
          {session ? (
            <AvatarDropdown session={session} />
          ) : (
            <button
              onClick={() => signIn("github")}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Placeholder */}
        <button
          className="md:hidden"
          // Mobile menu toggle logic will be implemented as a client-side behavior
        >
          Mobile Menu
        </button>
      </div>
    </nav>
  );
}