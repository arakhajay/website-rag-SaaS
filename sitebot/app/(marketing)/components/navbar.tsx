"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="inline-block font-bold text-xl">SiteBot</span>
                    </Link>
                    <nav className="hidden gap-6 md:flex">
                        <Link
                            href="#features"
                            className={cn(
                                "flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                                pathname === "/#features" && "text-foreground"
                            )}
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className={cn(
                                "flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                                pathname === "/#pricing" && "text-foreground"
                            )}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#about"
                            className={cn(
                                "flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                                pathname === "/#about" && "text-foreground"
                            )}
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <nav className="flex items-center space-x-1">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">
                                Get Started
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
