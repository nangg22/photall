import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">Photall</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/editor"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Tools
            </Link>
            <Link
              href="https://github.com/your-username/photall"
              target="_blank"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Docs
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="https://github.com/your-username/photall" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span className="sr-only">GitHub</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
