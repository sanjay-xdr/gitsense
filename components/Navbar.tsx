// components/Navbar.tsx (or wherever your original Navbar was)
import Link from "next/link";
import { auth } from "../app/auth"; // Ensure this path is correct for your app router auth
import AvatarDropdown from "./AvatarDropdown";
import LoginButton from "./LoginButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, GitFork, Rss, Home } from "lucide-react"; // Using GitFork for logo-like icon

export default async function Navbar() {
  const session = await auth();

  const navLinks = [
    { href: "/repos", label: "Repos", icon: <GitFork className="h-4 w-4 md:mr-2" /> },
    { href: "/feed", label: "Feed", icon: <Rss className="h-4 w-4 md:mr-2" /> },
    // Add more links as needed
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo and Desktop Site Name */}
        <Link
          href="/"
          className="mr-6 flex items-center space-x-2 text-lg font-bold text-primary hover:opacity-85 transition-opacity"
        >
          <GitFork className="h-6 w-6" /> {/* Example Icon for Logo */}
          <span className="hidden font-bold sm:inline-block">
            GitSense
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-4 lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Auth and Mobile Menu Trigger */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          {session?.user ? (
            <AvatarDropdown session={session} />
          ) : (
            <div className="hidden md:block">
              <LoginButton />
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <Link href="/" className="flex items-center space-x-2 text-lg font-bold text-primary">
                      <GitFork className="h-6 w-6" />
                      <span>GitSense</span>
                    </Link>
                  </div>
                  
                  <nav className="flex-1 flex flex-col space-y-2 p-4">
                    <SheetClose asChild>
                        <Link
                          href="/"
                          className="flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <Home className="mr-2 h-4 w-4" /> Home
                        </Link>
                    </SheetClose>
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          {link.icon} {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="mt-auto p-4 border-t">
                    {!session?.user && (
                      <SheetClose asChild>
                        <LoginButton />
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}